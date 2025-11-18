// 钩子状态枚举
const HookState = {
    SWINGING: 'swinging',
    FIRING: 'firing',
    RETRACTING: 'retracting',
    SCORING: 'scoring'
};

// 钩子类
class Hook {
    constructor() {
        this.reset();
    }

    // 重置钩子状态
    reset() {
        this.state = HookState.SWINGING;
        this.x = GameConfig.HOOK.START_X;
        this.y = GameConfig.HOOK.START_Y;
        this.endX = this.x;
        this.endY = this.y;
        this.angle = 0;
        this.swingDirection = 1;
        this.speed = GameConfig.HOOK.BASE_SPEED;
        this.caughtItem = null;
        this.length = 0;
        this.maxLength = GameConfig.HOOK.MAX_LENGTH;
        this.scoringTimer = 0;
        this.firingAngle = 0; // 发射时的角度
        // 注意：不要重置 onItemScored 回调函数，它应该在整个游戏过程中保持
        if (!this.onItemScored) {
            this.onItemScored = null; // 仅在初始化时设置为null
        }
    }

    // 更新钩子状态
    update(deltaTime) {
        switch (this.state) {
            case HookState.SWINGING:
                this.updateSwinging(deltaTime);
                break;
            case HookState.FIRING:
                this.updateFiring(deltaTime);
                break;
            case HookState.RETRACTING:
                this.updateRetracting(deltaTime);
                break;
            case HookState.SCORING:
                this.updateScoring(deltaTime);
                break;
        }
    }

    // 更新摆动状态
    updateSwinging(deltaTime) {
        // 钩子左右摆动
        this.angle += this.swingDirection * GameConfig.HOOK.SWING_SPEED * deltaTime;
        
        // 检查摆动边界并反转方向
        if (this.angle >= GameConfig.HOOK.SWING_ANGLE) {
            this.angle = GameConfig.HOOK.SWING_ANGLE;
            this.swingDirection = -1;
        } else if (this.angle <= -GameConfig.HOOK.SWING_ANGLE) {
            this.angle = -GameConfig.HOOK.SWING_ANGLE;
            this.swingDirection = 1;
        }
        
        // 计算钩子端点位置 - 使用更长的摆动长度
        const swingLength = 120; // 摆动时钩子的长度，增加覆盖范围
        const radians = Utils.Math.degToRad(this.angle);
        // 精确计算摆动位置，避免浮点数误差
        this.endX = Math.round(this.x + Math.sin(radians) * swingLength);
        this.endY = Math.round(this.y + Math.cos(radians) * swingLength);
        
        // 更新钩子长度
        this.length = swingLength;
    }

    // 更新下落状态
    updateFiring(deltaTime) {
        // 使用发射时固定的角度计算方向，确保直线运动
        const radians = Utils.Math.degToRad(this.firingAngle);
        const deltaX = Math.sin(radians) * this.speed * deltaTime;
        const deltaY = Math.cos(radians) * this.speed * deltaTime;
        
        // 更新钩子端点位置，避免浮点数累积误差
        this.endX = Math.round(this.endX + deltaX);
        this.endY = Math.round(this.endY + deltaY);
        
        // 更新钩子长度
        this.length = Utils.Math.distance(this.x, this.y, this.endX, this.endY);
        
        // 检查是否到达最大长度或触底或触侧边
        if (this.length >= this.maxLength || 
            this.endY >= GameConfig.CANVAS_HEIGHT - 20 ||
            this.endX <= 10 || 
            this.endX >= GameConfig.CANVAS_WIDTH - 10) {
            this.startRetracting();
        }
    }

