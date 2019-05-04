// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const { folderid } = event
    return await db.collection('song').where({
      folderid: folderid,
    }).get({
      success: function (res) {
      }
    });
  } catch (e) {
    console.error(e);
  }
  
}