<?php

/**
 * 入口文件
 * 最后合并到app.inc里去 
 *
 *  
 */

class App extends PL_Application{


	protected function __construct(){
		parent::__construct();
		$this['mods'] = array(
			'api'=> ROOT.'/ApiServer.php'
			,'page'=> ROOT.'/views/PageServer.php'
			,'weibo'=> ROOT.'/views/PageServer.php'
		);



		
	}

	function getSession(){
		return PL_Session::start(null,false,true);
	}
}


function &getApp(){
	return App::getInstance();
}

