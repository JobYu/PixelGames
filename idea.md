### **H5游戏《深海寻宝》技术设计文档 (GDD)**

#### **1. 游戏概述 (Game Overview)**

*   **游戏名称：** 深海寻宝 (暂定)
*   **游戏类型：** 休闲、益智、抓取类
*   **核心玩法：** 类似于“黄金矿工”，玩家在限定时间内抓取海底的各种物品，以达到目标分数。
*   **平台：** H5 (适配移动端和PC浏览器)
*   **目标用户：** 寻求碎片化时间娱乐的休闲游戏玩家。

#### **2. 核心玩法机制 (Core Gameplay Mechanics)**

**2.1. 游戏目标**
*   在每个关卡规定的时间（例如：120秒）内，获得目标分数（例如：1000分）即可过关。
*   时间耗尽时，若未达到目标分数，则游戏失败。
*   成功过关后，剩余时间可以按一定比例折算为奖励分数。

**2.2. 玩家操作**
*   **PC端：**
    *   `↓` (方向键下): 释放钩子。
*   **移动端：**
    *   点击屏幕任意位置: 释放钩子。
*   **操作逻辑：** 钩子在屏幕上方左右往复摆动，玩家在合适的时机操作，钩子会沿着当前方向直线向下伸出。

**2.3. 钩子机制 (Hook Mechanics)**
钩子是游戏的核心，其行为应通过一个**状态机 (State Machine)** 来管理，以保证逻辑的清晰。

*   **状态1: 摇摆 (Swinging)**
    *   钩子在初始位置，以一个固定的轴心点进行左右往复的正弦或余弦运动。
    *   这是玩家可以发射钩子的唯一状态。
*   **状态2: 下落 (Firing)**
    *   玩家操作后，钩子状态切换为“下落”。
    *   钩子沿着当前角度匀速向下移动。
    *   下落速度为一个可配置的基础值 `hookBaseSpeed`。
*   **状态3: 上升 (Retracting)**
    *   当钩子碰到边界或抓取到道具后，状态切换为“上升”。
    *   钩子匀速返回初始的轴心点。
    *   **上升速度计算公式：** `retractSpeed = hookBaseSpeed - itemWeight`。这意味着抓取到的道具越“重”，上升速度越慢。每个道具都需要有一个“重量”属性。
    *   如果未抓取到任何道具（空钩），则以最快速度 `hookBaseSpeed` 返回。
*   **状态4: 结算 (Scoring)**
    *   当携带道具的钩子回到轴心点时，状态切换为“结算”。
    *   道具消失，播放得分动画（如 `+100`）和音效。
    *   玩家总分增加。
    *   结算完成后，钩子状态重新切换回“摇摆”。

**2.4. 碰撞检测**
*   在“下落”状态中，实时检测钩子前端与所有可抓取道具的碰撞。
*   一旦发生碰撞，立即停止下落，并记录被抓取的道具，切换到“上升”状态。
*   为避免性能问题，道具较多时可采用空间划分（如四叉树）等优化算法，但初期版本可使用简单的矩形碰撞检测。

#### **3. 关卡设计 (Level Design)**

**3.1. 关卡核心要素**
每个关卡由以下数据定义：
*   `level`: 关卡ID (例如: 1, 2, 3...)
*   `timeLimit`: 关卡时间限制 (秒)
*   `targetScore`: 目标分数
*   `items`: 一个包含本关卡所有道具配置的数组。

**3.2. 关卡生成算法 (Procedural Generation)**
为了实现自动化生成，同时保证关卡的可玩性和趣味性，推荐采用**基于权重的随机分布算法**。

*   **步骤1: 定义道具清单**
    *   在关卡配置中，指定可能出现的道具类型及其数量或总价值。
    *   例如：`{ type: 'gold_small', count: 5 }, { type: 'fish_clown', count: 3 }, { type: 'rock_small', count: 4 }`
*   **步骤2: 划分生成区域**
    *   将海底区域划分为若干个不可见的网格或区域。
