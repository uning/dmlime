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
			,'weibo'=> ROOT.'/weibo/ThirdServer.php'
		);



		
	}

	static function getSession($id = null){
		PL_Session::usecookie(true);
		return PL_Session::start($id,false);
	}
}


function &getApp(){
	return App::getInstance();
}

