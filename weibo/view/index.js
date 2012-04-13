
function idFrom(jqid){
	var e = $(jqid);
	if(! e || inviteH == 'undefined')
		e = $(jqid,window.parent.document);
	return e;
}
var inviteCallBack;
function inviteFriends(param, callBack) {
	var max;
	var exclude;
	var type;
	var wind;
	try {
		type = param.type;
		max = param.max || "";
		exclude = param.exclude || "";

	} catch (e) {
	}
	
	inviteCallBack = callBack;

	var div =  idFrom("#tabs");
	var inviteH = idFrom("#invite");
	try {
		navigateTo(inviteH.attr('href'));
		div.children('a').removeClass('active');
		div.children('li').removeClass('active');
		inviteH.addClass('active');
		return false;
	} catch (e) {
	}
	return false;
}

function chooseGift(callBack){
	var div =  idFrom("#tabs");
	var freeGift = idFrom("#freeGift");
	try {
		navigateTo(freeGift.attr('href'));
		div.children('a').removeClass('active');
		div.children('li').removeClass('active');
		freeGift.addClass('active');
		return false;
	} catch (e) {
	}
	return false;
	
}

function sendGift(giftid,callBack){
	var div =  idFrom("#tabs");
	var inviteH = idFrom("#invite");
	try {
		var g = isBlank(giftid)?'':'?gift='+giftid;
		navigateTo(inviteH.attr('href')+g);
		div.children('a').removeClass('active');
		div.children('li').removeClass('active');
		inviteH.addClass('active');
		return false;
	} catch (e) {
	}
	return false;
}
function isBlank(str) {
	return  !str;
}

var cached_publish_stream = false;

var param;
var feedCall;



function feedPublishCallback(response){
	var pub = 1;
	if(!response) pub = 0;
	if(pub==1){
		
		var k='';
		if(param['ext']['feedtype']==2){
			k = '&ot='+param['task'];
		}else if(param['ext']['feedtype']==3){
			k = '&ot='+ param['gift'];
		}
		else if(param['ext']['feedtype']==4){
			k = '&ot='+param['ext']['oid']+'&frd='+param['ext']['uid'];
		}
		var pid = param['ext']['uid'];
		if(param['ext']['frd']){
			pid = param['ext']['frd'];
		}
		$.ajax({
			type: 'POST',
			url: '../pop/storeFeed.php',
			data:'type='+param['ext']['feedtype']+'&fid='+param['fid']+k+'&pid='+ pid,
			success: function(){}
		});
	}
	if(pub==1){
		try{
			feedCall('ok');
			}catch(e){}
	}
	
}


/**
 * 响应tab切换
 * **/
var appFrame, flashFrame, loadingFrame, htmlFrame, iframe, oldIframe, tabs, flashTab, preloadedUrls = {}, needToRestore;
var cleanup = function() {
	if(oldIframe)
	oldIframe.remove();
};

var hideFlash = function() {
	if(document.getElementById('flash_run_id')){
		try{
		document.getElementById('flash_run_id').shutDownMusic();
		}catch(e){}
	}
	window.location.hash = '#notOnFlash';
	flashFrame.addClass('offscreen');
	
};

var hideHtml = function() {htmlFrame.addClass('offscreen'); if(oldIframe)
	oldIframe.remove();};
var hideLoading = function() {loadingFrame.hide();};

var showHtml = function() {
	hideLoading();
	hideFlash();
	htmlFrame.removeClass('offscreen');
	appFrame.removeClass('flashVisible');
};

var showLoading = function() {
	hideHtml();
	hideFlash();
	loadingFrame.show();
	//loadingFrame.removeClass('offscreen');
	
	appFrame.removeClass('flashVisible');
};

var showFlash = function() {
	try{
		var fp=document.getElementById('flashapp') 
		fb && fp.turnOnMusic && fp.turnOnMusic();
		document.getElementById('flashapp')
	}catch(e){}
	hideHtml();
	hideLoading();
	flashFrame.removeClass('offscreen');
	flashFrame.show();
	appFrame.addClass('flashVisible');
	oldIframe = iframe;
	iframe = false;
	tabs.children('a').removeClass('active');
	flashTab.children('a').addClass('active');
	setTimeout(cleanup, 500);
};

var interval, innerDoc, lastHeight;

var innerIFramePoller = function() {

	try {
		if (iframe == null || (iframe[0].contentWindow && iframe[0].contentWindow.location.hash == "#switchToFlash")) {
		  iframe && iframe.unbind('load', iframeLoaded);
			showFlash();
			clearInterval(interval);
			interval = null;
			if (iframe)
			iframe[0].contentWindow.location.hash = '#switched';
		} else {
			if (!innerDoc || lastHeight == null || lastHeight == 0) {
				try{
				innerDoc = $(iframe[0].contentWindow.document.body);
				}catch(e){}
			}
			
			var height = innerDoc.outerHeight();
			if (height != lastHeight|| height ==0) {
				iframe.height(height+200);
				lastHeight = height;
			}
		}
	} catch(e) {
	}

};

var iframeLoaded = function() {
	iframe && iframe.unbind('load', iframeLoaded);
	showHtml();
};



var getUrlParamStr = function (){
	var qs=window.location.href.indexOf('?'),
	ret = '';
	if(qs>-1)
		ret  = window.location.href.slice(qs + 1);
	return ret;
}


