const express = require('express');
const archiver = require('archiver');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const https = require('https');
const Jimp = require('jimp');
const { registerComponent, getComponent } = require('./components/componentRegistry');

const app = express();
const PORT = process.env.PORT || 3001;

const MINIPROGRAM_VERSION = '1.2.2';

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

async function copyBaseFramework(outputDir) {
  const baseDir = path.join(__dirname, 'wxApp');
  const filesToCopy = [
    'app.js',
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
}

async function loadComponentData(page, merchantId, outputDir) {
  try {
    console.log('开始加载组件数据...');
    console.log('页面组件列表:', JSON.stringify(page.components, null, 2));
    const imagesDir = path.join(outputDir, 'images');

    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    for (const component of page.components || []) {
      console.log(`\n处理组件: ${component.componentName}`);
      const comp = getComponent(component.componentName);
      console.log(`组件对象:`, comp ? '找到' : '未找到');

      if (comp) {
        console.log(`组件有loadData方法:`, !!comp.loadData);
      }

      if (comp && comp.loadData) {
        console.log(`开始加载 ${component.componentName} 数据...`);
        const data = await comp.loadData(merchantId, outputDir);
        console.log(`${component.componentName} 数据加载完成:`, JSON.stringify(data, null, 2));
        component.componentItems = data;
      } else {
        console.log(`${component.componentName} 没有loadData方法或组件未找到，使用默认数据`);
      }
    }
    console.log('\n组件数据加载完成');
    console.log('最终组件数据:', JSON.stringify(page.components, null, 2));
  } catch (error) {
    console.error('加载组件数据失败:', error);
  }
}

function generateAppJs(merchantId, outputDir) {
  const sourceAppJsPath = path.join(__dirname, 'wxApp', 'app.js');
  let appJsContent = fs.readFileSync(sourceAppJsPath, 'utf-8');

  if (merchantId) {
    appJsContent = appJsContent.replace(
      /merchantId: '\{商家ID\}'/g,
      `merchantId: '${merchantId}'`
    );
  }

  appJsContent = appJsContent.replace(
    /console\.log\('小程序启动'\);/g,
    `console.log('小程序启动');\n  console.log('小程序版本: ${MINIPROGRAM_VERSION}');`
  );

  fs.writeFileSync(path.join(outputDir, 'app.js'), appJsContent);
  console.log('生成app.js, 商家ID:', merchantId || '');
}

async function generatePage(page, outputDir, merchantId) {
  try {
    console.log('========== 开始生成页面 ==========');
    console.log('页面信息:', JSON.stringify(page, null, 2));

    const pageDir = path.join(outputDir, 'pages', page.pageId);
    console.log(`创建页面目录: ${pageDir}`);
    fs.mkdirSync(pageDir, { recursive: true });

    console.log(`跳过组件数据加载（小程序端自行加载）`);

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

function getComponentDataKey(component) {
  const name = component.componentName;
  const mapping = {
    '轮播图': 'carouselImages',
    '功能列表': 'functionList',
    '图片': 'singleImage',
    '文本': 'textContent',
    '商品网格': 'productGrid',
    '商品列表': 'productList',
    '公告': 'noticeList',
    '标签页面': 'tabsData',
    '内容列表': 'contentList'
  };

  if (mapping[name]) {
    return mapping[name];
  }

  const rawId = component.componentId || '';
  const safeId = rawId.replace(/[^a-zA-Z0-9_]/g, '');
  return safeId ? `component_${safeId}` : 'componentData';
}

function generatePageJS(page, merchantId) {
  const components = page.components || [];
  const componentsData = components.map(comp => {
    const dataKey = getComponentDataKey(comp);
    return `  ${dataKey}: [],`;
  }).join('\n');

  const loadDataCalls = components.map(comp => {
    return `    this.load${comp.componentName}Data();`;
  }).join('\n');

  const loadMethods = components.map(comp => {
    let worksheetId = '';
    let dataMapping = '';
    let filtersConfig = '[]';

    if (comp.componentName === '轮播图') {
      worksheetId = 'lunbotu';
      filtersConfig = `[
              {
                'controlId': 'mRowid',
                'dataType': 2,
                'spliceType': 1,
                'filterType': 24,
                'value': mRowid
              }
            ]`;
      dataMapping = `result.data.rows.map(row => {
        let url = '';
        if (row.url) {
          url = row.url;
        } else if (row.fengmian) {
          try {
            const imgArray = JSON.parse(row.fengmian);
            if (Array.isArray(imgArray) && imgArray.length > 0) {
              const firstImg = imgArray[0];
              url = firstImg.large_thumbnail_full_path || firstImg.url || firstImg.large_thumbnail_path || firstImg.path;
            }
          } catch (e) {
            console.error('解析fengmian字段失败:', e);
          }
        }
        return { url };
      }).filter(item => item.url)`;
    } else if (comp.componentName === '功能列表') {
      worksheetId = 'gongneng';
      filtersConfig = `[
              {
                'controlId': 'mRowid',
                'dataType': 2,
                'spliceType': 1,
                'filterType': 24,
                'value': mRowid
              }
            ]`;
      dataMapping = `result.data.rows.map(row => {
        let iconUrl = '';
        try {
          const iconArray = JSON.parse(row.icon);
          if (Array.isArray(iconArray) && iconArray.length > 0) {
            iconUrl = iconArray[0].large_thumbnail_full_path || iconArray[0].url || iconArray[0].thumbnail_full_path;
          }
        } catch (e) {
          console.error('解析icon字段失败:', e);
        }
        return { icon: iconUrl, name: row.mingcheng };
      });`;
    } else if (comp.componentName === '内容列表') {
      worksheetId = 'neirong';
      filtersConfig = `[
              {
                'controlId': 'mRowid',
                'dataType': 2,
                'spliceType': 1,
                'filterType': 24,
                'value': mRowid
              }
            ]`;
      dataMapping = `result.data.rows.map(row => {
        let fengmianUrl = '';
        try {
          if (row.fengmian) {
            const imgArray = JSON.parse(row.fengmian);
            if (Array.isArray(imgArray) && imgArray.length > 0) {
              fengmianUrl = imgArray[0].large_thumbnail_full_path || imgArray[0].url || imgArray[0].thumbnail_full_path;
            }
          }
        } catch (e) {
          console.error('解析fengmian字段失败:', e);
        }
        let zztxUrl = '';
        try {
          if (row.zztx) {
            const imgArray = JSON.parse(row.zztx);
            if (Array.isArray(imgArray) && imgArray.length > 0) {
              zztxUrl = imgArray[0].large_thumbnail_full_path || imgArray[0].url || imgArray[0].thumbnail_full_path;
            }
          }
        } catch (e) {
          console.error('解析zztx字段失败:', e);
        }
        return {
          rowid: row.rowid,
          mingcheng: row.mingcheng || '',
          miaoshu: row.miaoshu || '',
          fengmian: fengmianUrl,
          biaoqian: row.biaoqian || '',
          jiage: row.jiage || '',
          zztx: zztxUrl,
          zznc: row.zznc || '',
          ctime: row.ctime || '',
          ctimeFormatted: (function() {
            if (!row.ctime) return '';
            const now = new Date();
            const date = new Date(row.ctime.replace(' ', 'T'));
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);
            if (diffMins < 1) return '刚刚';
            if (diffMins < 60) return diffMins + '分钟前';
            if (diffHours < 24) return diffHours + '小时前';
            if (diffDays === 1 || (diffHours >= 24 && diffHours < 48)) return '昨天';
            if (diffDays < 7) return diffDays + '天前';
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            const h = String(date.getHours()).padStart(2, '0');
            const min = String(date.getMinutes()).padStart(2, '0');
            if (y === now.getFullYear()) {
              return m + '-' + d + ' ' + h + ':' + min;
            }
            return y + '-' + m + '-' + d;
          })(),
          dianzan: row.dianzan || '',
          pinglun: row.pinglun || '',
          shoucang: row.shoucang || '',
          yueduliang: row.yueduliang || ''
        };
      })`;
    } else {
      worksheetId = '';
      dataMapping = 'result.data.rows';
    }

    const dataKey = getComponentDataKey(comp);
    return `
  async load${comp.componentName}Data() {
    try {
      console.log('开始加载${comp.componentName}数据...');
      const app = getApp();
      const mRowid = app && app.globalData && app.globalData.mRowid ? app.globalData.mRowid : '${merchantId || ''}';
      
      const data = await this.call${comp.componentName}API(mRowid);
      console.log('${comp.componentName}数据加载成功:', data);
      this.setData({ ${dataKey}: data });
    } catch (error) {
      console.error('${comp.componentName}数据加载失败:', error);
    }
  },

  async call${comp.componentName}API(mRowid) {
    const api = require('../../utils/MingdaoYunArrayAPI');
    const apiInstance = new api();
    
    const result = await apiInstance.getData({
      worksheetId: '${worksheetId}',
      filters: ${filtersConfig},
      pageSize: 50,
      pageIndex: 1
    });
    
    if (result.success && result.data && result.data.rows) {
      return ${dataMapping};
    }
    return [];
  },`;
  }).join('\n');

  return `Page({
  data: {
${componentsData}
  },

  async onLoad(options) {
    console.log('${page.pageName}页面加载', options);
    const app = getApp();
    const appMerchantId = app && app.globalData && app.globalData.merchantId ? app.globalData.merchantId : '${merchantId || ''}';
    console.log('商家ID:', appMerchantId);
    console.log('小程序版本: ${MINIPROGRAM_VERSION}');
    
    await this.initShangjiaRowid(appMerchantId);
    
    console.log('=== 开始加载组件数据 ===');
${loadDataCalls}
    console.log('=== 组件数据加载结束 ===');
  },

  async initShangjiaRowid(mRowid) {
    try {
      const app = getApp();
      const api = require('../../utils/MingdaoYunArrayAPI');
      const apiInstance = new api();
      
      const filters = [
        {
          'controlId': 'mRowid',
          'dataType': 2,
          'spliceType': 1,
          'filterType': 2,
          'value': mRowid
        }
      ];
      
      const result = await apiInstance.getData({
        worksheetId: 'shangjia',
        filters: filters,
        pageSize: 1,
        pageIndex: 1
      });
      
      console.log('=== 查询shangjia表返回结果 ===');
      console.log(JSON.stringify(result, null, 2));
      
      if (result.success && result.data && result.data.rows && result.data.rows.length > 0) {
        const shangjiaRowid = result.data.rows[0].rowid;
        console.log('商家rowid:', shangjiaRowid);
        app.globalData.mRowid = shangjiaRowid;
      } else {
        console.log('未找到对应的商家记录');
      }
    } catch (error) {
      console.error('查询shangjia表失败:', error);
    }
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
  },
${loadMethods}
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
  const comp = getComponent(component.componentName);
  if (comp && comp.generateHTML) {
    const componentWithKey = { ...component, dataKey: getComponentDataKey(component) };
    return comp.generateHTML(componentWithKey);
  }
  return `  <view class="component">${component.componentName}</view>`;
}

function generatePageWXSS(page) {
  const componentsCSS = page.components.map(comp => {
    const component = getComponent(comp.componentName);
    return component && component.generateCSS ? component.generateCSS() : '';
  }).filter(css => css).join('\n\n');

  return `.page {
  min-height: 100vh;
  background: #f5f5f5;
}

${componentsCSS}`;
}

function generatePageJSON(page) {
  return `{
  "navigationBarTitleText": "${page.pageName}",
  "usingComponents": {}
}`;
}

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`图片下载成功: ${filepath}`);
          resolve();
        });
      } else {
        console.error(`图片下载失败: ${url}, 状态码: ${response.statusCode}`);
        reject(new Error(`图片下载失败: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      console.error(`图片下载错误: ${url}`, err);
      reject(err);
    });
  });
}

