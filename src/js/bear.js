// 熊的状态枚举
const BearState = {
    IDLE: 'idle',
    FISHING: 'fishing'
};

// 熊类
class Bear {
    constructor() {
        this.state = BearState.IDLE;
        this.images = {};
        this.fishingFrames = [];
        this.currentFrame = 0;
        this.animationTime = 0;
        this.frameRate = 0.2; // 每秒5帧
        
        // 熊的位置（在画面中间的海平面上方）
        this.x = 400 - 39; // 画面中心(400) - 熊原始宽度的一半(39)
        this.y = 5;
        this.width = 78;  // 熊图片的实际宽度 (放大2倍)
        this.height = 74; // 熊图片的实际高度 (放大2倍)
        
        this.loadImages();
    }
    
    // 加载图片资源
    loadImages() {
        // 加载待机图片
        this.images.idle = new Image();
        this.images.idle.src = 'assets/images/characters/bear/idle/bear_idle.png';
        
        // 加载钓鱼动画帧
        for (let i = 1; i <= 4; i++) {
            const img = new Image();
            img.src = `assets/images/characters/bear/fishing/bear_fishing_0${i}.png`;
            this.fishingFrames.push(img);
        }
        
        console.log('🐻 熊的图片资源开始加载');
    }
    
    // 更新熊的状态
    update(deltaTime, hookState) {
        // 根据钩子状态切换熊的状态 (下落和收回时都算钓鱼)
        if (hookState === 'firing' || hookState === 'retracting') {
            this.state = BearState.FISHING;
        } else {
            this.state = BearState.IDLE;
        }
        
        // 更新钓鱼动画
        if (this.state === BearState.FISHING) {
            this.animationTime += deltaTime;
            if (this.animationTime >= this.frameRate) {
                this.currentFrame = (this.currentFrame + 1) % this.fishingFrames.length;
                this.animationTime = 0;
            }
        } else {
            this.currentFrame = 0;
            this.animationTime = 0;
        }
    }
    
    // 渲染熊
    render(ctx) {
        let imageToDraw = null;
        
        if (this.state === BearState.FISHING && this.fishingFrames.length > 0) {
            imageToDraw = this.fishingFrames[this.currentFrame];
        } else if (this.images.idle && this.images.idle.complete) {
            imageToDraw = this.images.idle;
        }
        
        if (imageToDraw && imageToDraw.complete) {
            ctx.save();
            
            // 关闭图像平滑（抗锯齿），保持像素画效果
            ctx.imageSmoothingEnabled = false;
            ctx.msImageSmoothingEnabled = false;
            ctx.webkitImageSmoothingEnabled = false;
            
            // 绘制熊
            ctx.drawImage(
                imageToDraw,
                this.x,
                this.y,
                this.width,
                this.height
            );
            
            ctx.restore();
        }
    }
    
    // 设置熊的位置
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    
    // 获取熊的状态（用于调试）
    getState() {
        return this.state;
    }
    
    // 获取鱼竿位置（钩子起始点）
    getFishingRodPosition() {
        // 鱼竿位置在熊的中心偏右上方，对应画面中心
        return {
            x: 400-36, // 保持在画面中心
            y: this.y + 30
        };
    }
}