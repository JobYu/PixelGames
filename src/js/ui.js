// UI管理器
class UIManager {
    constructor() {
        this.currentScreen = 'loading';
        this.isProcessingNextLevel = false; // 防止重复切换关卡的标志
        this.eventHandlers = new Map(); // 存储事件处理函数的引用
        // 延迟初始化事件监听器，确保DOM已加载
    }

    // 初始化事件监听器
    initializeEventListeners() {
        // 主菜单按钮
        this.addClickListener('start-game-btn', () => this.startGame());
        this.addClickListener('level-select-btn', () => this.showLevelSelect());
        this.addClickListener('achievements-btn', () => this.showAchievements());
        this.addClickListener('settings-btn', () => this.showSettings());

        // 关卡选择
        this.addClickListener('back-to-menu-btn', () => this.showMainMenu());

        // 游戏控制按钮
        this.addClickListener('pause-btn', () => this.pauseGame());
        this.addClickListener('pass-level-btn', () => this.passLevel());
        this.addClickListener('quit-btn', () => this.quitToMenu());

        // 暂停界面按钮
        this.addClickListener('resume-btn', () => this.resumeGame());
        this.addClickListener('restart-btn', () => this.restartGame());
        this.addClickListener('quit-to-menu-btn', () => this.quitToMenu());

        // 游戏结束界面按钮
        this.addClickListener('next-level-btn', () => this.nextLevel());
        this.addClickListener('retry-btn', () => this.retryLevel());
        this.addClickListener('back-menu-btn', () => this.backToMenu());

        // 设置界面
        this.addClickListener('back-from-settings-btn', () => this.showMainMenu());

        // 成就界面
        this.addClickListener('back-from-achievements-btn', () => this.showMainMenu());

        // 设置控件
        this.initializeSettings();
    }

    // 添加点击事件监听器
    addClickListener(id, handler) {
        const element = document.getElementById(id);
        if (element) {
            // 如果之前已经绑定过，先移除旧的事件监听器
            if (this.eventHandlers.has(id)) {
                const oldHandler = this.eventHandlers.get(id);
                element.removeEventListener('click', oldHandler);
            }

            // 添加新的事件监听器
            element.addEventListener('click', handler);
            // 存储处理函数引用，用于后续移除
            this.eventHandlers.set(id, handler);
        } else {
            console.warn(`UI元素未找到: ${id}`);
        }
    }

    // 初始化设置控件
    initializeSettings() {
        // 音乐音量
        const musicVolume = document.getElementById('music-volume');
        const musicValue = document.getElementById('music-volume-value');
        if (musicVolume && musicValue) {
            musicVolume.addEventListener('input', (e) => {
                musicValue.textContent = e.target.value;
                GameData.setSetting('musicVolume', parseInt(e.target.value));
            });
        }

        // 音效音量
        const sfxVolume = document.getElementById('sfx-volume');
        const sfxValue = document.getElementById('sfx-volume-value');
        if (sfxVolume && sfxValue) {
            sfxVolume.addEventListener('input', (e) => {
                sfxValue.textContent = e.target.value;
                GameData.setSetting('sfxVolume', parseInt(e.target.value));
            });
        }

        // 画质设置
        const graphicsQuality = document.getElementById('graphics-quality');
        if (graphicsQuality) {
            graphicsQuality.addEventListener('change', (e) => {
                GameData.setSetting('graphicsQuality', e.target.value);
            });
        }
    }

