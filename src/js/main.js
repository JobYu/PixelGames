// 游戏主入口文件
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM内容已加载');
    
    // 检查必要的元素是否存在
    const canvas = document.getElementById('game-canvas');
    const loadingScreen = document.getElementById('loading-screen');
    
    if (!canvas) {
        console.error('游戏Canvas未找到');
        return;
    }
    
    if (!loadingScreen) {
        console.error('加载屏幕未找到');
        return;
    }
    
    console.log('基础元素检查完成');
    
    // 初始化所有管理器
    initializeGame();
});

// 初始化游戏
function initializeGame() {
    console.log('深海寻宝游戏启动中...');
    
    // 检查必要的配置对象
    if (typeof GameConfig === 'undefined') {
        console.error('GameConfig未定义');
        return;
    }
    
    console.log('GameConfig已加载:', GameConfig);
    
    try {
        console.log('创建AudioManager...');
        audioManager = new AudioManager();
        
        console.log('创建UIManager...');
        uiManager = new UIManager();
        
        console.log('创建Game实例...');
        game = new Game();
        // 设置为全局变量，以便其他模块可以访问
        window.game = game;
        
        // 显示加载界面并模拟加载过程
        uiManager.showLoading();
        uiManager.simulateLoading(() => {
            // 加载完成后初始化游戏
            finishInitialization();
        });
    } catch (error) {
        console.error('游戏初始化失败:', error);
        // 显示错误信息
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #0f1419; color: white; font-family: Arial;">
                <div style="text-align: center;">
                    <h2>游戏初始化失败</h2>
                    <p>请刷新页面重试</p>
                    <button onclick="location.reload()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">刷新页面</button>
                </div>
            </div>
        `;
    }
}

// 完成初始化
function finishInitialization() {
    try {
        // 初始化音频系统
        audioManager.init();
        
        // 初始化游戏数据
        GameData.init();
        
        // 初始化UI事件监听器
        uiManager.initializeEventListeners();
        
        // 增强音效功能
        enhanceWithAudio();
        
        // 初始化游戏引擎
        console.log('准备初始化游戏引擎...');
        game.init();
        console.log('游戏引擎初始化完成!');
        
        // 设置Canvas自适应
        setupCanvasResponsive();
        
        // 绑定全局事件
        setupGlobalEvents();
        
        // 显示主菜单
        uiManager.showMainMenu();
        
        console.log('游戏初始化完成!');
    } catch (error) {
        console.error('游戏初始化过程中出错:', error);
        // 尝试显示基本的游戏界面
        try {
            uiManager.showMainMenu();
        } catch (e) {
            console.error('无法显示主菜单:', e);
        }
    }
}

// 设置Canvas响应式
function setupCanvasResponsive() {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) return;
    
    function resizeCanvas() {
        const container = canvas.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        // 计算合适的Canvas尺寸
        let canvasWidth = 800;
        let canvasHeight = 600;
        
        if (Utils.Device.isMobile()) {
            const screenSize = Utils.Device.getScreenSize();
            const maxWidth = Math.min(screenSize.width * 0.95, 400);
            const maxHeight = Math.min(screenSize.height * 0.6, 300);
            
            const scale = Math.min(maxWidth / canvasWidth, maxHeight / canvasHeight);
            canvasWidth *= scale;
            canvasHeight *= scale;
        }
        
        canvas.style.width = canvasWidth + 'px';
        canvas.style.height = canvasHeight + 'px';
    }
    
    // 初始调整
    resizeCanvas();
    
    // 监听窗口大小变化
    window.addEventListener('resize', resizeCanvas);
}

// 设置全局事件
function setupGlobalEvents() {
    // 添加按钮点击音效
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn')) {
            audioManager.playSound('button_click');
        }
    });
    
    // 防止右键菜单和文本选择
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });
    
    // 防止页面滚动（移动端）
    document.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, { passive: false });
    
    // 处理页面可见性变化（自动暂停）
    document.addEventListener('visibilitychange', function() {
        if (document.hidden && game && game.state === 'playing') {
            game.pauseGame();
            uiManager.showScreen('pause-screen');
        }
    });
    
    // 处理音频设置变化
    document.addEventListener('settingsChanged', function(e) {
        const { musicVolume, sfxVolume } = e.detail;
        if (audioManager) {
            audioManager.setMusicVolume(musicVolume / 100);
            audioManager.setSFXVolume(sfxVolume / 100);
        }
    });
}

// 音效集成 - 使用更安全的方法
function enhanceWithAudio() {
    // 保存原始方法
    const originalFire = Hook.prototype.fire;
    const originalCatchItem = Hook.prototype.catchItem;
    const originalAddScore = Game.prototype.addScore;

    // 增强钩子发射音效
    Hook.prototype.fire = function() {
        const result = originalFire.call(this);
        if (audioManager) {
            audioManager.playSound('hook_fire');
        }
        return result;
    };

    // 增强钩子抓取音效
    Hook.prototype.catchItem = function(item) {
        const result = originalCatchItem.call(this, item);
        if (result && audioManager) {
            audioManager.playSound('hook_catch');
        }
        return result;
    };

    // 增强得分音效
    Game.prototype.addScore = function(points) {
        const result = originalAddScore.call(this, points);
        if (audioManager) {
            audioManager.playSound('score_gain');
        }
        return result;
    };
}

// 全局错误处理
window.addEventListener('error', function(e) {
    console.error('游戏运行错误:', e.error);
    
    // 显示友好的错误提示
    const errorMessage = document.createElement('div');
    errorMessage.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(211, 47, 47, 0.9);
        color: white;
        padding: 20px;
        border-radius: 10px;
        font-family: Orbitron, monospace;
        z-index: 1000;
        text-align: center;
    `;
    errorMessage.innerHTML = `
        <h3>游戏遇到错误</h3>
        <p>请刷新页面重试</p>
        <button onclick="location.reload()" style="
            margin-top: 10px;
            padding: 5px 15px;
            background: #fff;
            color: #d32f2f;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        ">刷新页面</button>
    `;
    
    document.body.appendChild(errorMessage);
    
    // 5秒后自动移除错误提示
    setTimeout(() => {
        if (errorMessage.parentNode) {
            errorMessage.parentNode.removeChild(errorMessage);
        }
    }, 5000);
});