async function downloadTabBarIcons(config, outputDir) {
  const imagesDir = path.join(outputDir, 'images');

  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
    console.log('创建images目录');
  }

  const iconPromises = [];

  const themeColorRaw = config.globalConfig && config.globalConfig.themeColor ? config.globalConfig.themeColor : '#667eea';
  const themeColor = normalizeColorForAppJson(themeColorRaw) || '#667eea';

  const tabBarConfig = config.tabBarConfig || {};
  const unselectedColorResolved = resolveThemeColor(tabBarConfig.unselectedColor || '#999999', themeColor);
  const unselectedColor = normalizeColorForAppJson(unselectedColorResolved) || '#999999';

  const selectedColorResolved = resolveThemeColor(tabBarConfig.selectedColor, themeColor);
  let selectedColor = normalizeColorForAppJson(selectedColorResolved);
  if (!selectedColor) {
    selectedColor = themeColor || '#667eea';
  }

  const tabBarList = tabBarConfig.list || [];

  for (const tab of tabBarList) {
    if (tab.selectedIconRowid && config.userImages) {
      const selectedImage = config.userImages.find(img => img.rowid === tab.selectedIconRowid);
      if (selectedImage && selectedImage.url) {
        const filename = `${tab.selectedIconRowid}.png`;
        const filepath = path.join(imagesDir, filename);
        iconPromises.push(
          downloadImage(selectedImage.url, filepath)
            .then(async () => {
              try {
                const image = await Jimp.read(filepath);
                image.color([{ apply: 'mix', params: [selectedColor, 100] }]);
                await image.writeAsync(filepath);
                console.log(`选中图标已叠加颜色 ${selectedColor}: ${filepath}`);
              } catch (err) {
                console.error('选中图标叠加颜色失败:', filepath, selectedColor, err);
              }
            })
        );
        tab.selectedIcon = filename;
      }
    }

    if (tab.unselectedIconRowid && config.userImages) {
      const unselectedImage = config.userImages.find(img => img.rowid === tab.unselectedIconRowid);
      if (unselectedImage && unselectedImage.url) {
        const filename = `${tab.unselectedIconRowid}.png`;
        const filepath = path.join(imagesDir, filename);
        iconPromises.push(
          downloadImage(unselectedImage.url, filepath)
            .then(async () => {
              try {
                const image = await Jimp.read(filepath);
                image.color([{ apply: 'mix', params: [unselectedColor, 100] }]);
                await image.writeAsync(filepath);
                console.log(`未选中图标已叠加颜色 ${unselectedColor}: ${filepath}`);
              } catch (err) {
                console.error('未选中图标叠加颜色失败:', filepath, unselectedColor, err);
              }
            })
        );
        tab.unselectedIcon = filename;
      }
    }
  }

  await Promise.all(iconPromises);
  console.log('所有图标下载完成');
}