var urlParamStr = getUrlParamStr(); 
var navigateTo = function(url) {
	if (url.match(/^#switchToFlash/)) {
		switchToFlash();
		return;
	}

	setupElements();
	showLoading();
	if (!iframe) {
		document.getElementById("htmlFrame").innerHTML = "";
		iframe = createIframe().appendTo(htmlFrame);
	}
	iframe.load(iframeLoaded);
	var nurl = url;
	if(url.indexOf('?') < 0)
		nurl += '?';
    nurl += '&pid='+pid + '&_cid='+_cid + '&' + urlParamStr;
	iframe.attr('src', nurl);     
	console.log('nurl=',nurl);
	innerDoc = null; lastHeight = 0;
	interval = setInterval(innerIFramePoller, 500);
	return false;
};

var switchToFlash = function() {
	interval && clearInterval(interval);
	interval = null;
	showFlash();
};

var preloadFuncs = [];
var preloadUrl = function(url) {
	var preloader = function(){
		var preloadedFrame = createIframe();
		preloadedFrame.addClass('preloaded').attr('src', prepUrl(url)).appendTo(htmlFrame).load(function() {
			preloadedUrls[url] = preloadedFrame;
		});
	};

	if(preloadFuncs.push){
		preloadFuncs.push(preloader);
	}	
};

var createIframe = function() {
	return $("<iframe/>", {scrolling: 'no', border: '0', frameborder: '0', height: '0'});
};

var setupElements = function() {
	appFrame = $('#appFrame');
	flashFrame = $('#flashFrame');
	loadingFrame = $('#loadingFrame');
	htmlFrame = $('#htmlFrame');
	flashTab = $('#flashTab');
};


function sendRequest(isSendToMany, toId) {

}


$(document).ready(
		function(){
	/** Opens an overlaying iframe */
	//(function() {
		
		var goTo  = function(el){
		 	if (!el.is('a')) {
				el = el.parents('a');
			}
			console.log('goTo = ',el.attr('href'));
			navigateTo(el.attr('href'));
			tabs.children('a').removeClass('active');
			el.addClass('active'); 
			
		};
		
		var tabClick = function(e) {
            if (e && e.target) {
				var el = $(e.target);
				goTo(el);
				return false;
			}
			return false;
		};

		
		$(function() {
		   tabs = $('#tabs li');
			tabs.children('a').not('.fullpage').click(tabClick);
			setupElements();

			$('#invite').click(sendRequest);

		});
		
		$(function() { 
	      if(a == 'invite' || a == 'freeGift'  || a == 'faq'){
		    tabs = $('#tabs li');
			var link = $("#"+a);
			goTo(link);
		  }
		});

	//})();

});

var snsapi={
	config:{
		appid:_app_id
		//,appkey:_app_key
	},
    loadConfig:function(param){
        this.config = param;
    }


	//call_in flash
	//
	//
    ,run:function(param){
		console.log('snsapi.run',param);
        var action = param.action;
        this[action] && this[action](param);
    }

    ,invite:function(param){
		console.log('snsapi.invite',param);
    }
    ,request:function(param){
		console.log('snsapi.request',param);
    }
    ,gift:function(param){
    }
    ,pay:function(param){

    }

    ,feed:function(param){
        /*
        // 默认发送feed之后有奖励
        var sent_award = param.sent_award || true;
        var content = (typeof param.content =='undefined')?'　':param.content;
        var visiter_pids = (typeof param.visiter_pids == 'undefined')?[]:param.visiter_pids;
		var fid =  param && param.feedid;
		var fconf = _FEEDS[fid];
		var _replacetxt = function(txt,param){
			var i,exp,j,ret = txt
			for( i = 0; i< param.users.length ; i++){
				j = i+1;
				exp = '#'+j;
				ret = ret.replace(new RegExp(exp,'g'),param.users[i].name);
			}
			return ret;
		}
		if(fconf){
        if(typeof param.callback=='undefined'){
            var sent_callback = function(feed_token){
                if(sent_award){
                    $.post(snsapi.config.js_api_url
                            ,{action:'feed_sent',uid:snsapi.config.uid,token:snsapi.config.token,feed_token:feed_token}
                            ,function(data){
                                if(data.s==1){
                                    var flashapp = getFlashMovieObject("flashapp");
                                    flashapp.hosterGetItem({from:'snsapi.feed',gain:data.gain,cost:data.cost,award:data.award});
                                }
                            },'json');
                }
            }
        }else{
            var sent_callback = param.callback;
        }
        var p = {action:'feed',uid:pid,token:this.config.token,tag:param.tag,visiter_pids:visiter_pids};
        if(param.level) p.level = param.level;
        if(param.ext && param.ext.scene_id) p.scene_id = param.ext.scene_id;
        if(param.ext && param.ext.object_id) p.object_id = param.ext.object_id;
        $.post(this.config.js_api_url,p,function(data){
            if(data.s==1){
                var url = snsapi.config.canvas_url+'?ss='+data.feed_id;
                if(param.adtag){
                    url += '&adtag='+param.adtag;
                }
                var pics = snsapi.config.common_resource_url+param.img;
                var feed_token = data.feed_token;
                var wb_param = {
                    method:'sendWeibo'
            ,params:{
                appId:snsapi.config.appid
            ,title:param.caption
            ,content:content
            ,actionText:param.actionLinkName
            ,templateContent:param.description
            ,link:snsapi.config.canvas_url
            ,actionUrl:url
            ,imageUrl:pics
            }
                };
                WYX.Connect.send(wb_param,function(data){
                    if(data=='true'){
                        sent_callback(feed_token);
                    }
                });
            }else{
                console.log(data.msg);
            }
        },'json');
        */
    }
    ,share:function(param){
    }
}

