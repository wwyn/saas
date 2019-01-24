const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
const app = getApp();
var current_page = 1;
var loading_more = false;
var load_list = function(page) {
    loading_more = true;
    var _this = this;
    var page = page ? page : 1;
    util.wxRequest({
        url: config.BASE_URL + '/m/my-integral-' + page + '.html',
        success: function(res) {
            var newdata = res.data;
            var _thisdata = _this.data;
            if (newdata) {
                if (_thisdata.integral_list && page > 1) {
                    newdata.integral_list = _thisdata.integral_list.concat(newdata.integral_list);
                }
                if (!newdata.integral_list || !newdata.integral_list.length) {
                    newdata.empty_list = 'YES';
                } else {
                    newdata.empty_list = 'NO';
                }
                _this.setData(newdata);
            }
        },
        complete:function(){
            loading_more = false;
            _this.setData({
                hideLoading:true
            });
        }
    });
};
Page({
    data: {
        reason_map: {
            'order': '下单',
            'refund': '退款',
            'recharge': '充值',
            'exchange': '兑换',
            'deduction': '抵扣',
            'sign': '签到',
            'comment': '评价',
            'commission': '分佣'
        }
    },
    onReady: function() {
        wx.setNavigationBarTitle({
            title: '我的积分'
        });
    },
    onLoad: function(options) {
        var _this = this;
        wx.getSystemInfo({
            success: function(res) {
                _this.setData({
                    sv_height: res.windowHeight,
                });
            }
        });
        util.checkMember.call(this, function() {
            util.wxRequest({
                url: config.BASE_URL + '/m/my-integral.html',
                success: function(res) {
                    var pagedata = res.data;
                    load_list.call(_this);
                }
            });
        });
    },
    evt_scrolltolower: function(e) {
        if (loading_more || this.data.pager.total == this.data.pager.current) {
            return;
        }
        current_page += 1;
        load_list.call(this, current_page);
    },
    evt_changealert:function(e){
        var dataset = e.currentTarget.dataset;
    }
});