function resolveThemeColor(value, themeColor) {
  if (!value) {
    return value;
  }
  if (value === '{主题色}') {
    return themeColor || value;
  }
  return value;
}

function normalizeColorForAppJson(color) {
  if (!color || typeof color !== 'string') {
    return color;
  }
  let c = color.trim();
  if (/^#([0-9a-fA-F]{8})$/.test(c)) {
    c = '#' + c.slice(1, 7);
  } else if (/^#([0-9a-fA-F]{3})$/.test(c)) {
    const r = c[1];
    const g = c[2];
    const b = c[3];
    c = `#${r}${r}${g}${g}${b}${b}`;
  }
  return c;
}

async function generateAppJson(config, outputDir) {
  const themeColorRaw = config.globalConfig && config.globalConfig.themeColor ? config.globalConfig.themeColor : '#667eea';
  const themeColor = normalizeColorForAppJson(themeColorRaw) || '#667eea';

  const globalConfig = config.globalConfig || {};
  const navigationBar = globalConfig.navigationBar || {};

  const navBackgroundColorRaw = resolveThemeColor(navigationBar.backgroundColor, themeColor);
  const navBackgroundColor = normalizeColorForAppJson(navBackgroundColorRaw) || '#ffffff';

  const navTextColorRaw = resolveThemeColor(navigationBar.textColor, themeColor);
  const navTextColor = normalizeColorForAppJson(navTextColorRaw) || '#181818';

  const navigationBarTextStyle = navTextColor && navTextColor.toLowerCase() === '#ffffff' ? 'white' : 'black';

  const appJson = {
    pages: config.pages.map(p => `pages/${p.pageId}/index`),
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: navBackgroundColor,
      navigationBarTitleText: '小程序',
      navigationBarTextStyle: navigationBarTextStyle
    },
    sitemapLocation: 'sitemap.json'
  };

  const tabBarConfig = config.tabBarConfig || {};
  const tabBarList = tabBarConfig.list || [];

  if (tabBarList.length > 0) {
    const tabBarBackgroundColorResolved = resolveThemeColor(tabBarConfig.backgroundColor || '#ffffff', themeColor);
    const tabBarBackgroundColor = normalizeColorForAppJson(tabBarBackgroundColorResolved) || '#ffffff';

    const unselectedColorResolved = resolveThemeColor(tabBarConfig.unselectedColor || '#999999', themeColor);
    const unselectedColor = normalizeColorForAppJson(unselectedColorResolved) || '#999999';

    const selectedColorResolved = resolveThemeColor(tabBarConfig.selectedColor, themeColor);
    let selectedColor = normalizeColorForAppJson(selectedColorResolved);
    if (!selectedColor) {
      selectedColor = themeColor || '#667eea';
    }

    appJson.tabBar = {
      color: unselectedColor,
      selectedColor: selectedColor,
      backgroundColor: tabBarBackgroundColor,
      borderStyle: 'white',
      list: tabBarList.map(tab => ({
        pagePath: `pages/${tab.pageId}/index`,
        text: tab.name,
        iconPath: `images/${tab.unselectedIcon}`,
        selectedIconPath: `images/${tab.selectedIcon}`
      }))
    };
    console.log('生成tabBar配置');
  }

  fs.writeFileSync(path.join(outputDir, 'app.json'), JSON.stringify(appJson, null, 2));
  console.log('生成app.json，内容如下:');
  console.log(JSON.stringify(appJson, null, 2));
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
    console.log('接收到的配置:', JSON.stringify(config, null, 2));
    console.log('tabBarConfig.list长度:', config.tabBarConfig?.list?.length || 0);
    console.log('pages长度:', config.pages?.length || 0);

    const merchantId = config.merchantId || '';
    console.log('商家ID:', merchantId);

    const timestamp = Date.now();
    const uniqueDir = path.join(OUTPUT_DIR, `miniprogram_${timestamp}`);
    fs.mkdirSync(uniqueDir, { recursive: true });

    console.log('1. 复制基础框架代码...');
    await copyBaseFramework(uniqueDir);

    console.log('1.5. 生成app.js...');
    generateAppJs(merchantId, uniqueDir);

    console.log('2. 生成页面代码...');
    for (const page of config.pages) {
      await generatePage(page, uniqueDir, merchantId);
    }

    console.log('2.5. 下载tabBar图标...');
    if (config.tabBarConfig && config.tabBarConfig.list && config.tabBarConfig.list.length > 0) {
      await downloadTabBarIcons(config, uniqueDir);
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

registerComponent('轮播图', require('./components/carousel'));
registerComponent('功能列表', require('./components/function-list'));
registerComponent('图片', require('./components/image'));
registerComponent('文本', require('./components/text'));
registerComponent('商品网格', require('./components/product-grid'));
registerComponent('公告', require('./components/notice'));
registerComponent('标签页面', require('./components/tabs'));
registerComponent('内容列表', require('./components/content-list'));

console.log('组件注册完成');

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`健康检查: http://localhost:${PORT}/health`);
});
