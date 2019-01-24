// pages/mystore/register/index.js
const config = require('../../../../config/config.js');
const util = require('../../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    img_url:config.BASE_HOST,
    classifyList: [{ title: '个人店铺', value: 'individual', url1: '/public/wechat/vshop/person_fill.png', url2: '/public/wechat/vshop/person.png' }, { title: '企业店铺', value: 'enterprise', url1: '/public/wechat/vshop/manage_fill.png', url2: '/public/wechat/vshop/manage.png' }],
    idx: '',
    agent_type: 'individual',
    success: false,
    IDurl: '',
    repetitive: false,
    // right: false
  },
  //修改值
  evt_input:function(e){
      let valuetype = e.currentTarget.dataset.type;
      let _set = {};
      _set[valuetype] = e.detail.value;
      this.setData(_set);
  },
  evt_submit:function(){
      let submitdata = {};
      let _this = this;
      let _vshop_id = wx.getStorageSync('_vshop_id');
      if(_vshop_id){
        submitdata['_vshop_id'] = _vshop_id;
      } 
      if (this.data.is_agent){
        submitdata['agent_type'] = _this.data.agent_type;
        submitdata['shop_name'] = _this.data.shopname;
        submitdata['agent_name'] = _this.data.shopkeeper;
        if (_this.data.agent_type == 'individual'){
          submitdata['idcard'] = _this.data.idcard;
          submitdata['idcard_front_image_id'] = _this.data.idcard_img;
        }else{
          submitdata['ent_credit_code'] = _this.data.idcard;
          submitdata['brand_auth_img'] = _this.data.brand_img;
          submitdata['biz_license_img'] = _this.data.licence_img;
        }
      }else{
        submitdata['name'] = _this.data.shopname;
        submitdata['shopkeeper'] = _this.data.shopkeeper;
        submitdata['idcard'] = _this.data.idcard;
        submitdata['idcard_front_image_id'] = _this.data.idcard_img;
      }
    for (let i in submitdata){
      if (!submitdata[i]){
        wx.showModal({
          title: '温馨提示',
          content: '请完善入驻信息',
          showCancel:false,
          confirmColor: '#6699FF'
        })
        return;
      }
    }
      wx.showToast({
          icon: "loading",
          title: "正在上传"
      })
      console.log('form发生了submit事件，携带数据为：', submitdata)
      // wx.navigateTo({
      //     url: '/pages/mystore/audit/index',
      // })
      util.checkMember.call(_this,function(){
          util.wxRequest({
              url: config.BASE_URL + '/m/vshop-info-save.html',
              method: 'POST',
              data:submitdata,
              success: function (res) {
                  if(res.data.error){
                      wx.showModal({
                        title: '温馨提示',
                        content: res.data.error||'',
                        showCancel:false,
                        confirmColor:'#6699FF'
                      })
                  }else{
                    wx.setStorageSync('is_reload_vshop', 'true');
                    wx.navigateBack({
                      
                    })
                  }
              },
              complete:function(){
                wx.hideLoading();
              }
          })
      })

  },
  //申请信息
  classifySelected: function (e) {
    let idx = e.currentTarget.dataset.index;
    let item = e.currentTarget.dataset.item;
    console.log(item)
    this.setData({
      idx,
      agent_type: item.value,
      idcard:''
    })
  },
  uploadIDimage: function (e) {
    let imgtype = e.currentTarget.dataset.type;
    var _this = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        var tempFilePaths = res.tempFilePaths;
        if (!tempFilePaths[0]) {
          return;
        }
        wx.showToast({
          icon: 'loading',
          mask: true,
          content: '上传中',
          duration: 50000
        });
        util.wxUpload({
          url: config.BASE_URL + '/m/imagemanage-wx_upload.html',
          filePath: tempFilePaths[0],
          name: 'file',
          success: function (res) {
            if (res.data == '') {
              wx.showModal({
                title: '上传失败',
                content: '图片上传失败,请重试',
                showCancel: false
              })
              return;
            };
            var data = JSON.parse(res.data);
            var image_id = data.image_id;
            let img = imgtype+'_img';
            let _set = {};
            _set[img] = image_id
            _this.setData(_set);
          },
          complete: function (e) {
            wx.hideToast();
          }
        })
      }
    });
  },
  upload: function (page, path) {
    wx.showToast({
      icon: "loading",
      title: "正在上传"
    }),
      wx.uploadFile({
        url: config.SERVER_URL + "",//后台接口
        filePath: path,
        name: 'file',
        header: { "Content-Type": "multipart/form-data" },
        formData: {
          //和服务器约定的token, 一般也可以放在header中
          // 'session_token': wx.getStorageSync('session_token')
        },
        success: function (res) {
          console.log(res);
          if (res.statusCode != 200) {
            wx.showModal({
              title: '提示',
              content: '上传失败',
              showCancel: false
            })
            return;
          }
          var data = res.data
          this.setData({  //上传成功
            IDurl: data,
          })
        },
        fail: function (e) {
          console.log(e);
          wx.showModal({
            title: '提示',
            content: '上传失败',
            showCancel: false
          })
        },
        complete: function () {
        }
      })
  },
  load_image: function (e) {
    util.loadImage(this, e.currentTarget.dataset.ident, 'm');
  },
  onLoad:function(){
    let pages = getCurrentPages(); //获取加载的页面
    let lastpage = pages[pages.length - 2]; //获取当前页面的对象
    let initdata = lastpage.data;
    this.setData({
      is_agent: (!lastpage.data.from_vshop['shop_id'] && !lastpage.data.vshop)||lastpage.data.agent?true:false
    })
    if (this.data.is_agent){
        if (initdata.agent && initdata.agent['agent_id']) {
            this.setData({
              agent_type: initdata.agent.agent_type,
              shopname: initdata.agent.shop_name,
              shopkeeper: initdata.agent.agent_name
            })
            if (initdata.agent.agent_type == 'individual'){
                this.setData({
                  idcard: initdata.agent.id_card,
                  idcard_img: initdata.agent.id_card_img
                })
            }else{
              this.setData({
                idcard: initdata.agent.ent_credit_code,
                brand_img: initdata.agent.brand_auth_img,
                licence_img: initdata.agent.biz_license_img
              })
            }
        } else if (initdata.agent && !initdata.agent['agent_id']) {
          this.setData({
            shopname: initdata.agent.shop_name
          })
        }
    }else{
        if (initdata.vshop){
            this.setData({
              shopname: initdata.vshop.name,
              shopkeeper: initdata.vshop.shopkeeper,
              idcard: initdata.vshop.idcard,
              idcard_img: initdata.vshop.idcard_front_image_id
            })
        }
    }
  }
})