const pageOptions = require('../../index/_index.js');
pageOptions.getTabParams = function(){
	let extConfig = wx.getExtConfigSync? wx.getExtConfigSync(): {};
	if(extConfig != {}){
		this.setData({
			options:{
				s:extConfig.tabs['tab_1']
			}
		})
	}
	
}
Page(pageOptions);