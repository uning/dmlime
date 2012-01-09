<?php

function usage($m){
	echo <<<EOF
     <pre>
     $m
    ./genicon.php fn x y w h sx sy ofn
       fn  -- 大图名字
       x   -- 起始x，
       y   -- 起始x，
       w   -- 默认50
       h   -- 默认50

       sx  -- x上放大倍数 default 1
	   sy  -- y上放大倍数 default 1 
       ofn  -- 输出文件名，默认 fn_x_y
EOF;
die();
}

$sname = php_sapi_name();
if($sname != 'cli'){//for console
	$fn = $_REQUEST['fn'];
	$x = $_REQUEST['x'];
	$y = $_REQUEST['y'];
	$w = $_REQUEST['w'];
	$h = $_REQUEST['h'];
	$sx = $_REQUEST['sx'];
	$sy = $_REQUEST['sy'];
	$ofn = $_REQUEST['ofn'];
}else{
	$_REQUEST = $argv;
	$fn = $_REQUEST[1];
	$x = $_REQUEST[2];
	$y = $_REQUEST[3];
	$w = $_REQUEST[4];
	$h = $_REQUEST[5];
	$sx = $_REQUEST[6];
	$sy = $_REQUEST[7];
	$ofn = $_REQUEST[8];
	
}

$INDIR=__DIR__.'/dmdata/dmimg/';
$OUTDIR=__DIR__.'/assets/icons/';

if(!$fn || !file_exists($INDIR.$fn)){
	usage("$INDIR$fn not exists\n");

}
if(!$x)
	$x = 0;
if(!$y)
	$y = 0;
if(!$w)
	$w = 50; 
if(!$h)
	$h = $w;
if(!$sx)
	$sx = 1;
if(!$sy)
	$sy = $sx;

$ow = $w * $sx;
$oh = $h * $sx;


if(!$ofn){
	$ofn = basename($fn);
	$an = explode('.',$fn);
	$ext = end($an);
	//array_pop($an);
	$ofn = $an[0];
	$ofn.=".$x.$y.$ow.$oh.png";

}
$data = array(
	'width'=>'550',
	'height'=>'700',
);

//print_r(gd_info());exit;
// create image
$oim = imagecreatetruecolor($ow, $oh);
$background = imagecolorallocatealpha($oim,255,255,255,127);

$sim = imagecreatefromstring(file_get_contents($INDIR.$fn));

//imagecopyresampled($oim, $sim, 0, 0, $x, $y, $ow, $oh, $w, $h);
imagecopyresized($oim,$sim,0,0,$x,$y,$ow,$oh,$w,$h);
$info = getimagesize($INDIR.$fn);
if ( ($info[2] == IMAGETYPE_GIF) || ($info[2] == IMAGETYPE_PNG) ) {
	$trnprt_indx = imagecolortransparent($sim);
	// If we have a specific transparent color
	if ($trnprt_indx >= 0) {
		// Get the original image's transparent color's RGB values
		$trnprt_color    = imagecolorsforindex($sim, $trnprt_indx);
		// Allocate the same color in the new image resource
		$trnprt_indx    = imagecolorallocate($image_resized, $trnprt_color['red'], $trnprt_color['green'], $trnprt_color['blue']);
		// Completely fill the background of the new image with allocated color.
		imagefill($oim, 0, 0, $trnprt_indx);
		// Set the background color for new image to transparent
		imagecolortransparent($oim, $trnprt_indx);
	}
	// Always make a transparent background color for PNGs that don't have one allocated already
	elseif ($info[2] == IMAGETYPE_PNG) {
		// Turn off transparency blending (temporarily)
		imagealphablending($oim, false);
		// Create a new transparent color for image
		$color = imagecolorallocatealpha($oim, 0, 0, 0, 127);

		// Completely fill the background of the new image with allocated color.
		imagefill($oim, 0, 0, $color);

		// Restore transparency blending
		imagesavealpha($oim, true);
	}
}


// flush image
if( 0 && $sname !='cli'){
header('Content-type: image/png');
imagepng($oim);
}
imagepng($oim,$OUTDIR.$ofn);
echo <<<DOC
<script type="text/javascript" src="assets/js/jquery.js"></script>
<div style='background-color:red;'>
<img src='assets/icons/$ofn?{$_SERVER['REQUEST_TIME']}' ></img> 
</div>
<hr/>
<form >
fn:<input name='fn' value='$fn' size='5'></input>
x:<input name='x' value='$x' size='5'></input>
y:<input name='y' value='$y' size='5'></input>
w:<input name='w' value='$w' size='5'></input>
h:<input name='h' value='$h'size='5'></input>
sx:<input name='sx' value='$sx' size='5'></input>
sy:<input name='sy' value='$sy' size='5'></input>
<input type='submit' value='确定'></input>

</form>
<hr/>
<div style='background-color:green;'>
<img id='mainimg' src='dmdata/dmimg/$fn' ></img> 
<div id='mapp' style='border:1px   red   Solid;position:absolute; width:5px; height:5px; z-index:0; left: 50px; top: 77px; filter:Alpha(opacity=80);'></div>
</div>

<script>

/*
$('#mainimg').mouseover(
);
*/
$('#mainimg').mousemove(
  function (e){
  if(x1 != -1  ){
     w = e.offsetX - x1;
     h  = e.offsetY - y1;
     pdiv.css({'width':w + 'px','height':h + 'px'});
  }
}
);
var pdiv = $('#mapp')
pdiv.click(function (e){
    x2 = e.pageX - x2 ;
    y2 = e.pageY - y2;
    $('form input[name="w"]').val(x2);
    $('form input[name="h"]').val(y2);
    console.log('div',e.pageX,e.pageY,x1,y1,x2,y2);
    pdiv.css({'width':1 + 'px','top':-1000 + 'px'});
    x1 = -1;
  
}
);
var x1 = -1,y1,x2 = -1,y2

$('#mainimg').click(
  function(e){
  console.log(e);
  if(x1 == -1){
     x1 = e.offsetX ;
     y1 = e.offsetY ;
    $('form input[name="x"]').val(x1);
    $('form input[name="y"]').val(y1);
     x2 =  e.pageX ;
     y2 =  e.pageY ;
     pdiv.css({'top':e.pageY + 'px','left':e.pageX + 'px',height:'5px',width:'5px'});
     console.log('img',e.pageX,e.pageY,x1,y1,x2,y2);
  }else{
    x2 = e.offsetX - x1 ;
    y2 = e.offsetY - y1;
    console.log('img',e.pageX,e.pageY,x1,y1,x2,y2);
    $('form input[name="w"]').val(x2);
    $('form input[name="h"]').val(y2);
    pdiv.css({'width':1 + 'px','top':-1000 + 'px'});
    x1 = -1;
    
  }
}
);


</script>

DOC;
