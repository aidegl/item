/**
 * 像素Canvas页面组件
 */
export default class PixelCanvasPage {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.characterData = null; // 角色JSON数据
        this.colorPalette = null; // 调色板数据
        this.isDataLoaded = false;
        this.canvasWidth = 120; // Canvas逻辑宽度（系统级分辨率，统一分辨率）
        this.charWidth = 0; // 角色宽度（从JSON数据计算，使用整个数据数组的宽度）
        this.charHeight = 0; // 角色高度（从JSON数据计算，使用整个数据数组的高度）
        this.charX = 0;
        this.charY = 0;
        this.isSelected = false;
        this.chatBox = null;
        
        // 五行颜色映射
        this.wuxingColors = {
            '金': {
                '较浅色': '#b4b4b4',
                '浅色': '#929292',
                '深色': '#727272',
                '较深色': '#545454',
                '特淡': '#f2f2f2'
            },
            '木': {
                '较浅色': '#30ee73',
                '浅色': '#2bd64f',
                '深色': '#1dbb59',
                '较深色': '#00a555',
                '特淡': '#a6f7c2'
            },
            '水': {
                '较浅色': '#00C5E8',
                '浅色': '#00A2E8',
                '深色': '#0087E8',
                '较深色': '#0064E8',
                '特淡': '#a6f7c2'
            },
            '火': {
                '较浅色': '#ff7a7a',
                '浅色': '#f35a5a',
                '深色': '#cf4e4e',
                '较深色': '#bb3939',
                '特淡': '#ffdbeb'
            },
            '土': {
                '较浅色': '#ffc343',
                '浅色': '#d9931a',
                '深色': '#ba7326',
                '较深色': '#905322',
                '特淡': '#ffdc92'
            }
        };
        this.defaultOutlineColor = '#00C5E8'; // 默认描边颜色
        this.characterWuxing = null; // 角色五行属性，后续从API获取
        
        // 功能组配置
        this.functionGroups = {
            leftTop: [
                { name: 'kapai' },
                { name: 'renwu' },
                { name: 'xiangfa' }
            ],
            rightTop: [
                { name: 'shangcheng' },
                { name: 'xiaoxi' },
                { name: 'chongdian' },
                { name: 'hua' },
                { name: 'paipai' }
            ]
        };
        
        // 图标显示逻辑（从icon.json加载）
        this.iconDisplayLogic = null;
        this.aiType = 'AI'; // 默认类型，后续从API获取
        this.endType = '用户端'; // 默认端类型，后续从API获取
        this.showAllIconsForDebug = true; // 调试：true=显示全部功能图标，false=按icon.json规则
        
