goog.provide('dm.User');
goog.require('dm.conf.FP');
goog.require('dm.conf.SP');
goog.require('dm.conf.EP');



/**
 * Single User
 * @constructor
 */
dm.User = function(uid){
  //从服务器获取自身信息
  this.lvl = 0;
  this.skills = {};
  this.equips ={};//0:head,1:body,2:cape,3:jewel,4:武器
  this.id = uid;
  this.sp = {};
  this.fp = {};//计算结果
  this.popuFP();
  this.popuSP();

}

//
//计算参与直接公式计算的属性
//默认初始值 + 装备二级属性值
//到一级属性值转换,
//
//只支持简单的 加点操作
//
dm.User.prototype.getFP = function(name){
	if(!dm.conf.FP[name]){
		console.error("getFP " , name, "not define");
		return 0;
	}
	var sps = {},i,j,v,ret = 0;
	//处理装备二级属性
	for ( i in this.equips ){
		v = this.equips[i] && this.equips[i].sp || {}
		for(j in v){
			sps[j] = sps[j] || 0;
			sps[j] += v[j];
		}
		v =  this.equips[i] && this.equips[i].fp && this.equips[i].fp[name] || 0;
		ret += v;
	}

	//加上自身二级属性
	for ( i in this.sp){
		sps[i] = sps[i] || 0;
		sps[i] += this.sp[i]
	}

	//二级属性到一级属性转换
	for( i in sps){
		v = dm.conf.SP[i] && dm.conf.SP[i].func && dm.conf.SP[i].func[name]  || 0;
		ret += v * sps[i];
	}
	ret += parseInt(dm.conf.FP[name] && dm.conf.FP[name].def) || 0;
	return ret;
}

dm.User.prototype.getSP=function(name){
	if(!dm.conf.SP[name]){
		console.error("getSP " , name, "not define");
		return 0;
	}

	var sps = {},i,j,v,ret = 0;
	//处理装备二级属性
	for ( i in this.equips ){
		v = this.equips[i] && this.equips[i].sp || {}
		for(j in v){
			sps[j] = sps[j] || 0;
			sps[j] += v[j];
		}
	}

	//加上自身二级属性
	for ( i in this.sp){
		sps[i] = sps[i] || 0;
		sps[i] += this.sp[i]

	}
	ret += sps[name] || 0;
	ret += parseInt(dm.conf.SP[name] && dm.conf.SP[name].def) || 0;
	return ret;
}

/**
 * 计算一级属性值
 * 在计算之前算一次，随装备变化
 */
dm.User.prototype.popuFP=function(){
	var i;
	for( i in dm.conf.FP){
		this.fp[i] = this.getFP(i);
	}
}

dm.User.prototype.popuSP=function(){
	var i;
	for(i in dm.conf.SP){
		this.sp[i] = this.getSP(i);
	}
}


//升级技能
dm.User.prototype.skillUp=function(name){

}

//升级装备
dm.User.prototype.equipUp=function(name){

	this.popuFP();
}

//购买装备
dm.User.prototype.equipBuy=function(name){
	var rand = Math.round(Math.random()*6);
	switch(rand){
		case 0:
			//head
			this.equips[0] = dm.conf.EP['head_'+this.lvl] || {};
			break;
		case 1:
			//body
			this.equips[1] = dm.conf.EP['body_'+this.lvl] || {};
			break;
		case 2:
			//cape
			this.equips[2] = dm.conf.EP['cape_'+this.lvl] || {};
			break;
		case 3:
			//jewel
			this.equips[3] = dm.conf.EP['jew_'+this.lvl] || {};
			break;
		default:
			//arm
			this.equips[4] = dm.conf.EP['arm_'+this.lvl] || {};
			break;
	}
	//处理属性

	/*
	if(rand < 4){
		this.equip[rand]
	}else{
		this.equip[4]
	}
	*/
	this.popuFP();
}

//人物升级
dm.User.prototype.lvlUp=function(){
	var i;
	for(i in this.sp){
		this.sp[i] += parseInt(dm.conf.SP[i] && dm.conf.SP[i].add) || 0;
	}
	this.popuFP();
	this.lvl += 1;
}

//装备属性
