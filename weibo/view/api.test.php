<pre>
<?php
/**
 * view/api.test.php
 *
 * Developed by Tingkun <tingkun@playcrab.com>
 * Copyright (c) 2011 Playcrab Corp.
 * All rights reserved.
 *
 * Changelog:
 * 2011-11-22 - created
 *
 */

$renren = PL::getClient();;


PL::updateFriend(true,$um);
print_r($um);
#print_r($renren->get('user/app_friend_ids'));
$method = $_REQUEST['method'];
if(method_exists($renren,$method)){
	print_r($renren->get($method));
}
else if($method){
	print_r(PL::$method());
//	print_r(PL::update_achieve('1'));

}else{

        $cc=new ReflectionClass('PL');
        $ms = $cc->getMethods();
		echo "<textarea> \n";
		print_r($ms);
		echo "</textarea> \n";


}
if(0){
}
?>
<form method=post>
<label>方法名:</label> <input name='method' value='<?php echo $method;?>'/>
<button type='submit'>提交</button>
</form>
http://open.weibo.com/game/index/wiki?title=1/user/app_friend_ids
邀请request发送
支付相关的代码，和sina提供的后台接口代码
/home/hotel/zeus/connector/connector/sinaweibo.php
/home/hotel/zeus/apps/111230.05/public/controller/CPayment.php   
sinaweibo_paycallback()


js相关的代码
/home/hotel/zeus/asset/common/js/common.js
/home/hotel/zeus/asset/111230.05/js/1.js

/home/hotel/zeus/apps/111230.05/public/controller/CJsapi.php
<button onclick='sendFeed()'>测试feed</button>
<button onclick='sendRequest()'>测试Request</button>
<script src='<?php echo $curlp = app_config('common_resource_url');?>/js/jquery-1.5.0.min.js'></script>
<script src="<?php echo $curlp;?>/js/swfobject.js"></script>
<script type="text/javascript" src="http://game.weibo.com/static/js/v0.3/wyx.connect.js.php"></script>
<script>
var friend = 1421510214;
function sendFeed(){
	WYX.Connect.send({   method:'sendWeibo',
		params:{
			appId:2136202145,
				title:'我在测试微游戏的widget',
				content:'前端开发还挺有意思的',
				actionText:'这个是干嘛的？',
				templateContent:'分享这一刻，来说点什么吧',
				link:'http://game.weibo.com/teslalab',
				actionUrl:'http://game.weibo.com/teslalab',
				imageUrl:'http://tp3.sinaimg.cn/1421510214/50/5598861940/1',
					}
				},
					function(){
						//callBack function
						//alert('wow');
			})};

			function sendRequest(){
				WYX.Connect.send({
					method:'invite',
						params:{
							appId:_app_id,
								uid:<?php echo $pid; ?>,
								friends:[{id:1937793450, name:'sdlwxiaoya'}],
								content:'原谅我吧，小白鼠，为我这个码农做点贡献吧，阿门',
								title:'发送好友邀请',
								inviteCallback:'http://game.weibo.com/teslalab',
								action:'http://game.weibo.com/teslalab',
								target:'top'
					}
				},
					function(){
						//callBack function
				});
			};

			function test(){
				WYX.Connect.setTitle("还剩5秒");
			};

			function show() {	  
				document.getElementById("xie").style.display = "";
				document.getElementById("content1").style.display = "";
			}
			function hide() {
				document.getElementById("xie").style.display = "none";
				document.getElementById("content1").style.display = "none";
			}
</script>

