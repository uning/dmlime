<!doctype html >
<html manifest="cache.manifest">
	<head>
		<title>冒险大陆</title>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<link rel="stylesheet" type="text/css" href="assets/bootstrap.min.css">
		<!--[if lt IE 9]>
		<script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
		<![endif]-->
		<link rel="icon" href="assets/images/favicon.ico" type="image/x-icon" />
		<link rel="shortcut icon" href="assets/images/favicon.ico">
		<link rel="apple-touch-icon" href="assets/images/apple-touch-icon.png">
		<link rel="apple-touch-icon" sizes="72x72" href="assets/images/apple-touch-icon-72x72.png">
		<link rel="apple-touch-icon" sizes="114x114" href="assets/images/apple-touch-icon-114x114.png">
	</head>

	<body id='gamearea' style='background-color:rgb(91,67,46);'>
		<div id='loading' class='subpage'>
			<img style='margin-left:45%;margin-top:20%' src='./assets/loading.gif' />
		</div>

		<div class="alert fade in hide " id='okalert'>         
			<a class="close" data-dismiss="alert" href="#">×</a>
			<span>注册成功,进入游戏</span>
		</div>
		<div class="alert alert-error fade in hide" id='failalert'>         
			<a class="close" data-dismiss="alert" href="#">×</a>
			<span>注册失败，请坚查网络，稍后再试</span>
		</div>
		<div id='loginregdiv' class='hide subpage register login'>
			<form class="form-horizontal" method='POST'>
				<fieldset>
					<legend id='titleleg'>请注册</legend>
					<div class="control-group">
						<label class="control-label" title='找回密码用' for="inputUsername">邮箱</label>
						<div class="controls">
							<input class="input-xlarge focused" name='email' id='inputUsername' type="text" placeholder='您的注册邮箱' value="">
							<span class="help-inline"></span>
						</div>
					</div>
					<div class="control-group">
						<label class="control-label" for="inputPassword">密码</label>
						<div class="controls">
							<input class='input-xlarge' type="password" name='passwd' placeholder='您的密码' id="inputPassword">
							<span class="help-inline"></span>
						</div>
					</div>
					<div class="control-group justreg">
						<label class="control-label" for="reinputPassword">重复密码</label>
						<div class="controls">
							<input class='input-xlarge' type="password" name='repasswd' placeholder='确认您的密码' id="reinputPassword">
							<span class="help-inline"></span>
						</div>
					</div>
					<div class="form-actions">
						<button type="submit" class="btn span2 btn-primary" id='submitButton'>提交</button>
						<button class="btn continuegame" >继续游戏</button>
					</div>
				</fieldset>
			</form>

		</div>

		<script>
			//*
			(function(name,callback){
				var getObjectByName = function(name, opt_obj) {
					var parts = name.split('.');
					var cur = opt_obj || window;
					for (var part; part = parts.shift(); ) {
						if (cur[part]) {
							cur = cur[part];
							} else {
							return null;
						}
					}
					return cur;
				};

				function loadJS(call){
					var script = document.createElement('script');
					script.setAttribute('type','text/javascript');
					script.onload = function(){
						(getObjectByName(callback))();
						call();
					};

					script.setAttribute('src',name);
					document.getElementsByTagName('head')[0].appendChild(script);
				}
				loadJS(function(){});
			})('dm.c.js','dm.start');
			//*/
			// Hides the addressbar on non-post pages 
			function hideURLbar() { window.scrollTo(0,1); } 
			addEventListener('load', function(){setTimeout(hideURLbar, 0);}, false);
		</script>
	</body>
</html>
