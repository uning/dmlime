 
<style>  
  
#pay-body{  
}
.user-info {
height:60px;
margin:0 20px;
padding:10px 10px 10px 90px;
}
.user-info h2{
text-align:left;
}
.user-info p{
padding:10px 0 0;
text-align:left;
}
.user-info p label {
background:url("<?php echo $urlp ?>images/gem.png") no-repeat scroll 5px center #FFFAEF;
border:1px solid #E2C925;
margin-right:10px;
padding:5px 20px 6px 25px;
}
.user-info p label span {
color:#336699;
padding-left:5px;
}
.user-info .avatar{
-moz-border-radius:3px 3px 3px 3px;
-moz-box-shadow:1px 1px 2px #CCCCCC;
border:1px solid #B2B2B2;
display:block;
float:left;
height:50px;
margin-left:-70px;
padding:2px;
}
.user-info .avatar img{
width: 50px;
height: 50px;
}
.pay-form {
padding:10px 30px;
 }
.pay-form h2 {
font-size:14px;
font-weight:normal;
padding:10px 30px;
}
.pay-type{
padding-left: 30px;
}
.pay-type li div {
text-indent:-9999px;
}
.pay-type li {
	float:left;
	cursor:pointer;
	height:230px;
	padding-left:10px;
	position:relative;
	text-align:center;
	width:150px;
}

.pay-type li .paypay{
	background:url("<?php echo $urlp ?>images/payment1.png?v=1") no-repeat scroll center top transparent;
	height:210px;
}
.pay-type li input {
background:url("<?php echo $urlp ?>images/payment1.png?v=1") no-repeat scroll center top transparent;
 background-position: -19px -205px;
border:0 none;
bottom:24px;
cursor:pointer; 
height:50px;
position:absolute;
right:26px;
width:120px;
}
.pay-type li .gem-10-50 {
background-position:-638px 50%;
}
.gem-10-50 .pay-select{
	bottom:74px;
	position:absolute;
	right:25px;
}
.gem-10-50 .gem-num{
position:absolute;
right:21px;
text-indent:-1px;
top:18px;
}
.gem-10-50 .gem-num  img{
height:51px;
width:64px;
}

.pay-type li .gem-100 {
background-position: 0;
}
.pay-type li .gem-200 {
background-position:-156px 50%;
}
.pay-type li .gem-500 {
background-position:-312px 50%; 
}
.pay-type li .gem-1000 {
background-position:-478px 50%
}
.payment-type label{
padding-right:20px;
}


.pay-tab {
background:url("<?php echo $urlp ?>images/pay_feedbottombg.gif") repeat-x scroll center bottom transparent;
clear:both;
margin-left:30px;
overflow:hidden;
padding-left:10px;
}
.pay-tab li.current {
background:url("<?php echo $urlp ?>images/pay_menubg.gif") no-repeat scroll left -72px transparent;
}
.pay-tab ul li {
background-image:url("<?php echo $urlp ?>images/pay_menubg.gif");
background-position:left -179px;
background-repeat:no-repeat;
float:left;
font-size:14px;
margin-left:3px;
margin-right:5px;
overflow:hidden;
padding-left:5px;
text-align:center;
}

.pay-tab li.current a {
background:url("<?php echo $urlp ?>images/pay_menubg.gif") no-repeat scroll right 1px transparent;
color:#333333 !important;
font-weight:bold;
padding:0 15px 0 10px;
}
.pay-tab li a {
background:url("<?php echo $urlp ?>images/pay_menubg.gif") no-repeat scroll right -179px transparent;
display:block;
float:left;
font-weight:bold;
height:31px;
line-height:31px;
margin-left:-3px;
padding:0 15px 0 10px;
}
.pay-tab li a:hover{
text-decoration:none;
}
 </style>

<script type="text/javascript">

 
function callback(responseItem){
	var errCode = responseItem.getErrorCode();
	var errMsg = responseItem.getErrorMessage();
	var params = responseItem.getData();
	console.debug("params",params);
	var msg;
	if (errCode == Payment.ResponseCode.OK) {
 		msg = "平台充值结果为：成功充值" +params.message  +"。如果显示结果不对，尝试刷新页面。确定返回游戏";
		
	 
		var alert_dialog = new Dialog(
				Dialog.DIALOG_CONFIRM, 
				{message: msg,title: '充值结果',callBack:function(confirm){ 
					if(confirm){
					var addGem = parseInt(params.amount) * 10; 
					var gemNode = document.getElementById('gemValue'); 
					console.debug("gemNode",gemNode.getInnerHTML(),addGem);
					gemNode.setTextValue(parseInt(gemNode.getInnerHTML() ) + parseInt(addGem) );
					document.setLocation('<?php echo PL::canvas_url; ?>');
					}else{
					}
				} }
		);
	}
	else if (errCode == Payment.ResponseCode.USER_CANCELLED) {
		msg = "用户取消了消费。";
	}
	else {
		msg = "由于某种原因没支付成功。";
	}
	
}

function requestPayment(amount,gem,message) {
	var payType = Payment.PaymentType.PAYMENT;
 

	var params = {}; 
	params[Payment.Field.AMOUNT] = amount; 
	params[Payment.Field.MESSAGE] = message;
	params[Payment.Field.PARAMETERS] = "{name:'gem',amount:"+amount+",gem:"+gem+",message:"+message+",pid:<?php echo $pid;?>}"; 
	params[Payment.Field.PAYMENT_TYPE] = payType; 
	params[Payment.Field.SANDBOX] = true; //
	var itemParams1 = {}; 
	itemParams1[Payment.BillingItem.SKU_ID] = 'gem'; 
	itemParams1[Payment.BillingItem.PRICE] = amount; 
	itemParams1[Payment.BillingItem.COUNT] = gem; 
	itemParams1[Payment.BillingItem.DESCRIPTION] = message; 
	params[Payment.Field.ITEMS] = [itemParams1];
	//可以有多个item构成一个购物车
	Payment.requestPayment(callback,params);
}

