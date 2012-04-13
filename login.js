goog.provide('dm.Login')
goog.require('jquery')

var checkedEmails = {}
var checkEmail = function(existc){
	var el = $('#inputUsername');
	var v = el.val();
	var validateEmail = function (email) { 
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return re.test(email);
	} 
	if(!validateEmail(v)){
		$(el).next('span').html('enm... 邮箱格式错误，请输入格式正确的邮箱:(');
		$(el).parent().parent().addClass('error');
		return false;
	}

	if(!existc)
		return v 

	if(checkedEmails[v] == 1){
		$(el).next('span').html('OK');
		$(el).parent().parent().removeClass('error');
		$(el).parent().parent().addClass('success');
		return v;
	}
	if(checkedEmails[v] == 2){
		$(el).next('span').html('enm... 邮箱已经存在:(');
		$(el).parent().parent().addClass('error');
		$('#emailexists').modal();
		return false;
	}
	dm.api('System.checkEmail',{email:v},function(r){
		r = r || {}
		if(r.s != 'OK'){
			$(el).next('span').html('enm... 邮箱已经存在:( <a href="#" onclick="dologin();return false;" > 直接登录</a>');
			$(el).parent().parent().addClass('error');
			checkedEmails[v] = 2;
			return false;
		}else{
			checkedEmails[v] = 1;
			$(el).next('span').html('OK');
			$(el).parent().parent().removeClass('error');
			$(el).parent().parent().addClass('success');
		}
	})
}

var checkEmailE = function(){
	return checkEmail(true)
}

var checkPassword = function(){
	var el = $('#inputPassword');
	var v = el.val(),min = 3, max = 16,err = '';
	if(v == ''){
		err = '密码不能为空'
	}else if(v.length < min){
		err = '密码太短 不足 '+ min +' 个字符';
	}else if(v.length > max)
		err = '密码太长 超过 '+ max +' 个字符';

	if(err != ''){
		$(el).next('span').html(err);
		$(el).parent().parent().addClass('error');
		return false;
	}
	$(el).next('span').html('OK');
	$(el).parent().parent().removeClass('error');
	$(el).parent().parent().addClass('success');
	return v;
}


var checkrePassword = function(existc){
	var el = $('#reinputPassword');
	var v = el.val(),err = '';
	var vv = $('#inputPassword').val();
	if(v != vv){
		err = '两次输入密码不匹配'
	}
	if(err != ''){
		$(el).next('span').html(err);
		$(el).parent().parent().addClass('error');
		return false;
	}
	$(el).next('span').html('OK');
	$(el).parent().parent().removeClass('error');
	$(el).parent().parent().addClass('success');
	return v;
}
var _show = function (jqid,msg){
	if(msg){
		$(jqid + ' > span').html(msg);
		$(jqid).show()
	}else{
		$(jqid).hide()
	}



}

var showok = function(msg){
	_show('#okalert',msg)
}
var showfail = function(msg){
	_show('#failalert',msg)
}

$('.close').unbind('click')
$('.close').click(function(){
	$(this).parent().hide();
	return false 
})


var setupFormEl = function(jqid,focusoutcb){
	var el = $(jqid)
	el.unbind();
	el.focusout(focusoutcb);
	el.next('span').html('');
	el.parent().parent().removeClass('error');
	el.parent().parent().removeClass('warning');
}
function doregister(){	
	dm.hidegame()
	$('#loginregdiv input').unbind();
	$('.subpage').hide();
	$('#titleleg').html('注册')
	$('.register').show()	
	$('.justreg').show();
	setupFormEl('#inputUsername',checkEmailE)
	setupFormEl('#inputPassword',checkPassword)
	setupFormEl('#reinputPassword',checkrePassword) 
	$('#submitButton').unbind();
	$('#submitButton').click(function(){
		var p = {};
		p.uuid = dm.uuid;
		p.email = checkEmail();
		p.password = checkPassword();
		if(p.email && p.password )
			dm.api('System.reg',p,function(r){
				r = r || {}
				if(r.s == 'OK'){
					p.lt = new Date()
					showok('注册成功, <a href="javascript:dm.continuegame();">继续游戏</a>')
					setTimeout(dm.continuegame,2000);
					dm.LDB.set('token',p);
				}else if(r.s == 'exists'){
					showfail('注册失败,邮箱已经注册，<a href="javascript:dm.dologin()">直接登录</a>')
				}else{
					showfail('注册失败,稍后再试或<a href="javascript:dm.continuegame()">直接游戏</a>')
				}
			})
			return false;
	})
}

function dologin(){
	$('#loginregdiv input').unbind();
	$('.subpage').hide();
	dm.hidegame()
	$('#titleleg').html('登录');
	$('.login').show()	
	$('.justreg').hide();
	setupFormEl('#inputUsername',checkEmail)
	setupFormEl('#inputPassword',checkPassword)
	dm.LDB.get('token',function(r){
		if(r && r.email)
			$('#inputUsername').val(r.email);
		if(r && r.password){
			$('#inputPassword').val(r.password);
		}
	});


	$('#submitButton').unbind();
	$('#submitButton').click(function(){
		var p = {};
		p.uuid = dm.uuid;
		p.email = checkEmail();
		p.password = checkPassword();
		if(p.email && p.password )
			dm.api('System.login',p,function(r){
				r = r || {}
				if(r.s != 'OK'){
					showfail('登录失败，请检查密码是否正确，稍后再试')
				}else{
					dm.uuid = r.uuid
					dm.rdata = r.d 
					p.lt = new Date()
					dm.LDB.set('token',p);
					showok('登录成功, <a href="javascript:dm.continuegame();">继续游戏</a>')
					setTimeout(dm.continuegame,2000);
				}	
			})
			return false;
	})
}

dm.dologin = dologin 
dm.doregister = doregister 
$('.continuegame').click(dm.continuegame);

$('.dologin').click(function(){
	dologin()
	return false 
})
$('.doregister').click(function(){
	doregister()
	return false 
})

