const config = require('../../../../config/config.js');
const util = require('../../../../utils/util.js');
// var QRcode = require('../../../../utils/qrcode.js');
Page({
    data: {
    },
    onReady: function() {
        wx.setNavigationBarTitle({
            title: "邀请同事加入"
        });
    },
    onLoad: function(options) {
        var _this = this;
        var sysinfo = wx.getSystemInfoSync(),win_width = sysinfo.windowWidth;
        this.setData({
            win_width:win_width
        })
        util.checkMember.call(this, function() {
            util.wxRequest({
                url: config.BASE_URL + '/m/o2ocds-myqrcode.html',
                success: function(res) {
                    var pagedata = res.data.data;
                    _this.setData(pagedata);
                    wx.showToast({
                        icon:'loading',
                        duration:5000
                    });
                    util.getqrcode({
                        'path': '/pages/oshop/my/bind/relation?relation_encode='+pagedata.relation_data_encrypt,
                        'type': 'scene',
                        'width': 430
                    }, function(qr_image_data) {
                        wx.hideToast();
                        _this.setData({
                            qrcode_image_url:qr_image_data.qrcode_image_url
                        });
                    });
                },
                complete: function() {
                    _this.setData({
                        hideLoading:true
                    });
                }
            });
        });

    }
});
