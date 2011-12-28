<?php

//global function
/**
 * 从数组读取参数
 *
 **/
function getParam(&$param,$name,$require=true,$default = null){
	if(is_array($name)){
		$ret = array();
		foreach($name as $n){
			if(isset($param[$n])){
				$ret[$n] = $param[$n];
			}else {
				throw new Exception("no [$n] param");
			}
		}
		return $ret;
	}
	if(array_key_exists($name,(array)$param)){
		return $param[$name];
	}else if($require){
		throw new  Exception("no [$name] param");
	}
	return $default;
}
class ApiServer extends PL_Server_Json {

    /**
     * 读取请求
     */
	/*
    public function &getRequest()
    {
		//$this->_debug = true;
        $this->_req = $_REQUEST;
        if(!$this->_req||!isset($this->_req['m'])){
            throw new Exception( 'JsonServer: no method in request, '.$jsonstr);
        }
        if($this->_debug){
            self::debugOut('jsonpost',$this->_req);
        }
        return $this->_req;
	}
	 */

	public function auth($req = null){
		if(!PL_Session::canStart()){
			return true;//没有
		}
		$so = PL_Session::start();
		return true;
	}
	
}
