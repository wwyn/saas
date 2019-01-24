//app.js
const config = require('config/config.js');
const getCurrentPage = function() {
    let pages = getCurrentPages() //获取加载的页面
    console.info(pages);
    let currentPage = pages[pages.length - 1] //获取当前页面的对象
    let url = currentPage.route //当前页面url
    let options = currentPage.options //如果要获取url中所带的参数可以查看options

    //拼接url的参数
    let urlWithArgs = url + '?'
    for (let key in options) {
        let value = options[key]
        urlWithArgs += key + '=' + value + '&'
    }
    urlWithArgs = urlWithArgs.substring(0, urlWithArgs.length - 1)

    return {
            'current_page_url':urlWithArgs,
            'pages_length':pages.length
    };
}
App({
  onLaunch: function (options) {
    var _this = this;
    let defaulttheme = '';
    let themelist = {};
    if (config.RUN_ON_SAAS && wx.getExtConfig) {
      var header = {};
      var ext_vars = wx.getExtConfigSync();
      //小应用特殊头
      header['X-Requested-isWXAPP'] = 'YES';
      //header['content-type'] = 'application/json';
      header['content-type'] = 'application/x-www-form-urlencoded';
      header['x-requested-saas-mode'] = 'APP';
      header['x-requested-saas-app'] = ext_vars.host_pre;
      header['x-requested-saas-client'] = ext_vars.client_id;
      header['x-requested-saas-order'] = ext_vars.order_id;
      wx.getExtConfig({
        success: function (res) {
          if (res.extConfig.themes) {
            themelist = res.extConfig.themes.schemes;
            defaulttheme = res.extConfig.themes.default;
            var arr = [];
            for (var key in themelist) {
              arr.push(key);
            }
            if (arr.length == 0) {
              return false;
            }
            wx.request({
              url: config.BASE_URL + '/openapi/xcxpage/oninit',
              header: header,
              success: function (res) {
                if (res.data.data && res.data.data.theme_color) {
                  if (themelist[res.data.data.theme_color]) {
                    _this.globalData.themecolor = themelist[res.data.data.theme_color].color_addon.themecolor;
                  } else if (themelist[defaulttheme]) {
                    _this.globalData.themecolor = themelist[defaulttheme].color_addon.themecolor;
                  } else {
                    var arr = [];
                    for (var key in themelist) {
                      arr.push(key);
                    }
                    _this.globalData.themecolor = themelist[arr[0]].color_addon.themecolor;
                  }
                } else {
                  if (themelist[defaulttheme]) {
                    _this.globalData.themecolor = themelist[defaulttheme].color_addon.themecolor;
                  } else {
                    var arr = [];
                    for (var key in themelist) {
                      arr.push(key);
                    }
                    _this.globalData.themecolor = themelist[arr[0]].color_addon.themecolor;
                  }
                }
              },
              fail: function (res) {
                if (themelist[defaulttheme]) {
                  _this.globalData.themecolor = themelist[defaulttheme].color_addon.themecolor;
                } else {
                  var arr = [];
                  for (var key in themelist) {
                    arr.push(key);
                  }
                  _this.globalData.themecolor = themelist[arr[0]].color_addon.themecolor;
                }
              }
            });
          }
          wx.request({
            url: config.BASE_URL + '/openapi/open_app/wx_templates',
            header: header,
            success: function (res) {
              _this.globalData.msg_templates = res.data.data;
            }
          });
        }
      })
    }
        try{
            var query = options.query;
            if (query && query._vshop_id) {
                //微店id 记录
                /**
                 * @see /pages/checkout/checkout.js line 105
                 */
                wx.setStorageSync('_vshop_id', query._vshop_id);
            }
            console.log('options解析前');
            console.log(query);
            if (options.query && query.q) getQuery(decodeURIComponent(query.q), query);
            console.log('options解析后');
            console.log(options);
            // 商户id
            if (query && query.merchant_id) {
              if (query.merchant_id != 0) {
                wx.setStorageSync('merchant_id', query.merchant_id);
              } else {
                wx.removeStorageSync('merchant_id');
              }
            }
        }catch(e){
            console.log(e);
        }
    //this.onError('test error');
  },
  onShow: function (options) {
    //TODO
    console.info('app Show');
    try {
      var query = options.query;
      console.log('options解析前');
      console.log(query);
      if (options.query && query.q) getQuery(decodeURIComponent(query.q), query);
      console.log('options解析后');
      console.log(options);
      // 商户id
      if (query && query.merchant_id) {
        if (query.merchant_id != 0) {
          wx.setStorageSync('merchant_id', query.merchant_id);
        } else {
          wx.removeStorageSync('merchant_id');
        }
      }
    } catch (e) {
      console.log(e);
    }
    wx.getNetworkType({
      success: function (re) {
        if (re.networkType == 'none') {
          wx.navigateTo({
            url: '/pages/common/noconnect'
          });
        }
      },
      fail: function () {
        wx.navigateTo({
          url: '/pages/common/noconnect'
        });
      }
    });
    if (wx.onNetworkStatusChange) {
      wx.onNetworkStatusChange(function (is_connected, networkType) {
        if (!is_connected) {
          wx.navigateTo({
            url: '/pages/common/noconnect'
          });
        }
      });
    }
  },
  onHide: function () {
    //TODO
    console.info('app Hide');
  },
  onError: function (msg) {
    //记录错误日志到服务器端
    var system_info = wx.getSystemInfoSync();
    wx.getNetworkType({
      success: function (res) {
        var header = {};
        //小应用特殊头
        header['X-Requested-isWXAPP'] = 'YES';

        //session_id , vmc_uid 处理
        var session_id = wx.getStorageSync('_SID'),
          vmc_uid = wx.getStorageSync('_VMC_UID');
        // SID
        if (session_id)
          header['X-WxappStorage-SID'] = session_id;

        // UID
        if (vmc_uid)
          header['X-WxappStorage-VMC-UID'] = vmc_uid;

        if (config.RUN_ON_SAAS && wx.getExtConfig) {
          var ext_vars = wx.getExtConfigSync();
          // SAAS RUN TYPE
          header['x-requested-saas-mode'] = 'APP';
          header['x-requested-saas-app'] = ext_vars.host_pre;
          header['x-requested-saas-client'] = ext_vars.client_id;
          header['x-requested-saas-order'] = ext_vars.order_id;
        }
        //content-type
        header['content-type'] = 'application/x-www-form-urlencoded';
        wx.request({
          url: config.BASE_URL + '/openapi/wechat/xcxerrorlog',
          method: 'POST',
          header: header,
          data: {
            timestamp: parseInt(new Date().getTime() / 1000),
            //appid: config.APP_ID,
            network_type: res.networkType,
            system_model: system_info.model,
            system_systemver: system_info.system,
            system_platform: system_info.platform,
            //system_sdkver:system_info.SDKVersion,
            system_ver: system_info.version,
            //system_screen:(system_info.screenWidth+'*'+system_info.screenHeight),
            system_window: (system_info.windowWidth + '*' + system_info.windowHeight),
            system_pixel: system_info.pixelRatio,
            system_language: system_info.language,
            error_log: msg
          }
        });
      }
    });
  },
  setMember:function(data){
    var that = this;
    if(!data || typeof data !='object')return;
    if(!that.globalData.member){
        that.globalData.member = {};
    }
    for(let k in data){
        that.globalData.member[k] = data[k];
    }
  },
  getMember: function (cb, is_retry) {
    var that = this
    var _do_login = function () {
      wx.login({
        success: function (res) {
          console.info('login success:');
          var code = res.code;
          console.info(res);
          console.info('new auth code:' + code);
          if (code) {
            wx.getUserInfo({
              withCredentials:true,//强制携带登陆信息
              success: function (res) {
                //已主动授权过的直接走这里，未主动授权过的走fail 流程
                console.info('getUserInfo success:');
                console.info(res);
                let _set = res.userInfo;
                    _set['signature'] = res.signature;
                    _set['encryptedData'] = res.encryptedData;
                    _set['iv'] = res.iv;
                    _set['code'] = code;
                    _set['signature'] = res.signature;
                that.setMember(_set);
                typeof cb == "function" && cb(that.globalData.member)
              },
              fail: function (res) {
                //未授权过
                console.info('getUserInfo fail:');
                console.info(res);
                let current_page = getCurrentPage();
                let current_page_url = current_page['current_page_url'];
                let current_pages_length = current_page['pages_length'];
                console.info(current_page);
                var redirect_url = '/pages/member/login/oauth?callback='+encodeURIComponent(current_page_url);
                if(current_pages_length<2){
                    //root page
                    console.info('from root page');
                    redirect_url+='&from_root_page=true';
                }
                wx.redirectTo({
                    'url':redirect_url
                });
              }
            });
          }
        },
        fail: function (res) {
          that.globalData.member = null;
          console.info('login fail:');
          console.info(res);

        }
      });
    };
    wx.checkSession({
      success: function () {
        if (that.globalData.member && that.globalData.member.member_id && that.globalData.member.openid) {
          console.info('globalData  cache:');
          console.info(that.globalData.member);
          typeof cb == "function" && cb(that.globalData.member);
        } else {
          //调用登录接口
          _do_login();
        }
      },
      fail: function () {
        _do_login();
      }
    });
  },
  globalData: {
    member: null,
    themecolor: {
      "text_primary": "#333333",
      "text_info": "#999999",
      "price_text": "#ff0000",
      "foot_bar_bg": "#efefef",
      "foot_bar_icon_text": "#999999",
      "popup_color": "#e64340",
      "buynow_color": "#e64340",
      "addcart_color": "#1aad19",
      "storerare_color": "#ec8b89",
      "buynow_text_color": "#ffffff",
      "addcart_text_color": "#ffffff",
      "storerare_text_color": "#ffffff",
      "buysingle_color": "#ffb800",
      "opengroup_color": "#f83d38",
      "ordercash_color": "#e64340",
      "buysingle_text_color": "#ffffff",
      "opengroup_text_color": "#ffffff",
      "ordercash_text_color": "#ffffff",
      "cart_checkouticon_color": "#e64340",
      "cart_footbg_color": "#000000",
      "cart_foottext_color": "#ffffff",
      "cart_footprice_color": "#ff9900",
      "cart_checkout_color": "#e64340",
      "cart_checkouttext_color": "#ffffff",
      "form_submit_color": "#1aad19",
      "form_submittext_color": "#ffffff",
      "sure_submit_color": "#e64340",
      "sure_submittext_color": "#ffffff",
      "checkbox_checked_color": "#1aad19",
      "success_icon_color": "#1aad19",
      "success_btn_color": "#1aad19"
    },
    msg_templates: {},
    timer:''
  }
});