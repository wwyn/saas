// pages/vstore/agree/agree.js

const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    let pages = getCurrentPages(); //获取加载的页面
    let lastpage = pages[pages.length - 2]; //获取当前页面的对象
    let initdata = lastpage.data;
    this.setData({
      is_agent: (!lastpage.data.from_vshop['shop_id'] && !lastpage.data.vshop) || lastpage.data.agent ? true : false,
      agreement: initdata.agreement,
      hideLoading:true
    })
  },
  consent:function(){
    let pages = getCurrentPages(); //获取加载的页面
    let lastpage = pages[pages.length - 2]; //获取当前页面的对象
    wx.navigateBack({
      success:function(){
        lastpage.setData({
          checked: true
        })
      }
    })
  }
})