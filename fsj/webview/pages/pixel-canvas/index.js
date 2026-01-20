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
        
        this.init();
    }

    async init() {
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
        } catch (error) {
            console.error('加载HTML失败:', error);
            // 如果fetch失败，直接使用内联HTML
            this.container.innerHTML = `
                <section class="pixel-canvas-page" role="region" aria-label="像素角色展示">
                    <div class="canvas-container">
                        <canvas id="pixelCanvas" role="img" aria-label="像素角色" tabindex="0"></canvas>
                    </div>
                    <div class="chat-box" id="chatBox" role="dialog" aria-label="角色对话" aria-hidden="true">
                        <p class="chat-message">你好，我叫阿兰，你找我有事吗？</p>
                    </div>
                </section>
            `;
            this.canvas = document.getElementById('pixelCanvas');
            this.chatBox = document.getElementById('chatBox');
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
        
        // 监听窗口大小变化
        window.addEventListener('resize', () => this.updateCanvas());
        
        // 监听Canvas点击事件
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
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
        // 绘制#6ad2ec颜色的描边（沿着角色外轮廓）
        const outlineColor = '#6ad2ec';
        
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
