//gallery.js
//商品列表页
const config = require('../../config/config.js');
const util = require('../../utils/util.js');

Page({
    onReady: function() {
        var _this = this;
        wx.setNavigationBarTitle({
            title: '商品分类'
        });
        wx.getSystemInfo({
            success: function(res) {
                console.info(res);
                _this.setData({
                    cr_height: res.windowHeight - 46
                });
            }
        });
    },
    onLoad: function() {
        var _this = this;
        util.wxRequest({
            url: config.BASE_URL + '/m/category.html',
            success: function(res) {
                _this.setData(res.data);
                _this.setData({
                    cvisible: res.data.category_tree[0].cat_id
                });
            },complete:function(){
                _this.setData({
                    hideLoading:true
                });
            }
        });
    },
    load_image: function(e) {
        var image_id = e.currentTarget.dataset.ident;
        util.loadImage(this, image_id, 'o');
    },
    evt_cactive: function(e) {
        this.setData({
            cvisible: e.currentTarget.dataset.id
        });
    },
    clearInput: function() {
        this.setData({
            inputVal: ""
        });
        var filter = this.data.filter;
        if (!filter || filter['keyword'] == '') {
            return;
        }
        delete(filter['keyword']);
        this.setData({
            'filter': filter
        });
        load_list.call(this, 1);
    },
    inputTyping: function(e) {
        this.setData({
            inputVal: e.detail.value
        });
    },
    confirmInput: function(e) {
      wx.navigateTo({
        url: '/pages/gallery/gallery?keyword=' + (this.data.inputVal ? this.data.inputVal:'')
      });
    },
    evt_goto: function(e) {
        wx.navigateTo({
            url: e.currentTarget.dataset.url
        });
    }
});
