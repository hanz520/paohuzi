// pages/index/index.js
const cloud = require('../../utils/cloud');

Page({
  data: {
    recentGames: []
  },

  onLoad: function () {
    // 加载最近游戏记录
    this.loadRecentGames();
  },

  onShow: function () {
    // 每次显示时刷新最近游戏记录
    this.loadRecentGames();
  },

  /**
   * 选择游戏模式
   */
  onSelectMode: function (e) {
    const mode = e.currentTarget.dataset.mode;
    
    // 跳转到玩家设置页
    wx.navigateTo({
      url: `/pages/setup/setup?mode=${mode}`
    });
  },

  /**
   * 加载最近游戏记录
   */
  loadRecentGames: function () {
    const that = this;
    
    // 从云数据库获取最近 3 条游戏记录
    wx.cloud.callFunction({
      name: 'getRecentGames',
      data: {
        limit: 3
      },
      success: function (res) {
        if (res.result && res.result.success) {
          const games = res.result.games.map(game => ({
            id: game._id,
            mode: game.mode,
            winner: game.winner,
            time: that.formatTime(game.createTime)
          }));
          
          that.setData({
            recentGames: games
          });
        }
      },
      fail: function (err) {
        console.log('加载最近游戏记录失败', err);
        // 如果云函数调用失败，使用本地缓存
        that.loadFromLocal();
      }
    });
  },

  /**
   * 从本地缓存加载
   */
  loadFromLocal: function () {
    const recentGames = wx.getStorageSync('recentGames') || [];
    const games = recentGames.map(game => ({
      id: game.id,
      mode: game.mode,
      winner: game.winner,
      time: this.formatTime(game.createTime)
    }));
    
    this.setData({
      recentGames: games
    });
  },

  /**
   * 格式化时间
   */
  formatTime: function (date) {
    if (!date) return '';
    
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    
    // 1 分钟内
    if (diff < 60000) {
      return '刚刚';
    }
    
    // 1 小时内
    if (diff < 3600000) {
      return Math.floor(diff / 60000) + '分钟前';
    }
    
    // 24 小时内
    if (diff < 86400000) {
      return Math.floor(diff / 3600000) + '小时前';
    }
    
    // 格式化日期
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hour = d.getHours().toString().padStart(2, '0');
    const minute = d.getMinutes().toString().padStart(2, '0');
    
    return `${month}/${day} ${hour}:${minute}`;
  },

  /**
   * 跳转到历史记录页
   */
  goToHistory: function () {
    wx.navigateTo({
      url: '/pages/history/history'
    });
  },

  /**
   * 查看游戏详情
   */
  viewGameDetail: function (e) {
    const gameId = e.currentTarget.dataset.id;
    
    wx.navigateTo({
      url: `/pages/history/history?detail=${gameId}`
    });
  }
});
