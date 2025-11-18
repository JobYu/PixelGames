// 工具函数库
const Utils = {
    // 数学工具
    Math: {
        // 角度转弧度
        degToRad(degrees) {
            return degrees * Math.PI / 180;
        },

        // 弧度转角度
        radToDeg(radians) {
            return radians * 180 / Math.PI;
        },

        // 限制数值在指定范围内
        clamp(value, min, max) {
            return Math.min(Math.max(value, min), max);
        },

        // 线性插值
        lerp(start, end, t) {
            return start + (end - start) * t;
        },

        // 计算两点距离
        distance(x1, y1, x2, y2) {
            const dx = x2 - x1;
            const dy = y2 - y1;
            return Math.sqrt(dx * dx + dy * dy);
        },

        // 随机整数
        randomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },

        // 随机浮点数
        randomFloat(min, max) {
            return Math.random() * (max - min) + min;
        },

        // 随机选择数组元素
        randomChoice(array) {
            return array[Math.floor(Math.random() * array.length)];
        }
    },

    // 碰撞检测
    Collision: {
        // 点与矩形碰撞
        pointRect(px, py, rx, ry, rw, rh) {
            return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
        },

        // 矩形与矩形碰撞
        rectRect(r1x, r1y, r1w, r1h, r2x, r2y, r2w, r2h) {
            return r1x < r2x + r2w && 
                   r1x + r1w > r2x && 
                   r1y < r2y + r2h && 
                   r1y + r1h > r2y;
        },

        // 圆形与矩形碰撞
        circleRect(cx, cy, radius, rx, ry, rw, rh) {
            // 找到矩形上最接近圆心的点
            const closestX = Utils.Math.clamp(cx, rx, rx + rw);
            const closestY = Utils.Math.clamp(cy, ry, ry + rh);
            
            // 计算距离
            const distance = Utils.Math.distance(cx, cy, closestX, closestY);
            return distance <= radius;
        },

        // 线段与矩形碰撞（钩子与道具）
        lineRect(x1, y1, x2, y2, rx, ry, rw, rh) {
            // 检查线段端点是否在矩形内
            if (this.pointRect(x1, y1, rx, ry, rw, rh) || 
                this.pointRect(x2, y2, rx, ry, rw, rh)) {
                return true;
            }

            // 检查线段是否与矩形边相交
            return this.lineIntersectsLine(x1, y1, x2, y2, rx, ry, rx + rw, ry) ||
                   this.lineIntersectsLine(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh) ||
                   this.lineIntersectsLine(x1, y1, x2, y2, rx + rw, ry + rh, rx, ry + rh) ||
                   this.lineIntersectsLine(x1, y1, x2, y2, rx, ry + rh, rx, ry);
        },

        // 线段相交检测
        lineIntersectsLine(x1, y1, x2, y2, x3, y3, x4, y4) {
            const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
            if (denom === 0) return false;

            const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
            const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

            return t >= 0 && t <= 1 && u >= 0 && u <= 1;
        }
    },

    // 动画工具
    Animation: {
        // 缓动函数
        easeInOut(t) {
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        },

        easeOut(t) {
            return 1 - Math.pow(1 - t, 3);
        },

        easeIn(t) {
            return t * t * t;
        },

        // 弹性动画
        elastic(t) {
            if (t === 0) return 0;
            if (t === 1) return 1;
            const p = 0.3;
            const a = 1;
            const s = p / 4;
            return a * Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / p) + 1;
        }
    },

    // DOM工具
    DOM: {
        // 获取元素
        $(selector) {
            return document.querySelector(selector);
        },

        // 获取所有元素
        $$(selector) {
            return document.querySelectorAll(selector);
        },

        // 添加事件监听器
        on(element, event, handler) {
            element.addEventListener(event, handler);
        },

        // 移除事件监听器
        off(element, event, handler) {
            element.removeEventListener(event, handler);
        },

        // 添加CSS类
        addClass(element, className) {
            element.classList.add(className);
        },

        // 移除CSS类
        removeClass(element, className) {
            element.classList.remove(className);
        },

        // 切换CSS类
        toggleClass(element, className) {
            element.classList.toggle(className);
        },

        // 设置样式
        setStyle(element, styles) {
            Object.assign(element.style, styles);
        }
    },

    // 颜色工具
    Color: {
        // RGB转十六进制
        rgbToHex(r, g, b) {
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        },

        // 十六进制转RGB
        hexToRgb(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        },

        // 颜色插值
        interpolate(color1, color2, t) {
            const c1 = this.hexToRgb(color1);
            const c2 = this.hexToRgb(color2);
            
            if (!c1 || !c2) return color1;
            
            const r = Math.round(Utils.Math.lerp(c1.r, c2.r, t));
            const g = Math.round(Utils.Math.lerp(c1.g, c2.g, t));
            const b = Math.round(Utils.Math.lerp(c1.b, c2.b, t));
            
            return this.rgbToHex(r, g, b);
        }
    },

    // 时间工具
    Time: {
        // 格式化时间 (秒 -> MM:SS)
        formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        },

        // 格式化分数 (添加千分位分隔符)
        formatScore(score) {
            return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
    },

    // 设备检测
    Device: {
        // 是否为移动设备
        isMobile() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        },

        // 是否为触摸设备
        isTouch() {
            return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        },

        // 获取屏幕尺寸
        getScreenSize() {
            return {
                width: window.innerWidth,
                height: window.innerHeight
            };
        }
    },

    // 粒子效果工具
    Particles: {
        // 创建爆炸粒子
        createExplosion(x, y, count = 10, color = '#FFD700') {
            const particles = [];
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: x,
                    y: y,
                    vx: Utils.Math.randomFloat(-100, 100),
                    vy: Utils.Math.randomFloat(-100, 100),
                    life: 1.0,
                    decay: Utils.Math.randomFloat(0.01, 0.03),
                    size: Utils.Math.randomFloat(2, 6),
                    color: color
                });
            }
            return particles;
        },

        // 更新粒子
        updateParticles(particles, deltaTime) {
            for (let i = particles.length - 1; i >= 0; i--) {
                const particle = particles[i];
                particle.x += particle.vx * deltaTime;
                particle.y += particle.vy * deltaTime;
                particle.life -= particle.decay;
                
                if (particle.life <= 0) {
                    particles.splice(i, 1);
                }
            }
        },

        // 渲染粒子
        renderParticles(ctx, particles) {
            particles.forEach(particle => {
                ctx.save();
                ctx.globalAlpha = particle.life;
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
        }
    },

    // 调试工具
    Debug: {
        // 绘制碰撞框
        drawBounds(ctx, x, y, width, height, color = 'red') {
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, width, height);
            ctx.restore();
        },

        // 绘制点
        drawPoint(ctx, x, y, radius = 3, color = 'red') {
            ctx.save();
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        },

        // 输出日志
        log(message, type = 'info') {
            const timestamp = new Date().toLocaleTimeString();
            console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
        }
    }
}; 