    // 显示屏幕
    showScreen(screenId) {
        // 隐藏所有屏幕
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });

        // 显示指定屏幕
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            this.currentScreen = screenId;
        }
    }

    // 显示加载界面
    showLoading() {
        this.showScreen('loading-screen');
    }

    // 显示主菜单
    showMainMenu() {
        this.updateMainMenuStats();
        this.showScreen('main-menu');
    }

    // 更新主菜单统计
    updateMainMenuStats() {
        const highScore = document.getElementById('high-score');
        const totalScore = document.getElementById('total-score');
        const completedLevels = document.getElementById('completed-levels');

        if (highScore) {
            highScore.textContent = GameData.getHighScore();
        }

        if (totalScore) {
            totalScore.textContent = GameData.getTotalScore();
        }

        if (completedLevels) {
            completedLevels.textContent = GameData.getCompletedLevelCount();
        }
    }

    // 显示关卡选择界面
    showLevelSelect() {
        this.generateLevelGrid();
        this.showScreen('level-select');
    }

    // 生成关卡网格
    generateLevelGrid() {
        const levelGrid = document.getElementById('level-grid');
        if (!levelGrid) return;

        levelGrid.innerHTML = '';

        // 生成前20个关卡按钮
        for (let i = 1; i <= 20; i++) {
            const button = document.createElement('button');
            button.className = 'level-button';
            button.textContent = i;

            if (GameData.isLevelCompleted(i)) {
                button.classList.add('completed');
            } else if (!GameData.isLevelUnlocked(i)) {
                button.classList.add('locked');
                button.disabled = true;
            }

            if (!button.disabled) {
                button.addEventListener('click', () => this.selectLevel(i));
            }

            levelGrid.appendChild(button);
        }
    }

    // 选择关卡
    selectLevel(levelId) {
        this.startGameWithLevel(levelId);
    }

    // 显示成就界面
    showAchievements() {
        this.showScreen('achievements-screen');
    }

    // 显示设置界面
    showSettings() {
        // 加载当前设置
        const settings = GameData.getSettings();

        const musicVolume = document.getElementById('music-volume');
        const musicValue = document.getElementById('music-volume-value');
        if (musicVolume && musicValue) {
            musicVolume.value = settings.musicVolume;
            musicValue.textContent = settings.musicVolume;
        }

        const sfxVolume = document.getElementById('sfx-volume');
        const sfxValue = document.getElementById('sfx-volume-value');
        if (sfxVolume && sfxValue) {
            sfxVolume.value = settings.sfxVolume;
            sfxValue.textContent = settings.sfxVolume;
        }

        const graphicsQuality = document.getElementById('graphics-quality');
        if (graphicsQuality) {
            graphicsQuality.value = settings.graphicsQuality;
        }

        this.showScreen('settings-screen');
    }

    // 开始游戏
    startGame() {
        this.startGameWithLevel(1);
    }

    // 开始指定关卡
    startGameWithLevel(levelId) {
        console.log(`🎮 startGameWithLevel调用: levelId=${levelId}`);
        this.showScreen('game-screen');
        if (game) {
            game.startGame(levelId);
        }
    }

    // 暂停游戏
    pauseGame() {
        if (game) {
            game.pauseGame();
            this.showScreen('pause-screen');
        }
    }

    // 主动过关
    passLevel() {
        if (game) {
            game.passLevel();
        }
    }

    // 继续游戏
    resumeGame() {
        if (game) {
            game.resumeGame();
            this.showScreen('game-screen');
        }
    }

    // 重新开始游戏
    restartGame() {
        if (game) {
            game.restartLevel();
            this.showScreen('game-screen');
        }
    }

    // 退出到主菜单
    quitToMenu() {
        if (game) {
            game.returnToMenu();
        }
        this.showMainMenu();
    }

    // 下一关
    nextLevel() {
        // 防止重复调用的保护机制
        if (this.isProcessingNextLevel) {
            console.log('⚠️ 正在处理下一关切换，忽略重复调用');
            return;
        }

        this.isProcessingNextLevel = true;

        if (game) {
            // 直接使用Game类的currentLevel，确保正确的下一关
            const currentLevel = game.currentLevel;
            const nextLevel = currentLevel + 1;
            console.log(`🎮 进入下一关: ${currentLevel} → ${nextLevel}`);
            // 下一关时不重置分数，保持累积
            game.startGame(nextLevel, false);
            this.showScreen('game-screen');
        }

        // 延迟重置标志，防止快速连击
        setTimeout(() => {
            this.isProcessingNextLevel = false;
        }, 1000);
    }

    // 重试关卡
    retryLevel() {
        if (game) {
            game.restartLevel();
            this.showScreen('game-screen');
        }
    }

    // 返回菜单
    backToMenu() {
        this.quitToMenu();
    }

    // 模拟加载进度
    simulateLoading(callback) {
        const progressBar = document.getElementById('loading-progress');
        const loadingText = document.getElementById('loading-text');

        let progress = 0;
        const loadingMessages = [
            '初始化游戏引擎...',
            '加载游戏资源...',
            '生成深海世界...',
            '准备钩子系统...',
            '加载完成!'
        ];

        const interval = setInterval(() => {
            progress += Math.random() * 20;

            if (progress >= 100) {
                progress = 100;
                if (progressBar) progressBar.style.width = '100%';
                if (loadingText) loadingText.textContent = loadingMessages[4];

                setTimeout(() => {
                    clearInterval(interval);
                    callback();
                }, 500);
            } else {
                if (progressBar) progressBar.style.width = progress + '%';
                if (loadingText) {
                    const messageIndex = Math.floor(progress / 25);
                    loadingText.textContent = loadingMessages[Math.min(messageIndex, 3)];
                }
            }
        }, 100);
    }
}

// 全局UI管理器实例
let uiManager = null;
