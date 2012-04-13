
	<link rel="stylesheet" type="text/css" href="<?php echo $urlp=app_config('resource_url');?>/css/gift.css" />
		
		<script type="text/javascript">
		function toFlash()
		{
			window.parent.switchToFlash(); 
		}
		</script>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>Super Mall</title>
		
	<form action="<?php echo url(array('action'=>'page','page'=>'invite'));?>" method="post">
	<div class="main_gift_cont" style="background-color:#fffff;overflow: hidden;width:780px;height:640px;margin:0;text-align: center;padding-bottom: 5px;border:#3399bb solid 1px;z-index: 1;">
	<table width="100%" style="padding-top: 0px;margin-bottom: 2px">
		<tr>
		<td align="right"><a onclick="toFlash()" style="cursor: pointer;"><img src="<?php echo $urlp;?>/images/css/close.png"/></a></td>
		</tr>
	</table>
	<ul>
<?php
	//require_once 'freeGift.php';
	function getAttr($name,$xml)
	{
		return $xml[$name];
	}
	//#f5debc
	function levelEnoughShow($k,$xml)
	{
		echo '<li class="giftLi">';
		echo '<div class="gift_img">';
		echo '<label for="radiobucket">';
		echo '<img src="'.$urlp.'images/giftIcon/'.getAttr('icon',$xml).'" class="giftIconImg" style="width: 90px; margin-left: 0px;"/></label></div>';		
		echo '<div class="gift_name"><strong><span>'.getAttr('name',$xml).'</span></strong></div>';
		echo '<div class="gift_action"><input type="radio" name="gift" value="'.$k.'" id="radio'.getAttr('name',$xml).'"/></div></li>';
	}
	
	function levelLessShow($xml)
	{
		echo '<li class="giftLocked"><div class="gift_img">';
		echo '<img src="../static/images/giftIcon/'.getAttr('icon',$xml).'" class="giftIconImg" style="width: 90px; margin-left: 0px;"/></div>';
		echo '<div class="gift_name"><strong><span>'.getAttr('name',$xml).'</span></strong></div>';
		echo '<div class="gift_action">'.getAttr('level',$xml).'級后可贈送</div></li>';
	}
	
	function getUserLevel()
	{
		$ses = TTGenid::getbypid($_REQUEST['pid']);
		$user = new TTUser($ses['id']);
		return $user->getLevel();
	}
	
	/*
	$level = getUserLevel();
	foreach ($gift as $k => $child){
		if($level >= getAttr('level',$child)){
			levelEnoughShow($k,$child);
		}
		else{
			levelLessShow($child);
		}
	}
	 */
?>
</ul>
<br/>
		<div style="width: 700px; text-align: center;" >
			
			<input type="hidden" name="sessionK" value="<?php echo $_REQUEST['sessionK']?>"/>
			<input type="hidden" name="pid" value="<?php echo $_REQUEST['pid']?>"/>
			<input type="submit" name="send_gift" value="选好了，去选朋友吧 >>>" class="giftformsubmit giftButtonFloat" style="cursor: pointer;"/>
			<input type="button" name="skip" value="跳过" class="giftformsubmit giftButtonFloat" onclick="toFlash()" style="cursor: pointer;"/>
		</div>
</div>
</form>
