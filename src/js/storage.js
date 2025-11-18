// 数据存储管理器
const Storage = {
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('保存数据失败:', error);
            return false;
        }
    },

    load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('加载数据失败:', error);
            return defaultValue;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('删除数据失败:', error);
            return false;
        }
    },

    exists(key) {
        return localStorage.getItem(key) !== null;
    }
};

// 游戏数据管理器
const GameData = {
    init() {
        this.highScore = Storage.load(GameConfig.STORAGE_KEYS.HIGH_SCORE, 0);
        this.totalScore = Storage.load(GameConfig.STORAGE_KEYS.TOTAL_SCORE, 0);
        this.completedLevels = Storage.load(GameConfig.STORAGE_KEYS.COMPLETED_LEVELS, []);
        this.settings = Storage.load(GameConfig.STORAGE_KEYS.SETTINGS, {
            musicVolume: 50,
            sfxVolume: 70,
            graphicsQuality: 'medium'
        });
    },

    saveHighScore(score) {
        if (score > this.highScore) {
            this.highScore = score;
            Storage.save(GameConfig.STORAGE_KEYS.HIGH_SCORE, this.highScore);
            return true;
        }
        return false;
    },

    saveLevelCompletion(levelId, score, stars) {
        if (!this.completedLevels.includes(levelId)) {
            this.completedLevels.push(levelId);
            Storage.save(GameConfig.STORAGE_KEYS.COMPLETED_LEVELS, this.completedLevels);
        }
    },

    isLevelCompleted(levelId) {
        return this.completedLevels.includes(levelId);
    },

    isLevelUnlocked(levelId) {
        return levelId === 1 || this.isLevelCompleted(levelId - 1);
    },

    getCompletedLevelCount() {
        return this.completedLevels.length;
    },

    getSettings() {
        return this.settings;
    },

    setSetting(key, value) {
        this.settings[key] = value;
        Storage.save(GameConfig.STORAGE_KEYS.SETTINGS, this.settings);
    },

    getSetting(key) {
        return this.settings[key];
    },

    getHighScore() {
        return this.highScore;
    },

    // 累计分数相关方法
    addToTotalScore(score) {
        this.totalScore += score;
        Storage.save(GameConfig.STORAGE_KEYS.TOTAL_SCORE, this.totalScore);
    },

    getTotalScore() {
        return this.totalScore;
    },

    resetTotalScore() {
        this.totalScore = 0;
        Storage.save(GameConfig.STORAGE_KEYS.TOTAL_SCORE, this.totalScore);
    },

    // 重置所有游戏数据
    reset() {
        this.highScore = 0;
        this.totalScore = 0;
        this.completedLevels = [];
        this.settings = {
            musicVolume: 50,
            sfxVolume: 70,
            graphicsQuality: 'medium'
        };
        
        Storage.save(GameConfig.STORAGE_KEYS.HIGH_SCORE, this.highScore);
        Storage.save(GameConfig.STORAGE_KEYS.TOTAL_SCORE, this.totalScore);
        Storage.save(GameConfig.STORAGE_KEYS.COMPLETED_LEVELS, this.completedLevels);
        Storage.save(GameConfig.STORAGE_KEYS.SETTINGS, this.settings);
        
        console.log('所有游戏数据已重置');
    }
};
