
<style type="text/css">
table {
	font-size: 12px;
	font-weight: lighter;
	width: 750px;
	margin: 10px 0 5px 0;
	text-align: left;
	margin-left: 5px;
	margin-right: 5px;
	padding-left: 5px;
	padding-right: 5px;
	/*background-color: bbbb99;*/
}
p{
	
}
font{
	font-weight: bold;
}
a{
	font-size: 12px;
	font-weight: normal;
}
.title{
	font-size: 14px;
	font-weight: 1000;
	color: 3366bb;
}
a:link  {
	text-decoration:none;
	color:3366bb; 
}
a:visited{
	text-decoration:none;
	color:3366bb; 
}
</style>
<script type="text/javascript">
		function toFlash()
		{
			window.parent.switchToFlash(); 
		}
		function goTo(name){
			scroller(name,100);//window.location = window.location.protocol+window.location.pathname+"#"+name;
		}
		
function intval(v) 
{

	v = parseInt(v); 
	return isNaN(v) ? 0 : v; 
}

  
function getPos(e) 
{ 
	var l = 0; 
	var t = 0; 
	var w = intval(e.style.width); 
	var h = intval(e.style.height); 
	var wb = e.offsetWidth; 
	var hb = e.offsetHeight; 
	while (e.offsetParent){ 
	l += e.offsetLeft + (e.currentStyle?intval(e.currentStyle.borderLeftWidth):0);

	t += e.offsetTop + (e.currentStyle?intval(e.currentStyle.borderTopWidth):0);

	e = e.offsetParent; 
	} 
	l += e.offsetLeft + (e.currentStyle?intval(e.currentStyle.borderLeftWidth):0);

	t += e.offsetTop + (e.currentStyle?intval(e.currentStyle.borderTopWidth):0); 
	return {x:l, y:t, w:w, h:h, wb:wb, hb:hb}; 
}

  
 
function scroller(el) 
{  
	if(typeof el != 'object') { el = document.getElementById(el); }  
	var scroll  = document.getElementById('scroller');
	if(!el) {scroll.scrollTop=0; return;}
 	var p = getPos(el); 
     
 	scroll.scrollTop =  p.y-60; 
} 
		
		</script>
		
<body bgcolor="#ffffff">


<div style="text-align: center;border: #3399bb solid 1px;">
<table id="head" style='width:99%'>
<tr> 
<td align="right"><a onclick="toFlash()" style="cursor: pointer;"><img src="<?php echo $urlp;?>images/css/close.png"/></a></td>
</tr>
</table>


<div id='scroller' style="text-align: center;overflow-y:scroll;height:500px;">


<table>


<tr height="20px" align="left">
<td ><a onclick="goTo('q')" href='javascript:void(0);'>哪些需要由你来决定</a></td>
<td><a onclick="goTo('q2')" href='javascript:void(0);'>&nbsp;&nbsp;&nbsp;销售秘笈</a></td>
</tr>
<tr height="20px" align="left">
<td><a  onclick="goTo('q3')" href='javascript:void(0);'>进货秘笈</a></td>
<td><a  onclick="goTo('q4')" href='javascript:void(0);'>&nbsp;&nbsp;&nbsp;怎样升级更快呢</a></td>
</tr>
<tr height="20px" align="left">
<td><a  onclick="goTo('q5')" href='javascript:void(0);'>装扮商场</a></td>
<td><a  onclick="goTo('q6')" href='javascript:void(0);'>&nbsp;&nbsp;&nbsp;关心一下你的顾客吧	</a></td>
</tr>
<tr height="20px" align="left">
<td colspan="2"><a  onclick="goTo('q7')" href='javascript:void(0);'>如果我离线了，我的商场还能赚钱么？</a></td>
</tr>
</table>

