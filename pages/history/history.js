// pages/history/history.js
const cloud = require('../../utils/cloud');

Page({
  data: {
    games: [],
    page: 1,
    pageSize: 20,
    filterMode: 'all',
    filterTime: 'all',
    hasMore: true,
    loading: false
  },

  onLoad: function () {
    this.loadGames();
  },

  onShow: function () {
    // 刷新数据
    this.setData({
      page: 1,
      games: [],
      hasMore: true
    }, () => {
      this.loadGames();
    });
  },

  /**
   * 加载游戏记录
   */
  async loadGames() {
    if (this.data.loading || (!this.data.hasMore && this.data.page > 1)) return;

    this.setData({ loading: true });

    try {
      console.log('加载游戏记录，参数:', {
        page: this.data.page,
        pageSize: this.data.pageSize,
        mode: this.data.filterMode,
        timeRange: this.data.filterTime
      });

      const res = await cloud.getHistoryGames({
        page: this.data.page,
        pageSize: this.data.pageSize,
        mode: this.data.filterMode,
        timeRange: this.data.filterTime
      });

      console.log('云函数返回:', res);

      if (res.result && res.result.success) {
        const newGames = res.result.games;
        const hasMore = res.result.hasMore;

        console.log('获取到游戏数量:', newGames.length);

        this.setData({
          games: this.data.page === 1 ? newGames : [...this.data.games, ...newGames],
          hasMore,
          page: this.data.page + 1,
          loading: false
        });
      } else {
        console.error('云函数返回失败:', res);
        this.setData({ loading: false });
      }
    } catch (err) {
      console.error('加载游戏记录失败', err);
      this.setData({ loading: false });
    }
  },

  /**
   * 加载更多
   */
  loadMore() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadGames();
    }
  },

  /**
   * 筛选模式
   */
  onFilterMode(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({
      filterMode: mode,
      page: 1,
      games: [],
      hasMore: true
    }, () => {
      this.loadGames();
    });
  },

  /**
   * 筛选时间
   */
  onFilterTime(e) {
    const time = e.currentTarget.dataset.time;
    this.setData({
      filterTime: time,
      page: 1,
      games: [],
      hasMore: true
    }, () => {
      this.loadGames();
    });
  },

  /**
   * 游戏卡片点击
   */
  onGameTap(e) {
    const gameId = e.currentTarget.dataset.id;
    // 跳转到详情页
    wx.navigateTo({
      url: `/pages/result/result?gameId=${gameId}&from=history`
    });
  },

  /**
   * 开始游戏
   */
  onStartGame() {
    wx.navigateBack({
      delta: 1
    });
  }
});
