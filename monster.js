goog.provide('dm.Monster');
goog.require('dm.conf.MS');

dm.Monster = function(turn, p, game, mon_id){
	this.game = game;
	this.board = game.board;
	this.conf = dm.conf.MS;
	this.genAttribute(turn, p, mon_id);
}

dm.Monster.prototype.genAttribute = function(turn, p, mon_id){
	//基础属性
	this.p = p;//gem
	this.attack = 1 + Math.floor(turn/40); 
	this.hp = Math.floor(turn/30)+4;
	this.def = Math.floor(turn/40)+1;
	this.aliveturn = 0;

	var mon_arr = this.game.data['specialMon'];
	//特殊怪物?
	this.id = mon_id;
	if(!this.id){
		//if(this.game.user.lvl > 4 && Math.random()*100 > 95){
		if(Math.random()*100 > 70){
			//
			//var index = Math.round(Math.random()*(mon_arr.length-1));
			//this.id = this.game.data.specialMon.splice(index, 1);

			//test
			this.id = 3;
		}else{
			this.id = 0;
		}
	}
	//附加属性
	var id = this.id;
	var config = this.conf[id];
	//
	this.attack += parseInt(config.attack);
	this.def += parseInt(config.defense);
	this.hp += parseInt(config.hp);
	this.skill = config.skill;
	this.bounce = config['bounce'];
	//
	this.def_left = this.def;
	this.hp_left = this.hp;
	//状态参数
	this.delay = config.delay;
	this.poison = 0; //受毒伤害
	this.poison_start = 1; //受毒伤害
	this.stone = 0; //石化伤害

	//显示相关，标签
	var name = config.name;
	var tips = config.tips;
	var size = p.getSize(), 
	h=size.height, 
	w=size.width;
	this.attlabel = new lime.Label().setFontFamily('Trebuchet MS').setFontColor('#000').setFontSize(30).setAnchorPoint(1, 0.5).setText(this.attack);
	this.hplabel = new lime.Label().setFontFamily('Trebuchet MS').setFontColor('#f00').setFontSize(30).setAnchorPoint(1, 0.5).setText(this.hp_left);
	this.deflabel = new lime.Label().setFontFamily('Trebuchet MS').setFontColor('#00f').setFontSize(30).setAnchorPoint(1, 0.5).setText(this.def);
	p.appendChild(this.attlabel.setPosition(w*0.4, -h/4));
	p.appendChild(this.hplabel.setPosition(w*0.4, 0));
	p.appendChild(this.deflabel.setPosition(w*0.4, h/4));

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
	if(this.aliveturn >= turn){
		this.p.keep = false;
		var nobounce = false;
		this.onDeath(nobounce);
	}
}


/**
 *怪物死亡后产生作用,复原一些怪物改变的参数
 * param@ bounce -- true 有奖励 ， false 无奖励
 */
dm.Monster.prototype.onDeath = function(bounce){
	//使怪物可以产生
	if(this.id){
		this.game.data.specialMon.push(this.id);  
		//怪物技能影响复原
		this.endSkill();
		//获得奖励
		if(bounce){
			this.addBounce();
		}
	}
}
/** 
 * 回合开始的动作
 */
 dm.Monster.prototype.startTurn = function(monster){
	if(monster){
		if(monster.delay == 0)
			monster.useSkill();
	}else{
		if(this.delay == 0)
			this.useSkill();
	}

 }

/**
 * 每轮结束后执行的动作
 */
dm.Monster.prototype.endTurn = function(monster){
	if(monster){
		monster.incAliveTurn();
		if(monster.delay == 1){
			monster.useSkill();
		}
	}else{
		this.incAliveTurn();
		if(this.delay == 1){
			this.useSkill();
		}
	}
}


dm.Monster.prototype.disableConn = function(number){
	if(!nmuber){
		number = 2;
	}
	//this.board. 
}
 
/**
 * 怪物使用相应的技能
 */
dm.Monster.prototype.useSkill = function(){
	switch(this.skill){
		case '1':{
			this.suicide(5);
			break;
		}
		case '2':{
			this.game.updateData('canCD', 0);
			break;
		}
		case '3':{
			this.game.updateData('gold', -2, 'add');
			break;
		}
		case '4':{
			//1回合开始随机2个gem，设置不可连接
			//2下一回合，换成另外两个 -- 回合末这两个自动可连
			//3死亡时候复原
			break;
		}
		case '5':{
			break;
		}
		case '6':{
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
			break;
		}
		case '17':{
			break;
		}
		case '18':{
			break;
		}
		case '19':{
			break;
		}
		case '20':{
			break;
		}
	}
}


/**
 * 怪物死亡后复原技能影响
 */
dm.Monster.prototype.endSkill = function(){
	switch(this.skill){
		case '2':{
			this.game.updateData('canCD', 1);
			break;
		}
		case '4':{
			break;
		}
		case '5':{
			break;
		}
		case '6':{
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
			break;
		}
		case '17':{
			break;
		}
		case '18':{
			break;
		}
		case '19':{
			break;
		}
		case '20':{
			break;
		}
	}
}
