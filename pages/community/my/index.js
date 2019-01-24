const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
const timeago = require('../../../utils/timeago.js');
// var md5 = require('../../../../utils/md5.js');
var current_page = 1;
var loading_more = false;
var timeago_ins = timeago();
var load_list = function(page) {
    loading_more = true;
    var _this = this;
    var page = page ? page : 1;
    util.wxRequest({
        url: config.BASE_URL + '/m/communityblog-my-' + page + '.html',
        success: function(res) {
            var newdata = res.data;
            var _thisdata = _this.data;
            if (newdata && newdata.blog_data) {
                if(newdata.blog_data.blog_list){
                    for (let i = 0; i < newdata.blog_data.blog_list.length; i++) {
                        newdata.blog_data.blog_list[i].timeago = timeago_ins.format(parseInt(newdata.blog_data.blog_list[i].createtime)*1000);
                    }
                }
                if (_thisdata.blog_data && _thisdata.blog_data.blog_list && page > 1) {
                    newdata.blog_data.blog_list = _thisdata.blog_data.blog_list.concat(newdata.blog_data.blog_list);
                    newdata.blog_data.media_audio = newdata.blog_data.media_audio || {};
                    Object.assign(newdata.blog_data.media_audio, _thisdata.blog_data.media_audio);
                    newdata.blog_data.media_images = newdata.blog_data.media_images || {};
                    Object.assign(newdata.blog_data.media_images, _thisdata.blog_data.media_images);
                    newdata.blog_data.media_video = newdata.blog_data.media_video || {};
                    Object.assign(newdata.blog_data.media_video, _thisdata.blog_data.media_video);
                    newdata.blog_data.author_list = newdata.blog_data.author_list || {};
                    Object.assign(newdata.blog_data.author_list, _thisdata.blog_data.author_list);
                }
                if (!newdata.blog_data.blog_list || !newdata.blog_data.blog_list.length) {
                    newdata.empty_list = 'YES';
                } else {
                    newdata.empty_list = 'NO';
                }
                _this.setData(newdata);
            }
        },
        complete: function() {
            wx.stopPullDownRefresh();
            _this.setData({
                hideLoading: true
            });
            loading_more = false;
        }
    });
};
Page(Object.assign({
    data: {
        audio_playing:false,
        hideLoading: false,
        in_my_page:true,
        status_map:{
            'shield':'审核中',
            'release':'已发布',
            'recommend':'推荐',
            'highlyrecommend':'强烈推荐',
            'top':'置顶'
        }
    },
    onHide:function(){
        this.setData({
            current_play_video_id:false
        });
    },
    onPullDownRefresh: function() {
        if(!this.data.member)return wx.stopPullDownRefresh();
        load_list.call(this,current_page=1);
    },
    onReachBottom:function(){
        if(!this.data.member)return;
        if (loading_more || this.data.pager.total == this.data.pager.current) {
            return;
        }
        current_page+=1;
        load_list.call(this,current_page);
    },
    onReady: function() {
        var _this = this;
        wx.setNavigationBarTitle({
            title: '我的主页'
        });
        wx.getSystemInfo({
            success: function(res) {
                _this.setData({
                    media_image_size: (res.windowWidth-21)/4 - 4,
                    win_height:res.windowHeight,
                    win_width:res.windowWidth
                });
            }
        });
    },
    onLoad: function(options) {
        var _this =this;
        util.checkMember.call(this, function(re) {

            load_list.call(_this,1);
        });
    },
    load_image: function(e) {
        util.loadImage(this,e.currentTarget.dataset.ident,'m');
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
    },
    evt_confirmsigndata:function(e){
        let val = e.detail.value;
        let _this = this;
        if(_this.data.user_data.sign == val)return;
        wx.showModal({
            title:'保存签名?',
            content:val,
            success:function(re){
                if(re.confirm){
                    wx.showToast({
                        icon:'loading'
                    });
                    util.wxRequest({
                        url: config.BASE_URL + '/m/communitysetting-user_sign.html',
                        method:'POST',
                        data:{
                            sign:val
                        },
                        success: function(res) {
                            var resdata = res.data;
                            if(resdata.success){
                                wx.showToast({
                                    icon:'success',
                                    content:'签名保存成功'
                                });
                                _this.setData({
                                    'user_data.sign':val
                                });
                            }else{
                                wx.showModal({
                                    title:'签名保存失败',
                                    showCancel:false,
                                    content:resdata.error||''
                                });
                            }
                        },
                        complete: function() {
                            //wx.hideToast();
                        }
                    });
                }
            }
        });
    }

},require('../_require_evt.js')));
