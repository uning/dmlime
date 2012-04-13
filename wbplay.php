<?php
/**
 * wbplay.php
 *
 * Developed by Tingkun <tingkun@playcrab.com>
 * Copyright (c) 2012 Platon Group, http://platon.sk/
 * All rights reserved.
 *
 * Changelog:
 * 2012-04-13 - created
 *
 */
define('P_PLATFORM','weibo');
require_once __DIR__.'/base.php';
PL_Session::usecookie(true);
PL_Session::start();
echo "<pre>";
print_r($_SESSION);