    // 更新上升状态
    updateRetracting(deltaTime) {
        // 计算返回方向
        const dx = this.x - this.endX;
        const dy = this.y - this.endY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 计算返回速度（考虑携带物品的重量）
        let retractSpeed = this.speed;
        if (this.caughtItem) {
            retractSpeed = Math.max(this.speed - this.caughtItem.weight * 8, this.speed * 0.2);
        }
        
        // 计算移动距离
        const moveDistance = retractSpeed * deltaTime;
        
        // 如果距离很近或者本次移动就能到达，直接到达目标位置
        if (distance <= moveDistance + 8) {
            // 钩子已返回起始位置
            this.endX = this.x;
            this.endY = this.y;
            this.state = HookState.SCORING;
            return;
        }
        
        // 归一化方向向量并移动
        const normalizedX = dx / distance;
        const normalizedY = dy / distance;
        
        // 使用精确的移动计算，避免Math.round导致的震荡
        this.endX += normalizedX * moveDistance;
        this.endY += normalizedY * moveDistance;
        
        // 更新携带物品位置
        if (this.caughtItem) {
            this.caughtItem.x = this.endX - this.caughtItem.width / 2;
            this.caughtItem.y = this.endY - this.caughtItem.height / 2;
        }
    }

    // 更新结算状态
    updateScoring(deltaTime) {
        // 使用计时器而不是setTimeout避免重复触发
        if (!this.scoringTimer) {
            this.scoringTimer = 0;
        }
        
        this.scoringTimer += deltaTime;
        
        if (this.scoringTimer >= 0.1) { // 0.1秒后结算
            if (this.caughtItem && this.onItemScored) {
                console.log(`🏆 得分结算: ${this.caughtItem.name} (${this.caughtItem.score}分)`);
                // 触发得分事件
                this.onItemScored(this.caughtItem);
                // 通知ItemManager完成道具收集
                if (window.game && window.game.itemManager) {
                    window.game.itemManager.completeItemCollection(this.caughtItem);
                }
                this.caughtItem = null;
            }
            this.scoringTimer = 0;
            this.reset();
        }
    }

    // 发射钩子
    fire() {
        if (this.state === HookState.SWINGING) {
            this.state = HookState.FIRING;
            this.speed = GameConfig.HOOK.BASE_SPEED;
            this.firingAngle = this.angle; // 记录发射时的角度
        }
    }

    // 开始回收钩子
    startRetracting() {
        this.state = HookState.RETRACTING;
    }

    // 抓取物品
    catchItem(item) {
        if (this.state === HookState.FIRING && !this.caughtItem) {
            this.caughtItem = item;
            this.startRetracting();

            return true;
        }
        return false;
    }

    // 检查与物品的碰撞
    checkCollision(item) {
        if (this.state !== HookState.FIRING || this.caughtItem) {
            return false;
        }

        // 使用线段与矩形的碰撞检测
        const hookTipX = this.endX;
        const hookTipY = this.endY;
        const hookRadius = GameConfig.HOOK.HOOK_SIZE;
        
        return Utils.Collision.circleRect(
            hookTipX, hookTipY, hookRadius,
            item.x, item.y, item.width, item.height
        );
    }

    // 渲染钩子
    render(ctx) {
        ctx.save();
        
        // 绘制钩子线 - 使用精确的像素位置避免模糊
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = GameConfig.HOOK.THICKNESS;
        ctx.beginPath();
        // 对坐标进行0.5像素偏移，获得更清晰的线条
        ctx.moveTo(Math.floor(this.x) + 0.5, Math.floor(this.y) + 0.5);
        ctx.lineTo(Math.floor(this.endX) + 0.5, Math.floor(this.endY) + 0.5);
        ctx.stroke();
        
        // 绘制钩子头部
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.arc(this.endX, this.endY, GameConfig.HOOK.HOOK_SIZE, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制钩子固定点
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    // 设置得分回调
    setScoreCallback(callback) {
        this.onItemScored = callback;
        if (!this.onItemScored) {
            console.warn('⚠️ 钩子回调函数设置失败');
        }
    }

    // 获取当前状态
    getState() {
        return this.state;
    }

    // 是否可以发射
    canFire() {
        return this.state === HookState.SWINGING;
    }

    // 是否正在移动
    isMoving() {
        return this.state === HookState.FIRING || this.state === HookState.RETRACTING;
    }
} 