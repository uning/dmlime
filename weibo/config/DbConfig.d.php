<?php
/*
 * db.php
 *
 * Developed by Tingkun <tingkun@playcrab.com>
 * Copyright (c) 2011 Playcrab Corp.
 * Licensed under terms of GNU General Public License.
 * All rights reserved.
 *
 * Changelog:
 * 2011-05-19 - created
 *
 */


class DbConfig extends   PL_Config_Db
{
    static $ttservers=array(
        'main'=> array(
            'user_num_per_db'=>200000,
            'shardings'=>array(
                array(
                    array('host'=>'127.0.0.1','port'=>'52000'),
                )
            )
        ),
        'cha'=> array(
            'user_num_per_db'=>200000,
            'shardings'=>array(
                array(
                    array('host'=>'127.0.0.1','port'=>'52000'),
                )
            )
        ),
        'genid'=> array(
            'shardings'=>array(
                array(
                    array('host'=>'127.0.0.1','port'=>'51000'),
                )
            )
        ),
    );
    static $mysqls = array(
        'log'=>array(
            'host'=>'127.0.0.1',
            'port'=>3306,
            'username' => 'root',
            'password' => '',
            'dbname'   => 'mall_paylog'
        ),
    );
    static $redises = array(
        //redis.cache.53002.conf  redis.rank.53004.conf  redis.record.53006.conf  redis.session.53000.conf
		'session'=>array(
            'user_num_per_db'=>200000,
			'shardings'=>array(
				array(
					array('host'=>'127.0.0.1','port'=>53000),
				),

			)
		),
        'record'=>array(
            'host'=>'127.0.0.1',
            'port'=>53006,
        ),
        'rank'=>array(
            'host'=>'127.0.0.1',
            'port'=>53004,
        ),
        'cache'=>array(
            'host'=>'127.0.0.1',
            'port'=>53002,
        ),
    );

	static $mongodb_def_cstr = 'mongodb://localhost:35050';
	static $mongodb_def_db = 'test';
	static $mongodb_def_option = array();
	static $mongodbs = array(
		'session'=>array(
			'cstr'=>'',
			'db'=>'',
			'option'=>array()
		),
		'user'=>array(
			'option'=>array()
		),
		'feed'=>array(
			'option'=>array()
		),
		'friend'=>array(
			'option'=>array()
		),
		'log'=>array(
			'option'=>array()
		),
	);


}
