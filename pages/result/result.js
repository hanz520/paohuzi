// pages/result/result.js
const cloud = require('../../utils/cloud');

Page({
  data: {
    mode: '3 人',
    players: [],
    winner: '',
    mvp: '',
    duration: 0,
    totalScore: 0,
    isZeroSum: true,
    saved: false,
    showFormula: false,
    // 新增：游戏记录 ID 和来源
    gameId: '',
    from: 'home',
    // 新增：游戏详细过程
    scoreRows: [],
    // 新增：转换分和最终分数
    hasConvertedScores: false,
    // 新增：游戏过程展开状态
    showProcess: false
  },

  onLoad: function (options) {
    // 判断是从哪里进入的
    if (options.gameId && options.from) {
      // 从历史记录或首页进入，加载云端数据
      this.setData({
        gameId: options.gameId,
        from: options.from
      });
      this.loadGameFromCloud(options.gameId);
    } else {
      // 从游戏结束进入，使用传入的数据
      const data = JSON.parse(decodeURIComponent(options.data || '{}'));
      
      this.setData({
        mode: data.mode,
        players: data.players,
        winner: data.winner,
        mvp: data.mvp,
        duration: data.duration,
        totalScore: data.totalScore,
        isZeroSum: data.isZeroSum,
        saved: data.saved || false,
        scoreRows: data.scoreRows || []
      });
    }
  },

  /**
   * 从云端加载游戏记录
   */
  async loadGameFromCloud(gameId) {
    wx.showLoading({ title: '加载中...' });
    
    try {
      // 调用云函数获取游戏详情
      const res = await wx.cloud.callFunction({
        name: 'getHistoryGames',
        data: {
          page: 1,
          pageSize: 1,
          mode: 'all',
          timeRange: 'all'
        }
      });
      
      if (res.result && res.result.success) {
        const game = res.result.games.find(g => g._id === gameId);
        
        if (game) {
          // 处理数据格式
          const players = game.players.map(p => ({
            ...p,
            rank: this.getRankName(p.isWinner)
          }));
          
          this.setData({
            mode: game.mode,
            players: players,
            winner: game.winner,
            duration: game.duration || 0,
            scoreRows: game.scoreRows || [],
            hasConvertedScores: true
          });
          
          // 计算总分和零和验证
          this.calculateTotalScore();
        } else {
          wx.showToast({
            title: '未找到游戏记录',
            icon: 'none'
          });
        }
      }
    } catch (err) {
      console.error('加载游戏详情失败', err);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  /**
   * 获取排名名称
   */
  getRankName(isWinner) {
    return isWinner ? '🏆 获胜' : '';
  },

  /**
   * 计算总分和零和验证
   */
  calculateTotalScore() {
    const totalScore = this.data.players.reduce((sum, p) => sum + (p.finalScore || 0), 0);
    this.setData({
      totalScore: totalScore,
      isZeroSum: Math.abs(totalScore) < 0.01
    });
  },

  /**
   * 格式化时间
   */
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  /**
   * 获取获胜者名字首字母
   */
  getWinnerInitial() {
    const winner = this.data.winner;
    if (!winner) return '';
    return winner.charAt(0).toUpperCase();
  },

  /**
   * 获取获胜者分数
   */
  getWinnerScore() {
    const winner = this.data.players.find(p => p.isWinner);
    return winner ? `+${winner.finalScore}` : '';
  },

  /**
   * 切换公式显示
   */
  toggleFormula() {
    this.setData({
      showFormula: !this.data.showFormula
    });
  },

  /**
   * 切换游戏过程显示
   */
  toggleProcess() {
    this.setData({
      showProcess: !this.data.showProcess
    });
  },

  /**
   * 删除游戏记录
   */
  onDeleteGame() {
    wx.showModal({
      title: '删除确认',
      editable: true,  // 启用输入框
      placeholderText: '请输入删除密码',
      confirmText: '删除',
      confirmColor: '#f5222d',
      success: (res) => {
        if (res.confirm) {
          const password = res.content || '';
          if (password === 'a123456!') {
            this.deleteGameRecord();
          } else {
            wx.showToast({
              title: '密码错误',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  /**
   * 删除游戏记录（调用云函数）
   */
  async deleteGameRecord() {
    if (!this.data.gameId) {
      wx.showToast({
        title: '无法删除',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '删除中...' });

    try {
      const res = await wx.cloud.callFunction({
        name: 'deleteGame',
        data: {
          gameId: this.data.gameId
        }
      });

      if (res.result && res.result.success) {
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        });

        // 延迟跳转到历史记录页
        setTimeout(() => {
          if (this.data.from === 'history') {
            // 从历史页来的，返回历史页
            wx.navigateBack({ delta: 1 });
          } else {
            // 从首页来的，返回首页
            wx.navigateBack({ delta: 2 });
          }
        }, 1500);
      } else {
        wx.showToast({
          title: '删除失败',
          icon: 'none'
        });
      }
    } catch (err) {
      console.error('删除游戏记录失败', err);
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  /**
   * 继续游戏
   */
  onContinueGame() {
    const { mode, players } = this.data;
    
    if (mode === '3 人') {
      // 三人模式：直接跳转到游戏计分页
      const playerNames = players.map(p => p.name);
      wx.navigateTo({
        url: `/pages/game/game?mode=3&players=${encodeURIComponent(JSON.stringify(playerNames))}`
      });
    } else {
      // 四人模式：跳转到组队选择页重新组队
      const playerNames = players.map(p => p.name);
      wx.navigateTo({
        url: `/pages/team-select/team-select?players=${encodeURIComponent(JSON.stringify(playerNames))}`
      });
    }
  },

  /**
   * 返回首页
   */
  onGoHome() {
    if (this.data.from === 'history' || this.data.from === 'home') {
      // 从历史记录或首页来的，返回 2 级
      wx.navigateBack({ delta: 2 });
    } else {
      // 从游戏结束来的，返回 4 级到首页
      wx.navigateBack({ delta: 4 });
    }
  }
});
