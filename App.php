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
			,'help'=> ROOT.'/help/HelpServer.php'
			,'support'=> ROOT.'/support/SupportServer.php'
		);

		//关掉apc缓存
		if(P_PLATFORM == 'dev' || ENV == 'test' ){
			PL_Config_Numeric::$useapc = false;
		}



		
	}

	function getSession(){
		if(PL_Session::canStart(true)){
			return PL_Session::start();
		}
	}
	/**
	 * not need
	 */
	static function init($config){
	}
}


function &getApp(){
	return App::getInstance();
}