// 调试功能（仅在开发环境）
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // 添加调试快捷键
    document.addEventListener('keydown', function(e) {
        // Ctrl + D: 切换调试模式
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            window.debugMode = !window.debugMode;
            console.log('调试模式:', window.debugMode ? '开启' : '关闭');
        }
        
        // Ctrl + R: 重置游戏数据
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            if (confirm('确定要重置所有游戏数据吗？')) {
                GameData.reset();
                location.reload();
            }
        }
        
        // Ctrl + L: 解锁所有关卡（调试用）
        if (e.ctrlKey && e.key === 'l') {
            e.preventDefault();
            for (let i = 1; i <= 20; i++) {
                GameData.saveLevelCompletion(i, 1000, 3);
            }
            console.log('已解锁前20关');
            if (uiManager.currentScreen === 'level-select') {
                uiManager.showLevelSelect();
            }
        }
    });
    
    // 显示调试信息
    console.log(`
    ====== 深海寻宝 调试模式 ======
    快捷键:
    Ctrl + D: 切换调试模式
    Ctrl + R: 重置游戏数据
    Ctrl + L: 解锁所有关卡
    ===============================
    `);
}

// 暴露全局调试接口
window.DebugAPI = {
    game: () => game,
    uiManager: () => uiManager,
    audioManager: () => audioManager,
    gameData: () => GameData,
    unlockAllLevels: () => {
        for (let i = 1; i <= 20; i++) {
            GameData.saveLevelCompletion(i, 1000, 3);
        }
        console.log('已解锁前20关');
    },
    resetData: () => {
        GameData.reset();
        console.log('游戏数据已重置');
    }
};

console.log('深海寻宝游戏 v1.0.0');
console.log('使用 window.DebugAPI 访问调试功能');
