<?php
require 'WeiyouxiClient.php';
try
{
	$weiyouxi = new WeiyouxiClient( '���APP Key' , '���APP Secret' );
	$userId = $weiyouxi->getUserId();
	//����API�ӿ�
	$info = $weiyouxi->get( 'user/show' , array( 'uid' => 1936344094 ) );
	echo '����ӿڳɹ�:';
	var_dump( $info );
}
catch( Exception $e )
{
	echo '����ӿ�ʧ��:';
	var_dump($e);
}