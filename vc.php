<?php
/**
 * vc.php
 *
 * Developed by Tingkun <tingkun@playcrab.com>
 * Copyright (c) 2012 Platon Group, http://platon.sk/
 * All rights reserved.
 *
 * Changelog:
 * 2012-03-21 - created
 *
 */
$gen = $_REQUEST['gen'];
header('Content-Type: text/javascript');
if(1 || $gen){
	$ver = '0.1.0'; 
	
	
    $lines = file('cache.manifest');
	define('MY_IGNORE_REG','/^\.$|^\.\.$|bak$|~$|^\.|asset|unittest|phpdoc/');
	define('MY_REG','/\.png$|^\.jpg$/');
	foreach($lines as $l){
		$l = trim($l);
		if(!$l)
			continue;
		if(is_file($l)){
			$fcid = md5_file($l);
			$fid = md5($l);
			$res[$fid] = array('cid'=> $fcid,'src'=>$l,'type'=>'image');
		}
	}

	$afile = 'dm.js';
	$res[md5($afile)] = array('cid'=> md5_file('dm.c.js'),'src'=>$afile,'type'=>'js');
	$data['ver'] = $ver;
	$data['resource']=$res;
	$c = "var _VER = ".json_encode($data);
	file_put_contents('vc.js',$c);
	echo $c;
}else{
	include 'vc.js';
}
?>

_VER.action = function(){
   console.log('code in vc.php')
}

