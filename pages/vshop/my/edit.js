// pages/member/information/information.js
const config = require('../../../config/config.js');
const util = require('../../../utils/util.js');
const app = getApp();


var format_region_data = function (region_data) {
  if (!region_data || region_data.length < 1) {
    return [];
  }
  var _return = [];
  for (var i = 0; i < region_data.length; i++) {
    var rd = region_data[i],
      rd = rd.split(':');
    _return.push({
      'text': rd[0],
      'value': rd[1],
      'c_idx': rd[2]
    });
  }
  return _return;
}

var init_region = function (path = [0, 0, 0]) {
  var _this = this;

  util.getRegionData([1, path[0]], function (data) {
    // console.info(data);
    let _data = format_region_data(data);
    _this.setData({
      'region_data.second': _data,
    });
    try {
      var child_index = _data[path[1]]['c_idx'];
    } catch (e) {
      child_index = _data[0]['c_idx'];
    }
    util.getRegionData([2, child_index], function (data) {
      _this.setData({
        'region_data.third': format_region_data(data),
      });
    });
  });
};


var get_region_val = function () {
  var region_val = 'mainland:',
    region_val_arr = [],
    rl = ['first', 'second', 'third'],
    region_data = this.data.region_data,
    selected_region = this.data.selected_region;
  //filter
  for (var i = 0; i < rl.length; i++) {
    if (region_data[rl[i]].length && region_data[rl[i]][selected_region[i]]) {
      region_val_arr.push(region_data[rl[i]][selected_region[i]]);
    }
  }
  for (var i = 0; i < region_val_arr.length; i++) {
    var loop = region_val_arr[i];
    if (i == region_val_arr.length - 1) {
      region_val += loop['text'] + ':' + loop['value'];
    } else {
      region_val += loop['text'] + '/';
    }
  }
  return region_val;
}

var set_region_val = function (val) {
  if (!val) return;
  console.info(val);
  var val = val.split(':'),
    text_path = val[1].split('/'),
    rl = ['first', 'second', 'third'],
    sr = [0, 0, 0];
  for (var i = 0; i < text_path.length; i++) {
    if (!rl[i]) {
      continue;
    }
    var lv = this.data.region_data[rl[i]];
    for (var j = 0; j < lv.length; j++) {
      if (lv[j].text == text_path[i]) {
        sr[i] = j;
        //console.info(sr);
        init_region.call(this, sr);
        break;
      }
    }
  };

  this.setData({
    "selected_region": sr
  });

}


Page({

  /**
   * 页面的初始数据
   */
  data: {
    img_url: config.BASE_URL,
    selected_region: [0, 0, 0]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this;
    util.checkMember.call(this, function () {
      util.wxRequest({
        url: config.BASE_URL + '/m/vshop-set_info.html',
        success: function (res) {
           _this.setData(res.data);
           if(res.data.agent){
              _this.setData({
                  agentAddress:res.data.agent.address,
                  agentRegion: res.data.agent.region,
              })
             util.getRegionData([0, 0], function (data) {
               var region_dataset = format_region_data(data);
               _this.setData({
                 'region_data.first': region_dataset
               });
               if (res.data.agent.region) {
                 set_region_val.call(_this, res.data.agent.region);
               } else {
                 init_region.call(_this);
               }
             });
           }
            if (res.data.vshop) {
              _this.setData({
                shopname: res.data.vshop.name,
                vshoplogo: res.data.vshop.logo
              })
            }
        },
        complete: function () {
          wx.stopPullDownRefresh();
          _this.setData({
            hideLoading: true
          });
        }
      });
    });
    
  },
  // 上传头像
  load_image: function (e) {
    util.loadImage(this, e.currentTarget.dataset.ident, 'm');
  },
  evt_regionchange: function (e) {
    if (!this.data.region_data || !this.data.region_data.first || !this.data.region_data.first.length || e.timeStamp < 700) {
      return;
    }
    console.log('修改地址');
    var path = e.detail.value;
    if (path[0] != this.data.selected_region[0]) {
      path[1] = 0;
      path[2] = 0;
    }
    if (path[1] != this.data.selected_region[1]) {
      path[2] = 0;
    }
    init_region.call(this, path);
    this.setData({
      selected_region: path
    });
    //this.data.maddr.area = get_region_val.call(this);

  },
  evt_mess:function(e){
      let type = e.currentTarget.dataset.type;
      let str = 'edit'+type;
      let _set = {};
      _set[str] = true;
      this.setData({
        editMess:true,
        editname:false,
        editaddress:false,
        editarea:false,
        editlogo: false
      })
      this.setData(_set);
    
  },
  close_mess: function (e) {
    let changetype = e.currentTarget.dataset.type;
    let _this = this;
    this.setData({
        editMess: false
    })
    if (changetype == 'name') {
        _this.setData({
          shopname: this.data.vshop.name
        })
    } else if (changetype == 'logo') {
        _this.setData({
          vshoplogo: _this.data.vshop.logo
        })
    } else if (changetype == 'region') {
        _this.setData({
          agentRegion: _this.data.agent.region
        })
        if (_this.data.agent.region) {
          set_region_val.call(_this, _this.data.agent.region);
        } else {
          init_region.call(_this);
        }
    } else if (changetype == 'address') {
        _this.setData({
          agentAddress: _this.data.agent.address
        })
    }
    
  },
  evt_chgavatar: function (e) {
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
            console.log("res", res)
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
            console.log(image_id)
            _this.setData({
              'vshoplogo': image_id
            });
          },
          complete: function (e) {
            // wx.hideToast();
            util.wxRequest({
              url: config.BASE_URL + '/m/my.html',
              success: function (res) {
                console.log(res)
              }
            })
            wx.hideToast();
          }
        })
      }
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.setNavigationBarTitle({
      title: '个人信息',
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    let options = {};
    this.onLoad(options)
  },
  //修改信息
  insertMess:function(e){
    let inserttype = e.currentTarget.dataset.type;
    if (inserttype == 'name') {
      this.setData({
        shopname:e.detail.value
      })
    } else if (inserttype == 'address') {
      this.setData({
        agentAddress: e.detail.value
      })
    }
  },
  //修改个人信息
  evt_operate:function(e){
    let changetype = e.currentTarget.dataset.type;
      let _this = this;
      let submitdata = {};
      if (changetype == 'name'){
          submitdata['name'] = this.data.shopname;
      } else if (changetype == 'logo'){
          submitdata['logo'] = this.data.vshoplogo;
      } else if (changetype == 'region'){
          _this.setData({
            vshopregion:get_region_val.call(_this)
          })
          submitdata['region'] = this.data.vshopregion;
      } else if (changetype == 'address'){
          submitdata['address'] = this.data.agentAddress;
      }
      util.checkMember.call(this, function () {
        util.wxRequest({
          url: config.BASE_URL + '/m/vshop-set_info-save.html',
          method:'post',
          data:submitdata,
          success: function (res) {
              if(res.data.success){
                  _this.setData({
                    editMess:false
                  })
                if (changetype == 'name') {
                  _this.setData({
                    'vshop.name': _this.data.shopname
                  })
                } else if (changetype == 'logo') {
                  _this.setData({
                    'vshop.logo': _this.data.vshoplogo
                  })
                } else if (changetype == 'region') {
                  _this.setData({
                    'agent.region': _this.data.vshopregion
                  })
                } else if (changetype == 'address') {
                  _this.setData({
                    'agent.address': _this.data.agentAddress
                  })
                }
              }
          },
          complete: function () {
            wx.stopPullDownRefresh();
            _this.setData({
              hideLoading: true
            });
          }
        });
      })
  }
})