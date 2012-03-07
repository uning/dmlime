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
	protected $_conn;
	protected $_db;
	protected $_collection;
	function __construct($host = 'localhost:35050', $db = 'test', $collection = 'dm'){
		$this->_conn = new Mongo($host);
		$this->_db = $this->_conn->$db;
		$this->_collection = $this->_db->$collection;
	}


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
		$pid    =   getParam($params,'pid', false,'');
		$pass    =   getParam($params,'passwd', false);
		$email = getParam($params, 'email',false);
		$create = getParam($params, 'create', false);
		$auto    =   getParam($params,'auto', false, true);

		$coll = $this->_collection;
		$data = $coll->findOne(array("pid"=>$pid, "pass"=>$pass));
		if(!isset($data)){
			if($create){
				$uid = $this->genUid();
				if($coll->save(array("_id"=>$uid, "pid"=>$pid, "passwd"=>$pass, "email"=>$email))){
					$ret['d'] = array("_id"=>$uid, "pid"=>$pid, "email"=>$email);
					$ret['s'] = 'OK';
					return $ret;
				}
				$ret['s'] = 'KO';
				return $ret;
			}else{
				echo "<script type='text/javascript'>location.href='register.php'</script>";
			//登陆错误
			}
		}else{
			//登陆成功
			echo "log success!";
		}
		/*
		if($id){
			 $isnew = false;
			 $uid = model_Genid::getUid($id,$isnew);
			 $um = new model_User($uid);
			 if($isnew){
			 }
		}
		 */
	}

	public function checkName($params){
		$pid = getParam($params, 'pid', true);
		$coll = $this->_collection;
		$data = $coll->findOne(array('pid' => $pid));
		if(isset($data)){
			$ret['d'] = "not avaliable";
		}else{
			$ret['d'] = "avaliable";
		}
		$ret[s] = 'ok';
		return $ret;
	}

	function genUid(){
		$coll = $this->_collection;
		$data = $coll->findOne(array("key"=>"maxuid"));
		if(!isset($data)){
			$coll->save(array("key"=>"maxuid","maxuid"=>1));
		}else{
			$coll->update(array("key"=>"maxuid"), array('$inc'=>array("maxuid"=>1)));
		}
		return $data["maxuid"]+1;
	}

	function test($params){
		print_r($_REQUEST);
		$name = getParam($params, 'name');
		$ret['s'] = 'OK';
		$ret['p'] = $name;
		return $ret;
	}

	/**
	 * @param
	 *   -- id : 用户id
	 *   -- data : 用户数据
	 */
	public function save($params){
		$id = getParam($params, 'id', true);
		$data = getParam($params, 'data', true);

		/*
		$m = new Mongo('localhost:35050'); 
		$db = $m->test;
		$collection = $db->dm;
		 */
		$collection = $this->_collection;
		$cond = array("name"=>$id);
		$record = array('$set'=>array("data"=>$data));
		if($collection->update($cond, $record)){
			$ret['s'] = 'ok';
			$ret['d'] = array($id => $data);
		};
		return $ret;
	}


	public function read($params){
		$id = getParam($params, 'id', true);
		$collection = $this->_collection;
		$cond = array("name"=>$id);
		$data = $collection->findOne($cond);
		if($data['name']){
			$ret['s'] = 'ok';
			$ret['d'] = $data['data'];
		};
		return $ret;
	}


	public function delete($params){
	}
}

