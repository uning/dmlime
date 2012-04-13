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
    static $redises = array(
		'session'=>array(
            'user_num_per_db'=>200000,
			'shardings'=>array(
				array(
					array('host'=>'127.0.0.1','port'=>53000),
				),

			)
		),
    );

	static $mongodb_def_cstr = 'mongodb://localhost:35050';
	static $mongodb_def_db = 'dm';
	static $mongodb_def_option = array();
	static $mongodbs = array(
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
