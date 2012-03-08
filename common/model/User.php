<?php
/*
 * User.php
 *
 * Developed by Tingkun <tingkun@playcrab.com>
 * Copyright (c) 2011 Playcrab Corp.
 * Licensed under terms of GNU General Public License.
 * All rights reserved.
 *
 * Changelog:
 * 2011-05-20 - created
 *
 */

class model_User  extends PL_Db_Mongo_User{

	public function __construct($u,$collname = 'user'){
		$this->_u  = $u;
		$this->_collname = $collname;
		$this->_mc = new PL_Db_Mongo(DbConfig::getMongodb($this->_collname));
	}
}


