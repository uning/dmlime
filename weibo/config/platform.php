<?php
/**
 * config/platform.php
 *
 * Developed by Tingkun <tingkun@playcrab.com>
 * Copyright (c) 2011 Playcrab Corp.
 * All rights reserved.
 *
 * Changelog:
 * 2011-11-21 - created
 *
 */
require_once __DIR__.'/../sdk/WeiyouxiClient.php';

class PL
{

    const api_key = '1788209403';
    const secret  = 'aea189c8236dd1931928af46b38b43ba';
    const app_id  = '1788209403';
    const canvas_url = "http://game.weibo.com/adventure";
    const callback_url = "http://adventure.playcrab.com/weibo.php";
    const canvas_name = "adventure";

    const reciever_url = "/xd.html";

    const group_url = "http://game.weibo.com/forum/showsubjectList?groupId=57";
    const pay_secure = 'a0901b';
    const platform = 'weibo';
    const gm_pic='http://hdn.xnimg.cn/photos/hdn121/20101207/1940/h_large_tKd7_2453000000692f74.jpg';


	/**
	 * 获取sdk
	 */
	static function getClient(){
		static $p;
		if(!$p){
			$p = new WeiyouxiClient( self::api_key , self::secret );
		}
		return $p;
	}

	/**
	 * 检查是否授权
	 *  
	 *  true authed
	 */
	static function checkAuth(){
		$p = self::getClient();
		return $p->getUserId()  ? true : false;
	}

	/**
	 * 更新自身信息
	 */
	static function updateInfo($force=false,&$um = null){
		$ut = &$_SESSION['_pluit'];
		$now = $_SERVER['REQUEST_TIME'];
		if($ut + 86400 > $now && !$force ){
			return ;
		}
		$p = self::getClient();
		$pid = $p->getUserId();
		if($pid){
			try{
				$info = $p->get('user/show',array('uid'=>$pid));
			}catch(Exception $e){
				PL_Log::error(" $pid updateInfo failed ".$e->getMessage()); 
				return;
			}
			if($info['idstr'] != $pid){
				PL_Log::error("$pid updateInfo failed"); 
				return;
			}
			$pid =P_PLATFORM.$pid;
			if(!$um){
				$um = new model_User($pid);
			}
			$pinfo = $info;
			$pinfo['pid'] = $pid;
			$pinfo['icon'] = $pinfo['avatar_large'];
			$um->opOne('pinfo',$pinfo);
			$um->save();
			$ut = $now;
			return $info;
		}

	}

