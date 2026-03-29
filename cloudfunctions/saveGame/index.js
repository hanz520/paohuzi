// cloudfunctions/saveGame/index.js - 保存游戏并更新玩家统计
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  const { gameData } = event;
  
  try {
    // 保存游戏记录
    await db.collection('games').add({
      data: gameData
    });
    
    // 更新玩家统计
    for (const player of gameData.players) {
      const playerRecord = await db.collection('players')
        .where({ nickname: player.name })
        .get();
      
      if (playerRecord.data.length > 0) {
        // 更新现有玩家
        await db.collection('players').doc(playerRecord.data[0]._id).update({
          data: {
            totalGames: db.command.inc(1),
            totalWins: player.isWinner ? db.command.inc(1) : 0,
            lastPlayTime: new Date()
          }
        });
      } else {
        // 创建新玩家
        await db.collection('players').add({
          data: {
            nickname: player.name,
            totalGames: 1,
            totalWins: player.isWinner ? 1 : 0,
            winRate: player.isWinner ? 1 : 0,
            lastPlayTime: new Date()
          }
        });
      }
    }
    
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
