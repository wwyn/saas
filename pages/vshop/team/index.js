const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
const app = getApp();
var current_page = 1;
var loading_more = false;

var load_list = function(page) {
    var _this = this;
    var page = page ? page : 1;
    wx.showNavigationBarLoading();
    loading_more = true;
    util.wxRequest({
        url: config.BASE_URL + '/m/vshop-group_list-'+_this.data.team_type+'-' + page + '.html',
        method:'POST',
        success: function(res) {
            var newdata = res.data;
            var _thisdata = _this.data;
            if (newdata) {
                if (!newdata.group_list || !newdata.group_list.length) {
                    newdata.empty_list = 'YES';
                } else {
                    newdata.empty_list = 'NO';
                }
                _this.setData(newdata);
            }
        },
        complete:function(){
            wx.hideNavigationBarLoading();
            _this.setData({hideLoading:true});
            loading_more = false;
        }
    });
};
//变更状态
var status_change = function(status,shopid,index){
  let _this = this;
  let submitdata ={};
  submitdata['shop_id'] = shopid;
  if (status == 'reject' && !_this.data.refuseContent){
      wx.showModal({
        title: '温馨提示',
        content: '请填写拒绝理由',
        showCancel:false
      })
      return;
  } else if (status == 'reject'){
      submitdata['reject_reason'] = _this.data.refuseContent;
  }
  if (loading_more) return;
  loading_more = true;
  wx.showNavigationBarLoading();
  util.wxRequest({
    url: config.BASE_URL + '/m/vshop-docheck-'+status+'.html',
    method: 'POST',
    data:submitdata,
    success: function (res) {
      if(res.data.error){
          wx.showModal({
            title: '温馨提示',
            content: res.data.error||'',
            showCancel:false,
            confirmColor:'#3093F8'
          })
      }else{
        wx.showToast({
          title: '操作成功'
        })
        _this.data.group_list.splice(index,1);
        _this.setData({
            group_list: _this.data.group_list
        })
      }
    },
    complete: function () {
      wx.hideNavigationBarLoading();
      _this.setData({ hideLoading: true ,refuse: false});
      loading_more = false;
    }
  });
}
Page({
    data: {
        empty_list: 'NO',
        team_type:'s1',
        img_url:config.BASE_HOST
    },
    onReady: function() {
    },
    onLoad: function(options) {
        var _this = this;
        wx.setNavigationBarTitle({
            title: '我的团队'
        });
        current_page = 1;
        util.checkMember.call(this, function() {
            load_list.call(_this);
        });
    },
    onReachBottom: function(e) {
        if (loading_more || this.data.pager.total == this.data.pager.current) {
            return;
        }
        current_page += 1;
        load_list.call(this, current_page);
    },
    load_image: function(e) {
        console.info(e);
        util.loadImage(this,e.currentTarget.dataset.ident,'m');
    },
    changeType:function(e){
        let team_type = e.currentTarget.dataset.type;
        let _this = this;
      this.setData({ team_type, group_list:[]});
        current_page = 1;
        util.checkMember.call(this, function () {
          load_list.call(_this);
        });
    },
    //拒绝开店
    showRefuse:function(e){
        let id = e.currentTarget.dataset.id;
        let index = e.currentTarget.dataset.index;
        this.setData({
          refuse:true,
          refuseid:id,
          refuseindex:index
        })
    },
    closeRefuse: function () {
      this.setData({
        refuse: false
      })
    },
    evt_operate:function(e){
        let _this = this;
        let id = e.currentTarget.dataset.id;
        let status = e.currentTarget.dataset.type;
        let index = e.currentTarget.dataset.index;
        if (status == 'agree'){
          wx.showModal({
            content: '「' + e.currentTarget.dataset.name+'」申请开通微店 是否同意?',
            confirmColor: '#6699FF',
            success: function (res) {
              if (res.confirm) {
                status_change.call(_this, status,id,index);
              }
            }
          })
        }else{
          status_change.call(_this, status, id,index);
        }
    },
    //输入拒绝理由
    insertContent:function(e){
        this.setData({
            refuseContent:e.detail.value
        })
    }
});
