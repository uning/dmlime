goog.provide('dm.Monster');
goog.require('dm.conf.MS');

/**
 * @constructor
 * @extends 
 * @param {string} txt Text shown on the button.
 */
dm.Monster = function(turn, p, game, mon_id){
	this.game = game;
	this.conf = dm.conf.MS;
	this.parentGem = p;
	this.genAttribute(turn, mon_id);
	//显示怪物攻防等图片
	this.genImg();
}

dm.Monster.prototype.genAttribute = function(turn, p, mon_id){
	//基础属性
	//this.p = p;//gem
	p = this.parentGem;

	this.att_max = Math.floor(turn/25); 
	this.hp_max =  Math.floor(turn/50)*2;
	this.def_max = Math.floor(turn/25);

	this.aliveturn = 0;

	//特殊怪物?
	this.id = mon_id;
	var turn = this.game.data.turn;
	var sp = this.game.data.specialMon;
	var i, max = 0;

	if(!this.id){
		if(turn >= this.conf[1].turn && Math.random()*100 > 90){//达到出现特殊怪物的条件
			//已经出现的怪物
			//可出现怪物
			for(i in this.conf){
				i>0 && turn >= this.conf[i].turn && (max = Math.max(max, parseInt(i)));
			}
			var avaliable = [];
			for(i=1; i<=max; i++){
				if(!sp[i]){ 
					//可选
					avaliable.push(i);
				}
			}

			if(avaliable.length > 0){
				this.id = avaliable[Math.floor(Math.random()*avaliable.length)];
				//test
				//this.id = 6;
				sp[this.id] = this.id;
			}else{
				this.id = 0;
			}
			//test
			//this.id = 1;
		}else{
			this.id = 0;
		}
	}

	/*
	if(this.id == 19){//克隆玩家属性
		this.clonePlayer();
	}
	if(this.id == 15){//会复活的怪物，需要跟金币一起才能消除
		this.revive_timeout = -1;
	}
	*/
	if(this.id == 5){//会复活的怪物，旁边不能有红心，否则复活
		this.revive_timeout = -1;
	}

	//附加属性
	var id = this.id;
	var config = this.conf[id];
	//
	this.att_max += parseInt(config.attack);
	this.def_max += parseInt(config.defense);
	this.hp_max  += parseInt(config.hp);

	this.skill = config.skill;
	this.bounce = config['bounce'];
	//
	//实际值
	this.att = this.att_max
	this.def = this.def_max;
	this.hp  = this.hp_max;

	//状态参数
	this.delay = config.delay;
	this.poison = false; //受毒伤害
	this.poison_dmg = 0;
	this.poison_start = true; //受毒伤害
	this.stone = false; //石化伤害
	this.canAttack = true; //是否可以攻击

	//显示相关，标签
	var name = config.name;
	var tips = config.tips;
	/*
	var size = p.getSize(), 
	h=size.height, 
	w=size.width;
	p.index = 0;
	p.fillImage(w, h);
	*/
	p.fillImage(config.icon)

	/*
	this.attlabel = new lime.Label().setFontFamily('Trebuchet MS').setFontColor('#000').setFontSize(30).setAnchorPoint(1, 0.5).setText(this.att);
	this.hplabel = new lime.Label().setFontFamily('Trebuchet MS').setFontColor('#f00').setFontSize(30).setAnchorPoint(1, 0.5).setText(this.hp);
	this.deflabel = new lime.Label().setFontFamily('Trebuchet MS').setFontColor('#00f').setFontSize(30).setAnchorPoint(1, 0.5).setText(this.def);
	*/

	this.killed = new lime.Sprite().setSize(this.parentGem.getSize()).setFill(new dm.IconManager.getImg("dmdata/dmimg/killed.png"));
}

/**
 * 加载怪物图标等
 */
