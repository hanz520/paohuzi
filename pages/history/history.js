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
      const res = await cloud.getHistoryGames({
        page: this.data.page,
        pageSize: this.data.pageSize,
        mode: this.data.filterMode,
        timeRange: this.data.filterTime
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
   * 格式化时间
   */
  formatTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${month}/${day} ${hour}:${minute}`;
  },

  /**
   * 格式化时长
   */
  formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}分${secs.toString().padStart(2, '0')}秒`;
  },

  /**
   * 游戏卡片点击
   */
  onGameTap(e) {
    const gameId = e.currentTarget.dataset.id;
    // TODO: 跳转到详情页
    wx.showToast({
      title: '详情页开发中',
      icon: 'none'
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
