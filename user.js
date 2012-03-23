goog.provide('dm.User');
goog.require('dm.conf.FP');
goog.require('dm.conf.SP');
goog.require('dm.conf.WP');
goog.require('dm.conf.SLD');
goog.require('dm.conf.SK');
goog.require('dm.conf.Eqpup');
goog.require('dm.conf.Exp');

/**
 * Single User
 * @constructor
 */
dm.User = function(uid, game){
  //从服务器获取自身信息

  this.data = {};
  this.data.lvl = 1;
  this.data.skills = {};
  this.data.equips ={};//0:head,1:body,2:cape,3:jewel,4:武器
  this.data.eqp_add = {};//存装备的附加属性
  this.data.id = uid;
  this.data.attr_arm = dm.conf.WP.attack.attr;
  this.data.attr_def = dm.conf.SLD.defense.attr;
  this.data.sp = {};
  this.data.fp = {};//计算结果
  this.popuSP();
  this.popuFP();

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
	for ( i in this.data.equips ){
		v = this.data.equips[i] && this.data.equips[i].sp || {}
		for(j in v){
			sps[j] = sps[j] || 0;
			sps[j] += v[j];
		}
		v = parseInt(this.data.equips[i] && this.data.equips[i].fp && this.data.equips[i].fp[name]) || 0;
		ret += v;
	}

	//加上自身二级属性
	for ( i in this.data.sp){
		sps[i] = sps[i] || 0;
		sps[i] += this.data.sp[i]
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
	for ( i in this.data.equips ){
		v = this.data.equips[i] && this.data.equips[i].sp || {}
		for(j in v){
			sps[j] = sps[j] || 0;
			sps[j] += v[j];
		}
	}

	//加上自身二级属性
	for ( i in this.data.sp){
		sps[i] = sps[i] || 0;
		sps[i] += this.data.sp[i]

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
	var i,max;
	for( i in dm.conf.FP){
		this.data.fp[i] = this.getFP(i);
		max = parseInt(dm.conf.FP[i].max);
		if(-1 != max){
			this.data.fp[i] = Math.min(this.data.fp[i], max);
		}
	}
}

dm.User.prototype.popuSP=function(){
	var i;
	for(i in dm.conf.SP){
		this.data.sp[i] = this.getSP(i);
	}
}

/*
 * 升级技能
 * 是否4个技能已满? 没满则会随机出新技能,否则升级技能
 */
dm.User.prototype.skillUp=function(sk){
	var i,sn=0;
	for(i in this.data.skills){
		if(this.data.skills[i] == sk){
			break;
		}
		sn++; //统计技能数量
	};
	if(sn < 4){
		this.data.skills[sk.id] = sk;
		var img = dm.IconManager.getImg("dmdata/dmimg/sk/"+sk.id+".png");
		this.game.disp.skillslot[sn].setFill(img);
		this.game.disp.skillslot[sn].no = sk.no;
		this.game.disp.skillslot[sn].sk = sk;
	}
}

/**
 *当用户集齐100个金币的时候，可以进入商店
 *    商店中随机选择3个部位，可以对该部位装备进行升级或者更新。
 *    升级可以升级装备主属性或者附加属性。
 *    选择更新，则会随机替换一个附加属性(变成初级附加属性)。
 */
dm.User.prototype.enterShop=function(){
	var i,eqps;
	var rand = Math.round(Math.random()*5);
	if(rand > 4)
		rand = 4;
	this.upgrade(4,0);
	//this.refresh(rand);
}


dm.User.prototype.buyItem = function(type, lvl){
	//var bg = this.game.backGround;
	var slot;
	//var icon = new lime.Sprite().setSize(64, 64).setPosition(-170 + type*85, -350);
	var conf;  
	if(type == 0){
		slot = this.game.disp.weapon;
		conf = dm.conf.WP;
	}else if(type == 1){
		slot = this.game.disp.shield;
		conf = dm.conf.SLD;
	}
	slot.setFill(dm.IconManager.getImg('dmdata/dmimg/equip/'+type+'_'+lvl+'.png'))
	//bg.appendChild(icon);
	this.data.equips[type] = conf[type+'_'+lvl] || {};
	this.popuFP();
}

//购买武器(换个名字)
/*
dm.User.prototype.upgrade=function(eqp, type){ //type = 0:主属性,type = 1:附加属性
	var id = eqp.eqpid;
	var lvl   = eqp.eqplvl;
	var icon  = eqp.eqpic;
	type = type || 0;
	if(!type){//升级主属性
		switch(id){
			case 0:
			case 1:
			case 2:
			case 3:
				this.data.equips[id] = dm.conf.EP[id+'_'+lvl] || {};
			break;
			default:{
				//arm
				this.data.equips[4] = dm.conf.EP['4_'+lvl] || {};
				this.game.data.hp += parseInt(this.data.equips[4].fp.a6 - dm.conf.EP['4_'+(lvl-1)].fp.a6);
				this.game.data.mana += parseInt(this.data.equips[4].fp.a5 - dm.conf.EP['4_'+(lvl-1)].fp.a5);
			break;
			}
		}
		this.data.equips[id].icon = icon;
	}
	this.popuFP();
}
*/


dm.User.prototype.genAttr = function(eqp, num){
	num = num || 2;
	var id = eqp.eqpid;
	var type = parseInt(this.data.equips[id].type);
	var i,j = 0;
	var selected = [];
	var conf, atts = {};
	var fp = dm.conf.FP;
	//var sp = dm.conf.SP;

	switch(type){
		case 1:{
			conf = this.data.attr_arm;
			break;
		}
		case 2:{
			conf = this.data.attr_def;
			break;
		}
	}

	num = Math.ceil(Math.random()*num) || 1;
	selected = this.randSel(conf, num);
	for(i in selected){ //生成num个随机属性
		atts[selected[i]] = Math.max(fp[selected[i]].min, Math.round(fp[selected[i]].max*Math.random()));	
	}
	return atts;
}

/*
 * 刷新装备，随机属性会改变
 * 随机生成1~num个属性，每个属性有随机值
 */
dm.User.prototype.refresh=function(eqp, atts){
	var i;
	var id = eqp.eqpid;
	this.data.eqp_add[id] = {};
	for(i in atts){
		this.data.eqp_add[id][i] = atts[i];
	}
	this.addatt(id);
	this.popuFP();
}

//生成的随机属性加入到中去，统一处理
dm.User.prototype.addatt=function(eqpid){
	var i, eqp, add_att;
	add_att = this.data.eqp_add[eqpid];
	eqp = this.data.equips[eqpid];
	for(i in add_att){
		switch(i.charAt(0)){
			case 'a':{
				eqp['fp'][i] = add_att[i];
				eqp['func'][i] = add_att[i];
				break;
			}
			case 'b':{
				eqp['sp'][i] = add_att[i];
				eqp['func'][i] = add_att[i];
				break;
			}
		}
	}

}


//人物升级
dm.User.prototype.lvlUp=function(){
	
	var i;
	for(i in this.data.sp){
		this.data.sp[i] += parseInt(dm.conf.SP[i] && dm.conf.SP[i].inc) || 0;
	}
	this.popuFP();
	this.data.lvl += 1;
	this.game.disp.lvl.setText(this.data.lvl);
	switch(this.data.lvl){
		case 2:
		case 4:
		case 7:
		case 10:{
			this.game.pop.skill++;
			break;
		}
	}
	if(this.data.lvl > 10 && !this.data.skills[3]){
		//没有学满4个技能
		this.game.pop.skill++;
	}
	//this.game.data['exp'] -= 3;
	
}

//
//在{附加属性：附加值}对中，找到附加属性键名并返回为数组形式
//param obj -- 要查找键值对的对象
//ret -- 返回 array
//
dm.User.findKey=function(array){
	array = array || {};
	if(!array)
		return 0;
	var i,index;
	index = new Array();
	for(i in array){
		index.push(i);
	}
	return index;
}


dm.User.randSel = function(arr, num){
	if(!arr)
		return 0;
	var i,r,sel=[];
	for(i=0;i<num;i++){
		r = Math.round(Math.random()*(arr.length-1));
		sel.push(arr[r]);
		arr.splice(r,1);
	}
	return sel;
}

/**
 * 找出两个用于学习的技能
 */
dm.User.prototype.findSkill = function(){
	var conf = dm.conf.SK;
	var i;
	var sk=new Array(5);
	for(i in conf){
		if(conf[i].lvl <= this.data.lvl && !this.data.skills[i]){
			//找出所有满足条件的
			!sk[conf[i]['class']] && (sk[conf[i]['class']] = []);
			sk[conf[i]['class']].push(i);
		}
	}
	var cansel = [];
	for(i in sk){
		if(sk[i].length){
			cansel.push(i);
		}
	}

	var choose = dm.User.randSel(cansel, 2);
	var ret = [dm.User.randSel(sk[choose[0]], 1), dm.User.randSel(sk[choose[1]], 1)]
	ret[0] = ret[0][0];
	ret[1] = ret[1][0];
	return ret;

}
