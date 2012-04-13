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

?>


<!doctype html>
<html> 
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

		<title><?php echo $this->title;?> - 冒险大陆 </title>

		<?php if($this->headerView) require $this->headerView; ?>

		<meta name="viewport" content="width=device-width, initial-scale=1.0"
		<!-- Le HTML5 shim, for IE6-8 support of HTML elements -->
		<!--[if lt IE 9]>
		<script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
		<![endif]-->
		<!-- Le fav and touch icons -->   
		<!-- Le styles -->
		<link href="assets/bootstrap/css/bootstrap.css" rel="stylesheet">
		<link href="assets/bootstrap/css/bootstrap-responsive.css" rel="stylesheet">

		<link rel="icon" href="assets/images/favicon.ico" type="image/x-icon" />
		<link rel="shortcut icon" href="assets/images/favicon.ico">
		<link rel="apple-touch-icon" href="assets/images/apple-touch-icon.png">
		<link rel="apple-touch-icon" sizes="72x72" href="assets/images/apple-touch-icon-72x72.png">
		<link rel="apple-touch-icon" sizes="114x114" href="assets/images/apple-touch-icon-114x114.png">


		<?php if($this->headerView) require $this->headerView; 

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
    </head>
    <body style='width:720px,height=1004px'>
	   <?php if($this->bodyView) require $this->bodyView; ?>
    </body>
</html>
<script>
$(document).ready(function (){
	if(top == window)
		$(document.body).css('overflow','auto');
    else
		$(document.body).css('overflow','hidden');
	  });
</script>
<?php
fastcgi_finish_request();
PL::updateFriend($_REQUEST['upf']);