dm.Monster.prototype.genImg = function(){
	this.disp = {};
	var disp = this.disp;
	var url = 'dmdata/dmimg/';
	disp.att_bg = new lime.Sprite().setSize(25, 24).setPosition(35, -30).setFill(dm.IconManager.getImg(url + 'matt.png'));
	disp.def_bg = new lime.Sprite().setSize(25, 24).setPosition(35, 0).setFill(dm.IconManager.getImg(url + 'mdef.png'));
	disp.hp_bg = new lime.Sprite().setSize(25, 24).setPosition(35, 30).setFill(dm.IconManager.getImg(url + 'mhp.png'));

	disp.att = dm.Game.genDigtalImg(this.att);
	disp.def = dm.Game.genDigtalImg(this.def);
	disp.hp = dm.Game.genDigtalImg(this.hp);

	var p = this.parentGem;
	for(var i in disp){
		p.appendChild(disp[i]);
	}
	disp.att_bg.appendChild(disp.att);
	disp.def_bg.appendChild(disp.def);
	disp.hp_bg.appendChild(disp.hp);
}

/**
 *改变怪物显示的数值
 */
dm.Monster.prototype.changeDisplay = function(type){
	var disp = this.disp;
	var parent = disp[type].getParent();
	parent.removeChild(disp[type]);
	disp[type] = dm.Game.genDigtalImg(this[type]);
	parent.appendChild(disp[type]);
	
}

/**
 * 怪物被杀死的图标
 */
dm.Monster.prototype.setKilled = function(){
	if(this.parentGem.getChildIndex(this.killed) == -1){ 
		this.parentGem.appendChild(this.killed);
	}
}

/**
 *
 */
dm.Monster.prototype.unsetKilled = function(){
	if(this.parentGem.getChildIndex(this.killed) != -1){
		this.parentGem.removeChild(this.killed);
	}
}

/**
 *当怪物被杀死的时候，得到相应奖励
*/
dm.Monster.prototype.addBounce = function(){
	var data = this.game.data;
	for(var i in this.bounce){
		this.game.updateData(i, parseInt(this.bounce[i]), 'add');
	}
}


/**
 * 计算存活轮数
*/
dm.Monster.prototype.incAliveTurn= function(){
	this.aliveturn++;
}


/**
 * 设定怪物存在的轮数
*/
dm.Monster.prototype.suicide = function(turn){
	this.incAliveTurn();
	if(this.aliveturn >= turn){
		this.p.keep = false;
		return true;
	}
	return false;
}


/**
 *怪物死亡后产生作用,复原一些怪物改变的参数
 * param@ bounce -- true 有奖励 ， false 无奖励
 */
dm.Monster.prototype.onDeath = function(bounce){
	//使怪物可以产生
	if(this.id == 0){
		this.game.updateData('killcommon', 1, 'add');
	}else{
		this.game.updateData('killspecial', 1, 'add');
	}

	this.game.disp.kill.setText(parseInt(this.game.disp.kill.getText())+1)

	if(this.id != 0){
		delete this.game.data.specialMon[this.id];  
		//怪物技能影响复原
		this.endSkill();
	}
	//获得奖励
	if(bounce && !this.parentGem.keep){
		this.addBounce();
	}
}
/** 
 * 回合开始的动作
 */
 dm.Monster.prototype.startSkill = function(){
	 if(this.id && this.delay == 0){
		 this.useSkill();
	 }
 }

/**
 * 每轮结束后执行的动作
 */
dm.Monster.prototype.endTurn = function(monster){
	if(monster){
		if(monster.aliveturn && monster.id && monster.delay == 1){
			monster.useSkill();
		}
		monster.incAliveTurn();
	}else{
		if(this.aliveturn && this.id && this.delay == 1){
			this.useSkill();
		}
		this.incAliveTurn();
	}
}


/**
 * 1回合开始随机2个gem，设置不可连接
 * 2下一回合，换成另外两个 -- 回合末这两个自动可连
 * 3死亡时候复原
 */
