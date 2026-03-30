// cloudfunctions/getHistoryGames/index.js - 获取历史游戏列表（分页）
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  const { page = 1, pageSize = 20, mode = 'all', timeRange = 'all' } = event;
  
  try {
    console.log('getHistoryGames 参数:', event);
    
    let query = db.collection('games');
    
    // 模式筛选
    if (mode !== 'all') {
      console.log('筛选模式:', mode);
      query = query.where({ mode });
    }
    
    // 时间筛选
    if (timeRange !== 'all') {
      console.log('筛选时间范围:', timeRange);
      const now = new Date();
      let startTime = new Date();
      
      if (timeRange === '7days') {
        startTime.setDate(now.getDate() - 7);
      } else if (timeRange === '30days') {
        startTime.setDate(now.getDate() - 30);
      }
      
      console.log('起始时间:', startTime);
      
      query = query.where({
        createTime: {
          gte: startTime
        }
      });
    }
    
    // 分页查询
    const total = await query.count();
    console.log('总记录数:', total.total);
    
    const games = await query
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .orderBy('createTime', 'desc')
      .get();
    
    console.log('查询到的游戏数量:', games.data.length);
    
    return {
      success: true,
      games: games.data,
      total: total.total,
      hasMore: (page * pageSize) < total.total
    };
  } catch (err) {
    console.error('getHistoryGames 错误:', err);
    return { success: false, error: err.message };
  }
};
