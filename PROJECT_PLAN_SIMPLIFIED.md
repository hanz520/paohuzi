# 计分器 - 简化版项目计划书

**版本**: v2.0 (简化版 - 云开发)  
**最后更新**: 2026 年 3 月 29 日  
**状态**: 待开发

---

## 一、项目概述

### 1.1 项目名称
**计分助手**（简化版）

### 1.2 项目定位
专为**玩家**设计的**云端计分工具**，支持 3-4 人游戏计分，四人模式支持组队计分，所有数据云端存储，朋友间共享可见。

### 1.3 目标用户
- 邵阳地区爱好者
- 家庭聚会、朋友娱乐场景
- 固定的小圈子玩家群体（作者和朋友）

### 1.4 核心价值
- 打开即用，简化登录流程
- 云端存储，朋友间数据共享
- 操作简单，计分方便
- 贴合计分游戏规则
- 历史战绩可追溯

---

## 二、功能需求

### 2.1 核心功能

#### 2.1.1 创建游戏
- **模式选择**: 3 人模式 / 4 人模式
- **玩家名称输入**: 
  - 3 人模式：输入 3 个玩家名字
  - 4 人模式：输入 4 个玩家名字
- **组队选择**（仅 4 人模式）: 

#### 2.1.2 计分操作
- 点击玩家卡片打开计分输入框
- **计分输入框功能**:
  - 数字输入框（手动输入分值）
  - **输入限制**: 必须为**大于等于 10 的整数**
  - **确认按钮**: 按输入分值给该玩家加分
  - **流局按钮**（仅四人模式显示）:
    - 点击后该玩家**-10 分**
    - 该玩家的队友**+10 分**
- 支持撤销上一次操作

#### 2.1.3 游戏结束条件
- **自动结束**: 
  - 条件 1: 任一玩家分数超过 100 分
  - 条件 2: 超过 100 分后，**另一名玩家得分时**才结束
- **手动结束**: 
  - 玩家可手动结束游戏
  - **需要二次确认**（避免误触）

#### 2.1.4 组队计分规则
- 四人模式下启用
- **正常计分**: 队友得分时，另一方按**50% 比例**获得分数，向上取整
- **流局计分**: 该玩家 -10 分，队友 +10 分（固定值）

#### 2.1.5 结算页面
- 显示各玩家原始分数
- **分数转换计算**: 原始分数除以 10，向上取整
- **最终得分计算**:
  - **三人模式**: 转换分数 × 2 - 其他玩家转换分数之和
  - **四人模式**: 转换分数 × 3 - 其他玩家转换分数之和
- **零和验证**: 所有玩家最终得分总和必须为 0
- 显示获胜玩家/队伍
- 显示 MVP（最终得分最高者）
- **继续下一局按钮**: 清空分数，保留玩家和队伍配置
- **返回首页按钮**
- **云存储**: 结算数据自动保存到云数据库

### 2.2 数据功能

#### 2.2.1 云数据库存储
- 使用微信云开发数据库
- 每局游戏结束后自动保存
- 所有玩家共享同一份数据

#### 2.2.2 历史记录
- 查看所有历史游戏记录
- 显示基本信息（模式、玩家、获胜者、时间）
- 点击查看游戏详情

---

## 三、技术架构

### 3.1 技术栈

#### 前端（微信小程序）
- **框架**: 微信小程序原生框架
- **UI 组件**: Vant Weapp 或基础组件
- **状态管理**: 小程序页面 data + 全局变量
- **云开发**: 微信云开发 SDK

#### 后端（云开发）
- **平台**: 微信云开发 (CloudBase)
- **云函数**: 2 个（创建游戏、保存游戏）
- **数据库**: 云数据库（MongoDB 协议）
- **无需 WebSocket**: 简化为单机操作，数据异步上云

### 3.2 系统架构图

