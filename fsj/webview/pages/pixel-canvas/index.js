/**
 * 像素Canvas页面组件
 */
export default class PixelCanvasPage {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.characterImage = null;
        this.isImageLoaded = false;
        this.canvasWidth = 60;
        this.charWidth = 12;
        this.charHeight = 20;
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
        // 加载角色图片
        this.loadCharacter();
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
        
        // 更新角色位置
        this.charX = Math.floor((this.canvas.width - this.charWidth) / 2);
        this.charY = Math.floor((this.canvas.height - this.charHeight) / 2);
        
        // 重绘
        this.redraw();
    }

    redraw() {
        // 绘制背景
        this.ctx.fillStyle = '#fbebd3';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制角色
        if (this.isImageLoaded) {
            this.drawCharacter();
            
            // 如果选中，绘制描边
            if (this.isSelected) {
                this.drawOutline();
            }
        }
    }

    drawCharacter() {
        if (!this.isImageLoaded) return;
        
        this.ctx.drawImage(
            this.characterImage,
            this.charX,
            this.charY,
            this.charWidth,
            this.charHeight
        );
    }

    drawOutline() {
        // 根据角色五行属性获取描边颜色
        let outlineColor = this.defaultOutlineColor;
        if (this.characterWuxing && this.wuxingColors[this.characterWuxing]) {
            outlineColor = this.wuxingColors[this.characterWuxing]['浅色'];
        }
        
        // 创建一个临时canvas来检测角色像素
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.charWidth;
        tempCanvas.height = this.charHeight;
        const tempCtx = tempCanvas.getContext('2d');
        
        // 禁用抗锯齿
        tempCtx.imageSmoothingEnabled = false;
        
        // 在临时canvas上绘制角色图片
        tempCtx.drawImage(
            this.characterImage,
            0, 0,
            this.charWidth,
            this.charHeight
        );
        
        // 获取像素数据
        const imageData = tempCtx.getImageData(0, 0, this.charWidth, this.charHeight);
        const data = imageData.data;
        
        // 检测边界像素并绘制描边
        for (let y = 0; y < this.charHeight; y++) {
            for (let x = 0; x < this.charWidth; x++) {
                const index = (y * this.charWidth + x) * 4;
                const alpha = data[index + 3];
                
                // 如果当前像素不透明（是角色的一部分）
                if (alpha > 0) {
                    // 检查上下左右四个方向的邻居
                    const neighbors = [
                        { dx: 0, dy: -1 }, // 上
                        { dx: 1, dy: 0 },  // 右
                        { dx: 0, dy: 1 },  // 下
                        { dx: -1, dy: 0 }  // 左
                    ];
                    
                    // 检查每个邻居
                    for (const neighbor of neighbors) {
                        const nx = x + neighbor.dx;
                        const ny = y + neighbor.dy;
                        
                        // 如果邻居超出边界，或者邻居是透明的，则绘制描边
                        if (nx < 0 || nx >= this.charWidth || 
                            ny < 0 || ny >= this.charHeight) {
                            // 超出边界，绘制描边
                            this.ctx.fillStyle = outlineColor;
                            this.ctx.fillRect(
                                this.charX + x + neighbor.dx,
                                this.charY + y + neighbor.dy,
                                1, 1
                            );
                        } else {
                            // 检查邻居像素的透明度
                            const neighborIndex = (ny * this.charWidth + nx) * 4;
                            const neighborAlpha = data[neighborIndex + 3];
                            
                            // 如果邻居是透明的，绘制描边
                            if (neighborAlpha === 0) {
                                this.ctx.fillStyle = outlineColor;
                                this.ctx.fillRect(
                                    this.charX + nx,
                                    this.charY + ny,
                                    1, 1
                                );
                            }
                        }
                    }
                }
            }
        }
    }

    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scale = this.canvas.width / rect.width;
        const x = (e.clientX - rect.left) * scale;
        const y = (e.clientY - rect.top) * scale;
        
        // 检查点击是否在角色范围内
        if (x >= this.charX && x < this.charX + this.charWidth &&
            y >= this.charY && y < this.charY + this.charHeight) {
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

    loadCharacter() {
        this.characterImage = new Image();
        
        this.characterImage.onload = () => {
            this.isImageLoaded = true;
            console.log('图片加载成功', this.characterImage.width, 'x', this.characterImage.height);
            this.redraw();
        };

        this.characterImage.onerror = () => {
            console.error('图片加载失败，路径:', this.characterImage.src);
            this.ctx.fillStyle = '#000000';
            this.ctx.font = '10px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('图片加载失败', this.canvasWidth / 2, this.canvas.height / 2);
        };

        this.characterImage.src = './assets/isPixel/像素角色.png';
    }

    destroy() {
        // 清理资源
        window.removeEventListener('resize', this.updateCanvas);
        if (this.canvas) {
            this.canvas.removeEventListener('click', this.handleCanvasClick);
        }
        this.characterImage = null;
    }
}
