// 游戏状态枚举
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over',
    LEVEL_COMPLETE: 'level_complete'
};

// 游戏主类
class Game {
    constructor() {
        console.log('初始化Game对象...');

        this.canvas = null;
        this.ctx = null;
        this.state = GameState.MENU;
        this.lastTime = 0;
        this.deltaTime = 0;

        // 游戏对象
        console.log('创建Hook对象...');
        this.hook = new Hook();

        console.log('创建ItemManager对象...');
        this.itemManager = new ItemManager();

        console.log('创建LevelManager对象...');
        this.levelManager = new LevelManager();

        console.log('创建Bear对象...');
        this.bear = new Bear();

        // 游戏数据
        this.score = 0;
        this.timeRemaining = 0;
        this.targetScore = 0;
        this.currentLevel = 1;
        this.levelStartScore = 0; // 记录进入当前关卡时的分数

        // 绑定方法上下文
        this.gameLoop = this.gameLoop.bind(this);
        this.handleInput = this.handleInput.bind(this);
    }

    // 初始化游戏
    init() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        // 初始化数据存储
        GameData.init();

        // 设置钩子回调
        this.hook.setScoreCallback((item) => {
            this.addScore(item.score);
        });

        // 设置钩子起始位置为熊的鱼竿位置
        this.updateHookPosition();

        console.log('🎮 游戏初始化完成，钩子回调已设置');

        // 添加事件监听器
        this.setupEventListeners();