```
┌─────────────────────────────────────┐
│         微信小程序前端              │
│  ┌─────────────────────────────┐    │
│  │  页面层 (5 个页面)            │    │
│  │  - index (首页/创建)        │    │
│  │  - setup (玩家设置)         │    │
│  │  - team-select (组队选择)   │    │  ← 四人模式
│  │  - game (游戏计分)          │    │
│  │  - result (结算页)          │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │  组件层 (3 个组件)            │    │
│  │  - 玩家卡片                 │    │
│  │  - 计分输入框               │    │
│  │  - 组队标识                 │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
              ↓ (HTTP 调用)
┌─────────────────────────────────────┐
│         微信云开发平台              │
│  ┌─────────────────────────────┐    │
│  │  云函数 (2 个)               │    │
│  │  - createGame               │    │
│  │  - saveGame                 │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │  云数据库 (2 张表)           │    │
│  │  - games (游戏记录)         │    │
│  │  - players (玩家统计)       │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### 3.3 数据库设计

#### games (游戏记录表)
```javascript
{
  _id: String,           // 游戏 ID
  mode: String,          // 游戏模式 ('3 人'/'4 人')
  players: [             // 玩家信息
    {
      name: String,      // 玩家昵称
      rawScore: Number,  // 原始分数
      convertedScore: Number, // 转换分数
      finalScore: Number,// 最终得分
      isWinner: Boolean  // 是否获胜
    }
  ],
  teams: Array,          // 组队信息 [[0,2], [1,3]] (四人模式)
  winner: String,        // 获胜者
  mvp: String,           // MVP
  duration: Number,      // 游戏时长 (秒)
  createTime: Date,      // 创建时间
  createdBy: String      // 创建者 openid
}
```

#### players (玩家统计表)
```javascript
{
  _id: String,           // 玩家昵称（作为唯一标识）
  nickname: String,      // 昵称
  totalGames: Number,    // 总游戏场次
  totalWins: Number,     // 总获胜场次
  winRate: Number,       // 胜率
  lastPlayTime: Date     // 最后游戏时间
}
```

#### 云开发配置
```javascript
// 云函数：getPlayers - 获取历史玩家列表
// 用于玩家设置页选择历史玩家

