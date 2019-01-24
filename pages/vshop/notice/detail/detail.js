const config = require('../../../../config/config.js');
const util = require('../../../../utils/util.js');
const WxParse = require('../../../../utils/wxParse/wxParse.js');
const dateFormat = require('../../../../utils/dateformat.js');

Page({
    data: {
      success: true,
    },
    onLoad: function(options) {
        var _this = this;
        var notice_id = options.notice_id;
        this.setData(options);
        util.checkMember.call(this, function() {
            util.wxRequest({
                url: config.BASE_URL + '/m/vshop-notice-'+notice_id+'.html',
                success: function(res) {
                    var pagedata = res.data;
                    if (pagedata.notice) {
                      pagedata.notice.last_modify = dateFormat(parseInt(pagedata.notice.last_modify) * 1000, 'yyyy-mm-dd HH:MM:ss');
                      WxParse.wxParse('notice_content', 'html', pagedata.notice.content, _this, 0);
                      wx.setNavigationBarTitle({
                        title: pagedata.notice.title
                      });
                      _this.setData(pagedata);
                    } else {
                      _this.setData({
                        success: false
                      })
                    }
                    
                },
                complete:function(){
                    _this.setData({hideLoading:true});
                }
            });
        });
    }
});
