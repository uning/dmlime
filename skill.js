goog.provide('dm.Skill');

dm.Skill = function(game){
	//this.skills = dm.conf.SK;
	this.game = game;
	this.board = game.board;
	this.user = game.user;
	this.sk_conf = dm.conf.SK;
}

/*
 * 使用技能，有buff效果的，设置持续轮数，对于非即时产生效果的技能，在回合中才发生作用
 */
dm.Skill.prototype.use = function(id){
	//使用技能
	if(this.game.data.skillCD[id] > 0){
		alert('技能冷却中, 还有'+this.game.data.skillCD[id]+'轮');
	}else{
		this.game.data.skillCD[id] = 3
		this.game.data.buff[id] = parseInt(this.sk_conf['sk'+id]['turn']); //持续时间
		if(parseInt(this.sk_conf['sk'+id]['delay']) == 0){ //立即施展技能
			this.action(id);
		}
	}
}


/*
 * 技能产生的作用效果
 */
dm.Skill.prototype.action = function(id, param){ //各个技能的作用效果
	switch(id){
		case '1':{ //加血
			this.game.updateData('hp', Math.min(Math.round(this.game.data.hp*1.1), this.user.data.fp.a6));
		}
		break;
		case '2':{ //
			this.game.updateData('hp', Math.min(Math.round(this.game.data.hp*1.2), this.user.data.fp.a6));
		}
		break;
		case '3':{ //法力转换为生命
			this.game.updateData('hp', Math.min(this.game.data.hp + this.game.data.mana, this.user.data.fp.a6));
			this.game.updateData('mana', 0);
		}
		break;
		case '4':{
			//每把武器带来的额外攻击力
			this.game.updateData('attack_ratio', 5);
		}
		break;
		case '5':{
			//造成法力值的伤害
			this.game.updateData('attack_magic', this.game.data['mana']);
			this.game.updateData('mana', 0);
			this.board.findMonster(this.magicAttack, this.game);
		}
		break;
		case '6':{
			//敌人受到伤害*2
			this.game.updateData('dmgRatio', 2);
		}
		break;
		case '7':{//防御力提升100%,属于额外护甲，受到伤害减少，或者持续3轮
			this.game.updateData('enhenceDef', 100);
			if(this.game.buff[7] == 3){//只在第一次加额外防御，额外防御承受攻击而减少，3回合后清零
				this.game.updateData('def_extra', this.game.data.enhenceDef/100 * this.game.user.data.fp.a3);
			}
		}
		break;
		case '8':{//绝对防御 
			this.game.updateData('noDmg', 1);
		}
		break;
		case '9':{//虚弱无力 降低敌人伤害,每轮效果递减10%
			this.game.updateData('reduceDmg', 10*this.game.data.buff[9]);
		}
		break;
		case '10':{//老化，敌人的生命值降低20%
			this.reduceHp(20)
		}
		break;
		case '11':{
			this.game.updateData('extAvoid', 20);
		}
		break;
		case '12':{//火球，随机消除3*3范围内的物体
			this.wipeBlock();
		}
		break;
		case '13':{//搜集某类图标
			this.collect('hp', 'exp');
		}
		break;
		case '14':{//重排列所有图标
			this.wipeAll();
		}
		break;
		case '15':{//新图标全部变成金币
			this.board.genType = 4; //新产生的图标类型
		}
		break;
		case '16':{//金币获得双倍效果
			this.game.updateData('doublegain', 1);
		}
		break;
		case '17':{ //本轮受到伤害死亡，可以复活
			this.game.updateData('revive', 1);
		}
		break;
		case '18':{ //敌人无法使用特殊技能
			this.game.updateData('disableSkill', 1);
		}
		break;
	}
}

dm.Skill.prototype.actionEnd = function(id, param){ //技能作用完毕的清理工作
	var buff = this.game.buff;
	switch(id){
		case '4':{
			this.game.updateData('attack_ratio', 0);
		}
		break;
		case '6':{
			this.game.updateData('dmgRatio', 1);
		}
		break;
		case '7':{
			this.game.updateData('def_extra', 0);
		}
		break;
		case '8':{//绝对防御 
			this.game.updateData('noDmg', 0);
		}
		break;
		case '9':{//虚弱无力 降低敌人伤害
			this.game.updateData('reduceDmg', 0);
		}
		break;
		case '11':{
			this.game.updateData('extAvoid', 0);
		}
		break;
		case '15':{//新图标全部变成金币
			this.board.genType = -1; //新产生的图标类型
		}
		break;
		case '16':{//金币获得双倍效果
			this.game.updateData('doublegain', 0);
		}
		break;
		case '17':{ //本轮受到伤害死亡，可以复活
			this.game.updateData('revive', 0);
		}
		break;
		case '18':{ //敌人无法使用特殊技能
			this.game.updateData('disableSkill', 0);
		}
		break;
	}
}

/**
 * 减少敌人HP
 */
