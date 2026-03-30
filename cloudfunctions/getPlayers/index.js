// cloudfunctions/getPlayers/index.js - 获取玩家列表（支持排序和分页）
const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

exports.main = async (event, context) => {
  const { page = 1, pageSize = 20, sortBy = 'games', sortOrder = 'desc' } = event || {};
  
  try {
    let query = db.collection('players');
    
    // 排序
    let sortField = 'totalGames';
    if (sortBy === 'winrate') {
      sortField = 'winRate';
    } else if (sortBy === 'score') {
      sortField = 'totalScore';
    }
    
    query = query.orderBy(sortField, sortOrder);
    
    // 分页
    const total = await query.count();
    const players = await query
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get();
    
    return {
      success: true,
      players: players.data,
      total: total.total,
      hasMore: (page * pageSize) < total.total
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