// 云函数：saveGame - 保存游戏并更新玩家统计
// 如果玩家不存在，自动创建新玩家记录
```

---

## 四、页面设计

### 4.1 首页 (pages/index/index)
**功能**: 创建游戏入口
**元素**:
- 页面标题："计分助手"
- 三人模式按钮
- 四人模式按钮
- 历史记录入口（右上角）

### 4.2 玩家设置页 (pages/setup/setup)
**功能**: 选择或输入玩家名称
**元素**:
- 页面标题："设置玩家"
- 模式显示："三人模式" 或 "四人模式"
- 玩家选择区域（3-4 个位置）
  - 每个位置包含：
    - **玩家卡片**：
      - 默认状态：显示"玩家 X"占位文字
      - 已选状态：显示玩家名字
    - **操作按钮**：
      - 未选择时：显示"选择玩家"按钮
      - 已选择时：显示"更换"按钮和"清空"按钮
- **历史玩家选择器**（弹窗/半屏弹窗）
  - 标题："选择玩家"
  - 搜索框：支持输入名字搜索
  - 玩家列表：显示云数据库中的历史玩家（按最近使用时间排序）
  - 点击玩家：选中并关闭弹窗
  - 取消按钮：关闭弹窗
- **开始游戏按钮**：
  - 初始禁用状态（有未设置的玩家时）
  - 所有玩家都设置后启用
- 返回按钮

**交互逻辑**:
1. 用户点击"选择玩家"按钮
2. 弹出历史玩家选择器
3. 可搜索或直接点击选择玩家
4. 选中后玩家卡片显示该玩家名字
5. 可对已选玩家点击"更换"重新选择
6. 可对已选玩家点击"清空"清除选择
7. 所有玩家都设置后，"开始游戏"按钮启用
8. 点击"开始游戏"：
   - 三人模式：直接跳转到游戏计分页
   - 四人模式：跳转到组队选择页

**数据结构**:
```javascript
{
  mode: '3 人' | '4 人',
  players: [
    { index: 0, name: '张三', selected: true },
    { index: 1, name: '', selected: false },
    { index: 2, name: '李四', selected: true }
  ]
}
```

### 4.3 组队选择页 (pages/team-select/team-select)
**功能**: 用户设置队友（仅四人模式）
**元素**:
- 页面标题："选择队友"
- 组队说明文字："请选择 2 名玩家作为队友"
- 4 名玩家列表（全部显示）
  - 玩家卡片（头像占位、昵称）
  - 点击选中/取消选中
  - 选中的玩家高亮显示（带勾选标识）
- **确认组队按钮**：
  - 初始禁用状态（灰色）
  - 选中恰好 2 名玩家时启用（彩色）
  - 点击后确认组队
- 返回按钮

**交互逻辑**:
- 显示全部 4 名玩家
- 用户点击玩家卡片进行选中/取消
- 必须选中且只能选中 2 名玩家
- 选中 2 名玩家时，确认按钮启用
- 点击确认后，选中的 2 名玩家为队友，剩余 2 名自动成队

### 4.4 游戏计分页 (pages/game/game)
**功能**: 游戏计分
**元素**:
- **顶部信息栏**:
  - 游戏模式标识（三人/四人）
  - 游戏时长（实时计时，格式：MM:SS）
  - 组队标识（四人模式显示：队伍 1 vs 队伍 2）

- **玩家卡片区域**:
  - 3-4 个玩家卡片（垂直排列或 2x2 网格）
  - 每个卡片包含:
    - 玩家头像占位（圆形，带字母）
    - 玩家名字
    - 当前分数（大号字体）
    - 队伍标识（四人模式，不同颜色区分）
    - 点击卡片打开计分输入框

- **计分输入弹窗**:
  - 弹窗标题：玩家名字
  - 分数输入框：
    - 数字键盘
    - 占位符："请输入分数（≥10）"
    - 实时验证提示
  - 按钮组:
    - **确认按钮**：按输入分数加分（输入≥10 时启用）
    - **流局按钮**（仅四人模式）：该玩家 -10 分，队友 +10 分
    - **取消按钮**：关闭弹窗

- **底部操作栏**:
  - **撤销按钮**：撤销上一次计分操作（有操作记录时启用）
  - **结束游戏按钮**：结束本局游戏

**交互逻辑**:
1. 点击玩家卡片 → 打开计分输入弹窗
2. 输入分数（≥10）→ 确认按钮启用
3. 点击确认 → 该玩家加上对应分数 → 关闭弹窗
4. 四人模式点击流局 → 该玩家 -10 分，队友 +10 分 → 关闭弹窗
5. 点击撤销 → 撤销上一次操作 → 显示提示"已撤销"
6. 点击结束游戏 → 弹出分数预览确认 → 确认后进入结算页

**游戏结束判定**:
- 每次计分后检查
- 条件 1：有玩家分数 > 100
- 条件 2：超过 100 分后，另一名玩家得分
- 满足条件时自动弹出分数预览确认
- 用户确认后，才保存数据并进入结算
- 用户取消后，可以继续修改分数（包括撤销操作）

**结算确认弹窗（方案 1）**:
- 标题："游戏结束"
- 内容：显示所有玩家当前分数预览
  ```
  当前分数：
  张三：115 分
  李四：85 分
  王五：35 分
  
  是否进入结算？
  ```
- 按钮：取消（再想想）/ 确认结算
- 用户取消后，可以撤销修改，重新计分

**数据结构**:
```javascript
{
  mode: '3 人' | '4 人',
  players: [
    { name: '张三', rawScore: 115, seat: 0 },
    { name: '李四', rawScore: 85, seat: 1 },
    { name: '王五', rawScore: 35, seat: 2 }
  ],
  teams: [[0, 2], [1, 3]],  // 四人模式队伍索引
  scoreRecords: [           // 计分记录（用于撤销）
    { playerId: 0, score: 10, type: 'normal', timestamp: Date }
  ],
  startTime: Date,
  timer: null               // 计时器 ID
}
```

### 4.5 结算页 (pages/result/result)
**功能**: 游戏结算
**元素**:
- **顶部区域**:
  - 游戏结束标识（奖杯图标）
  - "游戏结束" 标题
  - 游戏时长显示

- **获胜者展示区域**:
  - 获胜者卡片（大尺寸）
  - 获胜者头像和名字
  - 最终得分（特大号字体，彩色突出）
  - "获胜" 标识
  - MVP 标识（如获胜者不是最高分）

- **分数详情列表**:
  - 所有玩家的分数详情（按最终得分排序）
  - 每个玩家显示:
    - 排名（1、2、3...）
    - 玩家名字
    - 原始分数
    - 转换分数（原始分÷10，向上取整）
    - 最终得分（结算公式计算）
    - 胜负标识（+ 表示赢，- 表示输）

- **结算公式区域**（可展开/收起）:
  - 公式说明标题
  - 三人模式公式：最终得分 = 转换分×2 - 其他玩家转换分之和
  - 四人模式公式：最终得分 = 转换分×3 - 其他玩家转换分之和
  - 零和验证：所有玩家最终得分之和 = 0 ✓

- **数据保存提示**:
  - "✓ 本局数据已保存到云端"
  - 保存时间戳

- **按钮组**:
  - **继续游戏按钮**（主按钮，大号）:
    - 三人模式：保留玩家名字，清空分数，直接开始新一局
    - 四人模式：保留玩家名字，跳转到组队选择页重新组队
  - **返回首页按钮**（次要按钮）: 结束当前游戏，返回首页

**交互逻辑**:
1. 进入结算页 → 自动计算并展示结算结果
2. 点击公式区域 → 展开/收起公式详情
3. 点击"继续游戏":
   - 保存当前游戏记录到云端
   - 三人模式：跳转游戏计分页（原班人马）
   - 四人模式：跳转组队选择页（重新组队）
4. 点击"返回首页" → 跳转首页

**数据结构**:
```javascript
{
  mode: '3 人' | '4 人',
  players: [
    {
      name: '张三',
      rawScore: 115,              // 原始分数
      convertedScore: 12,         // 转换分数（向上取整）
      finalScore: 11,             // 最终得分
      isWinner: true,             // 是否获胜
      rank: 1                     // 排名
    }
  ],
  winner: '张三',
  mvp: '张三',
  duration: 1200,                 // 游戏时长（秒）
  settlement: {
    algorithm: '三人模式：转换分×2 - 其他玩家转换分之和',
    totalZero: true,              // 零和验证
    details: '12×2 - 9 - 4 = 11'  // 计算公式详情
  },
  saved: true,                    // 是否已保存
  saveTime: Date                  // 保存时间
}
```

### 4.6 历史记录页 (pages/history/history)
**功能**: 查看历史游戏
**元素**:
- **页面标题**: "游戏记录"
- **筛选区域**（可选）:
  - 全部 / 三人模式 / 四人模式
  - 最近 7 天 / 最近 30 天 / 全部
- **游戏记录列表**:
  - 游戏卡片（每条记录）
  - 卡片内容:
    - 模式标识（三人/四人）
    - 游戏日期（MM/DD HH:mm）
    - 玩家列表（3-4 名玩家名字）
    - 获胜者（高亮显示）
    - 游戏时长
  - 点击卡片 → 查看详情
- **加载更多**:
  - 滚动到底部自动加载
  - 或"加载更多"按钮
- **空状态**:
  - 无记录提示
  - 开始游戏引导

**交互逻辑**:
1. 进入页面 → 加载最近 20 条记录
2. 点击筛选 → 刷新列表
3. 点击记录 → 跳转详情页（可选）
4. 滚动到底部 → 加载更多

**数据结构**:
```javascript
{
  games: [
    {
      _id: 'game_001',
      mode: '3 人',
      players: ['张三', '李四', '王五'],
      winner: '张三',
      duration: 1200,
      createTime: Date
    }
  ],
  hasMore: true,
  filters: {
    mode: 'all',
    timeRange: 'all'
  }
}
```

---

## 五、核心算法

### 5.1 结算算法
```javascript
function calculateSettlement(players, mode) {
  const N = players.length; // 3 或 4
  const multiplier = N - 1; // 三人：2, 四人：3
  
  // Step 1: 计算转换分数
  const convertedScores = players.map(p => ({
    ...p,
    converted: Math.ceil(p.rawScore / 10)
  }));
  
  // Step 2: 计算最终得分
  const finalScores = convertedScores.map((player, index) => {
    const otherPlayers = convertedScores.filter((_, i) => i !== index);
    const otherSum = otherPlayers.reduce((sum, p) => sum + p.converted, 0);
    const finalScore = player.converted * multiplier - otherSum;
    
    return { ...player, finalScore };
  });
  
  // Step 3: 零和验证
  const totalScore = finalScores.reduce((sum, p) => sum + p.finalScore, 0);
  
  // Step 4: 确定获胜者
  const winner = finalScores.reduce((max, p) => 
    p.finalScore > max.finalScore ? p : max
  );
  
  return { players: finalScores, winner, totalScore, isZeroSum: totalScore === 0 };
}
```

### 5.2 组队选择算法
```javascript
/**
 * 组队选择逻辑 - 选择 2 名玩家为队友
 */
