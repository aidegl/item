<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Figma导出React代码学习指南</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
            text-align: center;
        }
        h2 {
            color: #34495e;
            margin-top: 40px;
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 5px;
        }
        h3 {
            color: #555;
            margin-top: 30px;
        }
        .container {
            background-color: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .file-structure {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            font-family: 'Courier New', Courier, monospace;
            white-space: pre;
            overflow-x: auto;
            margin: 20px 0;
            border-left: 4px solid #3498db;
        }
        .code-block {
            background-color: #2c3e50;
            color: #ecf0f1;
            padding: 15px;
            border-radius: 5px;
            font-family: 'Courier New', Courier, monospace;
            margin: 15px 0;
            overflow-x: auto;
            border-left: 4px solid #27ae60;
        }
        .highlight {
            background-color: #3498db;
            color: white;
            padding: 2px 5px;
            border-radius: 3px;
        }
        .note {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
        }
        .feature-list {
            list-style-type: none;
            padding: 0;
        }
        .feature-list li {
            margin: 10px 0;
            padding-left: 25px;
            position: relative;
        }
        .feature-list li::before {
            content: "✓";
            color: #28a745;
            font-weight: bold;
            position: absolute;
            left: 0;
        }
        img {
            max-width: 100%;
            height: auto;
            border-radius: 5px;
            margin: 20px 0;
            border: 1px solid #ddd;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
            color: #333;
        }
        tr:hover {
            background-color: #f5f5f5;
        }
        .info-box {
            background-color: #d1ecf1;
            border-left: 4px solid #17a2b8;
            padding: 15px;
            margin: 20px 0;
        }
        .warning-box {
            background-color: #f8d7da;
            border-left: 4px solid #dc3545;
            padding: 15px;
            margin: 20px 0;
        }
        .center-image {
            display: block;
            margin: 0 auto;
        }
        a {
            color: #3498db;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        .section-intro {
            font-size: 1.1em;
            color: #666;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Figma导出React代码学习指南</h1>
        
        <div class="info-box">
            <strong>为什么选择HTML格式？</strong> HTML文件具有极高的可读性，可以直接在浏览器中打开查看，无需安装额外的开发环境。通过图文并茂的方式，能更直观地理解React项目的结构和代码组织方式。
        </div>
        
        <h2>一、项目概述</h2>
        <p class="section-intro">Figma是一款强大的UI设计工具，它允许设计师创建精美的界面设计，并可以将这些设计导出为React代码。这些导出的代码提供了一个良好的起点，可以帮助开发者快速实现设计稿。</p>
        <p>本指南将帮助你理解Figma导出的React项目的文件结构、各文件的功能和作用，以及如何有效使用这些代码。</p>
        
        <h2>二、典型文件结构</h2>
        <p class="section-intro">Figma导出的React项目通常遵循以下文件结构，这种结构有利于代码的组织和维护：</p>
        
        <div class="file-structure">
my-figma-project/
├── public/                  # 公共资源目录
│   ├── index.html          # 项目入口HTML文件
│   ├── favicon.ico         # 网站图标
│   └── manifest.json       # PWA配置文件
├── src/                    # 源代码目录
│   ├── assets/             # 静态资源文件夹
│   │   ├── images/         # 图片资源
│   │   └── styles/         # 全局样式
│   ├── components/         # React组件文件夹
│   │   ├── atoms/          # 原子组件（最小的UI单元）
│   │   ├── molecules/      # 分子组件（由原子组件组成）
│   │   ├── organisms/      # 有机体组件（复杂组件）
│   │   └── templates/      # 模板组件（页面结构）
│   ├── pages/              # 页面组件
│   │   ├── HomePage.jsx
│   │   └── AboutPage.jsx
│   ├── utils/              # 工具函数
│   ├── App.jsx             # 应用根组件
│   ├── index.jsx           # 应用入口文件
│   └── index.css           # 全局CSS
├── package.json            # 项目依赖配置
├── package-lock.json       # 依赖版本锁定
└── README.md               # 项目说明文档
        </div>
        
        <h2>三、主要文件功能说明</h2>
        
        <h3>1. 项目配置文件</h3>
        <table>
            <tr>
                <th>文件</th>
                <th>功能</th>
                <th>示例代码</th>
            </tr>
            <tr>
                <td>package.json</td>
                <td>定义项目名称、版本、依赖包等信息，包含npm脚本命令</td>
                <td>"name": "my-figma-project"<br>"dependencies": {\"react\": \"^18.2.0\"}</td>
            </tr>
            <tr>
                <td>package-lock.json</td>
                <td>锁定依赖包的具体版本，确保团队开发环境一致</td>
                <td>包含详细的依赖树和版本信息</td>
            </tr>
            <tr>
                <td>README.md</td>
                <td>项目说明文档，包含安装、运行、使用等信息</td>
                <td>## 安装<br>npm install</td>
            </tr>
        </table>
        
        <h3>2. 公共文件 (public/)</h3>
        <table>
            <tr>
                <th>文件</th>
                <th>功能</th>
            </tr>
            <tr>
                <td>index.html</td>
                <td>HTML模板文件，React应用将挂载到这个文件中</td>
            </tr>
            <tr>
                <td>favicon.ico</td>
                <td>网站的图标，显示在浏览器标签栏</td>
            </tr>
            <tr>
                <td>manifest.json</td>
                <td>配置PWA（渐进式Web应用）的信息</td>
            </tr>
        </table>
        
        <div class="code-block">
<!-- public/index.html 示例 -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Figma React App</title>
</head>
<body>
  <noscript>您需要启用JavaScript来运行此应用程序。</noscript>
  <div id="root"></div> <!-- React应用将挂载到这个div -->
</body>
</html>
        </div>
        
        <h3>3. 源代码文件 (src/)</h3>
        
        <h4>核心入口文件</h4>
        <table>
            <tr>
                <th>文件</th>
                <th>功能</th>
            </tr>
            <tr>
                <td>index.jsx</td>
                <td>应用的入口点，负责将React组件渲染到DOM中</td>
            </tr>
            <tr>
                <td>App.jsx</td>
                <td>根组件，包含应用的主要结构和路由配置</td>
            </tr>
            <tr>
                <td>index.css</td>
                <td>全局CSS样式文件</td>
            </tr>
        </table>
        
        <div class="code-block">
// src/index.jsx 示例
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
        </div>
        
        <h4>组件文件 (components/)</h4>
        <p>Figma导出的代码通常按照<em>原子设计系统</em>组织组件，这种设计方法有助于创建可复用、可维护的UI组件：</p>
        
        <div class="file-structure">
components/
├── atoms/          # 原子组件 - 最小的UI单元
│   ├── Button.jsx
│   ├── Input.jsx
│   └── Text.jsx
├── molecules/      # 分子组件 - 由原子组件组成
│   ├── SearchBar.jsx
│   └── CardHeader.jsx
├── organisms/      # 有机体组件 - 复杂组件
│   ├── Header.jsx
│   └── ProductCard.jsx
└── templates/      # 模板组件 - 页面结构
    ├── PageTemplate.jsx
    └── CardTemplate.jsx
        </div>
        
        <div class="code-block">
// src/components/atoms/Button.jsx 示例（原子组件）
import React from 'react';
import './Button.css';

const Button = ({ text, onClick, variant = 'primary' }) => {
  return (
    <button 
      className={`button button-${variant}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default Button;
        </div>
        
        <h4>页面文件 (pages/)</h4>
        <p>包含应用的各个页面组件，如首页、关于页等。每个页面通常由多个组件组成，形成完整的用户界面。</p>
        
        <div class="code-block">
// src/pages/HomePage.jsx 示例
import React from 'react';
import Header from '../components/organisms/Header';
import HeroSection from '../components/organisms/HeroSection';
import FeatureSection from '../components/organisms/FeatureSection';
import Footer from '../components/organisms/Footer';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <Header />
      <HeroSection />
      <FeatureSection />
      <Footer />
    </div>
  );
};

export default HomePage;
        </div>
        
        <h4>资源文件 (assets/)</h4>
        <p>包含图片、字体、图标等静态资源。Figma导出的代码通常会将设计中的图片和图标导出到这个目录，并在组件中引用。</p>
        
        <h4>工具函数 (utils/)</h4>
        <p>包含一些通用的工具函数，如日期处理、数据转换、API调用等，这些函数可以在多个组件中复用。</p>
        
        <h2>四、Figma导出代码的特点</h2>
        
        <div class="feature-list">
            <li><strong>结构清晰</strong>：按照组件化思想组织代码，便于维护和扩展</li>
            <li><strong>样式精确</strong>：与Figma设计稿保持高度一致，包括颜色、间距、字体等</li>
            <li><strong>可复用性</strong>：组件化设计提高了代码的复用性，减少重复工作</li>
            <li><strong>响应式</strong>：通常包含响应式设计的CSS，适配不同屏幕尺寸</li>
            <li><strong>模块化</strong>：使用ES6模块系统组织代码，便于导入和导出</li>
            <li><strong>命名规范</strong>：通常遵循一定的命名规范，如BEM命名法</li>
        </div>
        
        <div class="warning-box">
            <strong>注意事项：</strong> Figma导出的代码通常只包含UI结构和样式，不包含业务逻辑。你需要根据需求添加交互逻辑、状态管理、API调用等功能。
        </div>
        
        <h2>五、如何有效使用Figma导出的代码</h2>
        
        <h3>1. 理解设计系统</h3>
        <p>花时间理解Figma设计稿中的设计系统，包括颜色、字体、间距、组件等。这将帮助你更好地理解导出的代码，并在开发过程中保持设计的一致性。</p>
        
        <h3>2. 逐步修改</h3>
        <p>不要一次性修改所有代码，而是逐步进行。先理解现有代码的结构和功能，然后再进行修改和扩展。这样可以减少错误，并更容易定位问题。</p>
        
        <h3>3. 添加交互逻辑</h3>
        <p>Figma导出的代码通常只包含UI结构和样式，你需要添加交互逻辑来实现完整的功能。例如，添加按钮点击事件、表单提交处理、数据获取等。</p>
        
        <h3>4. 优化代码</h3>
        <p>导出的代码可能包含一些冗余的部分，你可以根据需要进行优化，如：</p>
        <ul>
            <li>提取公共组件，减少重复代码</li>
            <li>优化CSS样式，使用CSS变量或CSS-in-JS</li>
            <li>添加适当的注释，提高代码可读性</li>
            <li>使用TypeScript增强类型安全性</li>
        </ul>
        
        <h3>5. 版本控制</h3>
        <p>将代码添加到Git等版本控制系统中，便于跟踪修改、协作开发和回滚操作。</p>
        
        <h2>六、学习资源推荐</h2>
        
        <ul>
            <li><a href="https://react.dev/" target="_blank">React官方文档</a> - 学习React的最佳资源，包含详细的教程和API文档</li>
            <li><a href="https://www.figma.com/developers/" target="_blank">Figma开发者文档</a> - 了解Figma API和导出功能</li>
            <li><a href="https://atomicdesign.bradfrost.com/" target="_blank">原子设计系统</a> - 理解组件设计思想的权威资源</li>
            <li><a href="https://www.w3schools.com/react/" target="_blank">W3Schools React教程</a> - 适合初学者的教程，包含大量示例</li>
            <li><a href="https://scrimba.com/learn/learnreact" target="_blank">Scrimba React教程</a> - 交互式学习平台，边学边练</li>
            <li><a href="https://frontendmasters.com/learn/react/" target="_blank">Frontend Masters React课程</a> - 高级React课程，深入学习React的核心概念</li>
        </ul>
        
        <div class="note">
            <strong>学习建议：</strong> 学习React最好的方法是实践。尝试修改Figma导出的代码，添加新功能，或者从头开始构建一些小项目。随着经验的积累，你会越来越熟练地使用React。
        </div>
        
        <h2>七、总结</h2>
        <p class="section-intro">Figma导出的React代码提供了一个很好的起点，可以帮助你快速实现设计稿。理解项目的文件结构和各文件的功能是有效使用这些代码的关键。</p>
        <p>通过学习和实践，你将能够掌握React开发，并能够灵活地使用Figma导出的代码来构建高质量的Web应用。记住，持续学习和实践是提高编程技能的最佳途径。</p>
        
        <footer style="margin-top: 50px; text-align: center; color: #666; border-top: 1px solid #e0e0e0; padding-top: 20px;">
            <p>Figma导出React代码学习指南 © 2026</p>
            <p>本指南旨在帮助开发者理解和使用Figma导出的React代码</p>
        </footer>
    </div>
</body>
</html><!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Figma导出React代码学习指南</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
            text-align: center;
        }
        h2 {
            color: #34495e;
            margin-top: 40px;
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 5px;
        }
        h3 {
            color: #555;
            margin-top: 30px;
        }
        .container {
            background-color: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .file-structure {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            font-family: 'Courier New', Courier, monospace;
            white-space: pre;
            overflow-x: auto;
            margin: 20px 0;
            border-left: 4px solid #3498db;
        }
        .code-block {
            background-color: #2c3e50;
            color: #ecf0f1;
            padding: 15px;
            border-radius: 5px;
            font-family: 'Courier New', Courier, monospace;
            margin: 15px 0;
            overflow-x: auto;
            border-left: 4px solid #27ae60;
        }
        .highlight {
            background-color: #3498db;
            color: white;
            padding: 2px 5px;
            border-radius: 3px;
        }
        .note {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
        }
        .feature-list {
            list-style-type: none;
            padding: 0;
        }
        .feature-list li {
            margin: 10px 0;
            padding-left: 25px;
            position: relative;
        }
        .feature-list li::before {
            content: "✓";
            color: #28a745;
            font-weight: bold;
            position: absolute;
            left: 0;
        }
        img {
            max-width: 100%;
            height: auto;
            border-radius: 5px;
            margin: 20px 0;
            border: 1px solid #ddd;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
            color: #333;
        }
        tr:hover {
            background-color: #f5f5f5;
        }
        .info-box {
            background-color: #d1ecf1;
            border-left: 4px solid #17a2b8;
            padding: 15px;
            margin: 20px 0;
        }
        .warning-box {
            background-color: #f8d7da;
            border-left: 4px solid #dc3545;
            padding: 15px;
            margin: 20px 0;
        }
        .center-image {
            display: block;
            margin: 0 auto;
        }
        a {
            color: #3498db;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        .section-intro {
            font-size: 1.1em;
            color: #666;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Figma导出React代码学习指南</h1>
        
        <div class="info-box">
            <strong>为什么选择HTML格式？</strong> HTML文件具有极高的可读性，可以直接在浏览器中打开查看，无需安装额外的开发环境。通过图文并茂的方式，能更直观地理解React项目的结构和代码组织方式。
        </div>
        
        <h2>一、项目概述</h2>
        <p class="section-intro">Figma是一款强大的UI设计工具，它允许设计师创建精美的界面设计，并可以将这些设计导出为React代码。这些导出的代码提供了一个良好的起点，可以帮助开发者快速实现设计稿。</p>
        <p>本指南将帮助你理解Figma导出的React项目的文件结构、各文件的功能和作用，以及如何有效使用这些代码。</p>
        
        <h2>二、典型文件结构</h2>
        <p class="section-intro">Figma导出的React项目通常遵循以下文件结构，这种结构有利于代码的组织和维护：</p>
        
        <div class="file-structure">
my-figma-project/
├── public/                  # 公共资源目录
│   ├── index.html          # 项目入口HTML文件
│   ├── favicon.ico         # 网站图标
│   └── manifest.json       # PWA配置文件
├── src/                    # 源代码目录
│   ├── assets/             # 静态资源文件夹
│   │   ├── images/         # 图片资源
│   │   └── styles/         # 全局样式
│   ├── components/         # React组件文件夹
│   │   ├── atoms/          # 原子组件（最小的UI单元）
│   │   ├── molecules/      # 分子组件（由原子组件组成）
│   │   ├── organisms/      # 有机体组件（复杂组件）
│   │   └── templates/      # 模板组件（页面结构）
│   ├── pages/              # 页面组件
│   │   ├── HomePage.jsx
│   │   └── AboutPage.jsx
│   ├── utils/              # 工具函数
│   ├── App.jsx             # 应用根组件
│   ├── index.jsx           # 应用入口文件
│   └── index.css           # 全局CSS
├── package.json            # 项目依赖配置
├── package-lock.json       # 依赖版本锁定
└── README.md               # 项目说明文档
        </div>
        
        <h2>三、主要文件功能说明</h2>
        
        <h3>1. 项目配置文件</h3>
        <table>
            <tr>
                <th>文件</th>
                <th>功能</th>
                <th>示例代码</th>
            </tr>
            <tr>
                <td>package.json</td>
                <td>定义项目名称、版本、依赖包等信息，包含npm脚本命令</td>
                <td>"name": "my-figma-project"<br>"dependencies": {\"react\": \"^18.2.0\"}</td>
            </tr>
            <tr>
                <td>package-lock.json</td>
                <td>锁定依赖包的具体版本，确保团队开发环境一致</td>
                <td>包含详细的依赖树和版本信息</td>
            </tr>
            <tr>
                <td>README.md</td>
                <td>项目说明文档，包含安装、运行、使用等信息</td>
                <td>## 安装<br>npm install</td>
            </tr>
        </table>
        
        <h3>2. 公共文件 (public/)</h3>
        <table>
            <tr>
                <th>文件</th>
                <th>功能</th>
            </tr>
            <tr>
                <td>index.html</td>
                <td>HTML模板文件，React应用将挂载到这个文件中</td>
            </tr>
            <tr>
                <td>favicon.ico</td>
                <td>网站的图标，显示在浏览器标签栏</td>
            </tr>
            <tr>
                <td>manifest.json</td>
                <td>配置PWA（渐进式Web应用）的信息</td>
            </tr>
        </table>
        
        <div class="code-block">
<!-- public/index.html 示例 -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Figma React App</title>
</head>
<body>
  <noscript>您需要启用JavaScript来运行此应用程序。</noscript>
  <div id="root"></div> <!-- React应用将挂载到这个div -->
</body>
</html>
        </div>
        
        <h3>3. 源代码文件 (src/)</h3>
        
        <h4>核心入口文件</h4>
        <table>
            <tr>
                <th>文件</th>
                <th>功能</th>
            </tr>
            <tr>
                <td>index.jsx</td>
                <td>应用的入口点，负责将React组件渲染到DOM中</td>
            </tr>
            <tr>
                <td>App.jsx</td>
                <td>根组件，包含应用的主要结构和路由配置</td>
            </tr>
            <tr>
                <td>index.css</td>
                <td>全局CSS样式文件</td>
            </tr>
        </table>
        
        <div class="code-block">
// src/index.jsx 示例
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
        </div>
        
        <h4>组件文件 (components/)</h4>
        <p>Figma导出的代码通常按照<em>原子设计系统</em>组织组件，这种设计方法有助于创建可复用、可维护的UI组件：</p>
        
        <div class="file-structure">
components/
├── atoms/          # 原子组件 - 最小的UI单元
│   ├── Button.jsx
│   ├── Input.jsx
│   └── Text.jsx
├── molecules/      # 分子组件 - 由原子组件组成
│   ├── SearchBar.jsx
│   └── CardHeader.jsx
├── organisms/      # 有机体组件 - 复杂组件
│   ├── Header.jsx
│   └── ProductCard.jsx
└── templates/      # 模板组件 - 页面结构
    ├── PageTemplate.jsx
    └── CardTemplate.jsx
        </div>
        
        <div class="code-block">
// src/components/atoms/Button.jsx 示例（原子组件）
import React from 'react';
import './Button.css';

const Button = ({ text, onClick, variant = 'primary' }) => {
  return (
    <button 
      className={`button button-${variant}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default Button;
        </div>
        
        <h4>页面文件 (pages/)</h4>
        <p>包含应用的各个页面组件，如首页、关于页等。每个页面通常由多个组件组成，形成完整的用户界面。</p>
        
        <div class="code-block">
// src/pages/HomePage.jsx 示例
import React from 'react';
import Header from '../components/organisms/Header';
import HeroSection from '../components/organisms/HeroSection';
import FeatureSection from '../components/organisms/FeatureSection';
import Footer from '../components/organisms/Footer';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <Header />
      <HeroSection />
      <FeatureSection />
      <Footer />
    </div>
  );
};

export default HomePage;
        </div>
        
        <h4>资源文件 (assets/)</h4>
        <p>包含图片、字体、图标等静态资源。Figma导出的代码通常会将设计中的图片和图标导出到这个目录，并在组件中引用。</p>
        
        <h4>工具函数 (utils/)</h4>
        <p>包含一些通用的工具函数，如日期处理、数据转换、API调用等，这些函数可以在多个组件中复用。</p>
        
        <h2>四、Figma导出代码的特点</h2>
        
        <div class="feature-list">
            <li><strong>结构清晰</strong>：按照组件化思想组织代码，便于维护和扩展</li>
            <li><strong>样式精确</strong>：与Figma设计稿保持高度一致，包括颜色、间距、字体等</li>
            <li><strong>可复用性</strong>：组件化设计提高了代码的复用性，减少重复工作</li>
            <li><strong>响应式</strong>：通常包含响应式设计的CSS，适配不同屏幕尺寸</li>
            <li><strong>模块化</strong>：使用ES6模块系统组织代码，便于导入和导出</li>
            <li><strong>命名规范</strong>：通常遵循一定的命名规范，如BEM命名法</li>
        </div>
        
        <div class="warning-box">
            <strong>注意事项：</strong> Figma导出的代码通常只包含UI结构和样式，不包含业务逻辑。你需要根据需求添加交互逻辑、状态管理、API调用等功能。
        </div>
        
        <h2>五、如何有效使用Figma导出的代码</h2>
        
        <h3>1. 理解设计系统</h3>
        <p>花时间理解Figma设计稿中的设计系统，包括颜色、字体、间距、组件等。这将帮助你更好地理解导出的代码，并在开发过程中保持设计的一致性。</p>
        
        <h3>2. 逐步修改</h3>
        <p>不要一次性修改所有代码，而是逐步进行。先理解现有代码的结构和功能，然后再进行修改和扩展。这样可以减少错误，并更容易定位问题。</p>
        
        <h3>3. 添加交互逻辑</h3>
        <p>Figma导出的代码通常只包含UI结构和样式，你需要添加交互逻辑来实现完整的功能。例如，添加按钮点击事件、表单提交处理、数据获取等。</p>
        
        <h3>4. 优化代码</h3>
        <p>导出的代码可能包含一些冗余的部分，你可以根据需要进行优化，如：</p>
        <ul>
            <li>提取公共组件，减少重复代码</li>
            <li>优化CSS样式，使用CSS变量或CSS-in-JS</li>
            <li>添加适当的注释，提高代码可读性</li>
            <li>使用TypeScript增强类型安全性</li>
        </ul>
        
        <h3>5. 版本控制</h3>
        <p>将代码添加到Git等版本控制系统中，便于跟踪修改、协作开发和回滚操作。</p>
        
        <h2>六、学习资源推荐</h2>
        
        <ul>
            <li><a href="https://react.dev/" target="_blank">React官方文档</a> - 学习React的最佳资源，包含详细的教程和API文档</li>
            <li><a href="https://www.figma.com/developers/" target="_blank">Figma开发者文档</a> - 了解Figma API和导出功能</li>
            <li><a href="https://atomicdesign.bradfrost.com/" target="_blank">原子设计系统</a> - 理解组件设计思想的权威资源</li>
            <li><a href="https://www.w3schools.com/react/" target="_blank">W3Schools React教程</a> - 适合初学者的教程，包含大量示例</li>
            <li><a href="https://scrimba.com/learn/learnreact" target="_blank">Scrimba React教程</a> - 交互式学习平台，边学边练</li>
            <li><a href="https://frontendmasters.com/learn/react/" target="_blank">Frontend Masters React课程</a> - 高级React课程，深入学习React的核心概念</li>
        </ul>
        
        <div class="note">
            <strong>学习建议：</strong> 学习React最好的方法是实践。尝试修改Figma导出的代码，添加新功能，或者从头开始构建一些小项目。随着经验的积累，你会越来越熟练地使用React。
        </div>
        
        <h2>七、总结</h2>
        <p class="section-intro">Figma导出的React代码提供了一个很好的起点，可以帮助你快速实现设计稿。理解项目的文件结构和各文件的功能是有效使用这些代码的关键。</p>
        <p>通过学习和实践，你将能够掌握React开发，并能够灵活地使用Figma导出的代码来构建高质量的Web应用。记住，持续学习和实践是提高编程技能的最佳途径。</p>
        
        <footer style="margin-top: 50px; text-align: center; color: #666; border-top: 1px solid #e0e0e0; padding-top: 20px;">
            <p>Figma导出React代码学习指南 © 2026</p>
            <p>本指南旨在帮助开发者理解和使用Figma导出的React代码</p>
        </footer>
    </div>
</body>
</html>**Add your own guidelines here**
<!--

System Guidelines

Use this file to provide the AI with rules and guidelines you want it to follow.
This template outlines a few examples of things you can add. You can add your own sections and format it to suit your needs

TIP: More context isn't always better. It can confuse the LLM. Try and add the most important rules you need

# General guidelines

Any general rules you want the AI to follow.
For example:

* Only use absolute positioning when necessary. Opt for responsive and well structured layouts that use flexbox and grid by default
* Refactor code as you go to keep code clean
* Keep file sizes small and put helper functions and components in their own files.

--------------

# Design system guidelines
Rules for how the AI should make generations look like your company's design system

Additionally, if you select a design system to use in the prompt box, you can reference
your design system's components, tokens, variables and components.
For example:

* Use a base font-size of 14px
* Date formats should always be in the format “Jun 10”
* The bottom toolbar should only ever have a maximum of 4 items
* Never use the floating action button with the bottom toolbar
* Chips should always come in sets of 3 or more
* Don't use a dropdown if there are 2 or fewer options

You can also create sub sections and add more specific details
For example:


## Button
The Button component is a fundamental interactive element in our design system, designed to trigger actions or navigate
users through the application. It provides visual feedback and clear affordances to enhance user experience.

### Usage
Buttons should be used for important actions that users need to take, such as form submissions, confirming choices,
or initiating processes. They communicate interactivity and should have clear, action-oriented labels.

### Variants
* Primary Button
  * Purpose : Used for the main action in a section or page
  * Visual Style : Bold, filled with the primary brand color
  * Usage : One primary button per section to guide users toward the most important action
* Secondary Button
  * Purpose : Used for alternative or supporting actions
  * Visual Style : Outlined with the primary color, transparent background
  * Usage : Can appear alongside a primary button for less important actions
* Tertiary Button
  * Purpose : Used for the least important actions
  * Visual Style : Text-only with no border, using primary color
  * Usage : For actions that should be available but not emphasized
-->
