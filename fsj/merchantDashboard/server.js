const express = require('express');
const archiver = require('archiver');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

app.use(express.static(path.join(__dirname, 'public')));

const TEMP_DIR = path.join(__dirname, 'temp');
const OUTPUT_DIR = path.join(__dirname, 'output');

[TEMP_DIR, OUTPUT_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

async function copyBaseFramework(outputDir) {
    const baseDir = path.join(__dirname, 'wxApp');
    const filesToCopy = [
        'app.js',
        'app.wxss',
        'sitemap.json',
        'project.config.json',
        'utils',
        'components'
    ];
    
    for (const item of filesToCopy) {
        const src = path.join(baseDir, item);
        const dest = path.join(outputDir, item);
        
        if (fs.existsSync(src)) {
            if (fs.statSync(src).isDirectory()) {
                fs.cpSync(src, dest, { recursive: true });
            } else {
                fs.copyFileSync(src, dest);
            }
            console.log(`复制: ${item}`);
        }
    }
}

async function generatePage(page, outputDir) {
    const pageDir = path.join(outputDir, 'pages', page.pageId);
    fs.mkdirSync(pageDir, { recursive: true });
    
    const jsContent = generatePageJS(page);
    fs.writeFileSync(path.join(pageDir, 'index.js'), jsContent);
    
    const wxmlContent = generatePageWXML(page);
    fs.writeFileSync(path.join(pageDir, 'index.wxml'), wxmlContent);
    
    const wxssContent = generatePageWXSS(page);
    fs.writeFileSync(path.join(pageDir, 'index.wxss'), wxssContent);
    
    const jsonContent = generatePageJSON(page);
    fs.writeFileSync(path.join(pageDir, 'index.json'), jsonContent);
    
    console.log(`生成页面: ${page.pageName}`);
}

function generatePageJS(page) {
    const componentsData = page.components.map(comp => {
        return `  ${comp.componentName}: ${JSON.stringify(comp.componentItems)},`;
    }).join('\n');
    
    return `Page({
  data: {
${componentsData}
  },

  onLoad(options) {
    console.log('${page.pageName}页面加载');
  },

  onReady() {
    console.log('页面渲染完成');
  },

  onShow() {
    console.log('页面显示');
  },

  onHide() {
    console.log('页面隐藏');
  },

  onUnload() {
    console.log('页面卸载');
  }
});`;
}

function generatePageWXML(page) {
    const componentsHTML = page.components.map(comp => {
        return generateComponentHTML(comp);
    }).join('\n');
    
    return `<view class="page">
${componentsHTML}
</view>`;
}

function generateComponentHTML(component) {
    switch (component.componentName) {
        case '轮播图':
            return `  <swiper class="carousel" indicator-dots autoplay interval="3000">
    ${component.componentItems.map(item => `    <swiper-item><image src="${item}" mode="aspectFill"></image></swiper-item>`).join('\n')}
  </swiper>`;
        case '功能列表':
            return `  <view class="function-list">
    <view class="function-grid">
      ${component.componentItems.map(item => `      <view class="function-item"><text>${item}</text></view>`).join('\n')}
    </view>
  </view>`;
        case '图片':
            return `  <image class="single-image" src="${component.componentItems[0]}" mode="widthFix"></image>`;
        case '文本':
            return `  <text class="custom-text" style="font-size: ${component.properties.fontSize || 16}px; color: ${component.properties.color || '#333'};">${component.componentItems[0]}</text>`;
        default:
            return `  <view class="component">${component.componentName}</view>`;
    }
}

function generatePageWXSS(page) {
    return `.page {
  min-height: 100vh;
  background: #f5f5f5;
}

.carousel {
  width: 100%;
  height: 200px;
}

.carousel image {
  width: 100%;
  height: 100%;
}

.function-list {
  background: #fff;
  padding: 10px;
  margin: 10px;
  border-radius: 8px;
}

.function-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.function-item {
  text-align: center;
  padding: 10px;
}

.function-item text {
  font-size: 12px;
  color: #666;
}

.single-image {
  width: 100%;
  display: block;
}

.custom-text {
  padding: 10px;
  display: block;
}`;
}

function generatePageJSON(page) {
    return `{
  "navigationBarTitleText": "${page.pageName}",
  "usingComponents": {}
}`;
}

async function generateAppJson(config, outputDir) {
    const appJson = {
        pages: config.pages.map(p => `pages/${p.pageId}/index`),
        window: {
            backgroundTextStyle: 'light',
            navigationBarBackgroundColor: config.globalConfig.navigationBar.backgroundColor,
            navigationBarTitleText: '小程序',
            navigationBarTextStyle: config.globalConfig.navigationBar.textColor === '#ffffff' ? 'white' : 'black'
        },
        tabBar: {
            color: config.tabBarConfig.unselectedColor || '#999999',
            selectedColor: config.tabBarConfig.selectedColor || '#667eea',
            backgroundColor: config.tabBarConfig.backgroundColor || '#ffffff',
            borderStyle: config.tabBarConfig.borderStyle || 'black',
            list: config.tabBarConfig.list.map(tab => ({
                pagePath: `pages/${tab.pageId}/index`,
                text: tab.name,
                iconPath: `images/${tab.unselectedIcon}`,
                selectedIconPath: `images/${tab.selectedIcon}`
            }))
        },
        sitemapLocation: 'sitemap.json'
    };
    
    fs.writeFileSync(path.join(outputDir, 'app.json'), JSON.stringify(appJson, null, 2));
    console.log('生成app.json');
}

async function createZip(sourceDir, zipPath) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        output.on('close', () => {
            console.log(`ZIP文件已创建: ${zipPath} (${archive.pointer()} bytes)`);
            resolve();
        });

        archive.on('error', (err) => {
            reject(err);
        });

        archive.pipe(output);
        archive.directory(sourceDir, false);
        archive.finalize();
    });
}

