const express = require('express');
const archiver = require('archiver');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

app.use(express.static(path.join(__dirname, 'public')));

const TEMP_DIR = path.join(__dirname, 'temp');
const OUTPUT_DIR = path.join(__dirname, 'output');
const MAX_ZIP_FILES = 10;
const ZIP_EXPIRE_HOURS = 24;

[TEMP_DIR, OUTPUT_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

function cleanupOldFiles() {
    try {
        const files = fs.readdirSync(OUTPUT_DIR).filter(file => file.endsWith('.zip'));

        if (files.length > MAX_ZIP_FILES) {
            files.sort((a, b) => {
                const statA = fs.statSync(path.join(OUTPUT_DIR, a));
                const statB = fs.statSync(path.join(OUTPUT_DIR, b));
                return statA.mtime - statB.mtime;
            });

            const filesToDelete = files.slice(0, files.length - MAX_ZIP_FILES);
            filesToDelete.forEach(file => {
                const filePath = path.join(OUTPUT_DIR, file);
                fs.unlinkSync(filePath);
                console.log(`删除旧文件: ${file}`);
            });
        }

        const now = Date.now();
        files.forEach(file => {
            const filePath = path.join(OUTPUT_DIR, file);
            const stats = fs.statSync(filePath);
            const ageHours = (now - stats.mtime.getTime()) / (1000 * 60 * 60);

            if (ageHours > ZIP_EXPIRE_HOURS) {
                fs.unlinkSync(filePath);
                console.log(`删除过期文件: ${file}`);
            }
        });
    } catch (error) {
        console.error('清理文件失败:', error);
    }
}

setInterval(cleanupOldFiles, 60 * 60 * 1000);
cleanupOldFiles();

async function copyBaseFramework(outputDir, merchantId) {
    const baseDir = path.join(__dirname, 'wxApp');
    const filesToCopy = [
        'app.wxss',
        'sitemap.json',
        'project.config.json',
        'utils',
        'components',
        'images'
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

    const appJsContent = generateAppJs(merchantId);
    fs.writeFileSync(path.join(outputDir, 'app.js'), appJsContent);
    console.log('生成app.js');
}

function generateAppJs(merchantId) {
    return `App({
  globalData: {
    merchantId: '${merchantId}'
  },

  onLaunch(options) {
    console.log('小程序启动');
    console.log('商家ID:', this.globalData.merchantId);
  },

  onShow(options) {
    console.log('小程序显示');
  },

  onHide() {
    console.log('小程序隐藏');
  }
});`;
}

async function generatePage(page, outputDir, merchantId) {
    try {
        const pageDir = path.join(outputDir, 'pages', page.pageId);
        console.log(`创建页面目录: ${pageDir}`);
        fs.mkdirSync(pageDir, { recursive: true });

        console.log(`生成JS文件...`);
        const jsContent = generatePageJS(page, merchantId);
        fs.writeFileSync(path.join(pageDir, 'index.js'), jsContent);
        console.log(`JS文件生成成功`);

        console.log(`生成WXML文件...`);
        const wxmlContent = generatePageWXML(page);
        fs.writeFileSync(path.join(pageDir, 'index.wxml'), wxmlContent);
        console.log(`WXML文件生成成功`);

        console.log(`生成WXSS文件...`);
        const wxssContent = generatePageWXSS(page);
        fs.writeFileSync(path.join(pageDir, 'index.wxss'), wxssContent);
        console.log(`WXSS文件生成成功`);

        console.log(`生成JSON文件...`);
        const jsonContent = generatePageJSON(page);
        fs.writeFileSync(path.join(pageDir, 'index.json'), jsonContent);
        console.log(`JSON文件生成成功`);

        console.log(`生成页面: ${page.pageName}`);
    } catch (error) {
        console.error(`生成页面失败: ${page.pageName}`, error);
        throw error;
    }
}

function generatePageJS(page, merchantId) {
    const componentsData = page.components.map(comp => {
        return `  ${comp.componentName}: ${JSON.stringify(comp.componentItems)},`;
    }).join('\n');

    return `Page({
  data: {
${componentsData}
  },

  onLoad(options) {
    console.log('${page.pageName}页面加载');
    const app = getApp();
    const merchantId = app.globalData.merchantId || '${merchantId}';
    console.log('商家ID:', merchantId);
    
    this.loadMerchantData(merchantId);
  },

  loadMerchantData(merchantId) {
    wx.request({
      url: 'https://api.example.com/merchant/data',
      data: {
        merchantId: merchantId
      },
      success: (res) => {
        this.setData({
          merchantData: res.data
        });
      }
    });
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
        sitemapLocation: 'sitemap.json'
    };

    if (config.tabBarConfig.list.length > 0) {
        appJson.tabBar = {
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
        };
        console.log('生成tabBar配置');
    }

    fs.writeFileSync(path.join(outputDir, 'app.json'), JSON.stringify(appJson, null, 2));
    console.log('生成app.json');
}

async function createZip(sourceDir, zipPath) {
    return new Promise((resolve, reject) => {
        console.log(`开始创建ZIP: ${sourceDir} -> ${zipPath}`);
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        output.on('close', () => {
            const fileSize = archive.pointer();
            console.log(`ZIP文件已创建: ${zipPath} (${fileSize} bytes)`);

            if (fileSize < 1000) {
                console.error('警告: ZIP文件大小异常小，可能创建失败');
            }
            resolve();
        });

        archive.on('error', (err) => {
            console.error('ZIP创建错误:', err);
            reject(err);
        });

        archive.on('warning', (err) => {
            console.warn('ZIP创建警告:', err);
        });

        archive.pipe(output);
        console.log(`开始添加目录: ${sourceDir}`);
        archive.directory(sourceDir, false);
        console.log(`目录添加完成，开始finalize`);
        archive.finalize();
        console.log(`finalize完成`);
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
        const merchantId = config.merchantId || '';
        console.log('商家ID:', merchantId);
        console.log('接收到的配置:', JSON.stringify(config, null, 2));
        console.log('tabBarConfig.list长度:', config.tabBarConfig?.list?.length || 0);
        console.log('pages长度:', config.pages?.length || 0);

        const timestamp = Date.now();
        const uniqueDir = path.join(OUTPUT_DIR, `miniprogram_${timestamp}`);
        fs.mkdirSync(uniqueDir, { recursive: true });

        console.log('1. 复制基础框架代码...');
        await copyBaseFramework(uniqueDir, merchantId);

        console.log('2. 生成页面代码...');
        for (const page of config.pages) {
            await generatePage(page, uniqueDir, merchantId);
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
