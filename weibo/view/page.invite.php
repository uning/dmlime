
<script src="<?php echo $urlp;?>js/jsflash.js"></script>
<script type="text/javascript"  src="http://static.connect.renren.com/js/v1.0/FeatureLoader.jsp"></script>
<style type="text/css">
 ul
{
	list-style-type:none;
	padding:0;
	margin:0;
}
li {
    list-style: none;
	
}
ul li
{
	margin:0;
	padding:0;
	float:left;
	list-style-type:none;
}
ul li a
{
	display:block;
	padding:6px 8px
}

</style>
<script type="text/javascript">
		function toFlash()
		{
			window.parent.switchToFlash(); 
		}
		function changeTab(id,hide)
		{
			var hide = document.getElementById(hide);
			hide.style.display = 'none';
			var tab = document.getElementById(id);
			tab.style.display = 'block';
		}
</script>
<?php 
$height = 650;
if($_REQUEST['gift'])
	$height = 750;
?>
<div style="overflow: hidden;width:780px;height:<?php echo $height.'px';?>;border:#3399bb solid 1px;">
<table width="100%">
<tr>
<td align="right"><a  onclick="toFlash()" style="cursor: pointer;"><img src="<?php $urlp;?>images/css/close.png" border="0"/></a></td>
</tr>
</table>
<table width="700px">
<?php 
/*
	require_once '../freeGift.php';
	$gid = $_REQUEST["gift"];
	$pid = $_REQUEST['pid'];
	$us = TTGenid::getbypid($pid);
	$exclude ="0";	
	$user = new TTUser($us['id']);
	$mode = 'all';
	if($gid){
		if($gift[$gid]['level']>$user->getLevel()){
			$gid='';
		}
	}
	if(!$gid){
		$mode= 'naf';
	}
	//$key  = date('Ymd').$pid;
	try{
		$tt = TT::LinkTT();
		$feed = $tt->getbyuidx('uid',$pid);
		if($feed)
		{
			$today = $feed['time'];
			$arr = '0';
			if($today==date('Ymd'))
			foreach ($feed['invite'] as $k=>$v){
					 $arr.=','.$k;
			}
		}
	}catch(Exception $e){}
 */	
	$linkid = uniqid();
	
	$width = '740px';
	$accept_url = PL::canvas_url."accept.php?lid=$linkid";
	$content = '帮好友装货，卸货，在这里开电影院、盖厕所、做导购员，去好友那里抢客人.... !!&lt;xn:req-choice url=&quot;'.$accept_url.'&quot;label=&quot;赶快行动&quot;&gt;';
	//print_r($exclude);
	if($gid!=NULL&&$gid!=''){
		 $accept_gift_url = PL::canvas_url."accept.php?lid=$linkid";
		$content = '我在购物天堂送给你个'.$gift[$gid]['name'].',快来领取吧!这个可是白送的哦'
		.'&lt;xn:req-choice url=&quot;'.$accept_gift_url.'&quot; label=&quot;领取礼物&quot;&gt;&lt;xn:req-choice url=&quot;'.$accept_url.' &quot; label=&quot;试试再说&quot;&gt;';
		echo '<tr><td align="center">';
		echo '<img src="'.$urlp.'images/giftIcon/'.$gift[$gid]['icon'].'"/>';
		
		echo '</td></tr>';
	}
	//$content.="&quot;&gt;"; 
	$sessionK= $_REQUEST['sessionK'];
	$store_url = url(array('action'=>'inviteCallback','lid'=>$linkid,'gift'=>$gid,'pid'=>$pid));
?>
<tr>
<td>
<div id="recm">
   <xn:serverxnml style="width:740px;">
   <script type="text/xnml">
 	<xn:request-form content="<?php echo $content;?>" action="<?php echo $store_url;?>"> 
	<xn:multi-friend-selector-x actiontext="选择好友" max="50"  exclude_ids="<?php echo $arr;?>" mode="<?php echo $mode;?>" width="732px"/> 
	</xn:request-form> 
 </script>
</xn:serverxnml> 
</div>

</td>
</tr>
</table>
</div>
<script type="text/javascript">
	function sendRequest(isSendToMany, toId) {
		var params = {"accept_url":_canvas_url,"accept_label":"接受邀请"};
		var style = null;
		if (isSendToMany) {
			params["actiontext"] = "邀请好友来玩吧";
		}
		else{
			params["to"] = toId;
			sendRequesttyle = {
				"width":500,  
					"height":350  
			};
		}
		var	uiOpts = {
			   url : "request",
				display : "iframe",
				params : pathinforams,
				style : style,
				onSuccess: function(r){},
				onFailure: function(r){} 
		};
		Renren.ui(uiOpts);
	}

	var config = {
		useparent:false,//init log? server can force debug, just for develop
			fb:1,//init fb
			debug:0,
			before_fbinit:function(){},
			after_fbinit:function(){},

			cb:function(){
				PF.init_platform(config.debug,config.before_fbinit,config.after_fbinit);
			}
	};
//	PL.init('<?php echo $urlp;?>/js/config.js',config);

</script>

