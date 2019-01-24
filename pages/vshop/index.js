const config = require('../../config/config.js');
const util = require('../../utils/util.js');
const app = getApp();
Page({
  data: {
    checked: true,
    img_url: config.BASE_HOST
  },
  
  onReady: function () {

  },
  onPullDownRefresh: function () {
    this.onLoad.call(this);
  },
  onShow: function () {
    
    if (wx.getStorageSync('is_reload_vshop')) {
      this.setData({
        hideLoading:false
      })
      wx.removeStorageSync('is_reload_vshop');
      this.onLoad.call(this);
    }
  },
  load_image: function (e) {
    console.info(e);
    util.loadImage(this, e.currentTarget.dataset.ident, 'm');
  },
  evt_goindex: function () {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  onLoad: function (options) {
    var _this = this;
    _this.setData({
      themecolor: app.globalData.themecolor
    })
    let _vshop_id = wx.getStorageSync('_vshop_id');
    if (!_vshop_id) {
      _vshop_id = 0
    }
    util.checkMember.call(this, function () {
      util.wxRequest({
        url: config.BASE_URL + '/m/vshop-info.html',
        method:'post',
        data: { _vshop_id},
        success: function (res) {
          var pagedata = res.data;
          _this.setData({
            is_agent: (!pagedata.from_vshop['shop_id'] && !pagedata.vshop) || pagedata.agent ? true : false
          })
          if (pagedata.vshop && pagedata.vshop.shop_id) {
            wx.setNavigationBarTitle({
              title: "我的微店"
            });
            wx.setStorageSync('own_shop', pagedata.vshop.shop_id);
          } else {
            wx.setNavigationBarTitle({
              title: "申请入驻"
            });
            wx.removeStorageSync('own_shop');
          }
          if (pagedata.data) {
            _this.setData(pagedata.data)
          }
          if (pagedata.vshop) {
            try {
              pagedata['vshop']['logo_url'] = util.fixImgUrl(pagedata['vshop']['logo_url']);
              pagedata['vshop']['banner_url'] = util.fixImgUrl(pagedata['vshop']['banner_url']);
            } catch (e) {

            }
          }
          _this.setData(pagedata);
        },
        complete: function () {
          //wx.hideNavigationBarLoading();
          wx.stopPullDownRefresh();
          _this.setData({
            hideLoading: true
          });

        }
      });
    });
  },
  small_shop: function(e) {
    let is_agent = this.data.is_agent;
    if (!is_agent) {
      let _this = this;
      let _vshop_id = wx.getStorageSync('_vshop_id');
      if (!_vshop_id) {
        _vshop_id = 0
      }
        util.checkMember.call(_this, function () {
          util.wxRequest({
            url: config.BASE_URL + '/m/vshop-info-save.html',
            method: 'POST',
            data: { _vshop_id: _vshop_id },
            success: function (res) {
              console.log('请求成功')
              if (res.data.error) {
                wx.showModal({
                  title: '温馨提示',
                  content: res.data.error || '',
                  showCancel: false,
                  confirmColor: '#6699FF'
                })
              } else {
                wx.setStorageSync('is_reload_vshop', 'true');
                wx.navigateTo({
                  url: '/pages/vshop/index',
                })
              }
            },
            complete: function () {
              wx.hideLoading();
            }
          })
        })
    } else {
      wx.navigateTo({
        url: '/pages/packagefirst/pages/register/index',
      })
    }
  },
  evt_joinvshop: function (e) {
    this.small_shop()
  },
  evt_getphonenumber: function (e) {
    var _this = this;
    var res = e.detail;
    if (!res.iv || !res.encryptedData) {
      return;
    }
    var wx_session_key = this.data.member.wx_session_key;
    if (!wx_session_key) {
      return;
    }
    wx.showToast({
      icon: 'loading',
      title: '正在绑定',
      mask: true,
      duration: 50000
    });
    let _vshop_id = wx.getStorageSync('_vshop_id');
    if (!_vshop_id) {
      _vshop_id = 0
    }
    util.wxRequest({
      url: config.BASE_URL + '/openapi/toauth/callback/wechat_toauth_wxapppam/bind_mobile',
      method: 'POST',
      data: {
        session_key: wx_session_key,
        iv: res.iv,
        encryptedData: res.encryptedData,
        _vshop_id: _vshop_id
      },
      success: function (res) {
        var resdata = res.data;
        if (resdata.result == 'error') {
          wx.showModal({
            title: '绑定失败',
            content: resdata.data,
            confirmColor:'#6699FF',
            showCancel:false
          });
        }
        if (resdata.result == 'success') {
          wx.showModal({
            title: '绑定成功',
            content: '已成功绑定手机:' + resdata.data.purePhoneNumber,
            showCancel: false,
            success: function (res) {
              app.globalData.member.exist_login_type &&
                app.globalData.member.exist_login_type.push &&
                app.globalData.member.exist_login_type.push('mobile');
              this.small_shop()
            }
          });
        }
      },
      complete: function () {
        wx.hideToast();
      }
    });
  },
  evt_getqrcode: function (e) {
    var _this = this;
    wx.showToast({
      title: '正在生成',
      icon: 'loading',
      mask: true,
      duration: 10000
    });
    util.getqrcode({
      'path': '/pages/index/index?_vshop_id=' + _this.data.vshop.shop_id,
      'type': 'scene',
      'width': 430
    }, function (qr_image_data) {
      wx.hideToast();
      wx.previewImage({
        urls: [qr_image_data.qrcode_image_url]
      });
    });
  },
  onShareAppMessage: function () {
    let the_path = '/pages/index/index?_vshop_id=' + this.data.vshop.shop_id;
    the_path = util.merchantShare(the_path);
    return {
      title: '微店分享',
      path: the_path,
    };
  },
  evt_redirect: function (e) {
    wx.redirectTo({
      url: e.currentTarget.dataset.url
    });
  },
  // 同意用户协议
  agreeMent: function (e) {
    this.setData({
      checked: !this.data.checked
    })
  },
  userAgreement: function () {
    wx.navigateTo({
      url: '/pages/vshop/agree/agree'
    })
  },
});