dm.Monster.prototype.disableConn = function(number){
	var data = this.game.data;
	var type_arr = this.game.board.type_arr;
	var i, type, random, id;
	if(data['disconnect']){
		for(i in data['disconnect']){
			data['disconnect'][i].canSelect = true;
			data['disconnect'][i].unsetSpecial();
		}
	}
	data['disconnect'] = [];
	if(!number){
		number = 2;
	}
	for(i=0; i<number; i++){
		random = Math.round(Math.random()*(dm.GEMTYPES.length-1));//随机一种类型	
		type = dm.GEMTYPES[random];//随机一种类型	
		
		random = Math.round(Math.random()*(type_arr[type].length-1));//在该类型中随机选一个
		//设置不可连接
		type_arr[type][random].canSelect = false;
		type_arr[type][random].setSpecial('disconnect');

		data['disconnect'].push(type_arr[type][random]);
	}

}


/**
 * 随机将某一个gem(除了monster以外)变成broken状态，无法发挥作用
 */
 dm.Monster.prototype.breakGem = function(type){
	 var c, r, s=[];
	 for (c = 0; c < this.game.board.cols; c++) {
		 for (r = 0; r < this.game.board.rows; r++) {
			 g = this.game.board.gems[c][r];
			 //if(g.type != 'monster' && g.isBroken == false){
			 if(g.type == type && g.isBroken == false){
				 s.push(g);
			 }
		 }
	 }
	 if(s.length > 0){
		 random = Math.round(Math.random()*(s.length-1));//随机一种类型	
		 s[random].isBroken = true;
		 s[random].setSpecial('broken');
	 }
 }
 

/**
 * 随机将一个Gem变成普通怪物
 */
dm.Monster.prototype.changeMonster = function(){
	 var c, r, s=[];
	 for (c = 0; c < this.game.board.cols; c++) {
		 for (r = 0; r < this.game.board.rows; r++) {
			 g = this.game.board.gems[c][r];
			 if(g.type != 'monster'){
				 s.push(g);
			 }
		 }
	 }
	 if(s.length > 0){
		 random = Math.round(Math.random()*(s.length-1));//随机选一个gem
		 s[random].type = 'monster';
		 s[random].monster = new dm.Monster(this.game.data.turn, s[random], this.game, 0);
	 }
}


/**
 * 治疗其他怪物
*/
dm.Monster.prototype.cure = function(){
	var type_arr = this.game.board.type_arr;
	var i, gem;
	for(i in type_arr['monster']){
		gem = type_arr['monster'][i];
		gem.monster.hp += Math.ceil(gem.monster.hp*0.1); //治疗10%；
		gem.monster.hp  = Math.min(gem.monster.hp, gem.monster.hp_max);
		gem.monster.hplabel.setText(gem.monster.hp);
		gem.monster.changeDisplay('hp');
	}
}

 /**
  * 怪物自爆，伤害玩家1半的血量
*/
dm.Monster.prototype.explode = function(){
	var data = this.game.data;
	this.game.updateData('hp', -Math.ceil(data['hp']/2), 'add');
	this.p.keep = false;
	var nobounce = false;
	this.onDeath(nobounce);
}

 /**
  * 怪物攻击带毒
*/
dm.Monster.prototype.poisonAttack = function(){
	//攻击造成20%的持续性毒伤害
	this.game.updateData('poison', Math.ceil(0.2*this.att));
}

  /**
   * 怪物出现降低玩家1/2防御力
*/
dm.Monster.prototype.reduceDefense = function(){
	this.game.updateData('def_reduce', Math.ceil(0.5*this.game.user.data.fp.a3));
}

   /**
	* 怪物可以获得本轮玩家所受伤害10%的生命恢复,最多能恢复自身20%生命值
*/
dm.Monster.prototype.steelHP = function(){
	this.hp += Math.min(Math.round(this.game.data['finalDmg']*0.1), Math.round(this.hp_max*0.2));
	this.hp = Math.min(this.hp, this.hp_max);
	this.hplabel.setText(this.hp);
	this.changeDisplay('hp');
}

/**
 * 血瓶变成毒药
 */