class TeamSelector {
  constructor(players) {
    this.players = players; // 4 名玩家
    this.selectedIndices = []; // 已选中的玩家索引
  }
  
  /**
   * 切换玩家选中状态
   */
  togglePlayer(index) {
    const pos = this.selectedIndices.indexOf(index);
    
    if (pos > -1) {
      // 取消选中
      this.selectedIndices.splice(pos, 1);
    } else {
      // 选中（最多 2 个）
      if (this.selectedIndices.length < 2) {
        this.selectedIndices.push(index);
      }
    }
    
    return this.selectedIndices;
  }
  
  /**
   * 是否可以确认
   */
  canConfirm() {
    return this.selectedIndices.length === 2;
  }
  
  /**
   * 确认组队
   */
  confirmTeam() {
    if (!this.canConfirm()) {
      throw new Error('请选择恰好 2 名玩家');
    }
    
    // 队伍 1：选中的 2 名玩家
    const team1 = this.selectedIndices;
    
    // 队伍 2：剩余的 2 名玩家
    const team2 = this.players
      .map((_, index) => index)
      .filter(index => !team1.includes(index));
    
    return {
      teams: [team1, team2],
      team1,
      team2
    };
  }
  
  /**
   * 判断玩家是否被选中
   */
  isSelected(index) {
    return this.selectedIndices.includes(index);
  }
  
