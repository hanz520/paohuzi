// pages/game/game.js
const { calculateSettlement, handleLiuJu, checkGameEnd } = require('../../utils/algorithm');
const cloud = require('../../utils/cloud');

Page({
  data: {
    mode: '3 人',
    players: [], // [{ name: '', rawScore: 0 }]
    teams: [], // [[0, 2], [1, 3]]
    scoreRecords: [], // 计分记录
    scoreRows: [], // 表格行数据 [{id: 1, scores: [10, 0, 20]}]
    scrollToView: '', // 滚动到指定行
    timerSeconds: 0,
    timer: null,
    
    // 计分弹窗
    showScoreInput: false,
    currentPlayerIndex: -1,
    currentPlayerName: '',
    inputScore: '',
    canConfirmScore: false,
    
    // 结束确认弹窗
    showEndConfirm: false,
    
    // 撤销功能
    canUndo: false
  },

  onLoad: function (options) {
    let gameState;
    
    if (options.state) {
      // 从组队选择页跳转而来
      gameState = JSON.parse(decodeURIComponent(options.state));
    } else if (options.players) {
      // 从玩家设置页直接跳转（三人模式）
      const players = JSON.parse(decodeURIComponent(options.players));
      gameState = {
        mode: '3 人',
        players: players.map(name => ({ name, rawScore: 0 })),
        teams: [],
        scoreRecords: [],
        startTime: new Date()
      };
    }
    
    if (gameState) {
      this.setData({
        mode: gameState.mode,
        players: gameState.players,
        teams: gameState.teams || [],
        scoreRecords: gameState.scoreRecords || [],
        scoreRows: this.buildScoreRows(gameState.scoreRecords || []),
        canUndo: (gameState.scoreRecords || []).length > 0
      });
    }
    
    // 启动计时器
    this.startTimer();
  },

  onUnload: function () {
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
  },

  /**
   * 启动计时器
   */
  startTimer() {
    const timer = setInterval(() => {
      this.setData({
        timerSeconds: this.data.timerSeconds + 1
      });
    }, 1000);
    
    this.setData({ timer });
  },

  /**
   * 获取玩家名字首字母
   */
  getPlayerInitial(name) {
    if (!name) return '';
    return name.charAt(0).toUpperCase();
  },

  /**
   * 获取队伍索引（四人模式）
   */
  getTeamIndex(playerIndex) {
    if (!this.data.teams || this.data.teams.length === 0) return -1;
    
    for (let i = 0; i < this.data.teams.length; i++) {
      if (this.data.teams[i].includes(playerIndex)) {
        return i;
      }
    }
    return -1;
  },

  /**
   * 构建表格行数据
   */
  buildScoreRows(scoreRecords) {
    return scoreRecords.map((record, index) => ({
      id: index + 1,
      scores: this.data.players.map((_, playerIdx) => {
        if (playerIdx === record.playerId) {
          return record.score;
        }
        // 流局模式需要计算其他玩家的分数
        if (record.type === 'liuju' && this.data.teams.length > 0) {
          const scoreChanges = this.calculateLiuJuScores(record.playerId, this.data.teams);
          return scoreChanges[playerIdx] || 0;
        }
        return 0;
      })
    }));
  },

  /**
   * 计算流局分数
   */
  calculateLiuJuScores(playerId, teams) {
    const scoreChanges = {};
    const playerIdNum = parseInt(playerId);
    
    // 找到流局玩家所在的队伍
    const team = teams.find(t => t.includes(playerIdNum));
    const teammateId = team.find(i => i !== playerIdNum);
    
    // 找到另一队
    const otherTeam = teams.find(t => !t.includes(playerIdNum));
    
    // 流局规则：
    // - 流局的玩家：-10 分
    // - 流局玩家的队友：+10 分（因为对方流局）
    // - 另一队的两名玩家：0 分（不受影响）
    
    scoreChanges[playerIdNum] = -10;
    scoreChanges[teammateId] = +10;
    scoreChanges[otherTeam[0]] = 0;
    scoreChanges[otherTeam[1]] = 0;
    
    return scoreChanges;
  },

  /**
   * 玩家表头点击
   */
  onPlayerHeaderTap(e) {
    const index = e.currentTarget.dataset.index;
    const player = this.data.players[index];
    
    this.setData({
      currentPlayerIndex: index,
      currentPlayerName: player.name,
      inputScore: '',
      canConfirmScore: false,
      showScoreInput: true
    });
  },

  /**
   * 分数输入
   */
  onScoreInput(e) {
    const value = e.detail.value;
    const score = parseInt(value);
    
    this.setData({
      inputScore: value,
      canConfirmScore: !isNaN(score) && score >= 10
    });
  },

  /**
   * 确认加分
   */
  onConfirmScore() {
    if (!this.data.canConfirmScore) return;
    
    const score = parseInt(this.data.inputScore);
    const index = this.data.currentPlayerIndex;
    
    // 更新分数
    const players = [...this.data.players];
    players[index].rawScore += score;
    
    // 添加计分记录
    const scoreRecords = [...this.data.scoreRecords, {
      playerId: index,
      score: score,
      type: 'normal',
      timestamp: new Date()
    }];
    
    // 构建新的表格行
    const newRow = {
      id: scoreRecords.length,
      scores: this.data.players.map((_, idx) => idx === index ? score : 0)
    };
    const scoreRows = [...this.data.scoreRows, newRow];
    
    this.setData({
      players,
      scoreRecords,
      scoreRows,
      scrollToView: 'row-' + newRow.id,
      canUndo: true,
      showScoreInput: false
    });
    
    // 检查游戏结束
    this.checkGameEnd(index);
  },

  /**
   * 流局（四人模式）
   */
  onLiuJu() {
    const index = this.data.currentPlayerIndex;
    const teams = this.data.teams;
    
    // 计算流局分数
    const scoreChanges = this.calculateLiuJuScores(index, teams);
    
    // 更新分数
    const players = [...this.data.players];
    for (const [playerIdx, change] of Object.entries(scoreChanges)) {
      players[playerIdx].rawScore += change;
    }
    
    // 添加计分记录
    const scoreRecords = [...this.data.scoreRecords, {
      playerId: index,
      score: -10,
      type: 'liuju',
      timestamp: new Date()
    }];
    
    // 构建新的表格行
    const newRow = {
      id: scoreRecords.length,
      scores: this.data.players.map((_, idx) => scoreChanges[idx] || 0)
    };
    const scoreRows = [...this.data.scoreRows, newRow];
    
    this.setData({
      players,
      scoreRecords,
      scoreRows,
      scrollToView: 'row-' + newRow.id,
      canUndo: true,
      showScoreInput: false
    });
    
    // 检查游戏结束
    this.checkGameEnd(index);
  },

  /**
   * 检查游戏结束
   */
  checkGameEnd(currentScorerId) {
    const result = checkGameEnd(this.data.players, currentScorerId);
    
    if (result.shouldEnd) {
      // 显示结算确认弹窗，带分数预览
      this.showSettlementConfirm();
    }
  },

  /**
   * 显示结算确认弹窗（带分数预览）
   */
  showSettlementConfirm() {
    const players = this.data.players;
    const content = players.map(p => 
      `${p.name}: ${p.rawScore}分`
    ).join('\n');
    
    wx.showModal({
      title: '游戏结束',
      content: `当前分数：\n${content}\n\n是否进入结算？`,
      confirmText: '确认结算',
      cancelText: '再想想',
      success: (res) => {
        if (res.confirm) {
          this.onConfirmEnd();
        }
      }
    });
  },

  /**
   * 撤销
   */
  onUndo() {
    if (this.data.scoreRecords.length === 0) return;
    
    const scoreRecords = [...this.data.scoreRecords];
    const lastRecord = scoreRecords.pop();
    
    // 撤销分数
    const players = [...this.data.players];
    if (lastRecord.type === 'normal') {
      players[lastRecord.playerId].rawScore -= lastRecord.score;
    } else if (lastRecord.type === 'liuju') {
      // 流局撤销需要重新计算
      const scoreChanges = this.calculateLiuJuScores(lastRecord.playerId, this.data.teams);
      for (const [playerIdx, change] of Object.entries(scoreChanges)) {
        players[playerIdx].rawScore -= change;
      }
    }
    
    // 重新构建表格行
    const scoreRows = this.buildScoreRows(scoreRecords);
    
    this.setData({
      players,
      scoreRecords,
      scoreRows,
      canUndo: scoreRecords.length > 0
    });
    
    wx.showToast({
      title: '已撤销',
      icon: 'success'
    });
  },

  /**
   * 关闭计分弹窗
   */
  closeScoreInput() {
    this.setData({
      showScoreInput: false,
      currentPlayerIndex: -1,
      inputScore: ''
    });
  },

  /**
   * 结束游戏（手动点击）
   */
  onEndGame() {
    // 手动结束也显示分数预览确认
    this.showSettlementConfirm();
  },

  /**
   * 确认结束游戏
   */
  async onConfirmEnd() {
    wx.showLoading({
      title: '保存中...',
      mask: true
    });
    
    try {
      // 计算结算结果
      const settlement = calculateSettlement(this.data.players, this.data.mode);
      
      // 构建游戏数据
      const gameData = {
        mode: this.data.mode,
        players: settlement.details,
        teams: this.data.teams,
        winner: settlement.winner,
        mvp: settlement.mvp,
        duration: this.data.timerSeconds,
        createTime: new Date(),
        settlement: {
          algorithm: this.data.mode === '3 人' 
            ? '转换分×2 - 其他玩家转换分之和' 
            : '转换分×3 - 其他玩家转换分之和',
          totalZero: settlement.isZeroSum,
          details: settlement
        }
      };
      
      console.log('准备保存游戏数据:', gameData);
      
      // 保存到云端
      const saveResult = await cloud.saveGame(gameData);
      
      console.log('云函数保存结果:', saveResult);
      
      wx.hideLoading();
      
      // 跳转到结算页
      const resultData = {
        ...settlement,
        mode: this.data.mode,
        duration: this.data.timerSeconds,
        saved: true,
        saveTime: new Date()
      };
      
      wx.navigateTo({
        url: `/pages/result/result?data=${encodeURIComponent(JSON.stringify(resultData))}`
      });
    } catch (err) {
      wx.hideLoading();
      console.error('保存游戏失败', err);
      
      wx.showModal({
        title: '保存失败',
        content: '无法连接到云端，是否继续结算？',
        confirmText: '继续',
        success: (res) => {
          if (res.confirm) {
            // 本地结算
            const settlement = calculateSettlement(this.data.players, this.data.mode);
            const resultData = {
              ...settlement,
              mode: this.data.mode,
              duration: this.data.timerSeconds,
              saved: false
            };
            
            wx.navigateTo({
              url: `/pages/result/result?data=${encodeURIComponent(JSON.stringify(resultData))}`
            });
          }
        }
      });
    }
  },

  /**
   * 弹窗遮罩点击
   */
  onModalMaskTap() {
    this.closeScoreInput();
  },

  /**
   * 停止事件冒泡
   */
  stopPropagation() {
    // 阻止点击内容区域时关闭弹窗
  }
});