dm.Monster.prototype.changePoison = function(){
	var hp_arr = this.game.board.type_arr['hp'];
	var hps = [];
	for(var i in hp_arr){
		if(!hp_arr[i].ispoison || hp_arr[i].ispoison == false){
			hps.push(hp_arr[i]);
		}
	}
	if(hps.length > 0){
		random = Math.round(Math.random()*(hps.length-1));//随机选一个gem
		hps[random].ispoison = true;
		hps[random].setSpecial('Poison');
	}
}

/**
 * 对玩家造成一个骷髅生命值的伤害(无视防御)。
 */
dm.Monster.prototype.throwMonster = function(){
	var mon_arr = this.game.board.type_arr['monster'];
	var i, mon=[], data = this.game.data;
	var fp = this.game.user.data.fp;
	for(i in mon_arr){
		if(mon_arr[i].monster.id == 0 && mon_arr[i].keep == true){
			mon.push(mon_arr[i]);
		}
	}
	if(mon.length > 0){
		random = Math.round(Math.random()*(mon.length-1));//随机选一个gem
		mon[random].keep = false;
		this.game.updateData('hp', - mon[random].monster.hp, 'add');
		if(data['hp'] <= 0){
			if(data.revive == 1){
				this.game.updateData('hp', fp.a6);
				this.game.updateData('mana', fp.a5);
				data[revive] = 0;
				console.log('revive');
			}else{
				this.game.endGame();
			}
		}
	}
}


/**
 * 死亡时旁边不能有红心，否则立即复活
 * 用技能杀死的不会复活
 */
dm.Monster.prototype.monRevive = function(){
	var p = this.parentGem;
	var gems = this.game.board.gems;
	var i, j, c, r;
	for(i=-1;i<2;i++){
		for(j=-1;j<2;j++){
			c = i+p.c;
			r = j+p.r;
			if(c >= 0 && r >= 0 && c < 6 && r < 6){
				if(gems[c][r].type == 'hp'){
					this.att = this.att_max
					this.def = this.def_max;
					this.hp  = this.hp_max;
					this.genImg();
					p.keep = true;
					return;
				}
			}
		}
	}
}
/**
 * 宝石怪物，死亡后需要和金币一起消除才能消灭，否则下一回合复活
 * 用技能杀死的不会复活
 *
dm.Monster.prototype.monRevive = function(){
	if(this.revive_timeout != -1){
		if(this.revive_timeout == 0){
			this.p.unsetSpecial();
			this.hp = this.hp_max;
			this.hplabel.setText(this.hp);
			this.changeDisplay('hp');
			this.p.type = 'monster';
		}else{
			this.revive_timeout--;
		}
	}
}
*/


/**
 * 怪物周围的物品附加火焰。如果连到这些gem，则会对玩家造成火焰伤害，伤害力等于怪物攻击力
 */
 dm.Monster.prototype.createFire =function(){
	 var c = this.p.c;
	 var r = this.p.r;
	 var i, j;
	 var gems = this.game.board.gems;
	 var data = this.game.data;
	 for(i in data['fireGems']){
		data['fireGems'][i].unsetSpecial();
		data['fireGems'][i].isOnFire = false;
	 }
	 data['fireGems'] = [];

	 for(i=-1; i<=1; i++){
		 for(j=-1; j<=1; j++){
			 if(c+i > -1 && r+j > -1 && r+j < 6 && c+i < 6){ //不超出边界
				gems[c+i][r+j].isOnFire = true;
				gems[c+i][r+j].setSpecial('Fire');
				data['fireGems'].push(gems[c+i][r+j]);
			 }
		 }
	 }
	 data['fireDmg'] = this.att;
 }

 /**
  * 克隆玩家属性
  */
  dm.Monster.prototype.clonePlayer = function(){
	  this.att_max = this.game.user.data.fp.a4;
	  this.def_max = this.game.user.data.fp.a3;
	  this.hp_max = this.game.user.data.fp.a6;
  }


 /**
  * 削弱玩家属性
  */


