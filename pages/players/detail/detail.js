// pages/players/detail/detail.js
const cloud = require('../../../utils/cloud');

Page({
  data: {
    player: {},
    games: [],
    page: 1,
    pageSize: 20,
    hasMore: true,
    loading: false
  },

  onLoad: function (options) {
    if (options.id) {
      this.setData({ playerId: options.id });
      this.loadPlayerDetail();
      this.loadPlayerGames();
    }
  },

  /**
   * 加载玩家详情
   */
  async loadPlayerDetail() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getPlayerDetail',
        data: {
          playerId: this.data.playerId
        }
      });

      if (res.result && res.result.success) {
        this.setData({
          player: res.result.player
        });
      }
    } catch (err) {
      console.error('加载玩家详情失败', err);
    }
  },

  /**
   * 加载玩家游戏记录
   */
  async loadPlayerGames() {
    if (this.data.loading || (!this.data.hasMore && this.data.page > 1)) return;

    this.setData({ loading: true });

    try {
      const res = await wx.cloud.callFunction({
        name: 'getPlayerGames',
        data: {
          playerId: this.data.playerId,
          page: this.data.page,
          pageSize: this.data.pageSize
        }
      });

      if (res.result && res.result.success) {
        const newGames = res.result.games;
        const hasMore = res.result.hasMore;

        this.setData({
          games: this.data.page === 1 ? newGames : [...this.data.games, ...newGames],
          hasMore,
          page: this.data.page + 1,
          loading: false
        });
      } else {
        this.setData({ loading: false });
      }
    } catch (err) {
      console.error('加载玩家游戏记录失败', err);
      this.setData({ loading: false });
    }
  },

  /**
   * 加载更多
   */
  loadMore() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadPlayerGames();
    }
  },

  /**
   * 获取名字首字母
   */
  getInitial(name) {
    if (!name) return '';
    return name.charAt(0).toUpperCase();
  },

  /**
   * 点击游戏记录
   */
  onGameTap(e) {
    const gameId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/result/result?gameId=${gameId}&from=history`
    });
  }
});
