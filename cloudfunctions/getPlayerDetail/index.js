// cloudfunctions/getPlayerDetail/index.js - 获取玩家详情
const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

exports.main = async (event, context) => {
  const { playerId } = event;
  
  if (!playerId) {
    return { 
      success: false, 
      error: '缺少玩家 ID'
    };
  }
  
  try {
    const player = await db.collection('players').doc(playerId).get();
    
    if (player.data) {
      return {
        success: true,
        player: player.data
      };
    } else {
      return {
        success: false,
        error: '玩家不存在'
      };
    }
  } catch (err) {
    return { 
      success: false, 
      error: err.message
    };
  }
};