dm.Skill.prototype.reduceHp = function(ratio){
  this.board.findMonster(function(g, context, ratio){
	  g.monster.hp_left = Math.floor(g.monster.hp_left*(100 - ratio)/100);
	  if(g.monster.hp_left > 0){
		  g.keep = true;
	  }else{
		  g.keep = false;
		  context.updateData('exp', 1, 'add');
	  }
	  g.monster.hplabel.setText(g.monster.hp_left);
  }, this.game, ratio);
}


  /**
   * 魔法攻击，造成剩余魔法值等量的伤害
   * 不会获得额外奖励
   */
  dm.Skill.prototype.magicAttack = function(g , game){
	  var i;
	  var dmg = game.data.attack_magic;
	  g.monster.hp_left = g.monster.def_left + g.monster.hp_left - dmg;
	  if(g.monster.hp_left <= 0){
		  g.keep = false;
		  game.updateData('exp', 1, 'add');
		  g.monster.onDeath(false);
	  }else{
		  g.monster.hplabel.setText(g.monster.hp_left);
		  g.keep = true;
	  }
  } 


 /**
  * 收集某类图标，产生作用获得其相关的奖励
  */
   dm.Skill.prototype.gainGem = function(gem){
	   var fp = this.game.user.data.fp
	   ,sp = this.game.user.data.sp
	   ,data = this.game.data
	   ,p_type
	   if(gem.isBroken)
		   return;
	   switch(gem.type){
		   case 'sword':{
			   this.game.updateData('attack_addtion', fp.a2, 'add');
		   }
		   break;
		   case 'monster':{
			   this.game.updateData('exp', fp.a17, 'add');
			   //gem.monster.onDeath(true);
		   }
		   break;
		   case 'hp':{
			   if(!(gem.ispoison == true)){
				   this.game.updateData('hp', fp.a9, 'add');
			   }
		   }
		   break;
		   case 'gold':{
			   this.game.updateData('gold', fp.a13, 'add');
		   }
		   break;
		   case 'mana':{
			   this.game.updateData('mana', fp.a21, 'add');
		   }
		   break;
	   }
   }

 /**
  * 重新排列所有的图标
  * 怪物不重新生成
  * 其他类型宝石重新生成
  */
   dm.Skill.prototype.reArrange = function(s){//, keep){
	   //先删除显示层元素
	   this.board.clearGem(true);
	   var c, r, copy, gem;
	   for (c = 0; c < this.board.cols; c++) {
		   if ( !this.board.gems[c] ) 
			   this.board.gems[c] = [];
		   i = 0;
		   for (r = this.board.gems[c].length; r < this.board.rows; r++) {
			   copy = s.splice(Math.round(Math.random()*(s.length-1)), 1);//随机选择一个gem
			   i++;
			   if(!copy[0].monster){//不是怪物
				   gem = dm.Gem.random(this.game.board.GAP, this.game.board.GAP, copy[0].index);
			   }else{
				   gem = copy[0];
				   gem.keep = true;
			   }
			   gem.r = r;
			   gem.c = c;
			   gem.setPosition((c + .5) * this.board.GAP, (-i + .5) * this.board.GAP);
			   //gem.setSize(this.GAP, this.GAP);
			   this.board.gems[c].push(gem);
			   this.board.layers[c].appendChild(gem);
		   }
	   }
	   this.board.moveGems();
   }


  /**
   * 找到要改变的gems,
   * param: mod -- all 全部选中 ; block，选3X3的块，并且消除
   */
   dm.Skill.prototype.findGem = function(mod, keep){
	   var s = [];
	   var g;
	   if(mod == 'All'){
		   var c, r;
		   for (c = 0; c < this.board.cols; c++) {
			   for (r = 0; r < this.board.rows; r++) {
				   g = this.board.gems[c][r];
				   g.keep = false;
				   s.push(g);
			   }
		   }
	   }else{//取3*3的一个方块内的元素
		   var anchor = [
			   Math.round(1 + Math.random()*(this.board.cols - 3)),
			   Math.round(1 + Math.random()*(this.board.rows - 3))
		   ];


		   for(c = -1; c < 2; c++){
			   for(r = -1; r < 2; r++){
				   g = this.board.gems[anchor[0] + c][anchor[1] + r];
				   g.keep = keep;
				   s.push(g);
			   }
		   }
	   }
	   return s;
   }

   /**
	* 找到某类gems，对每个对象调用回调函数
	*/
   dm.Skill.prototype.findType = function(type, func, param, context){
	   var c, i, r, g, arr = [];
	   for (c = 0; c < this.board.cols; c++) {
		   for (r = 0; r < this.board.rows; r++) {
			   if(this.board.gems[c][r].type == type){
				   func(this.board.gems[c][r], param, context);
			   }
		   }
	   }
	   this.game.board.clearGem();
   }


  /**
   * 技能：将当前的血瓶转换为经验
   * param@ type:搜集图标的类型， value：搜集图标增加的值的类型
   */
   dm.Skill.prototype.collect = function(type, value){
	   game = this.game;
	   this.findType(type,function(g, value, game){
		   g.keep = false;
		   if(!g.isBroken && !(g.ispoison == true)){
			   game.updateData(value, 1, 'add');
		   }
	   },value, game)
   }


 /**
  * 技能：随机消除图中3*3的格子
  */
  dm.Skill.prototype.wipeBlock = function(){
	  var s = this.findGem('block', false);
	  for(var i in s){
		  this.gainGem(s[i]);
		  if(s[i].monster){
			  //获得杀死怪物的额外奖励
			  s[i].monster.onDeath(true);
		  }
	  }
	  this.game.board.clearGem();
  }


 /**
  * 技能：替换所有的图标，全部刷新
  */
  dm.Skill.prototype.wipeAll = function(){
	  var s = this.findGem('All', true);
	  this.reArrange(s);
  }