function cleanup(dir) {
    if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`清理目录: ${dir}`);
    }
}

app.post('/api/generate-miniprogram', async (req, res) => {
    try {
        console.log('收到生成请求:', new Date().toISOString());
        const config = req.body;
        
        const timestamp = Date.now();
        const uniqueDir = path.join(OUTPUT_DIR, `miniprogram_${timestamp}`);
        fs.mkdirSync(uniqueDir, { recursive: true });
        
        console.log('1. 复制基础框架代码...');
        await copyBaseFramework(uniqueDir);
        
        console.log('2. 生成页面代码...');
        for (const page of config.pages) {
            await generatePage(page, uniqueDir);
        }
        
        console.log('3. 生成app.json...');
        await generateAppJson(config, uniqueDir);
        
        console.log('4. 创建ZIP文件...');
        const zipPath = path.join(OUTPUT_DIR, `miniprogram_${timestamp}.zip`);
        await createZip(uniqueDir, zipPath);
        
        console.log('5. 清理临时文件...');
        cleanup(uniqueDir);
        
        const downloadUrl = `/download/miniprogram_${timestamp}.zip`;
        res.json({
            success: true,
            message: '小程序代码生成成功',
            downloadUrl: downloadUrl,
            timestamp: timestamp
        });
        
    } catch (error) {
        console.error('生成失败:', error);
        res.status(500).json({
            success: false,
            message: '生成失败: ' + error.message
        });
    }
});

app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(OUTPUT_DIR, filename);
    
    if (fs.existsSync(filePath)) {
        res.download(filePath, 'miniprogram.zip', (err) => {
            if (!err) {
                console.log(`文件下载: ${filename}`);
            }
        });
    } else {
        res.status(404).json({
            success: false,
            message: '文件不存在'
        });
    }
});

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`健康检查: http://localhost:${PORT}/health`);
});
