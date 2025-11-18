// 基础道具类
class BaseItem {
    constructor(type, x, y) {
        const config = GameConfig.ITEMS[type];
        this.type = type;
        this.x = x;
        this.y = y;
        this.width = config.width;
        this.height = config.height;
        this.score = config.score;
        this.weight = config.weight;
        this.color = config.color;
        this.name = config.name;
        this.collected = false;
        this.hooked = false; // 新增：被钩住状态
        this.animationTime = 0;
        this.image = null;
    }

    update(deltaTime) {
        this.animationTime += deltaTime;
    }

    render(ctx) {
        if (this.collected) return;
        
        ctx.save();
        
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        // 对所有物体应用呼吸动画效果
        const scale = 1 + Math.sin(this.animationTime * 3) * 0.05;
        ctx.scale(scale, scale);
        
        if (this.image && this.image.complete) {
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        }
        
        ctx.restore();
    }
}

// 静态道具
class StaticItem extends BaseItem {
    constructor(type, x, y) {
        super(type, x, y);
    }
}

// 移动道具（鱼类）
class MovingItem extends BaseItem {
    constructor(type, x, y) {
        super(type, x, y);
        this.speed = GameConfig.ITEMS[type].speed || 50;
        this.direction = Math.random() > 0.5 ? 1 : -1;
        this.moveRange = {
            minX: 20,
            maxX: GameConfig.CANVAS_WIDTH - 20 - this.width
        };
        // 确保初始位置在有效范围内
        this.x = Math.max(this.moveRange.minX, Math.min(this.x, this.moveRange.maxX));
    }

    update(deltaTime) {
        super.update(deltaTime);
        if (this.collected) return;

        // 计算新位置
        const newX = this.x + this.direction * this.speed * deltaTime;
        
        // 检查边界碰撞
        if (newX <= this.moveRange.minX) {
            // 碰到左边界
            this.x = this.moveRange.minX;
            this.direction = 1; // 向右移动
        } else if (newX >= this.moveRange.maxX) {
            // 碰到右边界
            this.x = this.moveRange.maxX;
            this.direction = -1; // 向左移动
        } else {
            // 正常移动
            this.x = newX;
        }
    }
}

// 道具管理器
class ItemManager {
    constructor() {
        this.items = [];
        this.goldImage = new Image();
        this.goldImage.src = 'assets/Gold.png';
        this.goldMediumImage = new Image();
        this.goldMediumImage.src = 'assets/Gold_Medium.png';
        this.goldLargeImage = new Image();
        this.goldLargeImage.src = 'assets/Gold_Large.png';
        
        // 石头图片
        this.stoneImage = new Image();
        this.stoneImage.src = 'assets/Stone.png';
        this.stoneMediumImage = new Image();
        this.stoneMediumImage.src = 'assets/Stone_Medium.png';
        this.stoneLargeImage = new Image();
        this.stoneLargeImage.src = 'assets/Stone_Large.png';
    }

    clear() {
        this.items = [];
    }

    generateItems(levelConfig) {
        this.clear();
        
        levelConfig.items.forEach(itemConfig => {
            for (let i = 0; i < itemConfig.count; i++) {
                this.createRandomItem(itemConfig.type);
            }
        });
    }

    createRandomItem(type) {
        const config = GameConfig.ITEMS[type];
        if (!config) return;

        const x = Math.random() * (GameConfig.CANVAS_WIDTH - config.width - 100) + 50;
        const y = Math.random() * (GameConfig.CANVAS_HEIGHT - config.height - 200) + 150;

        let item;
        if (config.type === 'moving') {
            item = new MovingItem(type, x, y);
        } else {
            item = new StaticItem(type, x, y);
        }

        if (type.includes('GOLD')) {
            if (type === 'GOLD_MEDIUM') {
                item.image = this.goldMediumImage;
            } else if (type === 'GOLD_LARGE') {
                item.image = this.goldLargeImage;
            } else {
                item.image = this.goldImage;
            }
        } else if (type.includes('ROCK')) {
            if (type === 'ROCK_MEDIUM') {
                item.image = this.stoneMediumImage;
            } else if (type === 'ROCK_LARGE') {
                item.image = this.stoneLargeImage;
            } else {
                item.image = this.stoneImage;
            }
        }

        this.items.push(item);
    }

    update(deltaTime) {
        this.items.forEach(item => item.update(deltaTime));
        this.items = this.items.filter(item => !item.collected);
    }

    render(ctx) {
        this.items.forEach(item => item.render(ctx));
    }

    checkCollisions(hook) {
        for (let item of this.items) {
            if (item.collected || item.hooked) continue;
            
            if (hook.checkCollision(item)) {
                const caught = hook.catchItem(item);
                if (caught) {
                    item.hooked = true; // 设置为被钩住状态，而不是立即收集
                }
                return item;
            }
        }
        return null;
    }

    // 新增：完成道具收集的方法
    completeItemCollection(item) {
        if (item && item.hooked) {
            item.collected = true;
            item.hooked = false;
        }
    }
}
