<?php
/**
 * tests/testapi.php
 *
 * Developed by Tingkun <tingkun@playcrab.com>
 * Copyright (c) 2012 Platon Group, http://platon.sk/
 * All rights reserved.
 *
 * Changelog:
 * 2012-04-12 - created
 *
 */

require_once __DIR__.'/../base.php';
require_once (__DIR__.'/../ApiServer.php');


function dotest($m,$p=null,$show_all=true)
{
	$server = new ApiServer;
	if($show_all){
		echo "===============================================\n\n";
		echo "method $m\n";
		echo "The params are these as follow:\n";
		print_r( $p );
		echo "The response are these as follow:\n";
		PL_Tool_TimeUsed::recordTime($st);
	}
	$ret = $server->doRequest($m,$p);      
	if($show_all){
		$msg = PL_Tool_TimeUsed::recordTime($st,"$m ");
		print_r($ret);
		echo "$msg ===============================================\n\n";
	}
	return $ret;
}

function pdotest($str){
	$param = json_decode($str,true);
	$m = $param['m'];
	$p = $param['p'];
	dotest($m,$p,true);

}
 
$mc = new PL_Db_Mongo(DbConfig::getMongodb('user'));
try{
$mc->findAndRemove(array('email'=>'tingkun@playcrab.com'));
}catch(Exception $e){
	echo $e->getMessage()."\n";
}
dotest('System.reg',array('uuid'=>'tuuid','email'=>'tingkun@playcrab.com','password'=>'abcdef'));
dotest('System.login',array('email'=>'tingkun@playcrab.com','password'=>'abcdef'));
dotest('System.set',array('uuid'=>'tuuid','d'=>array('a'=>'add'),'k'=>'d1'));
dotest('System.get',array('uuid'=>'tuuid','keys'=> array('d1')));

