// cloudfunctions/getHistoryGames/index.js - 获取历史游戏列表（分页）
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  const { page = 1, pageSize = 20, mode = 'all', timeRange = 'all' } = event;
  
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
      } else if (timeRange === '30days') {
        startTime.setDate(now.getDate() - 30);
      }
      
      query = query.where({
        createTime: {
          gte: startTime
        }
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
    return { success: false, error: err.message };
  }
};
