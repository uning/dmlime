<?php
/**
 * index.php
 *
 * Developed by Tingkun <tingkun@playcrab.com>
 * Copyright (c) 2011 Playcrab Corp.
 * Licensed under terms of GNU General Public License.
 * All rights reserved.
 *
 * fortest
 * Changelog:
 * 2011-05-23 - created
 *
 */
require_once __DIR__.'/base.php';
require_once __DIR__.'/App.php';
header("content-type:application/json;charset=utf-8");

App::run('api');

