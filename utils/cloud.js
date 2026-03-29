// utils/cloud.js - 云开发 API 封装

/**
 * 获取历史玩家列表
 */
function getPlayers() {
  return wx.cloud.callFunction({
    name: 'getPlayers'
  });
}

/**
 * 保存游戏记录
 * @param {Object} gameData - 游戏数据
 */
function saveGame(gameData) {
  return wx.cloud.callFunction({
    name: 'saveGame',
    data: { gameData }
  });
}

/**
 * 获取最近游戏记录
 * @param {Number} limit - 数量限制
 */
function getRecentGames(limit = 3) {
  return wx.cloud.callFunction({
    name: 'getRecentGames',
    data: { limit }
  });
}

/**
 * 获取历史游戏列表（分页）
 * @param {Object} options - 选项
 * @param {Number} options.page - 页码
 * @param {Number} options.pageSize - 每页数量
 * @param {String} options.mode - 模式筛选
 * @param {String} options.timeRange - 时间范围
 */
function getHistoryGames(options = {}) {
  const {
    page = 1,
    pageSize = 20,
    mode = 'all',
    timeRange = 'all'
  } = options;
  
  return wx.cloud.callFunction({
    name: 'getHistoryGames',
    data: {
      page,
      pageSize,
      mode,
      timeRange
    }
  });
}

module.exports = {
  getPlayers,
  saveGame,
  getRecentGames,
  getHistoryGames
};
