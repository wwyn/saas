const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
//const timeago = require('../../../utils/timeago.js');

Page({
    data: {
        unrelationed:{}
    },
    onHide:function(){
        this.setData({
            current_play_video_id:false
        });
    },
    onPullDownRefresh: function() {
        if(!this.data.member)return;
        this.onLoad();
    },
    onReady: function() {
        var _this = this;
        wx.setNavigationBarTitle({
            title: '我的关注'
        });
    },
    onLoad: function(options) {
        var _this =this;
        util.checkMember.call(this, function(re) {
            util.wxRequest({
                url: config.BASE_URL + '/m/communityrelation-my_relation_user.html',
                success: function(res) {
                    var resdata = res.data;
                    _this.setData(resdata);
                },
                complete: function() {
                    wx.stopPullDownRefresh();
                    _this.setData({
                        hideLoading: true
                    });
                }
            });

        });
    },
    load_image: function(e) {
        util.loadImage(this,e.currentTarget.dataset.ident,'m');
    },
    evt_relation:function(e){
        let _this  = this;
        let user_id = e.currentTarget.dataset.userid;
        let nickname = e.currentTarget.dataset.nickname;
        util.wxRequest({
            url: config.BASE_URL + '/m/communityrelation-follow-' + user_id+ '.html',
            success: function(res) {
                let resdata = res.data;
                if (resdata.success) {
                    wx.showToast({
                        icon: 'success',
                        title: '关注成功'
                    });
                    _this.data.unrelationed[user_id] = false;
                    _this.setData({
                        unrelationed:_this.data.unrelationed
                    });
                }
            }
        });
    },
    evt_unrelation: function(e){
        let _this  = this;
        let user_id = e.currentTarget.dataset.userid;
        let nickname = e.currentTarget.dataset.nickname;
        wx.showModal({
            title:'确认取消关注？',
            content:'确认取消对"'+nickname+'"的关注?',
            success:function(res){
                if(res.confirm){
                    wx.showToast({icon:'loading'});
                    util.wxRequest({
                        url: config.BASE_URL + '/m/communityrelation-unrelation.html',
                        method:'POST',
                        data:{
                           user_id:user_id
                        },
                        success: function(res) {
                            _this.data.unrelationed[user_id] = true;
                            _this.setData({
                                unrelationed:_this.data.unrelationed
                            });
                        },
                        complete: function() {
                            wx.hideToast();
                        }
                    });
                }
            }
        });

    },
    evt_navuserpage:function(e){
        let user_id = e.currentTarget.dataset.userid;
        wx.navigateTo({
            url:'/pages/community/user?user_id='+user_id
        });
    },
    evt_gocommunity: function(e) {
        wx.reLaunch({
            url: '/pages/member/index',
            success: function() {
                wx.navigateTo({
                    url: '/pages/community/index'
                });
            }
        });
    }

});
