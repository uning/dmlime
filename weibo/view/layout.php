<?php
try{
	$ww =  PL::getClient();
	$pid = $ww->getUserId();
}catch( Exception $e ){
	die( '请求接口失败:');
}

if(!$pid){
	$this->redirect($rr->getAuthorizeUrl(PL::canvas_url.url(array('from'=>'authret'))));
	die();
}

$pid = P_PLATFORM.$pid;
PL_Session::usecookie(true);
$sess = PL_Session::start($pid);
if(!isset($_SESSION['uo'])){
	$um = new model_User($pid);
	$datas = $um->get(array('pinfo'=>1,'record'=>1));
	if(!$datas){
		$um->opOne('_it',$_SERVER);
		$pinfos = PL::updateInfo(false,$um);
	}else{
		$_SESSION['uo'] = $datas;
	}
}

$_cid  = $sess->getCid();
//setcookie('cid',$_cid);
$_SESSION['psession'] = PL::getSession(true);

require ROOT.'/dmc.php';
?>


<script>
  var _CONFIG = {};
  _CONFIG.resource_url = '<?php echo $urlp; ?>';
  _CONFIG.cid = '<?php echo $_cid; ?>';
  _CONFIG.common_resource_url = '<?php echo app_config('common_resource_url'); ?>';
  _CONFIG.appid = '<?php echo PL::app_id; ?>';
  _CONFIG.pid = '<?php echo $pid;?>';
  _CONFIG.js_api_url = '<?php echo url(array('mod'=>'jsapi','cid'=>$_cid));?>';
  _CONFIG.urlapi = '<?php echo url(array('mod'=>'api'));?>';
  _CONFIG.canvas_url = '<?php echo PL::canvas_url; ?>';
  _CONFIG.callback_url = '<?php echo PL::callback_url; ?>';
  _CONFIG.shortcut_url = '<?php echo PL::canvas_url; ?>'+'?from=shortcut';

  _CONFIG.platform = 'weibo'
  _CONFIG.qq_quns = ['116299965']
  //for browser 
  var console = console || {};console.log = console.log || function(){};
</script>
<?php
fastcgi_finish_request();
PL::updateFriend($_REQUEST['upf']);
