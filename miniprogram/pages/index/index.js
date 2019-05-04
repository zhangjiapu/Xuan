// miniprogram/pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    folders:[],

  }, 

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取用户信息
    var that = this;
    wx.login({
      success: function () {
        wx.getUserInfo({
          success: function (res) {
            getApp().globalData.userpicUrl = res.userInfo.avatarUrl;
            getApp().globalData.username = res.userInfo.nickName;
          }
        })
      }
    });
    wx.cloud.callFunction({
      name: "getUserId",
      success(res) {        
        getApp().globalData.userid = res.result.openid;
      }
    });

    // 获取歌单列表
    const db = wx.cloud.database({
      env: 'drummer-2019'
    })

    db.collection("folder").get({
      success(res) {
        that.setData({
          folders: res.data,
        })
      }
    });
  },

 
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    const db = wx.cloud.database({
      env: 'drummer-2019'
    })

    db.collection("folder").get({
      success(res) {
        that.setData({
          folders: res.data,
        })
        wx.stopPullDownRefresh();
      }
    });
  },

  go2song:function(e){
    let data = e.currentTarget.dataset;
    wx.navigateTo({      
      url: "../song/song?id=" + data.id
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})