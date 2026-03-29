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
    showFormula: false
  },

  onLoad: function (options) {
    const data = JSON.parse(decodeURIComponent(options.data || '{}'));
    
    this.setData({
      mode: data.mode,
      players: data.players,
      winner: data.winner,
      mvp: data.mvp,
      duration: data.duration,
      totalScore: data.totalScore,
      isZeroSum: data.isZeroSum,
      saved: data.saved || false
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
    wx.navigateBack({
      delta: 4 // 返回 4 级页面到首页
    });
  }
});
