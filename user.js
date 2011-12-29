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
  this.eqp_add = {};//存装备的附加属性
  this.id = uid;
  this.attr_arm = dm.conf.EP.attack.attr;
  this.attr_def = dm.conf.EP.defense.attr;
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
		v = parseInt(this.equips[i] && this.equips[i].fp && this.equips[i].fp[name]) || 0;
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

/**
 *当用户集齐100个金币的时候，可以进入商店
 *    商店中随机选择3个部位，可以对该部位装备进行升级或者更新。
 *    升级可以升级装备主属性或者附加属性。
 *    选择更新，则会随机替换一个附加属性(变成初级附加属性)。
 */
dm.User.prototype.enterShop=function(){
	var i,eqps;
	var rand = Math.round(Math.random()*4);
	this.upgrade(4,0);//rand,0);
	this.refresh(4);
}


//升级属性：选择升级主属性或者附加属性
//eqpid:
//      0 head, 1 body, 2 cape, 3 jew, 4 arm
dm.User.prototype.upgrade=function(eqpid, type){ //type = 0:主属性,type = 1:附加属性;//1, =2:附加属性2
	equiplvl = parseInt(this.equips[eqpid] && this.equips[eqpid].lvlneed || 0) +1;
	if(!type){//升级主属性
	switch(eqpid){
		case 0:
			//head
			this.equips[0] = dm.conf.EP['head_'+equiplvl] || {};
			break;
		case 1:
			//body
			this.equips[1] = dm.conf.EP['body_'+equiplvl] || {};
			break;
		case 2:
			//cape
			this.equips[2] = dm.conf.EP['cape_'+equiplvl] || {};
			break;
		case 3:
			//jewel
			this.equips[3] = dm.conf.EP['jew_'+equiplvl] || {};
			this.game.data.hp += parseInt(this.equips[3].fp.a6 - dm.conf.EP['jew_'+(equiplvl-1)].fp.a6);
			this.game.data.mana += parseInt(this.equips[3].fp.a5 - dm.conf.EP['jew_'+(equiplvl-1)].fp.a5);
			break;
		default:
			//arm
			this.equips[4] = dm.conf.EP['arm_'+equiplvl] || {};
			break;
	}
	}else{
		//type = type -1;
		var i,j=0,num;
		num = Math.round(Math.random());
		for(i in this.equips[eqpid].attr){
			if(j == num){
				//升级附加属性
				switch(this.equips[eqpid].attr[i].charAt(0)){
					case "a":
						this.equips[eqpid].attr[i] += dm.conf.FP[i].inc;
						break;
					case "b":
						this.equips[eqpid].attr[i] += dm.conf.SP[i].inc;
						break;
				}
				break;
			}
			j++;
		}
	}
	this.popuFP();
}

/*
 * 刷新装备，随机属性会改变
 * 每次随机产生一个属性，如果装备属性不足2个，则附加该属性；如果装备属性已经达到2个，则随机替换掉其中一个。
 */
dm.User.prototype.refresh=function(eqpid){
	var type = parseInt(this.equips[eqpid].type);
	var i,j,ch,sub,prop,rand_att,
		ct = 0;
	var	eqp_add = this.eqp_add[eqpid];
	var exist = new Array();//已有属性
	var item;
	var fp = dm.conf.FP;
	//var sp = dm.conf.SP;

	switch(type){
		case 1:
			item = this.attr_arm;
		break;
		case 2:
			item = this.attr_def;
		break;
	}
	if(eqp_add){
		for(i in eqp_add){
			for(j in item){
				if(item[j] == i){
					delete item[j];
					item.sort();
					item.length = item.length - 1;
				}
			}
			ct++; //已有属性个数
			exist.push(i);
		}
		ch = item[Math.round(Math.random()*(item.length - 1))];//选中属性
		if(ct > 1){
			sub = this.findKey(eqp_add);
			sub = sub[Math.round(Math.random())];
			delete eqp_add[sub];
		}else{
			sub = ch;
		}
		eqp_add[ch] = parseInt(fp[ch].def);
	}else{
		this.eqp_add[eqpid] = {};
		eqp_add = this.eqp_add[eqpid];
		rand_att = fp[item[Math.round(Math.random()*(item.length-1))]];
		eqp_add[rand_att['id']] = parseInt(rand_att.inc);
	}
	this.addatt(eqpid);
	this.popuFP();
}

//生成的随机属性加入到中去，统一处理
dm.User.prototype.addatt=function(eqpid){
	var i,eqp,add_att;
	add_att = this.eqp_add[eqpid];
	eqp = this.equips[eqpid];
	for(i in add_att){
		switch(i.charAt(0)){
			case 'a':
				eqp['fp'][i] = add_att[i];
				eqp['func'][i] = add_att[i];
				break;
			case 'b':
				break;
		}
	}

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

//
//在{附加属性：附加值}对中，找到附加属性键名并返回为数组形式
//
dm.User.prototype.findKey=function(array){
	array = array || {};
	var i,index;
	index = new Array();
	for(i in array){
		index.push(i);
	}
	return index;
}
