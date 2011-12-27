#!/bin/sh

#
# compile.sh
#
# Developed by Tingkun <tingkun@playcrab.com>
# Copyright (c) 2011 Playcrab Corp.
# Licensed under terms of GNU General Public License.
# All rights reserved.
#
# Changelog:
# 2011-12-27 - created
#

#bin/lime.py build helloworld -o helloworld/compiled/hw_adv.js -a -p helloworld.start
cd ../
bin/lime.py  build dm -o dm/compiled/dm.js -a -p dm.start
