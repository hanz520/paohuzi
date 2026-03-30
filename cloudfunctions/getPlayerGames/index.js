// cloudfunctions/getPlayerGames/index.js - 获取玩家游戏记录
const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

exports.main = async (event, context) => {
  const { playerId, page = 1, pageSize = 20 } = event || {};
  
  if (!playerId) {
    return { 
      success: false, 
      error: '缺少玩家 ID'
    };
  }
  
  try {
    // 先获取玩家信息
    const player = await db.collection('players').doc(playerId).get();
    
    if (!player.data) {
      return {
        success: false,
        error: '玩家不存在'
      };
    }
    
    const playerName = player.data.nickname;
    
    // 查询该玩家参与的游戏
    let query = db.collection('games')
      .where({
        'players.name': playerName
      })
      .orderBy('createTime', 'desc');
    
    // 分页
    const total = await query.count();
    const games = await query
      .skip((page - 1) * pageSize)
      .limit(pageSize)
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
