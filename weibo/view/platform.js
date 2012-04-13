
snsapi = snsapi || {}
snsapi.config = _CONFIG


snsapi.pay=function(param){
    alert('暂未开放');
    return false;
    var payment_div = $('<ul id="payDivID" style="height:300px;" ></ul>');
    $.each(_PAYMENTS,function(option_id,item){
        item = _PAYMENTS[option_id];
        console.log(option_id,item);
        $('<li class="btn_payment" option_id="{option_id}" style="float:left;width:150px;"><img src={urlp}/images/pay/{image} </li>'.format({urlp:_CONFIG.resource_url,option_id:option_id,image:item.img})).appendTo(payment_div);
    });
    snsapi.dialog(payment_div,{top:0});
    $('#payDivID .btn_payment').click(function(){
        sina_pay($(this).attr('option_id'));
    });
}
function sina_pay(option_id){
    // 如果target不用top的话, 下面不能简单的append,还需要把此前append的form去掉
    $('#payDivID').find('#wyxPay').remove();
    $('#payDivID').append('<form action="{js_api_url}" method="post" target="_blank" style="display:none;" id="wyxPay"><input type="hidden" name="uid" value="{uid}" /><input type="hidden" name="action" value="{action}" /><input type="hidden" name="token" value="{token}" /><input type="hidden" name="option_id" value="{option_id}" /></form>'.format({
        js_api_url:_CONFIG.js_api_url + '&action=sina_pay_submit'
        ,uid:_CONFIG.uid
        ,token:_CONFIG.token
        ,option_id:option_id
    }));
    $('#wyxPay').submit();
    return false;
}
snsapi.feedback=function(param){
}
snsapi.anti_indulgence=function(e){
    var offset = $('#anti_indulgence').offset();
    if(e){
        var idcardno = $(e).closest('table').find('input[name="idcardno"]').val();
        var idcardname = $(e).closest('table').find('input[name="idcardname"]').val();
        if(idcardname.length == 0) {
            alert('请输入合法的姓名');
            return;
        }
        if(idcardno.length != 15 && idcardno.length!=18){
            alert('请输入合法的身份证号码');
            return;
        }
        $.get(_CONFIG.js_api_url,{action:'anti_indulgence',idcardno:idcardno,idcardname:idcardname},function(data){
            console.log(data);
            snsapi.dialog(data,{top:100});
        });
    }else{
        $.get(_CONFIG.js_api_url,{action:'anti_indulgence'},function(data){
            console.log(data);
            snsapi.dialog(data,{top:100});
        });
    }
}
snsapi.feed=function(param){
    // 默认发送feed之后有奖励
    var sent_award = (typeof param.sent_award == 'undefined')?true:param.sent_award;
    var content = (typeof param.content =='undefined')?'　':param.content;
    var visiter_pids = (typeof param.visiter_pids == 'undefined')?[]:param.visiter_pids;
    var fid =  param && param.feedid;
    var fconf = _FEEDS[fid],rettxt,atusers
        var _replacetxt = function(txt,param){
            var i,exp,j
                rettxt = txt
                atusers = '';
            for( i = 0; param.users && i< param.users.length ; i++){
                j = i+1;
                exp = '#'+j;
                rettxt = rettxt.replace(new RegExp(exp,'g'),'@'+ param.users[i].name + ' ');
                atusers += ' @'+param.users[i].name +'('+param.users[i].pid+')';
            }
            return rettxt;
        }
    if(fconf){
        var pics = _CONFIG.resource_url+'/images/feed/feed_'+fid+'.png';
        var wb_param = {
            method:'sendWeibo'
                ,params:{
                    appId:_CONFIG.appid
                        ,title:  _replacetxt(fconf.feedname,param)
                        ,content: /*param.myname +' ' +*/ _replacetxt(fconf.feeddis,param)
                        ,actionText:'赶快加入侠隐传奇'
                        ,templateContent:  _replacetxt(fconf.feedsend,param)
                        ,link:_CONFIG.canvas_url + '?feeid='+fid
                        ,actionUrl:_CONFIG.canvas_url + '?feeid='+fid
                        ,imageUrl:pics
                }
        };
        WYX.Connect.send(wb_param,function(data){
            $('#flash').click();
        });
    }

}
/*
 * 向后台请求，是否有昨天注册了今天还没有登录的玩家，给他们送东西
 */
