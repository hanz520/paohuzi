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
    
    // Tab 相关
    currentTab: 'history', // 'history' 或 'new'
    
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
      // 未选择时打开选择器，并过滤掉已选择的玩家
      this.filterAvailablePlayers();
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
    // 更换玩家时，允许选择当前玩家（因为要替换掉）
    this.filterAvailablePlayers(index);
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
   * 过滤可选择的玩家（排除已选择的玩家）
   * @param {number} currentIdx - 当前正在操作的玩家索引（允许被选择）
   */
  filterAvailablePlayers(currentIdx = -1) {
    // 获取已选择的玩家名字列表（排除当前正在操作的玩家）
    const selectedNames = this.data.players
      .filter((p, idx) => p.selected && idx !== currentIdx)
      .map(p => p.name);
    
    // 过滤掉已选择的玩家
    const availablePlayers = this.data.allPlayers.filter(
      p => !selectedNames.includes(p.nickname)
    );
    
    this.setData({ filteredPlayers: availablePlayers });
  },

  /**
   * Tab 切换
   */
  onTabTap(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ 
      currentTab: tab,
      searchText: '', // 切换 Tab 时清空搜索
      newPlayerName: '', // 清空输入
      canAddNewPlayer: false,
      showDuplicateHint: false
    });
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
   * 确认新建玩家
   */
  onConfirmNewPlayer() {
    const name = this.data.newPlayerName.trim();
    
    if (!name || !this.data.canAddNewPlayer) return;
    
    // 直接选择刚创建的玩家
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
    
    // 先按搜索词过滤
    const searchFiltered = searchText
      ? allPlayers.filter(p => p.nickname.toLowerCase().includes(searchText))
      : allPlayers;
    
    // 再过滤掉已选择的玩家
    const selectedNames = this.data.players
      .filter((p, idx) => p.selected && idx !== this.data.currentPlayerIndex)
      .map(p => p.name);
    
    const filteredPlayers = searchFiltered.filter(
      p => !selectedNames.includes(p.nickname)
    );
    
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
   * 添加新玩家（已废弃，保留兼容性）
   */
  onAddNewPlayer() {
    // 这个方法已经不再使用，保留以防兼容性问题
    console.log('请使用 onConfirmNewPlayer 方法');
  },

  /**
   * 关闭选择器
   */
  closePlayerSelector() {
    this.setData({
      showPlayerSelector: false,
      currentPlayerIndex: -1,
      searchText: '',
      currentTab: 'history', // 重置为历史玩家 Tab
      newPlayerName: '',
      canAddNewPlayer: false,
      showDuplicateHint: false
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
