// cloudfunctions/getPlayers/index.js - 获取历史玩家列表
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  try {
    const players = await db.collection('players')
      .orderBy('lastPlayTime', 'desc')
      .limit(50)
      .get();
    
    return { 
      success: true, 
      players: players.data 
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
