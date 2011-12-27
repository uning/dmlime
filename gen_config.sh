#!/bin/sh

#
# gen_config.sh
#
# Developed by Tingkun <tingkun@playcrab.com>
# Copyright (c) 2011 Playcrab Corp.
# Licensed under terms of GNU General Public License.
# All rights reserved.
#
# Changelog:
# 2011-12-26 - created
#
cd dmdata && svn up
~/work/sys/php_5.4.0RC4/bin/php ../convert_csv.php