*   **步骤3: 随机放置**
    *   遍历道具清单，对于每一种道具，在其指定的数量范围内，随机选择一个空的网格区域进行放置。
    *   **优化：** 可以为不同区域设置“生成权重”，比如深海区域更容易生成大黄金，浅海区域更容易生成小鱼。同时，要避免道具重叠。
*   **步骤4: 总价值校验 (可选但推荐)**
    *   生成后，计算关卡内所有道具的总分值。确保总分值远高于目标分数（例如，至少是目标分数的150%），以保证玩家有足够的选择空间和容错率。

**3.3. 关卡配置文件示例 (JSON格式)**
这种数据驱动的方式让关卡策划可以不写一行代码就轻松配置新关卡。

```json
{
  "level": 1,
  "timeLimit": 120,
  "targetScore": 800,
  "items": [
    { "type": "gold_small", "count": 5 },
    { "type": "gold_medium", "count": 2 },
    { "type": "rock_small", "count": 4 },
    { "type": "fish_clown", "count": 3 }
  ]
}
```

#### **4. 道具系统设计 (Item System Design)**

这是系统设计的核心，必须保证高度的可扩展性。我们将使用**面向对象**的思路，设计一个基础道具类和若干子类。

**4.1. 设计原则**
*   **继承与多态：** 所有道具都继承自一个 `BaseItem` 基类。
*   **数据驱动：** 道具的具体属性（分数、重量、图片资源等）由配置文件定义，而不是硬编码在代码中。

**4.2. 基础道具类 (BaseItem)**
这是一个抽象基类，定义所有道具的共同属性和方法。

```javascript
// 伪代码示例
class BaseItem {
    constructor(config) {
        this.type = config.type;         // 类型标识，如 'gold_small'
        this.score = config.score;       // 分数
        this.weight = config.weight;     // 重量，影响钩子回收速度
        this.sprite = new Sprite(config.image); // 游戏引擎的精灵对象，用于显示
        this.x = 0;                      // 场景中的x坐标
        this.y = 0;                      // 场景中的y坐标
    }

    // 每个道具可以有自己的更新逻辑，例如移动
    update(deltaTime) {
        // 默认不执行任何操作
    }
}
```

**4.3. 道具分类与实现**

**4.3.1. 静态道具 (StaticItem)**
*   **描述：** 位置固定不动的道具，如黄金、石头。
*   **实现：** 直接继承 `BaseItem` 即可，无需重写 `update` 方法。
*   **配置示例 (`item_config.json`):**
    ```json
    {
        "gold_small": { "score": 100, "weight": 5, "image": "path/to/gold_small.png" },
        "gold_medium": { "score": 250, "weight": 10, "image": "path/to/gold_medium.png" },
        "rock_small": { "score": 20, "weight": 15, "image": "path/to/rock_small.png" }
    }
    ```

**4.3.2. 动态道具 (MovingItem - 鱼)**
*   **描述：** 会在一定范围内水平或垂直移动的道具。
*   **实现：** 继承 `BaseItem`，并重写 `update` 方法来实现移动逻辑。
*   **类定义示例:**
    ```javascript
    // 伪代码示例
    class MovingItem extends BaseItem {
        constructor(config) {
            super(config);
            this.speed = config.speed; // 移动速度
            this.moveRange = config.moveRange; // 移动范围 [minX, maxX]
            this.direction = 1; // 1 for right, -1 for left
        }

        update(deltaTime) {
            this.x += this.speed * this.direction * deltaTime;
            if (this.x > this.moveRange[1] || this.x < this.moveRange[0]) {
                this.direction *= -1; // 碰到边界后反向
            }
            // 这里还可以添加播放序列帧动画的逻辑
        }
    }
    ```
*   **配置示例 (`item_config.json`):**
    ```json
    {
        "fish_clown": { "score": 50, "weight": 3, "image_sequence": ["clown1.png", "clown2.png"], "speed": 50, "moveRange": [100, 500] },
        "fish_puffer": { "score": 80, "weight": 4, "image_sequence": ["puffer1.png", "puffer2.png"], "speed": 30, "moveRange": [200, 400] }
    }
    ```

