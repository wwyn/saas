const config = require('../../../../config/config.js');
const util = require('../../../../utils/util.js');
// var md5 = require('../../../../utils/md5.js');

Page({
    data: {

    },
    onReady: function() {
        // var _this = this;
        wx.setNavigationBarTitle({
            title: '即兴拍摄'
        });
        wx.getSystemInfo({
            success: function(res) {
                _this.setData({
                    win_height: res.windowHeight,
                    win_width: res.windowWidth
                });
            }
        });
    },
    onLoad: function(options) {
        
    }
});
