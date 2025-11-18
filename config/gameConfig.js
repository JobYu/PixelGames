// 游戏基础配置
const GameConfig = {
    // 游戏基础设置
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    
    // 钩子系统配置
    HOOK: {
        BASE_SPEED: 200,        // 钩子基础速度（像素/秒）
        SWING_ANGLE: 75,        // 摆动角度（度）
        SWING_SPEED: 60,        // 摆动速度（度/秒）
        MAX_LENGTH: 600,        // 钩子最大长度（像素）
        START_X: 400-36,           // 钩子起始X位置
        START_Y: 30,            // 钩子起始Y位置
        THICKNESS: 3,           // 钩子线条粗细
        HOOK_SIZE: 8            // 钩头大小
    },

    // 道具配置
    ITEMS: {
        GOLD_TINY: {
            type: 'static',
            score: 50,
            weight: 3,
            width: 16,
            height: 13,
            color: '#FFD700',
            name: '金粒'
        },
        GOLD_SMALL: {
            type: 'static',
            score: 100,
            weight: 5,
            width: 32,
            height: 26,
            color: '#FFD700',
            name: '小金块'
        },
        GOLD_MEDIUM: {
            type: 'static',
            score: 250,
            weight: 10,
            width: 48,
            height: 40,
            color: '#FFA500',
            name: '中金块'
        },
        GOLD_LARGE: {
            type: 'static',
            score: 500,
            weight: 20,
            width: 72,
            height: 68,
            color: '#FF8C00',
            name: '大金块'
        },
        DIAMOND: {
            type: 'static',
            score: 800,
            weight: 8,
            width: 25,
            height: 25,
            color: '#87CEEB',
            name: '钻石'
        },
        ROCK_TINY: {
            type: 'static',
            score: 10,
            weight: 8,
            width: 18,
            height: 18,
            color: '#A9A9A9',
            name: '碎石'
        },
        ROCK_SMALL: {
            type: 'static',
            score: 20,
            weight: 15,
            width: 25,
            height: 25,
            color: '#696969',
            name: '小石头'
        },
        ROCK_MEDIUM: {
            type: 'static',
            score: 35,
            weight: 25,
            width: 70,
            height: 70,
            color: '#556B2F',
            name: '中石头'
        },
        ROCK_LARGE: {
            type: 'static',
            score: 50,
            weight: 40,
            width: 90,
            height: 90,
            color: '#2F4F4F',
            name: '大石头'
        },
        FISH_SMALL: {
            type: 'moving',
            score: 80,
            weight: 3,
            width: 30,
            height: 15,
            color: '#FF6347',
            speed: 50,
            name: '小鱼'
        }
    },

    // 关卡配置
    LEVELS: [
        {
            id: 1,
            name: "初次下潜",
            timeLimit: 120,
            targetScore: 300,
            items: [
                { type: 'GOLD_TINY', count: 5 },
                { type: 'GOLD_SMALL', count: 4 },
                { type: 'ROCK_TINY', count: 3 },
                { type: 'ROCK_SMALL', count: 2 }
            ]
        },
        {
            id: 2,
            name: "认识重量",
            timeLimit: 120,
            targetScore: 600,
            items: [
                { type: 'GOLD_SMALL', count: 4 },
                { type: 'GOLD_MEDIUM', count: 3 },
                { type: 'ROCK_SMALL', count: 3 },
                { type: 'ROCK_MEDIUM', count: 2 }
            ]
        }
    ],

    // 存储键名
    STORAGE_KEYS: {
        HIGH_SCORE: 'deepSeaTreasure_highScore',
        TOTAL_SCORE: 'deepSeaTreasure_totalScore',
        COMPLETED_LEVELS: 'deepSeaTreasure_completedLevels',
        SETTINGS: 'deepSeaTreasure_settings'
    }
};
