<?php
try{
	$ww =  PL::getClient();
	$pid = $ww->getUserId();
}catch( Exception $e ){
	die( '请求接口失败:');
}

if(!$pid){
	$this->redirect(PL::canvas_url.url(array('from'=>'authret')));
	die();
}
$spid = $pid;
$pid = P_PLATFORM.$pid;
PL_Session::usecookie(true);
$epid = PL_Tool_IdGen::encodeStr($pid);
$s= PL_Session::start($epid);
if(!isset($_SESSION['uo'])){
	$um = new model_User($pid);
	$datas = $um->get(array('pinfo'=>1,'record'=>1));
	if(!$datas){
		$um->opOne('_it',$_SERVER['REQUEST_TIME']);
		$pinfos = PL::updateInfo(false,$um);
	}else{
		$_SESSION['uo'] = $datas;
	}
}

$_cid  = $s->getCid();
//setcookie('cid',$_cid);
$_SESSION['psession'] = PL::getSession(true);

//print_r($sess);die();

require ROOT.'/dmc.php';
?>
<script>
if(top && self && self !=top ){
//	top.location.assign("<?php echo "http://adventure.playcrab.com/wbplay.php?cid=$_cid";?>")
}
</script>
<script type="text/javascript" src="http://game.weibo.com/static/js/v0.3/wyx.connect.js.php"></script>
<script>
   WYX.Connect.init();
  var _CONFIG = _CONFIG ||  {};
  _CONFIG.rurl = 'http://adventure.playcrab.com/assets/';
  _CONFIG.cid = '<?php echo $s->getCid(); ?>';
  _CONFIG.appid = '<?php echo PL::app_id; ?>';
  _CONFIG.pid = '<?php echo $spid;?>';
  _CONFIG.canvas_url = '<?php echo PL::canvas_url; ?>';
  _CONFIG.callback_url = '<?php echo PL::callback_url; ?>';
  _CONFIG.platform = 'weibo'
</script>
<script type="text/javascript" src="./wxy.js"></script>
<?php
fastcgi_finish_request();
PL::updateFriend($_REQUEST['upf']);
