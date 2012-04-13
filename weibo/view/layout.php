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

$pid = P_PLATFORM.$pid;
PL_Session::usecookie(true);
$epid = PL_Tool_IdGen::encodeStr($pid);
$sess = PL_Session::start($epid);
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

$_cid  = $sess->getCid();
//setcookie('cid',$_cid);
$_SESSION['psession'] = PL::getSession(true);

//print_r($sess);die();

#require ROOT.'/dmc.php';
?>
<script>
if(top && self && self !=top ){
	top.location.assign("<?php echo "http://adventure.playcrab.com/wbplay.php?cid=$_cid";?>")
}
</script>
<?php
fastcgi_finish_request();
PL::updateFriend($_REQUEST['upf']);