        // 开始游戏循环
        this.gameLoop(0);
    }

    // 设置事件监听器
    setupEventListeners() {
        // 鼠标/触摸事件
        this.canvas.addEventListener('click', this.handleInput);
        this.canvas.addEventListener('touchstart', this.handleInput);

        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowDown') {
                e.preventDefault();
                this.handleInput();
            }
        });
    }

    // 处理输入
    handleInput() {
        if (this.state === GameState.PLAYING) {
            this.hook.fire();
        }
    }

    // 开始新游戏
    startGame(levelId = 1, resetScore = true) {
        this.currentLevel = levelId;
        // 只有在resetScore为true时才重置分数（新游戏时）
        if (resetScore) {
            this.score = 0;
        }
        // 记录进入当前关卡时的分数
        this.levelStartScore = this.score;
        this.loadLevel(levelId);
        this.state = GameState.PLAYING;
        this.updateUI();
    }

    // 加载关卡
    loadLevel(levelId) {
        const levelData = this.levelManager.loadLevel(levelId);
        this.timeRemaining = levelData.timeLimit;
        this.targetScore = levelData.targetScore;
        this.itemManager.generateItems(levelData);
        this.hook.reset();

        // 重置熊的状态
        this.bear.state = BearState.IDLE;
        this.bear.currentFrame = 0;
        this.bear.animationTime = 0;

        // 更新钩子位置
        this.updateHookPosition();

        // 隐藏过关按钮
        const passBtn = document.getElementById('pass-level-btn');
        if (passBtn) passBtn.classList.add('hidden');
    }

    // 游戏循环
    gameLoop(currentTime) {
        // 计算deltaTime
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // 限制deltaTime避免跳跃
        this.deltaTime = Math.min(this.deltaTime, 1 / 30);

        // 更新游戏状态
        this.update(this.deltaTime);

        // 渲染游戏
        this.render();

        // 继续循环
        requestAnimationFrame(this.gameLoop);
    }

    // 更新游戏状态
    update(deltaTime) {
        if (this.state !== GameState.PLAYING) return;

        // 更新时间
        this.timeRemaining -= deltaTime;

        // 更新游戏对象
        this.hook.update(deltaTime);
        this.itemManager.update(deltaTime);
        this.bear.update(deltaTime, this.hook.state);

        // 检查碰撞
        this.itemManager.checkCollisions(this.hook);

        // 检查游戏结束条件
        this.checkGameEndConditions();

        // 更新UI
        this.updateUI();
    }

    // 渲染游戏
    render() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制背景
        this.renderBackground();

        // 渲染熊（在背景之后，其他对象之前）
        this.bear.render(this.ctx);

        if (this.state === GameState.PLAYING || this.state === GameState.PAUSED) {
            // 渲染游戏对象
            this.hook.render(this.ctx);
            this.itemManager.render(this.ctx);

            // 渲染UI元素
            this.renderGameUI();
        }
    }

    // 渲染背景
    renderBackground() {
        // 深海渐变背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1565C0');
        gradient.addColorStop(0.3, '#1976D2');
        gradient.addColorStop(0.7, '#0D47A1');
        gradient.addColorStop(1, '#0A2E5C');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制海平面
        this.ctx.fillStyle = 'rgba(64, 181, 246, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, 80);
    }

    // 渲染游戏UI
    renderGameUI() {
        this.ctx.save();
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '16px Orbitron';
        this.ctx.textAlign = 'left';

        // 显示分数和目标
        this.ctx.fillText(`分数: ${this.score}`, 10, 30);
        this.ctx.fillText(`目标: ${this.targetScore}`, 10, 50);
        this.ctx.fillText(`时间: ${Math.ceil(this.timeRemaining)}s`, 10, 70);

        this.ctx.restore();
    }

    // 添加分数
    addScore(points) {
        const oldScore = this.score;
        this.score += points;
        this.updateUI(); // 立即更新UI显示

        // 显示得分动画提示
        this.showScorePopup(points);

        console.log(`💰 得分更新: +${points} (总分: ${oldScore} → ${this.score})`);
    }

    // 显示得分弹出动画
    showScorePopup(points) {
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = `+${points}`;
        popup.style.cssText = `
            position: absolute;
            left: 50%;
            top: 20%;
            transform: translateX(-50%);
            color: #FFD700;
            font-size: 24px;
            font-weight: bold;
            pointer-events: none;
            z-index: 1000;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        `;

        document.body.appendChild(popup);

        // 动画效果
        let opacity = 1;
        let yOffset = 0;
        const animate = () => {
            opacity -= 0.02;
            yOffset += 1;
            popup.style.opacity = opacity;
            popup.style.transform = `translateX(-50%) translateY(-${yOffset}px)`;

            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                document.body.removeChild(popup);
            }
        };

        requestAnimationFrame(animate);
    }

    // 检查游戏结束条件
    checkGameEndConditions() {
        // 时间耗尽
        if (this.timeRemaining <= 0) {
            if (this.score >= this.targetScore) {
                console.log(`🎉 时间耗尽但达到目标: ${this.score}/${this.targetScore}`);
                this.levelComplete();
            } else {
                console.log(`💀 时间耗尽且未达目标: ${this.score}/${this.targetScore}`);
                this.gameOver();
            }
            return;
        }

        // 达到目标分数
        if (this.score >= this.targetScore) {
            // 显示过关按钮，而不是自动过关
            const passBtn = document.getElementById('pass-level-btn');
            if (passBtn && passBtn.classList.contains('hidden')) {
                passBtn.classList.remove('hidden');
                console.log('✅ 达到目标分数，显示过关按钮');
            }
        }
    }

    // 主动过关
    passLevel() {
        if (this.score >= this.targetScore) {
            console.log(`🎉 玩家主动过关: ${this.score}/${this.targetScore}`);
            this.levelComplete();
        }
    }

    // 关卡完成
    levelComplete() {
        this.state = GameState.LEVEL_COMPLETE;

        // 计算星级
        const stars = this.levelManager.calculateStars(this.score, this.targetScore);

        // 保存进度
        GameData.saveLevelCompletion(this.currentLevel, this.score, stars);
        GameData.saveHighScore(this.score);

        // 累计分数到总分
        GameData.addToTotalScore(this.score);

        // 显示完成界面
        this.showLevelComplete(stars);
    }

    // 游戏结束
    gameOver() {
        this.state = GameState.GAME_OVER;

        // 保存最高分
        GameData.saveHighScore(this.score);

        // 显示游戏结束界面
        this.showGameOver();
    }

    // 暂停游戏
    pauseGame() {
        if (this.state === GameState.PLAYING) {
            this.state = GameState.PAUSED;
        }
    }

    // 继续游戏
    resumeGame() {
        if (this.state === GameState.PAUSED) {
            this.state = GameState.PLAYING;
        }
    }

    // 重新开始当前关卡
    restartLevel() {
        // 重试时恢复到进入当前关卡时的分数
        this.score = this.levelStartScore;
        this.loadLevel(this.currentLevel);
        this.state = GameState.PLAYING;
        this.updateUI();
    }

    // 返回主菜单
    returnToMenu() {
        this.state = GameState.MENU;
    }

    // 更新UI显示
    updateUI() {
        // 更新分数显示
        const scoreElement = document.getElementById('current-score');
        if (scoreElement) scoreElement.textContent = this.score;

        // 更新目标分数显示
        const targetElement = document.getElementById('target-score');
        if (targetElement) targetElement.textContent = this.targetScore;

        // 更新时间显示
        const timeElement = document.getElementById('remaining-time');
        if (timeElement) timeElement.textContent = Math.ceil(Math.max(0, this.timeRemaining));

        // 更新关卡显示
        const levelElement = document.getElementById('current-level');
        if (levelElement) levelElement.textContent = this.currentLevel;
    }

    // 显示关卡完成界面
    showLevelComplete(stars) {
        console.log('🎉 显示关卡完成界面');
        document.getElementById('game-over-title').textContent = '关卡完成!';
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-total-score').textContent = GameData.getTotalScore();
        document.getElementById('final-target').textContent = this.targetScore;
        document.getElementById('final-time').textContent = Math.ceil(this.timeRemaining);

        // 显示星级
        const starRating = document.getElementById('star-rating');
        starRating.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const star = document.createElement('span');
            star.className = 'star' + (i < stars ? '' : ' empty');
            star.textContent = '★';
            starRating.appendChild(star);
        }

        // 显示下一关按钮（关卡完成时）
        const nextButton = document.getElementById('next-level-btn');
        if (nextButton) {
            nextButton.classList.remove('hidden');
            console.log('✅ 下一关按钮已显示');
        }

        // 显示游戏结束界面
        document.getElementById('game-over-screen').classList.remove('hidden');
    }

    // 显示游戏结束界面
    showGameOver() {
        console.log('💀 显示游戏失败界面');
        document.getElementById('game-over-title').textContent = '游戏结束';
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-total-score').textContent = GameData.getTotalScore();
        document.getElementById('final-target').textContent = this.targetScore;
        document.getElementById('final-time').textContent = 0;

        // 隐藏星级和下一关按钮（游戏失败时）
        document.getElementById('star-rating').innerHTML = '';
        const nextButton = document.getElementById('next-level-btn');
        if (nextButton) {
            nextButton.classList.add('hidden');
            console.log('❌ 下一关按钮已隐藏');
        }

        // 显示游戏结束界面
        document.getElementById('game-over-screen').classList.remove('hidden');
    }

    // 更新钩子位置到熊的鱼竿
    updateHookPosition() {
        const rodPosition = this.bear.getFishingRodPosition();
        this.hook.x = rodPosition.x;
        this.hook.y = rodPosition.y;
        this.hook.endX = rodPosition.x;
        this.hook.endY = rodPosition.y;
    }
}

// 全局游戏实例
let game = null;
