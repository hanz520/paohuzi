// utils/algorithm.js - 核心算法模块

/**
 * 结算算法
 * @param {Array} players - 玩家数组（包含 rawScore）
 * @param {String} mode - 游戏模式 ('3 人'/'4 人')
 * @returns {Object} 结算结果
 */
function calculateSettlement(players, mode) {
  const N = players.length; // 3 或 4
  const multiplier = N - 1; // 三人：2, 四人：3
  
  // Step 1: 计算转换分数（原始分÷10，向上取整）
  const convertedScores = players.map(p => ({
    ...p,
    converted: Math.ceil(p.rawScore / 10)
  }));
  
  // Step 2: 计算最终得分
  const finalScores = convertedScores.map((player, index) => {
    const otherPlayers = convertedScores.filter((_, i) => i !== index);
    const otherSum = otherPlayers.reduce((sum, p) => sum + p.converted, 0);
    const finalScore = player.converted * multiplier - otherSum;
    
    return { 
      ...player, 
      finalScore,
      convertedScore: player.converted
    };
  });
  
  // Step 3: 零和验证
  const totalScore = finalScores.reduce((sum, p) => sum + p.finalScore, 0);
  const isZeroSum = totalScore === 0;
  
  // Step 4: 排序并确定排名
  const sortedPlayers = finalScores.sort((a, b) => b.finalScore - a.finalScore);
  sortedPlayers.forEach((player, index) => {
    player.rank = index + 1;
    player.isWinner = index === 0;
  });
  
  // Step 5: 确定获胜者和 MVP
  const winner = sortedPlayers[0];
  
  return {
    players: sortedPlayers,
    winner: winner.name,
    mvp: winner.name,
    totalScore,
    isZeroSum,
    multiplier,
    details: sortedPlayers.map(p => ({
      name: p.name,
      rawScore: p.rawScore,
      convertedScore: p.convertedScore,
      finalScore: p.finalScore,
      rank: p.rank,
      isWinner: p.isWinner
    }))
  };
}

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

/**
 * 流局计分处理（四人模式）
 * @param {Number} playerIndex - 点击流局的玩家索引
 * @param {Array} teams - 组队信息 [[0,2], [1,3]]
 * @returns {Object} 分数变更
 */
function handleLiuJu(playerIndex, teams) {
  const team = teams.find(t => t.includes(playerIndex));
  const teammateIndex = team.find(i => i !== playerIndex);
  
  // 找到另一队
  const otherTeam = teams.find(t => !t.includes(playerIndex));
  
  // 流局规则：
  // - 流局的玩家：-10 分
  // - 流局玩家的队友：+10 分（因为对方流局）
  // - 另一队的两名玩家：0 分（不受影响）
  
  return {
    [playerIndex]: -10,
    [teammateIndex]: +10,
    [otherTeam[0]]: 0,
    [otherTeam[1]]: 0
  };
}

/**
 * 游戏结束判定
 * @param {Array} players - 玩家数组
 * @param {Number} currentScorerId - 当前得分玩家索引
 * @returns {Object} 是否应该结束
 */
function checkGameEnd(players, currentScorerId) {
  // 找出所有超过 100 分的玩家
  const playersOver100 = players
    .map((p, index) => ({ ...p, index }))
    .filter(p => p.rawScore >= 100);
  
  // 如果没有玩家达到 100 分，不结束
  if (playersOver100.length === 0) {
    return { shouldEnd: false };
  }
  
  // 获取达到 100 分的玩家索引列表
  const over100Indices = playersOver100.map(p => p.index);
  
  // 检查当前得分玩家是否是达到 100 分的玩家之一
  const isCurrentScorerOver100 = over100Indices.includes(currentScorerId);
  
  // 逻辑：
  // 1. 如果当前得分玩家已经达到 100 分，可以继续累加，不触发结算
  // 2. 如果当前得分玩家没有达到 100 分，但已经有其他玩家达到 100 分了，触发结算
  //    （意味着达到 100 分的玩家没有继续得分，而其他玩家赢了一局）
  if (isCurrentScorerOver100) {
    // 达到 100 分的玩家继续得分，不结束
    return { shouldEnd: false };
  } else {
    // 没有达到 100 分的玩家得分了，而有人已经达到 100 分，结束游戏
    return { shouldEnd: true, reason: 'auto' };
  }
}

/**
 * 继续游戏 - 保留玩家名字，清空分数
 * @param {Object} currentState - 当前游戏状态
 * @returns {Object} 新游戏状态
 */
function continueGame(currentState) {
  return {
    mode: currentState.mode,
    players: currentState.players.map(p => ({
      name: p.name,
      rawScore: 0
    })),
    teams: null, // 清空组队配置（四人模式需重新选择）
    scoreRecords: [],
    startTime: new Date()
  };
}

module.exports = {
  calculateSettlement,
  TeamSelector,
  handleLiuJu,
  checkGameEnd,
  continueGame
};
