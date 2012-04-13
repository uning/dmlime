<?php
foreach ($this->cssFiles as $file){
	echo "<link type='text/css' rel='stylesheet' href='".STATIC_URLP."$file'></link>\n";
}
foreach ($this->hjsFiles as $file){
	echo "<script type='text/javascript' src='".STATIC_URLP."$file'></script>\n";
}
