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
	$rdir ='dmdata/dmimg/sk/';
	define('MY_IGNORE_REG','/^\.$|^\.\.$|bak$|~$|^\.|asset|unittest|phpdoc/');
	define('MY_REG','/\.png$|^\.jpg$/');
	function dirfiles($dir,&$rfiles){
		if ($dh = opendir($dir)) {
			while (($file = readdir($dh)) !== false) {
				if(preg_match(MY_IGNORE_REG,$file) )
					continue;
				$afile = $dir.$file;
				if(preg_match(MY_REG,$file)){
					$fcid = md5_file($afile);
					$fid = md5($afile);
					$rfiles[$fid] = array('cid'=> $fcid,'src'=>$afile,'type'=>'image');
				}else if(is_dir($afile))
					dirfiles($afile.'/',$rfiles);
			}
			closedir($dh);
		}
	}
	dirfiles($rdir,$res);
	$afile = 'dm.js';
	$res[md5($afile)] = array('cid'=> md5_file('dm.js'),'src'=>$afile,'type'=>'js');
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