function changePayNum(){
	var index = document.getElementById('pay_num_select').getSelectedIndex();
	var i = index +1;
	document.getElementById('gem-num-img-5').setStyle('display', 'none');
	document.getElementById('gem-num-img-4').setStyle('display', 'none');
	document.getElementById('gem-num-img-3').setStyle('display', 'none');
	document.getElementById('gem-num-img-2').setStyle('display', 'none');
	if(i>1){
		document.getElementById("gem-num-img-"+i).setStyle('display', '');
	}
}
function request1050Payment(){
	var index = document.getElementById('pay_num_select').getSelectedIndex();
	var i = index +1;
	var gem = i*10;
	requestPayment(i,gem,gem+"个宝石");
}

</script>

 

<div id='content'>
    <div class='container'>
        <div class='canvas'>
		    <div id='pay-body'>
				<div class='user-info'>
					<span class='avatar'>
						<xn:profile-pic uid="<?php echo $pid;?>" linked="false" size="tiny" />
					</span>
					<h2><xn:name uid="<?php echo $pid;?>" linked="false" shownetwork="false" /></h2>
					<p>
						<label>
							宝石余额: <span class='gem' id='gemValue'><?php echo $gem; ?></span>
						</label>
					</p>
				</div>
						

				
				
				<div class='pay-tab'> 
						<ul style="clear:both;">
<?php if(!$history){?>
						     <li><a  href="<?php echo PL::canvas_url.url(array('action'=>'pay','hitory'=>1,'xn_force_mode'=>0));?>">充值记录</a></li>
<?php }?>
							 <li><a  href="<?php echo PL::canvas_url;?>">返回游戏</a></li>
							 <li style='display:none'><a target="_top" href=" " >消费记录</a></li>
						</ul>
 				</div>
				
				<div class='pay-form'>
				     
<?php if($history){?>
					<h2>充值记录:</h2>
				     <table style='margin-left:40px;width:700px;'>
						<tr style='font-weight:bold;font-size:12px;'>
							<td>订单号</td><td>人人豆</td><td>宝石数</td> 
						</tr>
						
						
						
						<?php foreach($orders as $ordernum =>$order){ ?>
							<tr style='font-weight:normal;font-size:12px;'>
							  <td><?php echo $ordernum; ?></td>
							  <td><?php echo $order['amount']; ?></td>
							  <td><?php echo $order['gem']; ?></td>
						 
							</tr>
							
						<?php } ?>
					</table>
<?php } ?>
					<h2>选择你要充值的面值</h2>
					
					<ul class="pay-type clearfix">
						<li  style='display:none;'>
							<div class='paypay gem-10-50'>
								<div title="充值10-50个宝石">充值10-50个宝石</div>
								<div class='gem-num'>
									<img  id='gem-num-img-5'  src='<?php echo $urlp; ?>images/gem_50.png' />
									<img id='gem-num-img-4' style='display:none' src='<?php echo $urlp; ?>images/gem_40.png' />
									<img id='gem-num-img-3' style='display:none' src='<?php echo $urlp; ?>images/gem_30.png' />
									<img id='gem-num-img-2' style='display:none'  src='<?php echo $urlp; ?>images/gem_20.png' /> 
									
								</div>
								<select class='pay-select' id='pay_num_select'  onchange="changePayNum();">
										 <option value="1" >1</option>
										 <option value="2">2</option>
										 <option value="3">3</option>
										 <option value="4">4</option>
										 <option value="5" selected="">5</option> 
								</select>
								<p><input type="button" onclick="request1050Payment();return false;" value="   " class="btn-red"></p>
								<div>价格：<span style="font-weight: bold; color: #009900;">10</span>个人人豆</div>
							</div>
						</li>
						<li onclick="requestPayment(10,100,'100个宝石');return false;" >
							<div class='paypay gem-100'>
								<div title="充值100个宝石">充值100个宝石</div>
								<p><input type="button" value="   " class="btn-red"></p>
								<div>价格：<span style="font-weight: bold; color: #009900;">10</span>个人人豆</div>
							</div>	
						</li>
						<li  onclick="requestPayment(20,200,'200个宝石');return false;">
							<div class='paypay gem-200'>
								<div title="充值200个宝石">充值200个宝石</div>
								<p><input type="button" value="   " class="btn-red"></p>
								<div>价格：<span style="font-weight: bold; color: #009900;">20</span>个人人豆</div>
							</div>	
						</li>
						<li  onclick="requestPayment(50,500,'500个宝石');return false;" >
							<div class='paypay gem-500'>
								<div title="充值500个宝石">充值500个宝石</div>
								<p><input type="button" value="   " class="btn-red"></p>
								<div>价格：<span style="font-weight: bold; color: #009900;">50</span>个人人豆</div>
							</div>
						</li> 
						<li onclick="requestPayment(100,1000,'1000个宝石');return false;">
							<div class='paypay gem-1000'>
								<div title="充值1000个宝石">充值1000个宝石</div>
								<p><input type="button" value="   " class="btn-red"></p>
								<div>价格：<span style="font-weight: bold; color: #009900;">100</span>个人人豆</div>
							</div>
						</li>
					</ul>
					
					<h2>宝石可以用来使货车进货加速或者增加店面人气，还可以购买很多特殊店面哦~ <br/><b>PS:购买后宝石后，在游戏里面批量购买很多道具都有打折的哦</b></h2>
				</div> 
			</div>			 
		
		</div>
	</div>
</div>


