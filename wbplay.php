<?php
/**
 * wbplay.php
 *
 * Developed by Tingkun <tingkun@playcrab.com>
 * Copyright (c) 2012 Platon Group, http://platon.sk/
 * All rights reserved.
 *
 * Changelog:
 * 2012-04-13 - created
 *
 */
define('P_PLATFORM','weibo');
require_once __DIR__.'/base.php';
require_once __DIR__.'/weibo/config/platform.php';
PL_Session::usecookie(true);
$s = PL_Session::start();
$pid = PL_Tool_IdGen::decodeStr($s->getid());
$spid = $_SESSION['psession']['userId'];
if(P_PLATFORM.$spid != $pid ){
	die("请先<a href='".PL::canvas_url."' >登录</a>");
}
require_once('dmc.php');
?>
<script type="text/javascript" src="http://game.weibo.com/static/js/v0.3/wyx.connect.js.php"></script>
<script>
   WYX.Connect.init();
  var _CONFIG = _CONFIG ||  {};
  _CONFIG.rurl = 'http://adventure.playcrab.com/assets/';
  _CONFIG.cid = '<?php echo $s->getCid(); ?>';
  _CONFIG.appid = '<?php echo PL::app_id; ?>';
  _CONFIG.pid = '<?php echo $spid;?>';
  _CONFIG.urlapi = '<?php echo url(array('mod'=>'api'));?>';
  _CONFIG.canvas_url = '<?php echo PL::canvas_url; ?>';
  _CONFIG.callback_url = '<?php echo PL::callback_url; ?>';
  _CONFIG.platform = 'weibo'
</script>
<script type="text/javascript" src="./wxy.js"></script>