/**
* 怪物使用相应的技能
*/
dm.Monster.prototype.useSkill = function(){
	switch(this.skill){
		case '1':{
			//每回合损失2金币
			this.game.updateData('gold', -2, 'add');
			
			//自杀
			/*
			if(this.suicide(5)){
				var nobounce = false;
				this.onDeath(nobounce);
			}
			*/
			break;
		}
		case '2':{
			//附加毒伤害，必须消除红心来治疗
			this.poisonAttack();

			/*
			this.game.updateData('canCD', 0);
			*/
			break;
		}
		case '3':{
			//怪物存在时，CD不会减少
			/*
			this.game.updateData('gold', -2, 'add');
			*/

			this.game.updateData('canCD', false);
			break;
		}
		case '4':{
			//随机破坏一个武器图标
			this.breakGem('sword');
			/*
			this.disableConn();
			*/
			break;
		}
		case '5':{
			//杀死时候旁边不能有红心，否则满血复活
			//死亡时使用技能
		
			/*
			this.breakGem();
			*/
			break;
		}
		case '6':{
			//存在时不能伤害别的 木乃伊
			this.game.updateData('canDamageMon', false);
			//this.changeMonster();
			break;
		}
		case '7':{
			//board中计算，reflectionDmg
			//this.cure();
			break;
		}
		case '8':{
			if(this.suicide(5)){
				this.explode();
			}
			break;
		}
		case '9':{
			this.poisonAttack();
			break;
		}
		case '10':{
			this.reduceDefense();
			break;
		}
		case '11':{
			this.steelHP();
			break;
		}
		case '12':{
			this.changePoison();
			break;
		}
		case '13':{
			this.throwMonster();
			break;
		}
		case '14':{
			if(this.suicide(5)){
				//损失当前经验的一半
				this.game.updateData('exp', Math.round(this.game.data['exp']/2));
			}
			break;
		}
		case '15':{
			this.monRevive();
			break;
		}
		case '16':{
			//当该怪物出现时，其他怪物不受普通物理伤害(会承受技能伤害)
			this.game.updateData('canDamageMon', false);
			break;
		}
		case '17':{
			this.createFire();
			//在重排列以后需要使用技能
			//怪物使用技能的时机需要调整
			break;
		}
		case '18':{
			//直接在board.js中完成了
			//反弹伤害的怪物，reflectionDmg
			break;
		}
		case '19':{
			//this.clonePlayer();//克隆玩家属性
			break;
		}
		case '20':{
			//虚弱玩家
			this.game.updateData('isWeaken', true);
			break;
		}
	}
}


/**
 * 怪物死亡后复原技能影响
*/
dm.Monster.prototype.endSkill = function(){
	var data = this.game.data;
	var i;
	switch(this.skill){
		/*
		case '2':{
			this.game.updateData('canCD', 1);
			break;
		}
		*/
		case '3':{
			this.game.updateData('canCD', true);
			break;
		}
		case '4':{
			/*
			if(data['disconnect']){
				for(i in data['disconnect']){
					data['disconnect'][i].canSelect = true;
					data['disconnect'][i].unsetSpecial();
				}
			}
			data['disconnect'] = [];
			*/
			break;
		}
		case '5':{
			this.monRevive();
			break;
		}
		case '6':{
			this.game.updateData('canDamageMon', true);
			break;
		}
		case '7':{
			break;
		}
		case '8':{
			break;
		}
		case '9':{
			break;
		}
		case '10':{
			this.game.updateData('def_reduce', 0);
			break;
		}
		case '11':{
			break;
		}
		case '12':{
			break;
		}
		case '13':{
			break;
		}
		case '14':{
			break;
		}
		case '15':{
			break;
		}
		case '16':{
			this.game.updateData('canDamageMon', true);
			break;
		}
		case '17':{
			for(i in data['fireGems']){
				data['fireGems'][i].unsetSpecial();
				data['fireGems'][i].isOnFire = false;
			}
			data['fireGems'] = [];
			data['fireDmg'] = 0;
			break;
		}
		case '18':{
			break;
		}
		case '19':{
			break;
		}
		case '20':{
			this.game.updateData('isWeaken', false);
			break;
		}
	}
}
