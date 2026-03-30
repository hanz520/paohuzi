// pages/team-select/team-select.js
const { TeamSelector } = require('../../utils/algorithm');

Page({
  data: {
    players: [], // 玩家名字数组
    selectedIndices: [], // 已选中的玩家索引
    canConfirm: false
  },

  onLoad: function (options) {
    const players = JSON.parse(decodeURIComponent(options.players || '[]'));
    
    this.setData({ 
      players,
      teamSelector: new TeamSelector(players),
      isSelectedMap: players.map(() => false) // 初始化选中状态映射
    });
  },

  /**
   * 玩家点击
   */
  onPlayerTap(e) {
    const index = e.currentTarget.dataset.index;
    const teamSelector = this.data.teamSelector;
    
    // 切换选中状态
    teamSelector.togglePlayer(index);
    
    // 更新选中状态
    const selectedIndices = teamSelector.selectedIndices;
    const canConfirm = teamSelector.canConfirm();
    
    // 构建选中状态映射，方便 WXML 直接使用
    const isSelectedMap = this.data.players.map((_, idx) => selectedIndices.includes(idx));
    
    this.setData({
      selectedIndices,
      canConfirm,
      isSelectedMap
    });
  },

  /**
   * 判断是否选中
   */
  isSelected(index) {
    return this.data.isSelectedMap ? this.data.isSelectedMap[index] : false;
  },

  /**
   * 获取选中数量
   */
  getSelectedCount() {
    return this.data.selectedIndices.length;
  },

  /**
   * 获取玩家名字首字母
   */
  getPlayerInitial(name) {
    if (!name) return '';
    return name.charAt(0).toUpperCase();
  },

  /**
   * 确认组队
   */
  onConfirm() {
    if (!this.data.canConfirm) return;
    
    const teamSelector = this.data.teamSelector;
    const teamAssignment = teamSelector.confirmTeam();
    
    // 构建游戏状态
    const gameState = {
      mode: '4 人',
      players: this.data.players.map((name, index) => ({
        name,
        rawScore: 0
      })),
      teams: teamAssignment.teams,
      scoreRecords: [],
      startTime: new Date()
    };
    
    // 跳转到游戏计分页
    wx.navigateTo({
      url: `/pages/game/game?state=${encodeURIComponent(JSON.stringify(gameState))}`
    });
  }
});