<table id="q" border="0" cellpadding="0"  cellspacing="0">
<tr class="title"><td width="90%">哪些需要由你来决定</td><td width="10%" style='text-align:right'><a href='javascript:void(0)' onclick='goTo(0)' >[TOP]</a></td></tr>
<tr>
<td colspan="2">
<hr color="6699bb" width="100%">
<ul>
<li>
通过进货，出售不同的商品，如烤鸭、牛排、家庭影院、鲜花…， 看看都会吸引到什么顾客前来吧。	
</li>
<li>购买各种货车来采购商场出售的商品</li>
<li>楼体，墙纸，地板，店面，特殊店面，店面装饰，各种不同的搭配，老板，你的地盘你做主。	</li>
<li>拜访好友的商场、帮助好友增加商品、互赠礼物…，帮助好友可是利人利己的美差事哦。	</li>
<li>随着等级提高，商厦的扩大，将会不断地有新功能开启，更多有趣的任务、客人、装饰等着你，他们给你带来更多的奖励哦。	
</li>
</ul>
</td>
</tr>
</table>
<table id="q2" border="0" cellspacing="0" cellpadding="0">
<tr class="title"><td width="90%">销售秘笈</td><td width="10%" style='text-align:right'><a href='javascript:void(0)' onclick='goTo(0)' >[TOP]</a></td></tr>
<tr>
<td colspan="2" >
<hr color="6699bb" width="100%">
<p>
不同的商品生成的店面宽度不同，摆放一个店面需要足够的空间。 每一个店铺在同一时间只能出售一种商品，出售的时间根据不同的商品而不同，但店铺可以存放不同种类的商品， 当上一类商品出售完成以后，存放的商品会自动上架进行出售。 你的人气值越高，你的商品就会更快的卖出去。每一位客人进入 商厦会提示需要商品，然后进入你的商厦进行购买。	
</p>
 	</td>
	</tr>
</table>
<table id="q3" border="0" cellspacing="0" cellpadding="0">
<tr class="title"><td width="90%">进货秘笈</td><td width="10%" style='text-align:right'><a href='javascript:void(0)' onclick='goTo(0)' >[TOP]</a></td></tr>
<tr>
<td colspan="2">
<hr color="6699bb" width="100%">
<p>先要进货才能卖货，强大的进货车队对商场的经营至关重要。购买卡车放置到车库， 车库在商厦的最下面，随着等级的升高，车库会自动增大。 然后选择卡车，点取需要的商品，卡车就会出发，你就等着收取货物吧。 时间到了，卡车会返回车库，你点取货物之后，货物将存放在商品仓库里面。	
</p>
</td>
</tr>
</table>
<table id="q4" border="0" cellspacing="0">
<tr class="title"><td width="90%">怎样升级更快呢</td><td width="10%" style='text-align:right'><a href='javascript:void(0)' onclick='goTo(0)' >[TOP]</a></td></tr>
<tr>
<td colspan="2">
<hr color="6699bb" width="100%">
<p>游戏里有多种方式可以获得经验值奖励： 例如，采购货物，收取货物，完成成就。
 随着商厦等级的提高，可以做更多的事情获得奖励哦！	
</p>

<font color="red">小提示</font>:每一次升级都会获得奖励，而且等级越高，才能加盖更高的商厦，获取更高的人气。
</td>
</tr>
</table>
<table id="q5" border="0" cellspacing="0">
<tr class="title"><td width="90%">装扮商场</td><td width="10%" style='text-align:right'><a href='javascript:void(0)' onclick='goTo(0)' >[TOP]</a></td></tr>
<tr>
<td colspan="2">
<hr color="6699bb" width="100%">
 <p>商厦里，还给大家准备了很多漂亮的物品，来装扮自己的商场。
 例如，墙纸粉饰你的商铺， 地毯装饰你的大楼，还可以在店铺门前摆放一个侍从，
 招待你的顾客，摆放各种漂亮的栏杆， 提供休闲的座椅等等~~	
</p>
<p>当然，你还可以给楼体换一个颜色，给楼顶换一个造型，提供更漂亮的电梯，还可以安装一 个实用手扶梯。</p>
</td>
</tr>
</table>
<table id="q6" border="0" cellspacing="0">
<tr class="title"><td width="90%">关心一下你的顾客吧</td><td width="10%" style='text-align:right'><a href='javascript:void(0)' onclick='goTo(0)' >[TOP]</a></td></tr>
<tr>
<td colspan="2">
<hr color="6699bb" width="100%">
<p>顾客的头上会冒出气泡，气泡或者是顾客的需求或者是顾客的心情，注意顾客们的动态才能将
商场经营得更好哦。	
</p>
</td>
</tr>
</table>
<table id="q7" border="0" cellspacing="0">
<tr class="title"><td width="90%">如果我离线了，我的商场还能赚钱么？</td><td width="10%" style='text-align:right'><a href='javascript:void(0)' onclick='goTo(0)' >[TOP]</a></td></tr>
<tr>
<td colspan="2">
<hr color="6699bb" width="100%">
<p>本游戏不需要挂机，离线情况下，只有商场中的店面还有商品在出售，
就会给你带来持续的收入，离线前摆好商品即可。记得注意留意店面的存货情况，
达到最大人气值的商场才是最高效的商场哈。	
</p>
</td>
</table>

</div>
</div>

