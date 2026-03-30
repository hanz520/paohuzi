// cloudfunctions/getHistoryGames/index.js - 获取历史游戏列表（分页）
const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

exports.main = async (event, context) => {
  const { page = 1, pageSize = 20, mode = 'all', timeRange = 'all' } = event || {};
  
  try {
    let query = db.collection('games');
    
    // 模式筛选
    if (mode !== 'all') {
      query = query.where({ mode });
    }
    
    // 时间筛选
    if (timeRange !== 'all') {
      const now = new Date();
      let startTime = new Date();
      
      if (timeRange === '7days') {
        startTime.setDate(now.getDate() - 7);
        startTime.setHours(0, 0, 0, 0);
      } else if (timeRange === '30days') {
        startTime.setDate(now.getDate() - 30);
        startTime.setHours(0, 0, 0, 0);
      }
      
      // 使用 ISO 8601 字符串进行比较（数据库中的 createTime 是字符串类型）
      query = query.where({
        createTime: db.command.gte(startTime.toISOString())
      });
    }
    
    // 分页查询
    const total = await query.count();
    
    const games = await query
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .orderBy('createTime', 'desc')
      .get();
    
    return {
      success: true,
      games: games.data,
      total: total.total,
      hasMore: (page * pageSize) < total.total
    };
  } catch (err) {
    return { 
      success: false, 
      error: err.message
    };
  }
};
