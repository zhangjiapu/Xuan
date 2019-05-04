// miniprogram/pages/song/song.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:'',    
    songs:'',
    singer:"木子士心",
    totalNumber:0,
    currNumber:0,
    pageSize:15
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id: options.id
    })
  },

  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.showLoading({
      title: '加载中'
    });
    // 获取歌单下的所有歌曲
    const db = wx.cloud.database({
      env: 'drummer-2019'
    })

    let that = this;

    db.collection("song").limit(that.data.pageSize).where({
      folderid: this.data.id,
    }).get({
      success(res) {
        that.setData({
          songs: res.data,
        })
        wx.hideLoading();
      }
    });

    //获取歌单信息
    db.collection("folder").doc(this.data.id).get({
      success(res) {
        that.setData({
          folder: res.data
        })
      }
    });

    // 获取所有歌曲的数量
    db.collection("song").where({
      folderid:that.data.id
    }).count({
      success(res){
        that.setData({
          totalNumber:res.total
        })
      }
    });

  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    // 获取歌单下的所有歌曲
    const db = wx.cloud.database({
      env: 'drummer-2019'
    })

    let that = this;

    db.collection("song").limit(that.data.pageSize).where({
      folderid: this.data.id,
    }).get({
      success(res) {
        that.setData({
          songs: res.data,
        })
      }
    });

    //获取歌单信息
    db.collection("folder").doc(this.data.id).get({
      success(res) {
        that.setData({
          folder: res.data
        })
      }
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

    // 获取歌单下的所有歌曲
    const db = wx.cloud.database({
      env: 'drummer-2019'
    })

    let that = this;
    if(that.data.currNumber>that.data.totalNumber){
      that.setData({
        currNumber:that.data.totalNumber
      })
    }else{
      that.setData({
        currNumber:that.data.currNumber+that.data.pageSize
      })
    }

    // 显示加载动画
    wx.showLoading({
      title: '加载中'
    });
    // 分页查询
    db.collection("song").skip(that.data.currNumber).limit(that.data.pageSize).where({
      folderid: that.data.id,
    }).get({
      success(res) {
        let songtemp = res.data;
        let oldsongs = that.data.songs;
        let newsongs = oldsongs.concat(songtemp)

        that.setData({
          songs: newsongs,
        })
        // 隐藏加载动画
        wx.hideLoading();
      }
    });

    //获取歌单信息
    db.collection("folder").doc(that.data.id).get({
      success(res) {
        that.setData({
          folder: res.data
        })
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  playSong:function(e){    
    this.setData({
      songname: e.currentTarget.dataset.songname, //歌曲名称
      songurl: e.currentTarget.dataset.url, //歌曲链接
      currSongIndex: e.currentTarget.dataset.songindex//当前播放的歌曲序号
    });
    this.doMusicPlay();
  },

  doMusicPlay:function(){
    
    const backgroundAudioManager = wx.getBackgroundAudioManager()
    backgroundAudioManager.title = this.data.songname;  
    backgroundAudioManager.epname = this.data.folder.name;
    backgroundAudioManager.singer = this.data.singer;
    backgroundAudioManager.coverImgUrl = this.data.folder.pic;
    // 设置了 src 之后会自动播放
    backgroundAudioManager.src = this.data.songurl;

    let that = this;
    // 开始播放音乐的监听事件
    backgroundAudioManager.onCanplay(function () {
      wx.hideLoading();
    })

    // 监听音频加载中事件
    backgroundAudioManager.onWaiting(() =>{
      wx.showLoading({
        title: '加载中'
      });
    });

    //监听背景音频播放错误事件  
    backgroundAudioManager.onError((err) =>{
      console.log(err);
    });


    //监听音乐正常播放完的事件，顺序循环
    
    backgroundAudioManager.onEnded(() => {
      let songlist = that.data.songs;
      let listlength = songlist.length;
      let currsongIndex = that.data.currSongIndex;

      let nextsongIndex = (currsongIndex + 1) % listlength;
      let nextsong = songlist[nextsongIndex];
      that.setData({
        currSongIndex: nextsongIndex,//当前播放的歌曲序号
        songtitle: nextsong.name,
        songurl: nextsong.url
      });
      //列表循环
      that.doMusicPlay();
    })
  }
})