  /**
   * 获取选中数量
   */
  getSelectedCount() {
    return this.selectedIndices.length;
  }
}
```

### 5.3 流局计分算法
```javascript
function handleLiuJu(playerIndex, teams) {
  const team = teams.find(t => t.includes(playerIndex));
  const teammateIndex = team.find(i => i !== playerIndex);
  
  return {
    [playerIndex]: -10,
    [teammateIndex]: +10
  };
}
```

### 5.4 继续游戏逻辑
```javascript
/**
 * 继续游戏 - 保留玩家名字，四人模式重新组队
 */
function continueGame(currentState) {
  // 保留玩家名字，清空分数
  const newGameState = {
    mode: currentState.mode,        // 游戏模式（3 人/4 人）
    players: currentState.players.map(p => ({
      name: p.name,                 // 保留玩家名字
      rawScore: 0                   // 清空分数
    })),
    teams: null,                    // 清空组队配置（四人模式需重新选择）
    scoreRecords: [],               // 清空计分记录
    startTime: new Date()           // 新的开始时间
  };
  
  return newGameState;
}

// 前端跳转逻辑
function onContinueGame() {
  // 1. 保存当前游戏记录到云端
  saveGameToCloud(currentGameState);
  
  // 2. 判断是否需要重新组队
  if (currentGameState.mode === '4 人') {
    // 四人模式：跳转到组队选择页，重新组队
    const setupState = {
      mode: '4 人',
      players: currentGameState.players.map(p => ({ name: p.name }))
    };
    
    wx.redirectTo({
      url: '/pages/team-select/team-select?state=' + 
           encodeURIComponent(JSON.stringify(setupState))
    });
  } else {
    // 三人模式：直接跳转到游戏计分页
    const newGameState = continueGame(currentGameState);
    
    wx.redirectTo({
      url: '/pages/game/game?state=' + 
           encodeURIComponent(JSON.stringify(newGameState))
    });
  }
}
```

### 5.5 云存储函数

```javascript
// cloudfunctions/getPlayers/index.js - 获取历史玩家列表
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  try {
    const players = await db.collection('players')
      .orderBy('lastPlayTime', 'desc')
      .limit(50)
      .get();
    
    return { 
      success: true, 
      players: players.data 
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
```

```javascript
// cloudfunctions/saveGame/index.js - 保存游戏并更新玩家统计
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  const { gameData } = event;
  
  try {
    // 保存游戏记录
    await db.collection('games').add({
      data: gameData
    });
    
    // 更新玩家统计
    for (const player of gameData.players) {
      const playerRecord = await db.collection('players')
        .where({ nickname: player.name })
        .get();
      
      if (playerRecord.data.length > 0) {
        // 更新现有玩家
        await db.collection('players').doc(playerRecord.data[0]._id).update({
          data: {
            totalGames: db.command.inc(1),
            totalWins: player.isWinner ? db.command.inc(1) : 0,
            lastPlayTime: new Date()
          }
        });
      } else {
        // 创建新玩家
        await db.collection('players').add({
          data: {
            nickname: player.name,
            totalGames: 1,
            totalWins: player.isWinner ? 1 : 0,
            winRate: player.isWinner ? 1 : 0,
            lastPlayTime: new Date()
          }
        });
      }
    }
    
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
```

```javascript
// cloudfunctions/getRecentGames/index.js - 获取最近游戏记录
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  const { limit = 3 } = event;
  
  try {
    const games = await db.collection('games')
      .orderBy('createTime', 'desc')
      .limit(limit)
      .get();
    
    return { 
      success: true, 
      games: games.data 
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
```

```javascript
// cloudfunctions/getHistoryGames/index.js - 获取历史游戏列表（分页）
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  const { page = 1, pageSize = 20, mode = 'all', timeRange = 'all' } = event;
  
  try {
    let query = db.collection('games');
    
    // 模式筛选
    if (mode !== 'all') {
      query = query.where({ mode });
    }
    
    // 时间筛选
    if (timeRange !== 'all') {
      const now = new Date();
      let startTime = new Date();
      
      if (timeRange === '7days') {
        startTime.setDate(now.getDate() - 7);
      } else if (timeRange === '30days') {
        startTime.setDate(now.getDate() - 30);
      }
      
      query = query.where({
        createTime: {
          gte: startTime
        }
      });
    }
    
    // 分页查询
    const total = await query.count();
    const games = await query
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .orderBy('createTime', 'desc')
      .get();
    
    return {
      success: true,
      games: games.data,
      total: total.total,
      hasMore: (page * pageSize) < total.total
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
```

---

## 六、开发计划

### 6.1 开发阶段

#### 第一阶段：云开发环境搭建（1 天）
- [ ] 开通微信云开发
- [ ] 创建云数据库集合（games, players）
- [ ] 创建云函数（getPlayers, saveGame, getRecentGames, getHistoryGames）
- [ ] 配置云开发权限

#### 第二阶段：核心页面（3 天）
- [ ] 首页（模式选择）
- [ ] 玩家设置页
- [ ] 组队选择页
- [ ] 游戏计分页
- [ ] 结算页
- [ ] 历史记录页

#### 第三阶段：核心功能（3 天）
- [ ] 计分逻辑
- [ ] 计分输入框
- [ ] 流局按钮
- [ ] 输入验证
- [ ] 组队计分
- [ ] 结束判定
- [ ] 结算算法
- [ ] 继续游戏（保留玩家配置，清空分数）
- [ ] 云存储集成

#### 第四阶段：优化完善（2 天）
- [ ] 撤销功能
- [ ] UI/UX 优化
- [ ] Bug 修复
- [ ] 兼容性测试
- [ ] 云函数测试

### 6.2 总开发周期
**9 天**（约 1 周半）

### 6.3 里程碑
- **第 1 天末**: 云开发环境搭建完成
- **第 4 天末**: 所有页面上线
- **第 7 天末**: 核心功能 + 云存储完成
- **第 9 天末**: 测试完成

---

## 七、页面跳转流程

```
启动
  ↓
首页 (pages/index/index)
  ├─ 选择三人模式
  │     ↓
  │   玩家设置 (pages/setup/setup)
  │     ↓
  │   游戏计分 (pages/game/game)
  │     ↓
  │   结算 (pages/result/result) → 云存储
  │     ├─ 继续游戏 → 游戏计分（保留玩家，清空分数）
  │     └─ 返回首页 → 首页
  │
  └─ 选择四人模式
        ↓
      玩家设置 (pages/setup/setup)
        ↓
      组队选择 (pages/team-select/team-select)
        ↓
      游戏计分 (pages/game/game)
        ↓
      结算 (pages/result/result) → 云存储
        ├─ 继续游戏 → 组队选择（保留玩家，重新组队）
        └─ 返回首页 → 首页
```

---

## 八、项目目录结构

```
paohuzi-scoring-simple/
├── app.js                    # 小程序入口
├── app.json                  # 小程序配置
├── app.wxss                  # 全局样式
├── project.config.json       # 项目配置
├── project.private.config.json # 云开发配置
│
├── cloudfunctions/           # 云函数目录
│   ├── getPlayers/          # 获取历史玩家列表
│   ├── saveGame/            # 保存游戏并更新统计
│   ├── getRecentGames/      # 获取最近游戏记录
│   └── getHistoryGames/     # 获取历史游戏列表（分页）
│
├── pages/                    # 页面目录
│   ├── index/               # 首页
│   ├── setup/               # 玩家设置
│   ├── team-select/         # 组队选择
│   ├── game/                # 游戏计分
│   ├── result/              # 结算页
│   └── history/             # 历史记录
│
├── components/               # 组件目录
│   ├── player-card/         # 玩家卡片
│   ├── score-input/         # 计分输入框
│   └── team-badge/          # 组队标识
│
├── utils/                    # 工具类
│   ├── algorithm.js         # 算法模块
│   └── cloud.js             # 云开发 API 封装
│
└── assets/                   # 资源文件
    └── images/              # 图片资源
```

---

## 九、与原版本对比

| 功能模块 | 原版（v6） | 简化版 | 简化说明 |
|---------|-----------|--------|---------|
| **用户系统** | 微信登录授权 | 简化登录 | 保留 openid，去除昵称头像获取 |
| **房间系统** | 在线房间、WebSocket | 无需房间 | 删除创建/加入房间、分享邀请 |
| **社交功能** | 好友排行榜、分享 | 无 | 完全删除 |
| **数据功能** | 详细统计、连胜追踪 | 基础统计 | 仅保留场次、胜率 |
| **组队功能** | 复杂交互 | 保留核心 | 简化但保留 |
| **页面数量** | 12-13 个 | 6 个 | 减少 50% |
| **组件数量** | 5 个 | 3 个 | 减少 40% |
| **云函数** | 10 个 | 2 个 | 减少 80% |
| **开发周期** | 9 周（63 天） | 9 天 | 减少 86% |
| **技术复杂度** | 高（WebSocket+ 云开发） | 中（云开发） | 大幅降低 |

---

## 十、关键需求清单

### 10.1 必须实现的功能 (Must Have)
- ✅ 模式选择（3 人/4 人）
- ✅ 玩家昵称设置（选择历史玩家或新建）
- ✅ 历史玩家选择器
- ✅ 组队选择（四人模式，选择 2 名队友）
- ✅ 计分输入（>=10 整数）
- ✅ 流局功能（四人模式）
- ✅ 组队计分（50% 向上取整）
- ✅ 游戏结束判定
- ✅ 结算算法（三人×2，四人×3）
- ✅ 零和验证
- ✅ 继续游戏（保留玩家，四人重新组队）
- ✅ 云存储（游戏记录）
- ✅ 历史记录（分页加载）
- ✅ 云函数（getPlayers, saveGame, getRecentGames, getHistoryGames）

### 10.2 可选实现的功能 (Nice to Have)
- ⭕ 撤销功能
- ⭕ 音效/震动
- ⭕ 玩家统计（胜率等）

### 10.3 不需要实现的功能 (Won't Have)
- ❌ 复杂用户系统
- ❌ 在线房间对战
- ❌ WebSocket 实时同步
- ❌ 好友排行榜
- ❌ 分享功能
- ❌ 详细个人统计
- ❌ 连胜追踪

---

## 十一、技术优势

### 11.1 开发优势
- **简化后端**: 仅 2 个云函数
- **无需 WebSocket**: 节省实时通信开发
- **简化登录**: 无需复杂用户系统
- **页面精简**: 从 13 个减少到 6 个

### 11.2 维护优势
- **低服务器成本**: 仅需基础云开发套餐
- **低运维成本**: 无需监控复杂服务
- **快速迭代**: 修改功能快速

### 11.3 用户体验优势
- **打开即用**: 简化登录流程
- **数据共享**: 朋友间云端可见
- **历史可查**: 战绩永久保存
- **操作简单**: 专注核心计分

---

## 十二、测试计划

### 12.1 功能测试
- [ ] 模式选择
- [ ] 玩家设置
- [ ] 组队选择
- [ ] 计分操作
- [ ] 流局功能
- [ ] 结束判定
- [ ] 结算算法
- [ ] 继续下一局
- [ ] 云存储
- [ ] 历史记录

### 12.2 兼容性测试
- [ ] iOS 微信
- [ ] Android 微信
- [ ] 不同屏幕尺寸

---

**文档结束**

---

## 简化总结

### 核心变更：
1. **删除在线房间系统** → 改为本地创建，数据上云
2. **简化用户系统** → 保留 openid，去除复杂授权
3. **删除社交功能** → 无排行榜、无分享
4. **保留云开发** → 2 个云函数，2 张数据库表
5. **页面从 13 个减少到 6 个**
6. **云函数从 10 个减少到 2 个**
7. **开发周期从 63 天减少到 9 天**

### 保留的核心功能：
- ✅ 三人/四人模式
- ✅ 房主选队友
- ✅ 流局计分
- ✅ 组队计分（50% 比例）
- ✅ 结算算法（零和验证）
- ✅ 继续下一局
- ✅ 云存储（游戏记录）
- ✅ 历史记录

### 技术栈：
- **前端**: 微信小程序原生
- **后端**: 微信云开发（2 个云函数）
- **数据库**: 云数据库（2 张表）
- **无需**: WebSocket、复杂用户系统

这样的简化版本**保留了云端数据共享**，同时**大幅降低开发复杂度**，适合固定小圈子使用！
