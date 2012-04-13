
var snsapi = snsapi || {}
//发feed
snsapi.feed=function(param){
	param = param || {}
	var wb_param = {
		method:'sendWeibo'
		,params:{
			appId:_CONFIG.appid
			,title: param.title || '冒险大陆新纪元！' 
			,content:  param.content ||' 太精彩了'
			,actionText:'体验一把'
			,templateContent: param.tcontent ||'实在太精彩了' 
			,link:_CONFIG.canvas_url 
			,actionUrl:_CONFIG.canvas_url 
			,imageUrl: param.pics || _CONFIG.rurl+'/assets/images/apple-touch-icon-114x114.png'
		}
	};
	WYX.Connect.send(wb_param,function(data){

	});

}
