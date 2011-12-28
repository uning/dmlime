<?php

/**
 * common/model/model_Genid.php
 *
 * Developed by Tingkun <tingkun@playcrab.com>
 * Copyright (c) 2011 Playcrab Corp.
 * Licensed under terms of GNU General Public License.
 * All rights reserved.
 *
 * Changelog:
 * 2011-05-23 - created
 *
 */

class model_Genid extends PL_Db_Genid
{
	static function getDbc(){
		return new PL_Db_Genid_Redis();
	}

}
