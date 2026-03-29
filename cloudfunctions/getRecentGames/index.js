// cloudfunctions/getRecentGames/index.js - 获取最近游戏记录
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  const { limit = 3 } = event;
  
  try {
    const games = await db.collection('games')
      .orderBy('createTime', 'desc')
      .limit(limit)
      .get();
    
    return { 
      success: true, 
      games: games.data 
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
