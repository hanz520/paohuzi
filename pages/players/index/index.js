// pages/players/index/index.js
const cloud = require('../../../utils/cloud');

Page({
  data: {
    players: [],
    page: 1,
    pageSize: 20,
    sortBy: 'games', // games | winrate | score
    sortOrder: 'desc', // asc | desc
    hasMore: true,
    loading: false
  },

  onLoad: function () {
    this.loadPlayers();
  },

  onShow: function () {
    // 刷新数据
    this.setData({
      page: 1,
      players: [],
      hasMore: true
    }, () => {
      this.loadPlayers();
    });
  },

  /**
   * 加载玩家列表
   */
  async loadPlayers() {
    if (this.data.loading || (!this.data.hasMore && this.data.page > 1)) return;

    this.setData({ loading: true });

    try {
      const res = await wx.cloud.callFunction({
        name: 'getPlayers',
        data: {
          page: this.data.page,
          pageSize: this.data.pageSize,
          sortBy: this.data.sortBy,
          sortOrder: this.data.sortOrder
        }
      });

      if (res.result && res.result.success) {
        const newPlayers = res.result.players;
        const hasMore = res.result.hasMore;

        this.setData({
          players: this.data.page === 1 ? newPlayers : [...this.data.players, ...newPlayers],
          hasMore,
          page: this.data.page + 1,
          loading: false
        });
      } else {
        this.setData({ loading: false });
      }
    } catch (err) {
      console.error('加载玩家列表失败', err);
      this.setData({ loading: false });
    }
  },

  /**
   * 加载更多
   */
  loadMore() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadPlayers();
    }
  },

  /**
   * 排序
   */
  onSort(e) {
    const sort = e.currentTarget.dataset.sort;
    
    if (this.data.sortBy === sort) {
      // 切换排序顺序
      this.setData({
        sortOrder: this.data.sortOrder === 'desc' ? 'asc' : 'desc'
      });
    } else {
      // 切换排序字段
      this.setData({
        sortBy: sort,
        sortOrder: 'desc'
      });
    }

    // 重新加载数据
    this.setData({
      page: 1,
      players: [],
      hasMore: true
    }, () => {
      this.loadPlayers();
    });
  },

  /**
   * 点击玩家
   */
  onPlayerTap(e) {
    const playerId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/players/detail/detail?id=${playerId}`
    });
  }
});
