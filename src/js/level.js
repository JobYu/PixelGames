// 关卡管理器
class LevelManager {
    constructor() {
        this.currentLevel = 1;
        this.currentLevelData = null;
    }

    // 加载关卡
    loadLevel(levelId) {
        this.currentLevel = levelId;

        // 从配置中获取关卡数据
        if (levelId <= GameConfig.LEVELS.length) {
            this.currentLevelData = GameConfig.LEVELS[levelId - 1];
        } else {
            // 程序生成关卡
            this.currentLevelData = this.generateLevel(levelId);
        }

        return this.currentLevelData;
    }

    // 程序生成关卡
    generateLevel(levelId) {
        const baseTime = 120;
        const timeDecrement = Math.floor((levelId - 1) / 5) * 5;

        return {
            id: levelId,
            name: `深海探险 ${levelId}`,
            timeLimit: Math.max(baseTime - timeDecrement, 90),
            targetScore: this.calculateTargetScore(levelId),
            items: this.generateRandomItems(levelId)
        };
    }

    // 计算目标分数 - 新的分数曲线
    calculateTargetScore(levelId) {
        // 对于程序生成的关卡（11关及以后）
        // 基于第10关的分数（2500）进行递增
        let score = 2500;

        if (levelId > 10) {
            // 第11关开始：每关增加约20%的难度
            for (let i = 11; i <= levelId; i++) {
                score = Math.floor(score * 1.2);
            }
        }

        return score;
    }

    // 生成随机道具配置
    generateRandomItems(levelId) {
        const items = [];
        const difficulty = Math.min(levelId / 10, 2);

        // 基础道具 - 每关都有
        items.push({ type: 'GOLD_TINY', count: Math.floor(2 + Math.random() * 3) });
        items.push({ type: 'GOLD_SMALL', count: Math.max(2, 6 - Math.floor(difficulty * 2)) });
        items.push({ type: 'ROCK_TINY', count: Math.floor(2 + difficulty) });
        items.push({ type: 'ROCK_SMALL', count: Math.floor(2 + difficulty * 1.5) });

        // 中级道具 - 2关后出现
        if (levelId >= 2) {
            items.push({ type: 'GOLD_MEDIUM', count: Math.floor(1 + difficulty * 1.5) });
            items.push({ type: 'ROCK_MEDIUM', count: Math.floor(1 + difficulty) });
        }

        // 高级道具 - 4关后出现
        if (levelId >= 4) {
            items.push({ type: 'GOLD_LARGE', count: Math.floor(difficulty + 0.5) });
            items.push({ type: 'ROCK_LARGE', count: Math.floor(difficulty * 0.8) });
        }

        // 移动道具 - 3关后出现
        if (levelId >= 3) {
            items.push({ type: 'FISH_SMALL', count: Math.floor(1 + difficulty * 2) });
        }

        // 特殊道具 - 5关后出现
        if (levelId >= 5) {
            items.push({ type: 'DIAMOND', count: Math.floor(1 + difficulty / 2) });
        }

        return items;
    }

    // 获取当前关卡数据
    getCurrentLevelData() {
        return this.currentLevelData;
    }

    // 获取当前关卡ID
    getCurrentLevel() {
        return this.currentLevel;
    }

    // 检查关卡是否完成
    checkLevelComplete(score) {
        return score >= this.currentLevelData.targetScore;
    }

    // 计算星级评价
    calculateStars(score, targetScore) {
        const ratio = score / targetScore;
        if (ratio >= 1.6) return 3;
        if (ratio >= 1.3) return 2;
        if (ratio >= 1.0) return 1;
        return 0;
    }

    // 获取下一关ID
    getNextLevel() {
        return this.currentLevel + 1;
    }

    // 检查是否有下一关
    hasNextLevel() {
        return true; // 支持无限关卡
    }
}
