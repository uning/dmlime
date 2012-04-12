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
	 *
	 * @param $email        用户id，邮件等等
	 * @param $password   密码
	 * @param $auto   下次自动登录  
	 * @param  ...     其他信息
	 *
	 */
	public function login($params){
		$pass    =   getParam($params,'password');
		$email   = getParam($params, 'email');
		$um = model_User::fromDb(array('email'=>$email));
		if(!$um->data){
			return array('s'=>'notexists');
		}
		if($um->data['password'] != $pass){
			return array('s'=>'pass');//,'d'=>$um->data);
		}
		return array('s'=>'OK','uuid'=>$um->id(),'d'=>$um->data['d']);
	}

	public function reg($params){
		$email = getParam($params, 'email');
		$uuid = getParam($params, 'uuid');
		$um = model_User::fromDb(array('email'=>$email));
		if($um->data){
			return array('s'=>'exists');
		}
		unset($params['_id']);
		$now = $_SERVER['REQUEST_TIME'];
		$um->id($uuid);
		$um->opMulti($params);

		$um->opOne('_it',$now);
		$um->save();
		return array('s'=>'OK');
	}

	/**
	 * 检查email是否存在
	 * @param $email
	 */
	public function checkEmail($params){
		$email = getParam($params, 'email');
		$um = model_User::fromDb(array('email'=>$email));
		if($um->data){
			$ret['d'] = $um->data;
			$ret['s'] = 'exists';
		}
		else
			$ret['s'] = 'OK';
		return $ret;
	}


	function test($params){
		print_r($_REQUEST);
		$name = getParam($params, 'name');
		$ret['s'] = 'OK';
		$ret['p'] = $name;
		return $ret;
	}

	/**
	 * 保存数据
	 * @param
	 *   -- uuid : 用户id
	 *   -- d : 用户数据
	 *   -- k : 用户数据名称
	 */
	public function set($params){
		$id = getParam($params, 'uuid');
		$data = getParam($params, 'd');
		$k = getParam($params, 'k');
		$um = new model_User($uuid);
		$um->opOne($k,$data);
		$um->save();
		return array('s'=>'OK');

	}


	/**
	 * 获取数据
	 * @param 
	 *  uuid
	 *  keys array('xxx','xxx');
	 */
	public function get($params){
		$id = getParam($params, 'uuid');
		$fields = getParam($params, 'k',false,array());
		$ff = array();
		foreach((array)$fields as $k){
			if($k)
				$ff[$k] = 1;
		}
		$um = new model_User($uuid);
		$ret =  array('s'=>'OK');
		$d  = $um->get($ff);
		unset($d['password']);
		$ret['d']  = $d;
		return $ret;
	}

	//添加排行榜数据

}

