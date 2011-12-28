<?php
/**
 * common/api/System.php
 *
 * Developed by UNKNOWN AUTHOR <UNKNOWN@undefined.net>
 * Copyright (c) 2011 Platon Group, http://platon.sk/
 * All rights reserved.
 *
 * Changelog:
 * 2011-12-07 - created
 *
 */



class System{


	/**
	 * 登录后生成，cookie，加密保存账号密码信息
	 *
	 * @param $id     用户id，邮件等等
	 * @param $pass   密码
	 * @param $auto   下次自动登录  
	 * @param  ...     其他信息
	 *
	 */
	public function login($params){
		$id    =   getParam($params,'id',false,'');
		$pass    =   getParam($params,'pass',false);
		$auto    =   getParam($params,'auto',false,true);
		if($id){
			$isnew = false;
			 $uid = model_Genid::getUid($id,$isnew);
			 $um = new model_User($uid);
			 if($isnew){
			 }
		}
		$ret['s'] = 'OK';
		return $ret;
	}

	function test($params){
		$ret['s'] = 'OK';
		$ret['p'] = $params;
		return $ret;
	}



}

