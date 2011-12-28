<?php
/**
 * test.php
 *
 * Developed by Tingkun <tingkun@playcrab.com>
 * Copyright (c) 2011 Playcrab Corp.
 * All rights reserved.
 *
 * Changelog:
 * 2011-12-28 - created
 *
 */

require_once 'base.php';
require_once 'App.php';
require_once 'tdevenv.php';
App::getInstance();



function dotest($m,$p=null,&$show_all = null,$helptag='')
{
	$server = getApp()->server('api');

	ob_start();
	echo "===============================================\n\n";
	echo "method $m\n";
	echo "The params are these as follow:\n";
	$rp = print_r( $p,true );
	echo $rp."\n";
	echo "The response are these as follow:\n";
	PL_Tool_TimeUsed::recordTime($st);
	$ret = $server->doRequest($m,$p);      
	$msg = PL_Tool_TimeUsed::recordTime($st,"$m ");
	$rr = print_r($ret,true);
	echo $rr."\n";
	echo "$msg ===============================================\n\n";
	$show_all = ob_get_clean(); 
	$fpre = ROOT."/help/rawdata/$m.";
	file_put_contents($fpre.'all.'.$helptag,$show_all);
	file_put_contents($fpre.'p.'.$helptag,json_encode($p));
	return $ret;
}