**4.3.3. 特殊功能道具 (SpecialItem)**
*   **描述：** 被抓取后会触发特殊效果的道具。
*   **实现：** 继承 `BaseItem`，并额外拥有一个 `applyEffect` 方法。当钩子结算这类道具时，调用此方法。
*   **类定义示例:**
    ```javascript
    // 伪代码示例
    class SpecialItem extends BaseItem {
        constructor(config) {
            super(config);
            this.effectType = config.effectType; // 'speed_boost', 'score_multiplier'
            this.effectValue = config.effectValue; // 效果的数值，如 2 (代表2倍)
            this.duration = config.duration; // 效果持续时间（秒）
        }

        // effectTarget 是效果作用的目标，通常是玩家或游戏全局状态
        applyEffect(effectTarget) {
            effectTarget.addBuff(this.effectType, this.effectValue, this.duration);
        }
    }
    ```
*   **配置示例 (`item_config.json`):**
    ```json
    {
        "potion_speed": { "score": 10, "weight": 2, "image": "potion.png", "effectType": "hook_speed_boost", "effectValue": 2, "duration": 15 },
        "clover_luck": { "score": 10, "weight": 2, "image": "clover.png", "effectType": "score_multiplier", "effectValue": 1.5, "duration": 20 }
    }
    ```

**4.3.4. 宝箱 (TreasureChestItem)**
*   **描述：** 宝箱本身有基础分和重量，但其核心价值在于被抓取后能随机开出其他道具。
*   **实现：** 可以看作一种特殊的静态道具。在结算时，除了给予宝箱自身的分数外，还会根据其内部的“掉落列表”随机给一个额外奖励。
*   **配置示例 (`item_config.json`):**
    ```json
    {
        "chest_wood": {
            "score": 50,
            "weight": 12,
            "image": "chest.png",
            "lootTable": [ // 掉落列表
                { "type": "gold_medium", "chance": 0.4 }, // 40% 概率开出中黄金
                { "type": "potion_speed", "chance": 0.2 }, // 20% 概率开出加速药水
                { "type": "diamond", "chance": 0.1 },     // 10% 概率开出钻石
                { "type": "empty", "chance": 0.3 }        // 30% 概率为空
            ]
        }
    }
    ```

#### **5. 技术选型建议 (Tech Stack Recommendation)**

*   **游戏引擎:**
    *   **Phaser.js / Cocos Creator:** 推荐使用。它们提供了成熟的场景管理、精灵、动画、物理（碰撞检测）、资源加载和多平台发布方案，能极大提高开发效率。
    *   **原生JavaScript/TypeScript + Canvas:** 对于想深入学习底层原理的开发者，这也是一个选择，但开发成本会更高。
*   **开发语言:**
    *   **TypeScript:** 强烈推荐。其静态类型系统能有效减少运行时错误，提高代码的可维护性和健壮性，尤其适合这种具有复杂对象交互的游戏。
*   **项目架构:**
    *   **面向对象编程 (OOP):** 如上文设计，是实现此游戏最直观、最易于理解的范式。
    *   **实体组件系统 (ECS):** 更为现代的游戏架构模式，能提供极致的灵活性和性能，但学习曲线稍陡。对于此项目，OOP已足够优秀。

#### **6. 后续迭代方向 (Future Iterations)**

*   **商店系统：** 关卡之间可以进入商店，用赚取的金钱购买一次性道具（如炸药，可以炸掉抓上来的石头）或永久升级（如提升钩子基础速度）。
*   **更多关卡和道具：** 基于现有框架，可以轻松地横向扩展内容。
*   **多样化的敌人/障碍：** 比如会主动躲避钩子的鱼，或者需要多次抓取才能拉动的巨大宝物。
*   **音效与音乐：** 增加背景音乐、抓取音效、得分音效等，提升游戏沉浸感。
*   **社交功能：** 如好友排行榜，分享战绩等。

---

**总结:**

这份设计文档将原始需求进行了系统化和工程化的梳理。通过**数据驱动**和**模块化设计**，开发团队可以清晰地分工合作。前端开发者可以专注于实现钩子状态机和各类道具的基类，而关卡策划或设计师则可以通过修改JSON配置文件来创造丰富的游戏内容。这种架构不仅能保证第一个版本的顺利开发，也为未来的功能扩展打下了坚实的基础。