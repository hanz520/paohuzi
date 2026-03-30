// cloudfunctions/deleteGame/index.js - 删除游戏记录
const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

exports.main = async (event, context) => {
  const { gameId } = event;
  
  if (!gameId) {
    return { 
      success: false, 
      error: '缺少游戏 ID'
    };
  }
  
  try {
    // 删除游戏记录
    await db.collection('games').doc(gameId).remove();
    
    console.log('删除游戏记录成功:', gameId);
    
    return {
      success: true,
      message: '删除成功'
    };
  } catch (err) {
    console.error('删除游戏记录失败:', err);
    return { 
      success: false, 
      error: err.message
    };
  }
};
