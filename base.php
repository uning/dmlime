<?php
/*
 * base.php
 * 常量定义,发布时会打包进入app.inc
 *
 * Developed by Tingkun <tingkun@playcrab.com>
 * Copyright (c) 2011 Playcrab Corp.
 * Licensed under terms of GNU General Public License.
 * All rights reserved.
 *
 * Changelog:
 * 2011-05-19 - created
 *
 */

define('ROOT',__DIR__);
define('LIB_ROOT',__DIR__.'/lib');
define('PL_LIB_ROOT',LIB_ROOT.'/PL');

if (!function_exists('fastcgi_finish_request')){
	function  fastcgi_finish_request(){
		flush();
	}
}
/**
 *  url,from 
 */
function url($params = array() ,$rel=true,$urlp=''){
	$mod = & $params['mod'];
	$mod = $mod ? $mod : PL_Server::getParam('mod');
	$mod = & $params['ver'];
	$mod = $mod ? $mod : PL_Server::getParam('ver');
	$mod = & $params['action'];
	$mod = $mod ? $mod : PL_Server::getParam('action');

	$mod = & $params['branch'];
	$mod = $mod ? $mod : PL_Server::getParam('branch');


	$mod = & $params['platform'];
	$mod = $mod ? $mod : PL_Server::getParam('platform');

	$mod = & $params['config'];
	$mod = $mod ? $mod : PL_Server::getParam('config');
	if(!$rel){
		if(!$urlp){
			$urlp = (strtolower(getenv('HTTPS')) == 'on' ? 'https' : 'http') . '://'.$_SERVER['HTTP_HOST'];
			if($_SERVER['SERVER_PORT'] != '80'){
				$urlp .=':'.$_SERVER['SERVER_PORT'];
			}
			$urlp.= $_SERVER['DOCUMENT_URI'];
		}
	}
	return $urlp.'?'.http_build_query($params);
}


function outdebug(){
	print new PL_View(PL_ROOT.'/PL/View/Debug.php');
}

/*
set_error_handler(array('PL_Error', 'handler'));
register_shutdown_function(array('PL_Error', 'fatal'));
register_shutdown_function('outdebug');
 */







define('COMM_ROOT',__DIR__.'/common');
define('LOG_ROOT',__DIR__.'/log');
define('PUB_CONTROLLER',COMM_ROOT.'/api');
define('PUB_SERVER',COMM_ROOT.'/server');
define('TM','Ymd');

//数值

require_once __DIR__.'/autoload.php';
require_once __DIR__.'/App.php';

//数据库相关的配置
require_once ROOT.'/config/DbConfig.php';


//session ，由于facebook 用的session，这里启动sessnion