snsapi.callbackfriend = function(param){
    var p = {action:'callbackfriend',uid:_CONFIG.uid,token:_CONFIG.token};
    $.post(this.config.js_api_url,p,function(data){
        if(data.s==1 && data.user_list && data.user_list.length>0){
            snsapi.random_feed({user_list:data.user_list,type:'callback'});
        }else{
        }
    },'json');
}
/**
 * 随机@玩家
 *
 * @input
 *      type    energy, stamina
 */
snsapi.random_feed=function(param){
    var names = '';
    var visiter_pids = [];
    if(typeof param.user_list=='undefined'){
        param.user_list = config.user_list;
    }else{
        $.merge(param.user_list,config.user_list);
    }
    if(typeof param.type == 'undefined'){
        param.type='energy';
    }
    for(var i=0;i<param.user_list.length;i++){
        if(param.user_list[i].pid!=config.pid){
            if(param.user_list[i].name){
                if(names.length + 2 + param.user_list[i].name.length >50) continue;
                names += ' @'+param.user_list[i].name;
                visiter_pids[visiter_pids.length] = param.user_list[i].pid;
            }
        }
    }
    if(param.type=='energy'){
        var p = {
            action:'feed'
            ,tag:20
            ,img:'image/energy.png'
            ,caption:'大家来互粉吧'
            ,actionLinkName:'点击互得精力卡'
            ,description:names
            ,content:'《我的冒险》真好玩，我需要更多的好友！'
            ,sent_award:false
            ,visiter_pids:visiter_pids
            ,adtag:'cd2'
            ,callback:function(){
                var p= {'action':'log','event':'feed_sent','uid':config.uid,'pid':config.pid,'msg':'cd2 sent'};
                $.get(config.js_api_url,p);
            }
        };
    }else if(param.type=='stamina'){
        p = {
            action:'feed'
            ,tag:21
            ,img:'image/stamina.png'
            ,caption:'大家来互粉吧'
            ,actionLinkName:'点击互得体力卡'
            ,description:names
            ,content:'《我的冒险》真好玩，我需要更多的好友！'
            ,sent_award:false
            ,visiter_pids:visiter_pids
            ,adtag:'cd1'
            ,callback:function(){
                var p= {'action':'log','event':'feed_sent','uid':config.uid,'pid':config.pid,'msg':'cd1 sent'};
                $.get(config.js_api_url,p);
            }
        };
    }else if(param.type=='callback'){
        p = {
            action:'feed'
            ,tag:20
            ,img:'image/energy.png'
            ,caption:'冒险路上有你相伴！'
            ,actionLinkName:'这是你的精力'
            ,description:names
            ,content:'最近冒险耗费了大量精力哦，送点精力给你。'
            ,sent_award:false
            ,visiter_pids:visiter_pids
            ,adtag:'cd3'
            ,callback:function(){
                var p= {'action':'log','event':'feed_sent','uid':config.uid,'pid':config.pid,'msg':'cd3 sent'};
                $.get(config.js_api_url,p);
            }
        };
    }else if(param.type=='event'){
        var wb_param = {
            method:'sendWeibo'
            ,params:{
                appId:_CONFIG.appid
                ,title:'人人都能拿iPhone！'
                ,content:'我在《我的冒险》里拿到了一个抽奖号码，说不定大奖iPhone 4S就是我的啦。'
                ,actionText:'参与iPhone 4S活动'
                ,templateContent:names
                ,link:_CONFIG.canvas_url
                ,actionUrl:_CONFIG.canvas_url
                ,imageUrl:_CONFIG.common_resource_url+'image/feed_iphone4s.png'
            }
        };
        WYX.Connect.send(wb_param,function(data){
            if(data=='true'){
                var p= {'action':'event_share_award','uid':config.uid,'token':config.token};
                $.get(config.js_api_url,p);
            }
        });
        get_friend_list(0);
        return;
    }
    if( snsapi.date().getTime() < snsapi.date(2011,10,18).getTime()){
        if(param.type=='energy'){
            p.actionLinkName = '参与iPhone 4S活动';
            p.content='来玩《我的冒险》，立刻拥有最新的iphone 4S！';
        }else if(param.type=='stamina'){
            p.actionLinkName = '参与iPhone 4S活动';
            p.content='来玩《我的冒险》，立刻拥有最新的iphone 4S！';
        }else if(param.type=='callback'){
            p.actionLinkName = '参与iPhone 4S活动';
            p.content='送点精力给你。玩《我的冒险》，立刻拥有最新的iphone 4S！';
        }
        p.img='image/feed_iphone4s.png';
    }
    snsapi.run(p);
}
$(document).ready(function(){

    WYX.Connect.init();
	return;
    get_friend_list(0);

    $('#nav-weibo').click(function(){window.open('http://weibo.com/wodemaoxian','_blank');return false;});
    //$('#notice_right').append('<iframe width="100%" height="24" frameborder="0" allowtransparency="true" marginwidth="0" marginheight="0" scrolling="no" frameborder="No" border="0" src="http://widget.weibo.com/relationship/followbutton.php?width=100%&height=24&uid=2270850161&style=3&btn=red&dpc=1"></iframe>');
    $('#notice_right').append('<iframe width="136" height="24" frameborder="0" allowtransparency="true" marginwidth="0" marginheight="0" scrolling="no" frameborder="No" border="0" src="http://widget.weibo.com/relationship/followbutton.php?width=136&height=24&uid=2270850161&style=2&btn=red&dpc=1"></iframe>');
});
function get_friend_list(addself){
	return;
    if($('#footer_user_list').children().size()==0){
        config.user_list=[];
        $('#footer_user_list').html(
            "<div id='invite_friend' class='sys_notice' style='display:none;background-color:#FFF;border:0px;margin:0;padding:0 0 0 4px;'>"+
            "<div id='userlist2' style='height:200px; padding:0 0 0 25px; overflow:hidden;'></div>"+
            "<div style='cursor:pointer;height:75px;background: url("+config.common_resource_url+"/image/need_friends.sina.png) no-repeat scroll 0px 0px transparent;' onclick='get_friend_list(1);return false'></div>"+
            "</div>"
        );
    }

    $.get(config.js_api_url,{'action':'userList','uid':config.uid,'pid':config.pid,'token':config.token,addself:addself},function(data){
        if(data.s==1){
            config.user_list=data.user_list;
            var pids = []
            for(var i=0;i<data.user_list.length;i++){
                var user = data.user_list[i];
                pids[i] = user.pid;
            }
            if(pids.length){
                pids = pids.join(',');
                $('#invite_friend').css('display','');
                $('#userlist2').html('');
                $('#userlist2').append('<iframe width="700" scrolling="no" height="200" frameborder="0" src="http://widget.weibo.com/relationship/bulkfollow.php?uids={pids}&amp;wide=1&amp;color=C2D9F2,FFFFFF,0082CB,666666&amp;showtitle=1&amp;showinfo=0&amp;sense=0&amp;verified=1&amp;count=6&amp;refer=http%3A%2F%2Fgame.weibo.com%2Fwodemaoxian"></iframe>'.format({pids:pids}));
            }
        }
        if(addself){
            snsapi.random_feed({type:'energy'});
        }
    },'json');
}