        this.init();
    }

    async init() {
        // 加载图标显示逻辑
        await this.loadIconDisplayLogic();
        // 加载页面DOM
        await this.loadHTML();
        // 加载页面样式
        this.loadCSS();
        // 初始化Canvas
        this.initCanvas();
        // 加载调色板
        await this.loadColorPalette();
        // 加载角色数据
        await this.loadCharacter();
    }

    async loadHTML() {
        try {
            const response = await fetch('./pages/pixel-canvas/index.html');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();
            this.container.innerHTML = html;
            this.canvas = document.getElementById('pixelCanvas');
            this.chatBox = document.getElementById('chatBox');
            
            if (!this.canvas) {
                console.error('找不到 canvas 元素');
            }
            if (!this.chatBox) {
                console.error('找不到 chatBox 元素');
            }
            
            // HTML加载完成后初始化功能组
            this.initFunctionGroups();
        } catch (error) {
            console.error('加载HTML失败:', error);
            // 如果fetch失败，直接使用内联HTML
            this.container.innerHTML = `
                <section class="pixel-canvas-page" role="region" aria-label="像素角色展示">
                    <div class="canvas-container">
                        <canvas id="pixelCanvas" role="img" aria-label="像素角色" tabindex="0"></canvas>
                        
                        <!-- 信息框（系统级分辨率：屏幕宽/120） -->
                        <div class="info-box" id="infoBox">
                            <!-- 信息框图片 -->
                            <img src="./assets/isPixel/xinxikuang.png" alt="信息框" class="info-box-image" id="infoBoxImage">
                            <!-- 等级背景 -->
                            <img src="./assets/isPixel/等级背景.png" alt="等级背景" class="level-background" id="levelBackground">
                            <!-- 经验背景 -->
                            <img src="./assets/isPixel/jingyanbeijing.png" alt="经验背景" class="exp-background" id="expBackground">
                            <!-- 地图 -->
                            <img src="./assets/isPixel/ditu.png" alt="地图" class="ditu" id="ditu">
                            <!-- 经验条格子 -->
                            <div class="exp-bar-grid" id="expBarGrid">
                                <div class="exp-bar-segment exp-bar-segment-1"></div>
                                <div class="exp-bar-segment exp-bar-segment-2"></div>
                                <div class="exp-bar-segment exp-bar-segment-3"></div>
                                <div class="exp-bar-segment exp-bar-segment-4"></div>
                            </div>
                            <!-- 等级文字 -->
                            <div class="level-text" id="levelText">LV 01</div>
                            <!-- 经验值文字 -->
                            <div class="exp-text" id="expText">经验值：0/20</div>
                        </div>
                    </div>
                    
                    <!-- 功能组 - 左上角 -->
                    <div class="function-group function-group-leftTop"></div>
                    
                    <!-- 功能组 - 右上角 -->
                    <div class="function-group function-group-rightTop"></div>
                    
                    <div class="chat-box" id="chatBox" role="dialog" aria-label="角色对话" aria-hidden="true">
                        <p class="chat-message">你好，我叫阿兰，你找我有事吗？</p>
                    </div>
                </section>
            `;
            this.canvas = document.getElementById('pixelCanvas');
            this.chatBox = document.getElementById('chatBox');
            
            // HTML加载完成后初始化功能组
            this.initFunctionGroups();
        }
    }

    async loadIconDisplayLogic() {
        try {
            const response = await fetch('./pages/pixel-canvas/icon.json');
            if (response.ok) {
                this.iconDisplayLogic = await response.json();
            }
        } catch (error) {
            console.error('加载图标显示逻辑失败:', error);
        }
    }

    loadCSS() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = './pages/pixel-canvas/index.css';
        document.head.appendChild(link);
    }

    initCanvas() {
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        
        // 禁用Canvas抗锯齿，保持像素化效果
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;

        // 初始化Canvas尺寸
        this.updateCanvas();
        
        // 设置系统级分辨率变量
        this.updateSystemScale();
        
        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            this.updateCanvas();
            this.updateSystemScale();
        });
        
        // 监听Canvas点击事件
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
    }

    updateSystemScale() {
        // 系统级分辨率 = 屏幕宽/120
        const systemScale = window.innerWidth / 120;
        document.documentElement.style.setProperty('--system-scale', `${systemScale}px`);
        
        // 功能图标尺寸：屏幕宽度/120 × 图片宽度16
        const iconSize = (window.innerWidth / 120) * 16;
        document.documentElement.style.setProperty('--function-icon-size', `${iconSize}px`);
        
        // 信息框尺寸：屏幕宽度/120 × 图片原始尺寸（84x26）
        const infoBoxWidth = (window.innerWidth / 120) * 84;
        const infoBoxHeight = (window.innerWidth / 120) * 26;
        document.documentElement.style.setProperty('--info-box-width', `${infoBoxWidth}px`);
        document.documentElement.style.setProperty('--info-box-height', `${infoBoxHeight}px`);
        
        // 地图尺寸：屏幕宽度/120 × 图片原始尺寸（25x17）
        const dituWidth = (window.innerWidth / 120) * 25;
        const dituHeight = (window.innerWidth / 120) * 17;
        document.documentElement.style.setProperty('--ditu-width', `${dituWidth}px`);
        document.documentElement.style.setProperty('--ditu-height', `${dituHeight}px`);
        
        // 经验条尺寸：屏幕宽度/120 × 尺寸（72x2）
        const expBarWidth = (window.innerWidth / 120) * 72;
        const expBarHeight = (window.innerWidth / 120) * 2;
        document.documentElement.style.setProperty('--exp-bar-width', `${expBarWidth}px`);
        document.documentElement.style.setProperty('--exp-bar-height', `${expBarHeight}px`);
        
        // 等级文字背景尺寸：屏幕宽度/120 × 尺寸（35x9）
        const levelTextBgWidth = (window.innerWidth / 120) * 35;
        const levelTextBgHeight = (window.innerWidth / 120) * 9;
        document.documentElement.style.setProperty('--level-text-bg-width', `${levelTextBgWidth}px`);
        document.documentElement.style.setProperty('--level-text-bg-height', `${levelTextBgHeight}px`);
        
        // 经验值文字宽度：屏幕宽度/120 × 尺寸（72）
        const expTextWidth = (window.innerWidth / 120) * 72;
        document.documentElement.style.setProperty('--exp-text-width', `${expTextWidth}px`);
        
        // 更新信息框和功能组位置
        this.updateInfoBox();
        this.updateFunctionGroups();
    }

    updateInfoBox() {
        // 等级背景和经验背景现在是图片，不需要设置背景色
        // 如果需要根据五行属性改变图片颜色，可以使用 CSS filter 或其他方式
        // 目前直接显示图片即可
    }

    updateFunctionGroups() {
        // 功能组位置已在CSS中通过var(--system-scale)自动计算
        // 这里可以添加其他需要更新的逻辑
    }

    updateCanvas() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // 计算整数倍缩放
        const scale = Math.floor(screenWidth / this.canvasWidth);
        const actualScale = Math.max(1, scale);
        
        const canvasHeight = Math.floor(screenHeight / actualScale);
        
        // 设置Canvas实际像素尺寸
        this.canvas.width = this.canvasWidth;
        this.canvas.height = canvasHeight;
        
        // 设置Canvas显示尺寸
        this.canvas.style.width = (this.canvasWidth * actualScale) + 'px';
        this.canvas.style.height = (canvasHeight * actualScale) + 'px';
        
        // 更新角色位置（居中）
        if (this.charWidth > 0 && this.charHeight > 0) {
            this.charX = Math.floor((this.canvas.width - this.charWidth) / 2);
            this.charY = Math.floor((this.canvas.height - this.charHeight) / 2);
        }
        
        // 重绘
        this.redraw();
    }

    redraw() {
        // 绘制背景
        this.ctx.fillStyle = '#fbebd3';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制角色
        if (this.isDataLoaded) {
            this.drawCharacter();
            
            // 如果选中，绘制描边
            if (this.isSelected) {
                this.drawOutline();
            }
        }
    }

    drawCharacter() {
        if (!this.isDataLoaded || !this.characterData || !this.colorPalette) return;
        
        // JSON数据宽度是120等分（系统级分辨率），Canvas宽度也是120等分
        // 1:1 映射，不需要缩放
        // 遍历JSON数据绘制像素
        for (let row = 0; row < this.characterData.length; row++) {
            for (let col = 0; col < this.characterData[row].length; col++) {
                const colorValue = this.characterData[row][col];
                
                // 跳过透明像素
                if (colorValue === null || colorValue === '') continue;
                
                // 将HEX颜色值转换为Canvas颜色
                const color = this.hexToColor(colorValue);
                if (!color) continue;
                
                // 计算在Canvas上的位置（1:1映射，居中）
                const canvasX = this.charX + col;
                const canvasY = this.charY + row;
                
                // 确保不超出Canvas边界
                if (canvasX >= 0 && canvasX < this.canvas.width && 
                    canvasY >= 0 && canvasY < this.canvas.height) {
                    this.ctx.fillStyle = color;
                    this.ctx.fillRect(canvasX, canvasY, 1, 1);
                }
            }
        }
    }
    
    hexToColor(hexValue) {
        // 如果hexValue已经是完整的HEX颜色值（如"181818"），直接使用
        if (typeof hexValue === 'string' && hexValue.length === 6) {
            return '#' + hexValue;
        }
        
        // 如果是数字索引（0-110），从调色板中查找
        if (typeof hexValue === 'number') {
            return this.getColorFromPalette(hexValue);
        }
        
        return null;
    }
    
    getColorFromPalette(index) {
        if (!this.colorPalette || index < 0 || index > 110) return null;
        
        // 计算在调色板中的位置
        // 第0行：0-9（10个颜色），第1行：10-19，以此类推
        const row = Math.floor(index / 10);
        const col = index % 10;
        
        if (row < this.colorPalette.length && col < this.colorPalette[row].length) {
            const hexValue = this.colorPalette[row][col];
            return '#' + hexValue;
        }
        
        return null;
    }

    drawOutline() {
        if (!this.isDataLoaded || !this.characterData) return;
        
        // 根据角色五行属性获取描边颜色，默认使用蓝色
        let outlineColor = this.defaultOutlineColor; // 默认 #00C5E8（蓝色）
        if (this.characterWuxing && this.wuxingColors[this.characterWuxing]) {
            outlineColor = this.wuxingColors[this.characterWuxing]['浅色'];
        }
        
        // 检测边界像素并绘制描边（1:1映射，不需要缩放）
        for (let row = 0; row < this.characterData.length; row++) {
            for (let col = 0; col < this.characterData[row].length; col++) {
                const colorValue = this.characterData[row][col];
                
                // 如果当前像素不透明（是角色的一部分）
                if (colorValue !== null && colorValue !== '') {
                    // 检查上下左右四个方向的邻居
                    const neighbors = [
                        { dx: 0, dy: -1 }, // 上
                        { dx: 1, dy: 0 },  // 右
                        { dx: 0, dy: 1 },  // 下
                        { dx: -1, dy: 0 }  // 左
                    ];
                    
                    // 检查每个邻居
                    for (const neighbor of neighbors) {
                        const nRow = row + neighbor.dy;
                        const nCol = col + neighbor.dx;
                        
                        // 如果邻居超出边界，或者邻居是透明的，则绘制描边
                        if (nRow < 0 || nRow >= this.characterData.length ||
                            nCol < 0 || nCol >= this.characterData[row].length) {
                            // 超出边界，绘制描边
                            const canvasX = this.charX + col;
                            const canvasY = this.charY + row;
                            
                            // 在邻居位置绘制描边
                            const outlineX = canvasX + neighbor.dx;
                            const outlineY = canvasY + neighbor.dy;
                            
                            if (outlineX >= 0 && outlineX < this.canvas.width && 
                                outlineY >= 0 && outlineY < this.canvas.height) {
                                this.ctx.fillStyle = outlineColor;
                                this.ctx.fillRect(outlineX, outlineY, 1, 1);
                            }
                        } else {
                            const neighborValue = this.characterData[nRow][nCol];
                            
                            // 如果邻居是透明的，绘制描边
                            if (neighborValue === null || neighborValue === '') {
                                const canvasX = this.charX + col;
                                const canvasY = this.charY + row;
                                
                                const outlineX = canvasX + neighbor.dx;
                                const outlineY = canvasY + neighbor.dy;
                                
                                if (outlineX >= 0 && outlineX < this.canvas.width && 
                                    outlineY >= 0 && outlineY < this.canvas.height) {
                                    this.ctx.fillStyle = outlineColor;
                                    this.ctx.fillRect(outlineX, outlineY, 1, 1);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    handleCanvasClick(e) {
        if (!this.isDataLoaded || !this.characterData) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const scale = this.canvas.width / rect.width;
        const x = Math.floor((e.clientX - rect.left) * scale);
        const y = Math.floor((e.clientY - rect.top) * scale);
        
        // 检查点击是否在角色边界框范围内（整个角色区域，包括透明部分）
        if (x >= this.charX && x < this.charX + this.charWidth &&
            y >= this.charY && y < this.charY + this.charHeight) {
            // 只要在角色边界框内就响应点击，不要求必须是像素位置
            // 切换选中状态
            this.isSelected = !this.isSelected;
            
            // 重绘Canvas（显示/隐藏描边）
            this.redraw();
            
            // 显示/隐藏聊天框
            if (this.isSelected) {
                this.showChatBox();
            } else {
                this.hideChatBox();
            }
        }
    }

    showChatBox() {
        if (this.chatBox) {
            this.chatBox.classList.add('show');
            this.chatBox.setAttribute('aria-hidden', 'false');
        }
    }

    hideChatBox() {
        if (this.chatBox) {
            this.chatBox.classList.remove('show');
            this.chatBox.setAttribute('aria-hidden', 'true');
        }
    }

    initFunctionGroups() {
        // 初始化左上角功能组
        this.createFunctionGroup('leftTop', this.functionGroups.leftTop);
        // 初始化右上角功能组
        this.createFunctionGroup('rightTop', this.functionGroups.rightTop);
    }

    createFunctionGroup(position, functions) {
        const pageElement = this.container.querySelector('.pixel-canvas-page');
        if (!pageElement) return;
        
        const container = pageElement.querySelector(`.function-group-${position}`);
        if (!container) return;
        
        functions.forEach((func, index) => {
            // 检查是否应该显示该图标
            if (this.shouldShowIcon(func.name)) {
                const icon = document.createElement('img');
                icon.src = `./assets/isPixel/${func.name}.png`;
                icon.alt = func.name;
                icon.className = 'function-icon';
                icon.onerror = () => {
                    console.warn(`功能图标加载失败: ${func.name}.png`);
                };
                container.appendChild(icon);
            }
        });
    }

    shouldShowIcon(iconName) {
        const iconMap = {
            'shangcheng': '商城',
            'chongdian': '充电',
            'kapai': '卡牌',
            'paipai': '拍拍',
            'hua': '送花',
            'renwu': '任务',
            'xiangfa': '想法',
            'xiaoxi': '消息',
            'xitongrenwu': '系统任务'
        };
        if (!iconMap[iconName]) return false;
        
        // 调试模式：显示全部功能图标（左+右含送花、拍拍），便于开发测试
        if (this.showAllIconsForDebug) return true;
        
        if (!this.iconDisplayLogic) return false;
        
        const displayName = iconMap[iconName];
        const logic = this.iconDisplayLogic.find(
            item => item.类型 === this.aiType && item.端 === this.endType
        );
        if (!logic) return false;
        
        const shouldShow = logic[displayName];
        return shouldShow === 1 || shouldShow === 2;
    }

    async loadColorPalette() {
        try {
            // 尝试多个可能的路径（服务器可能在项目根目录或webview目录）
            const paths = [
                'webview/color.json',  // 服务器在项目根目录
                '/color.json',         // 服务器在webview目录（绝对路径）
                './color.json',        // 服务器在webview目录（相对路径）
                '../../color.json'     // 备用相对路径
            ];
            let response = null;
            let lastError = null;
            
            for (const path of paths) {
                try {
                    response = await fetch(path);
                    if (response.ok) {
                        console.log(`调色板路径成功: ${path}`);
                        break;
                    }
                } catch (e) {
                    lastError = e;
                    continue;
                }
            }
            
            if (response && response.ok) {
                const text = await response.text();
                if (!text || text.trim().length === 0) {
                    throw new Error('调色板文件为空');
                }
                this.colorPalette = JSON.parse(text);
                console.log('调色板加载成功');
            } else {
                console.error('调色板加载失败: 所有路径都失败', lastError);
            }
        } catch (error) {
            console.error('加载调色板失败:', error);
        }
    }

    async loadCharacter() {
        try {
            // 尝试多个可能的路径（服务器可能在项目根目录或webview目录）
            // 注意：调色板使用 ./color.json 成功，说明服务器在webview目录
            const paths = [
                './juese.json',        // 服务器在webview目录（相对路径，与color.json相同）
                '../../juese.json',     // 备用相对路径
                '/juese.json',          // 服务器在webview目录（绝对路径）
                'webview/juese.json'    // 服务器在项目根目录
            ];
            let response = null;
            let lastError = null;
            let successfulPath = null;
            
            for (const path of paths) {
                try {
                    response = await fetch(path);
                    if (response.ok) {
                        // 克隆响应以便检查内容而不消费原始响应
                        const clonedResponse = response.clone();
                        const text = await clonedResponse.text();
                        if (text && text.trim().length > 0) {
                            console.log(`角色数据路径成功: ${path}, 文件大小: ${text.length} 字符`);
                            successfulPath = path;
                            break;
                        } else {
                            console.warn(`路径 ${path} 返回空文件`);
                            response = null;
                        }
                    }
                } catch (e) {
                    lastError = e;
                    response = null;
                    continue;
                }
            }
            
            if (!response || !response.ok) {
                throw new Error(`HTTP error! status: ${response ? response.status : 'no response'}, 最后错误: ${lastError}`);
            }
            
            // 先获取文本，检查是否为空
            const text = await response.text();
            if (!text || text.trim().length === 0) {
                throw new Error(`角色数据文件为空 (路径: ${successfulPath || '未知'})`);
            }
            
            console.log(`文件内容长度: ${text.length} 字符, 前50字符: ${text.substring(0, 50)}`);
            
            // 尝试解析JSON
            try {
                this.characterData = JSON.parse(text);
            } catch (parseError) {
                console.error('JSON解析错误:', parseError);
                console.error('文件内容前200字符:', text.substring(0, 200));
                console.error('文件内容后200字符:', text.substring(Math.max(0, text.length - 200)));
                throw new Error(`JSON解析失败: ${parseError.message}`);
            }
            
            // 计算角色的实际尺寸（找出非null的边界）
            this.calculateCharacterBounds();
            
            this.isDataLoaded = true;
            console.log('角色数据加载成功', this.charWidth, 'x', this.charHeight);
            
            // 更新Canvas以重新计算角色位置
            this.updateCanvas();
        } catch (error) {
            console.error('加载角色数据失败:', error);
            if (this.ctx) {
                this.ctx.fillStyle = '#000000';
                this.ctx.font = '10px monospace';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('角色数据加载失败', this.canvasWidth / 2, this.canvas.height / 2);
            }
        }
    }
    
    calculateCharacterBounds() {
        if (!this.characterData || this.characterData.length === 0) {
            this.charWidth = 0;
            this.charHeight = 0;
            return;
        }
        
        // 使用整个数据数组的尺寸作为角色边界框
        // 这样点击检测和绘制逻辑一致（都是从数组的(0,0)开始）
        this.charHeight = this.characterData.length;
        
        // 找出数据数组的最大宽度
        let maxWidth = 0;
        for (let row = 0; row < this.characterData.length; row++) {
            if (this.characterData[row] && this.characterData[row].length > maxWidth) {
                maxWidth = this.characterData[row].length;
            }
        }
        this.charWidth = maxWidth;
    }

    destroy() {
        // 清理资源
        window.removeEventListener('resize', this.updateCanvas);
        if (this.canvas) {
            this.canvas.removeEventListener('click', this.handleCanvasClick);
        }
        this.characterData = null;
        this.colorPalette = null;
    }
}
