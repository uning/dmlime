<?php
/**
 * autoload.php
 *
 * Developed by Tingkun <tingkun@playcrab.com>
 * Copyright (c) 2011 Playcrab Corp.
 * All rights reserved.
 *
 * Changelog:
 * 2011-06-16 - created
 *
 */

#define('PL_ROOT',__DIR__.'/lib');
define('PL_ROOT',__DIR__.'/plframework');
require PL_ROOT.'/PL/ClassLoader.php';
$loader = PL_ClassLoader::getInstance();
$loader->registerPrefixes(array(
	'model_' => __DIR__.'/common/'
	,'PL_' => PL_ROOT
));
$loader->register();
