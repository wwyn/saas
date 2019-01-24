const pageOptions = require('../../index/_index.js');
pageOptions.getTabParams4 = function () {
  let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {};
  if (extConfig != {}) {
    if (extConfig.tabs['tab_4']) {
      this.setData({
        options: extConfig.tabs['tab_4'].pageParams
      })
    }

  }
}
Page(pageOptions);