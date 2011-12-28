<?php
/**
 * tdeployenv.php
 *
 *
 *
 * Developed by Tingkun <tingkun@playcrab.com>
 * Copyright (c) 2011 Playcrab Corp.
 * All rights reserved.
 *
 * Changelog:
 * 2011-11-22 - created
 *
 */

if(!function_exists('app_config')){
	function getRurl(){
		static $rurl = null;

		if($rurl === null){
			$rurl='./';
			$root = $_SERVER['DOCUMENT_ROOT'];  
			$ruri =	$_SERVER['DOCUMENT_URI'];
			$r = dirname($root.$ruri);
			while($r&&!file_exists($r.'/'.basename(__FILE__))){
				$r = dirname($r);
				$rurl .= '../';
			}
		}
		return $rurl;
	}

	function getPlatform(){
		static $rurl = null;
		if($rurl === null){
			if(isset($_REQUEST['platform']))
				return $rurl = $_REQUEST['platform'];
			else
				$rurl = 'dev';
		}
		return $rurl;
	}

	function app_config($name){
		if($name == 'service_mode'){
			return 'd';
		}

		if($name == 'resource_url'){
			return getRurl().'/asset/'.getPlatform().'/';
		}
		if($name == 'common_resource_url'){
			return getRurl().'/asset/common/';
		}
		if($name == 'platform'){
			return getPlatform();
		}
		if($name == 'log_path'){
			return __DIR__.'/logs';
		}
		if($name == 'vendor_path'){
			return __DIR__;
		}
		if($name == 'config_revision'){
			return 'dev';
		}
		if($name == 'app_config_path'){
			return '/backup/work/wuxia/cfgs/dev/';
		}
		die("nodevconfig: $name");

	}
}