	/**
	 * 更新好友列表
	 */
	static 	function updateFriend($force=false,&$um = null){
		$ut = &$_SESSION['_pluft'];
		$now = $_SERVER['REQUEST_TIME'];
		if($ut + 1500 > $now && !$force ){
			return ;
		}
		$p = self::getClient();
		$pid = $p->getUserId();
		if($pid){
			try{
				$info = $p->get('user/app_friend_ids');
			}catch(Exception $e){
				PL_Log::error(" $pid updateFriend failed ".$e->getMessage()); 
				return;
			}
			if(!$info){
				PL_Log::error(__METHOD__."{$pid} updateInfo failed"); 
				return;
			}
			$pid =P_PLATFORM.$pid;
			if(!$um){
				$um = new model_User($pid);
			}
            $strinfo = array();
			foreach((array)$info as $k=>$v){
                $strinfo[$k] = ''.$v;
				$fnum += 1;
			}
			$um->opOne('fpids',$strinfo);
			$um->opOne('ac.fnum',$fnum);
			$um->save(false);
			$ut = $now;
			return $info;
		}

	}
    static public function getAPI(){
        return self::getClient();
    }
    static public function getPID(){
        $api = self::getAPI();
        $userId = $api->getUserId();
        return $userId;
    }
    static public function getSession($upd = false){
		static $p;
		if($p)
			return $p;
        if(!$upd){
            if(isset($_SESSION['psession'])){
                return $p = $_SESSION['psession'];
            }
        }
        $api = self::getAPI();
        $session = $api->getSession();
        if($session){
            return $p=$session;
        }else{
            PL_Log::error(__METHOD__.' failed');
            return null;
        }
    }
	static function getSessionKey()
	{
		static $p;
		if($p)
			return $p;

		$p = self::getSession();
		if($p)
			return $p = $p['sessionKey'];
	}
    static public function getUserInfo($session_key = null){
        $api = self::getAPI();
        if(is_null($session_key)){
            $session_key  = self::getSessionKey();
            $ret = $api->get('user/show');
        }else{
            $ret = $api->get('user/show',array('session_key'=>$session_key));
        }
        if(isset($ret['error_code'])){
            // todo error log
            self::$error_msg = $ret['error_code'].','.$ret['error'];
            return null;
        }
        $user_info = array(
            'pid'=>$ret['id'],
            'session_key'=>$session_key,
            'name'=>$ret['name'],
            'icon'=>$ret['profile_image_url'],
            'gender'=>$ret['gender'],
            // 最早和前端约定 2 表示V用户, 而新浪则去掉了原有的level字段, 为了兼容, 这里伪造2, 不再区分V用户的种类(名人,政府,企业...)
            'verified'=>$ret['verified']?2:0,
        );
        return $user_info;
    }
    static public function getFriendPIDs($param=array(),$session = null){
        $api = self::getAPI();
		if(!$session) $session = self::getSession();
        $session_key = $session['sessionKey'];
        $ret = $api->get('user/app_friend_ids',array('session_key'=>$session_key));
        if(isset($ret['error_code'])){
            // todo error log
            self::$error_msg = $ret['error_code'].','.$ret['error'];
            return array();
        }
        return $ret;
    }
    static public function get_pay_token($order_id,$amount,$desc,$session_key = null){
        $api = self::getAPI();
        $appkey = self::appkey;
		if(!$session_key)
			$session_key = self::getSessionKey();

        $sign = md5($order_id.'|'.$amount.'|'.$desc.'|'.$appkey);


        $ret = $api->get('pay/get_token',array(
            'session_key'=>$session_key,
            'order_id'=>$order_id,
            'amount'=>$amount,
            'desc'=>$desc,
            'sign'=>$sign,
        ));
        if(isset($ret['error_code'])){
            // todo error log
            self::$error_msg = $ret['error_code'].','.$ret['error'];
            return null;
        }
        return $ret['token'];
    }
    static public function getFriendInfos($session,$param=array()){
        return array();
    }
    static public function isTestingPID($pid){
        return false;
    }
    static public function payment_finished($order_id,$pid){
        $api = self::getAPI();
        $appkey = self::getConfig('appkey');
        $appid = self::getConfig('appid');
        $sign = md5($order_id.'|'.$appkey);
        $ret = $api->get('pay/order_status',array(
            'order_id'=>$order_id,
            'user_id'=>$pid,
            'app_id'=>$appid,
            'sign'=>$sign,
        ));
        /*
        array(4) {
            ["order_id"]=>
                string(16) "1108009000000028"
                ["order_uid"]=>
                int(1606887824)
                ["amount"]=>
                int(5000)
                ["order_status"]=>
                int(0)
        }
        */

        if(isset($ret['error_code'])){
            // todo error log
            self::$error_msg = $ret['error_code'].','.$ret['error'];
            return false;
        }else{
            return $ret['order_status']==1;
        }
    }
    static public function update_rank($rank_id,$value,$session_key = null){
		if(!$session_key)
			$session_key = self::getSessionKey();
        $api = self::getAPI();
        $ret = $api->post('leaderboards/set',
            array(
                'session_key'=>$session_key,
                'rank_id'=>$rank_id,
                'value'=>$value,
            ));
        if(isset($ret['error_code'])){
			PL_Log::error(__METHOD__.' : '."$rank_id $value reason:".$ret['error_code'].','.$ret['error']);
            //glog::info($ret['request'].','.$ret['error_code'].','.$ret['error'],'api');
            return false;
        }else{
            return true;
        }
    }
    static public function get_achieve($session_key = null){
		if(!$session_key)
			$session_key = self::getSessionKey();
        $api = self::getAPI();
        $ret = $api->get('achievements/get',array('session_key'=>$session_key));
        if(!isset($ret['error_code'])){
            return $ret;
        }else{
            // todo error log
            self::$error_msg = $ret['error_code'].','.$ret['error'];
            return null;
        }
    }
    static public function update_achieveAsync($achieve_id,$session_key = null){
		register_shutdown_function('PL::update_achieve',$achv_id,$session_key);
    }
    static public function update_achieve($achieve_id,$session_key = null){
		if(!$session_key)
			$session_key = self::getSessionKey();
        $api = self::getAPI();
        $ret = $api->post('achievements/set',
            array('session_key'=>$session_key,'achv_id'=>$achieve_id));
        if(!isset($ret['error_code'])){
			error_log(__METHOD__." $session_key succ:".$achieve_id.'  '.$ret['error_code'].','.$ret['error']);
            return true;
        }else{
            // todo error log
			PL_Log::error(__METHOD__." $session_key fail:".$achieve_id.'  '.$ret['error_code'].','.$ret['error']);
            return false;
        }
    }
    static public function ignore_game($inviter_pid,$ignore,$session_key = null){
		if(!$session_key)
			$session_key = self::getSessionKey();
        $api = self::getAPI();
        $ret = $api->get('invite/ignore_game',array(
            'session_key'=>$session_key,
            'invite_id'=>$inviter_pid,
            'value'=>$ignore?2:1,
        ));
        if(!isset($ret['error_code'])){
            return true;
        }else{
            // todo error log
            self::$error_msg = $ret['error_code'].','.$ret['error'];
            return false;
        }
    }
    static public function is_fan($session_key = null){
		if(!$session_key)
			$session_key = self::getSessionKey();
        $api = self::getAPI();
        $ret = $api->get('application/is_fan',array(
            'session_key'=>$session_key,
        ));
        if(!isset($ret['error_code'])){
            return $ret['flag']==1;
        }else{
            // todo error log
            self::$error_msg = $ret['error_code'].','.$ret['error'];
            return false;
        }
    }
    static public function scored($session_key = null){
		if(!$session_key)
			$session_key = self::getSessionKey();
        $api = self::getAPI();
        $ret = $api->get('application/scored',array('session_key'=>$session_key));
        if(!isset($ret['error_code'])){
            return $ret;
        }else{
            // todo error log
            self::$error_msg = $ret['error_code'].','.$ret['error'];
            return false;
        }
    }

}





