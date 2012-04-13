<?php
/**
 * IndexServer.php
 *
 * Developed by Tingkun <tingkun@playcrab.com>
 * Copyright (c) 2011 Playcrab Corp.
 * Licensed under terms of GNU General Public License.
 * All rights reserved.
 *
 * Changelog:
 * 2011-06-11 - created
 *
 */
require_once __DIR__.'/config/platform.php';
class ThirdServer extends PL_Server_Page{
	public function __construct(){
	 $this->viewRoot = __DIR__.'/view/';
	}	
	
	function actionIndex(){

		
		$this->bodyView = $this->viewRoot.'index.body.php';
		$this->tailerView =  $this->viewRoot.'index.tailer.php';
		include  $this->viewRoot.'layout.php';
	}

	/*
	function run(){
		$view = $this->viewRoot.'index.php';
		include($view);
	}
	*/
	function actionPage(){
		$urlp = app_config('resource_url');
		$page = $this->getParam('page'); 
        $rr = PL::getClient();
        $pid = $rr->user;
		include  $this->viewRoot."page.$page.php";
		return ;
		include $this->viewRoot."page.faq.php";
		//include  $this->viewRoot.'layout.php';


	}

	/**
	 * 支付
	 */
	function actionPay(){
		$urlp = app_config('resource_url');
        $amount = $this->getParam('amount');
        $msg = $this->getParam('msg');
        $test = $this->getParam('test');
        $history = $this->getParam('hitory');
		$rr = PL::getClient();
		$pid = $rr->user;
		$uid = model_UserGenid::getUid($pid,$isnew);
		$um = new model_User($uid);
		$udata = $um->get(array('pinfo'=>1,'a.gem'=>1));
		$gem = $udata['a']['gem'];
		$mon = new  PL_Db_Mongo(DbConfig::getMongodb('order'));
		if($history){
			$orders = $mon->findByIndex('order',array('pid'=>$rr->user,'status'=>1));
		}
		if($gem < 1)
			$gem = 0;
        if($amount > 0){
			$oid =  microtime(true);//订单必须为long
			$data['_id'] = $oid;
			$data['ctime'] = $_SERVER['REQUEST_TIME'];
			$data['pid'] = $rr->user;
			$data['amount'] = $amount;
			$data['msg'] = $msg;
			$data['test'] = $test;
            $ret = $rr->pay_regOrder($oid,$amount,$msg,$test);
			$mon->save($data);
			print_r($ret);
			return ;


        }
		include $this->bodyView =  $this->viewRoot."page.pay.php";
	}

	function actionApi(){
		 $this->bodyView =  $this->viewRoot."api.test.php";
		 include  $this->viewRoot.'layout.php';

	}

	function actionOld(){
		include $this->viewRoot."old.php";

	}

	// 平台回调生成订单地址
	public function actionCbgetNewOrder(){
	}

	//支付完成后回调
	public function actionCbPay(){

	}


}
