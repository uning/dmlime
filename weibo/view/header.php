<?php
foreach ($this->cssFiles as $file){
	echo "<link type='text/css' rel='stylesheet' href='$file'></link>\n";
}
foreach ($this->hjsFiles as $file){
	echo "<script type='text/javascript' src='$file'></script>\n";
}
