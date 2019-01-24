const pageOptions = require('../../index/_index.js');
pageOptions.getTabParams5 = function () {
  let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {};
  if (extConfig != {}) {
    if (extConfig.tabs['tab_5']) {
      this.setData({
        options: extConfig.tabs['tab_5'].pageParams
      })
    }

  }
}
Page(pageOptions);
