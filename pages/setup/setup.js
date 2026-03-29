// pages/setup/setup.js
const cloud = require('../../utils/cloud');

Page({
  data: {
    mode: '3', // '3' 或 '4'
    playerCount: 3,
    players: [], // [{ name: '', selected: false }]
    showPlayerSelector: false,
    currentPlayerIndex: -1, // 当前正在选择的玩家索引
    allPlayers: [], // 所有历史玩家
    filteredPlayers: [], // 筛选后的玩家
    searchText: '',
    
    // 新建玩家相关
    newPlayerName: '',
    canAddNewPlayer: false,
    showDuplicateHint: false
  },

  onLoad: function (options) {
    const mode = options.mode || '3';
    const playerCount = mode === '3' ? 3 : 4;
    
    // 初始化玩家数组
    const players = [];
    for (let i = 0; i < playerCount; i++) {
      players.push({
        index: i,
        name: '',
        selected: false
      });
    }
    
    this.setData({
      mode,
      playerCount,
      players
    });
    
    // 加载历史玩家
    this.loadHistoryPlayers();
  },

  /**
   * 加载历史玩家
   */
  async loadHistoryPlayers() {
    try {
      const res = await cloud.getPlayers();
      if (res.result && res.result.success) {
        this.setData({
          allPlayers: res.result.players,
          filteredPlayers: res.result.players
        });
      }
    } catch (err) {
      console.error('加载历史玩家失败', err);
    }
  },

  /**
   * 玩家卡片点击
   */
  onPlayerCardTap(e) {
    const index = e.currentTarget.dataset.index;
    
    if (!this.data.players[index].selected) {
      // 未选择时打开选择器
      this.setData({
        currentPlayerIndex: index,
        showPlayerSelector: true
      });
    }
  },

  /**
   * 更换玩家
   */
  onChangePlayer(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      currentPlayerIndex: index,
      showPlayerSelector: true
    });
  },

  /**
   * 清空玩家
   */
  onClearPlayer(e) {
    const index = e.currentTarget.dataset.index;
    const players = this.data.players;
    players[index] = {
      index: index,
      name: '',
      selected: false
    };
    
    this.setData({ players });
    this.checkCanStart();
  },

  /**
   * 选择历史玩家
   */
  onSelectHistoryPlayer(e) {
    const name = e.currentTarget.dataset.name;
    const index = this.data.currentPlayerIndex;
    
    if (index >= 0) {
      const players = this.data.players;
      players[index] = {
        index: index,
        name: name,
        selected: true
      };
      
      this.setData({ players });
      this.closePlayerSelector();
      this.checkCanStart();
    }
  },

  /**
   * 搜索输入
   */
  onSearchInput(e) {
    const searchText = e.detail.value.toLowerCase();
    const allPlayers = this.data.allPlayers;
    
    const filteredPlayers = searchText
      ? allPlayers.filter(p => p.nickname.toLowerCase().includes(searchText))
      : allPlayers;
    
    this.setData({ filteredPlayers, searchText });
  },

  /**
   * 新建玩家名字输入
   */
  onNewPlayerInput(e) {
    const name = e.detail.value.trim();
    const allPlayers = this.data.allPlayers;
    
    // 检查是否已存在
    const exists = allPlayers.some(p => p.nickname === name);
    
    this.setData({
      newPlayerName: name,
      canAddNewPlayer: name.length > 0 && !exists,
      showDuplicateHint: exists && name.length > 0
    });
  },

  /**
   * 添加新玩家
   */
  onAddNewPlayer() {
    const name = this.data.newPlayerName.trim();
    
    if (!name || !this.data.canAddNewPlayer) return;
    
    // 选择刚创建的玩家
    this.onSelectHistoryPlayer({
      currentTarget: {
        dataset: { name }
      }
    });
    
    // 清空输入
    this.setData({
      newPlayerName: '',
      canAddNewPlayer: false,
      showDuplicateHint: false
    });
  },

  /**
   * 关闭选择器
   */
  closePlayerSelector() {
    this.setData({
      showPlayerSelector: false,
      currentPlayerIndex: -1,
      searchText: ''
    });
  },

  /**
   * 弹窗遮罩点击
   */
  onModalMaskTap() {
    this.closePlayerSelector();
  },

  /**
   * 停止事件冒泡
   */
  stopPropagation() {
    // 阻止点击内容区域时关闭弹窗
  },

  /**
   * 检查是否可以开始游戏
   */
  checkCanStart() {
    const canStart = this.data.players.every(p => p.selected);
    this.setData({ canStart });
  },

  /**
   * 获取玩家名字首字母
   */
  getPlayerInitial(name) {
    if (!name) return '';
    return name.charAt(0).toUpperCase();
  },

  /**
   * 开始游戏
   */
  onStartGame() {
    if (!this.data.canStart) return;
    
    const playerNames = this.data.players.map(p => p.name);
    
    if (this.data.mode === '3') {
      // 三人模式：直接跳转到游戏计分页
      wx.navigateTo({
        url: `/pages/game/game?mode=3&players=${encodeURIComponent(JSON.stringify(playerNames))}`
      });
    } else {
      // 四人模式：跳转到组队选择页
      wx.navigateTo({
        url: `/pages/team-select/team-select?players=${encodeURIComponent(JSON.stringify(playerNames))}`
      });
    }
  }
});