snsapi.toUserprofile = function(param){
    window.open('http://game.weibo.com/home/user?userId=' + param.pid );

}

/**
	 * @input
	 *      type, invite(默认), send_gift, send_request, send_duty_request
	 *      mode, 选择好友的范围 af, naf, all(默认)
	 *
	 *              type= send_gift or send_request 时有下面两个参数
	 *      gift_tag, 礼物tag
	 *      gift_name, 礼物名称
	 *
	 *              type= send_duty_request 时有下面三个参数
	 *      scene_id
	 *      object_id
	 *      object_name
	 *
	 *      friends, 数组 每个元素包含uid,pid
	 *
*/
snsapi.sendRequest = function(param){

	snsapi._social(param);
}
snsapi.team_request = function (param){
    param = param || {}
    param.type = 'team_request';
    snsapi._social(param);
    
}
snsapi._social = function(param){
	param = param || {};
	var friends = typeof param.friends=='undefined'?[]:param.friends;
	var type = param.type || 'invite',modes,selected_mode 
	if(type=='invite'){
		modes='all,naf,af';
		selected_mode = 'naf';
	}else if(type=='send_gift'){
		modes = 'all,af,naf,wyxf';
		selected_mode = 'all';
	}else if(type=='team_request'){
		modes = 'all,af,naf,wyxf';
		selected_mode = 'af';
	}else if(type=='send_duty_request'){
		modes = 'all,af,naf,wyxf';
		selected_mode = 'all';
	}

	$.post(_CONFIG.js_api_url,{
		action:'social_init'
		,uid:_CONFIG.uid
		,token:_CONFIG.token
		,type:type
	},function(data){
		if(1 ||  data.s==1){
			var social_id = data.social_id || 'sid';
			var exclude_pids = data.exclude_pids || '';
			if(param.exclude_pids){
				exclude_pids = exclude_pids + param.exclude_pids;
			}
			var action_url = '{callback_url}&mod=jsapi&action=social_save&type={type}&social_id={social_id}&cid={token}'.format({
				callback_url:(_CONFIG.callback_url.indexOf('?')==-1)?(_CONFIG.callback_url+'?'):(_CONFIG.callback_url)
				,type:type
				,social_id:social_id
				,uid:_CONFIG.uid
				,token:_CONFIG.cid
			});
			var callback_url = "{canvas_url}?mod=index&social_id={social_id}&social_type={type}&iid={iid}".format({
				canvas_url:_CONFIG.canvas_url
				,type:type
				,social_id:social_id
				,iid:_CONFIG.pid
			});
			if(type=='send_gift'||type=='team_request'){
				action_url += '&gift_tag='+param.gift_tag;
				callback_url += '&gift_tag='+param.gift_tag;
			}else if(type=='send_duty_request'){
				action_url += '&sid='+param.scene_id+'&oid='+param.object_id;
			}
			var bestfriend_callback_url = callback_url + '&bestfriend=1';
			var msg;


			if(type=='invite'){
				msg = '做任务，打副本，拿装备，火热PK，尽在《侠隐传奇》!!快来一起做大侠吧!!';
			}else if(type=='send_gift'){
				if(param.gift_tag==452201){
					msg = '送你一个神秘礼物，收取就有机会得到极寒箭、神秘雷鸟等神器，';
				}else{
					msg = '送你一个'+ param.gift_name + '，';
				}
			}else if(type=='team_request'){
				msg = '打副本，少了朋友怎么行！快来跟我一同打副本吧!!';
			}else if(type=='send_duty_request'){
				msg = '我的'+param.object_name + '有职位空缺，来帮帮我，';
			}

			if( snsapi.date().getTime() < snsapi.date(2011,10,20).getTime() ){
				msg = msg + '狼人和吸血鬼场景即将开启！快来和我一起玩吧！';
			}else{
				if(type=='invite'){
					msg += '快来体验专属的传奇历程，每个人都将是一代大侠！';
				}else{
					msg = msg + '快来和我一起玩吧！';
				}
			}
			var bestfriend_msg = msg;
			if(type=='invite'){
				bestfriend_msg='偷偷地告诉你，我最近在玩《我的冒险》，很好玩哦！一般人我不告诉他，一起来体验吧。';
			}

			var tab_menu = 
				'<div class="tab-menu-nav">'+
				'<ul>'+
				'<li><a href="javascript:void(0);" div_id="div_allfriend">所有粉丝</a></li>'+
				'<li><a href="javascript:void(0);" div_id="div_bestfriend">最粉丝<sup style="color:red;font-style:italic;">new</sup></a></li>'+
				'</ul>'+
				'</div>';
			var tab_bestfriend = 
				'<div id="div_bestfriend">'+
				'<div style="font-size:14px;font-weight:normal;margin-left:10px;">' +
				'下面这些人是你最好的朋友，快来邀请他们和你一起加入传奇旅程吧。成功邀请他们之后，你将获得以下好处：<br>'+
				'1. 朋友切磋，加速升级<br>'+
				'2. 组队打副本，奖励更丰厚<br>'+
				'</div>'+
				'<div class="requestForm">'+
				'<form method="post" action="http://game.weibo.com/home/widget/bestFansForm" id="createToolBestFans" target="bestFans">'+
			'<input type="hidden" name="target" id="widgetTarget" value="self" />'+
				'<input type="hidden" name="appId" id="widgetAppId" value="{appId}" />'+
				'<input type="hidden" name="scope" id="widgetScope" value="{scope}" />'+
				'<input type="hidden" name="action" id="widgetAction" value="{action}" />'+
				'<input type="hidden" name="excludedIds" id="widgetExcludedIds" value="" />'+
				'<input type="hidden" name="content" id="widgetContent" value="{content}" />'+
				'<input type="hidden" name="intro" id="widgetIntro" value="" />'+
				'<input type="hidden" name="inviteCallback" id="widgetInviteCallback" value="{callback}" />'+
				'</form>'+
				'<iframe width="680px" height="{height}px" frameborder="0" src="" name="bestFans" scrolling="no" id="bestFans"></iframe>'+
				'</div>'+
				'</div>';

			//var intro = '<img src="http://asset.wdmx.playcrab.com/common/image/facility_13002.png" />';
			//intro = escape(intro);
			//intro = encodeURIComponent(intro);
			//intro = "%3Cimg%20src%3D%22http%3A%2F%2Fasset.wdmx.playcrab.com%2Fcommon%2Fimage%2Ffacility_13002.png%22%20alt%3D%22%22%20%2F%3E%3Cbr%20%2F%3E";

			tab_bestfriend = tab_bestfriend.format({target:"self",appId:_CONFIG.appid,scope:'uninstall',selected_mode:selected_mode,action:action_url,exclude_pids:exclude_pids,pageSize:4,content:bestfriend_msg,callback:bestfriend_callback_url,height:300,invite_award:_CONFIG.invite_award_name,intro:''});

			var tab_allfriend = 
				'<div id="div_allfriend">'+
				'<div style="font-size:14px;font-weight:normal;margin-left:10px;">' +
				'每成功邀请一名好友就可以多得一次组队机会' +
				'</div>'+
				'<div class="requestForm">'+
				'<form method="post" action="http://game.weibo.com/home/widget/requestForm" id="createToolFriend" target = "friendSelector">'+
			'<input type="hidden" name="target" value="{target}" />'+
				'<input type="hidden" name="appId" value="{appId}" />'+
				'<input type="hidden" name="modes" value="{modes}" />'+
				'<input type="hidden" name="selectedMode" value="{selected_mode}" />'+
				'<input type="hidden" name="action" value="{action}" />'+
				'<input type="hidden" name="excludedIds" value="{exclude_pids}" />'+
				'<input type="hidden" name="pageSize" value="{pageSize}" />'+
				'<input type="hidden" name="content" value="{content}" />'+
				'<input type="hidden" name="callback" value="{callback}" />'+
				'</form>'+
				'<iframe width="680px" height="{height}px" frameborder="0" src="" name="friendSelector" scrolling="no" id="friendSelector"></iframe>'+
				'</div>'+
				'</div>';
			tab_allfriend = tab_allfriend.format({target:"self",appId:_CONFIG.appid,modes:modes,selected_mode:selected_mode,action:action_url,exclude_pids:exclude_pids,pageSize:8,content:msg,callback:callback_url,height:460,invite_award:_CONFIG.invite_award_name});

			//snsapi.dialog(tab_menu + tab_allfriend + tab_bestfriend,{top:0});
			snsapi.dialog( tab_allfriend ,{top:100});


			$('.tab-menu-nav a').click(function(){
				var div_id = $(this).attr('div_id');
				$('.tab-menu-nav a').removeClass('selected');
				$(this).addClass('selected');
				if(div_id=='div_allfriend'){
					$('#div_allfriend').removeClass('none');
					$('#div_bestfriend').addClass('none');
					if(!snsapi.allfriend_tab_opened){
						$('#createToolFriend').submit();
					}
				}else{
					$('#div_allfriend').addClass('none');
					$('#div_bestfriend').removeClass('none');
					if(!snsapi.bestfriend_tab_opened){
						$('#createToolBestFans').submit();
					}
				}
			});
			//$('.tab-menu-nav a:first').click();
			$('#createToolFriend').submit();

		}else{
			alert(data.msg);
		}
	},'json');
}
