goog.provide('dm.Game');
goog.require('dm.Display');
goog.require('dm.Progress');
goog.require('dm.LDB');
goog.require('lime.CanvasContext');
goog.require('lime.animation.RotateBy');
goog.require('lime.animation.MoveBy');
goog.require('lime.animation.Loop');

/**
 * Game scene for Roundball game.
 * @constructor
 * @extends lime.Scene
 */
dm.Game = function(size, user, guide){

	dm.log.fine('for ad',size,user)
    lime.Scene.call(this);
	//初始化数据
	dm.Display.init();
	this.initData(size, user);
	this.createPanel();
	this.createBoard(guide);
	//显示数据
	this.showData();

    // update score when points have changed
    lime.scheduleManager.scheduleWithDelay(this.updateScore, this, 100);

    lime.scheduleManager.scheduleWithDelay(this.createPopWindow, this, 500);
     // show lime logo
    dm.builtWithLime(this);
	goog.events.listen(this, ['mousedown', 'touchstart', 'mouseup', 'touchend'], this.pressHandler_);
	//goog.events.unlisten(this, ['mousedown', 'touchstart', 'mouseup', 'touchend'], this.pressHandler_, false, this);
	//
	//加数值动画label
	//this.notify = new lime.Label().setText('loading').setFontSize(80).setFontColor('#000').setPosition(dm.WIDTH/2, dm.HEIGHT/2).setOpacity(1);
	//this.appendChild(this.notify);

   /* lime.scheduleManager.scheduleWithDelay(function(){
		var rotate = new lime.animation.RotateBy(-150);
		this.disp.weapon_bg.runAction(rotate);
		}, this, 200);
		*/
	//dm.LDB.save('name','wangkun');
	//dm.LDB.get('name',function(str){alert(str)});
};
goog.inherits(dm.Game, lime.Scene);


/*
 * 面板的UI生成
 */
dm.Game.prototype.createPanel = function(){
	//背景层
	var i, j, slot, dp
	var gold_bar, blood_bar, skill_exp_bar, exp_bar;
	var blood_mask;

	var url = 'dmdata/dmimg/';
	var ext = '.png';

	//背景图片
	dp = dm.Display;
	this.backGround = new lime.Sprite().setSize(dp.framework.com.width, dp.framework.com.height).setFill(dp.url+dp.background.img);
	this.backGround.setPosition(dp.background.pos.x, dp.background.pos.y);
	this.appendChild(this.backGround);

	this.disp.player = new lime.Sprite().setFill(dp.url+dp.player.img.m)
	this.disp.enemy = new lime.Sprite().setFill(dp.url+'boss.png')
	this.disp.box = new lime.Sprite().setFill(dp.url+dp.box.img)
	this.disp.attack = new lime.Label().setText(this.user.data.fp.a1)
	this.disp.defense = new lime.Label().setText(this.user.data.fp.a3)
	this.disp.lvl = new lime.Label().setText(this.user.data.lvl)
	this.disp.turn = new lime.Label().setText(this.data.turn)
	this.disp.blood_bar  = new lime.Sprite().setFill(dp.url+dp.blood_bar.img)
	this.disp.weapon = new lime.Sprite()
	this.disp.shield = new lime.Sprite()
	this.disp.killLabel = new lime.Label().setText((this.data.killcommon + this.data.killspecial) || 0)
	this.disp.menu = new lime.Sprite().setFill(dp.menu.img)
	this.disp.topscoreLabelInner = new lime.Label()
	goog.events.listen(this.disp.menu, ['click', 'touchstart'], function(){
		this.removeChild(this.backGround);
		dm.loadCover();
	}, false, this);

	for(i in this.disp){
		this.disp[i].setPosition(dp[i].pos.x, dp[i].pos.y);
		dp[i].size && this.disp[i].setSize(dp[i].size.w, dp[i].size.h);
		dp[i].fontsize && this.disp[i].setFontSize(dp[i].fontsize);
		dp[i].fontcolor && this.disp[i].setFontColor(dp[i].fontcolor);
		this.backGround.appendChild(this.disp[i]);
	}

	//4个技能槽
	this.disp.skillslot = {};
	for( i=0; i<4; i++){
		slot = new lime.Sprite().setSize(dp.skillslot.size.w, dp.skillslot.size.h)
		.setPosition(dp.skillslot[i].pos.x, dp.skillslot[i].pos.y);//.setFill(0, 0, 0, 0.3);
		this.disp.skillslot[i] = slot;
		this.backGround.appendChild(slot);
	}
	
    this.disp.blood_mask = new lime.Sprite().setFill(100, 200, 0, .3).setAnchorPoint(0.5, 1).setPosition(dp.blood_mask.pos.x, dp.blood_mask.pos.y).
		setSize(dp.blood_mask.size.w, dp.blood_mask.size.h);
	this.disp.blood_bar.appendChild(this.disp.blood_mask);
	this.disp.blood_bar.setMask(this.disp.blood_mask);
	
	dm.LDB.get('topscore', function(topscore){
		this.disp.topscoreLabelInner.setText(topscore || 0);
	}, this)


	//test
	goog.events.listen(this.disp.enemy, ['mousedown', 'touchstart'], this.saveData, false, this);
}

/*
 * create board
 */
dm.Game.prototype.createBoard = function(guide){
	//test
	//guide = true;
	
	guide = guide || false;
    this.board = new dm.Board(this, guide);
    if(dm.isBrokenChrome()) this.board.setRenderer(lime.Renderer.CANVAS);
    this.backGround.appendChild(this.board);
}

/**
 * 显示游戏中的数值
 */
dm.Game.prototype.showData = function(){
	var dp = dm.Display
	this.disp.score = new lime.Label().setPosition(dp.score.pos.x, dp.score.pos.y).setFontSize(dp.score.fontsize).setText(0)
	this.disp.hp = new lime.Label().setPosition(dp.hp.pos.x, dp.hp.pos.y).setFontSize(dp.hp.fontsize - 2).setText(this.data['hp']+'/'+this.user.data.fp.a6)
	.setFontWeight(800).setFontColor('#FFF');

	this.disp.mana = new lime.Sprite().setPosition(dp.mana.pos.x, dp.mana.pos.y).setSize(dp.mana.size.w, dp.mana.size.h).setFill(dp.url + dp.mana.img)
	this.disp.mana_mask = new lime.Sprite().setAnchorPoint(0, .5).setPosition(- dp.mana.size.w/2, 0)//.setSize(dp.mana.size.w , dp.mana.size.h)
	this.disp.mana.appendChild(this.disp.mana_mask)
	this.disp.mana.setMask(this.disp.mana_mask)

	this.disp.exp = new lime.Sprite().setPosition(dp.exp.pos.x, dp.exp.pos.y).setSize(dp.exp.size.w, dp.exp.size.h).setFill(dp.url + dp.exp.img);
	this.disp.exp_mask = new lime.Sprite().setAnchorPoint(0, .5).setPosition(- dp.exp.size.w/2, 0)//.setSize(dp.exp.size.w, dp.exp.size.h)
	this.disp.exp.setMask(this.disp.exp_mask)
	this.disp.exp.appendChild(this.disp.exp_mask)

	this.disp.gold = new lime.Label().setPosition(dp.gold.pos.x, dp.gold.pos.y).setFontSize(dp.gold.fontsize).setText(this.data['gold'])
	this.disp.gold.setFontColor(dp.gold.fontcolor)

	this.backGround.appendChild(this.disp.mana)
	this.backGround.appendChild(this.disp.exp)
	this.backGround.appendChild(this.disp.score)
	this.backGround.appendChild(this.disp.hp)
	this.backGround.appendChild(this.disp.gold)
	this.show_create = 1;
}

/*
 * 游戏数据初始化
 */
dm.Game.prototype.initData = function(size, user){
	//初始化数据
	this.size  = size ||  6;
	this.user = user || new dm.User(1);
	this.user.game = this;

	//游戏展示变量
	this.dp = dm.Display;
	this.disp = {};

	//游戏数据
	this.data = {};
	this.data.turn = 0; //回合数
	this.data.hp    = this.user.data.fp.a6;
	this.data.mana  = 0;//this.user.data.fp.a5;
	this.data.def   = this.user.data.fp.a3;
	this.data.def_extra = 0; //额外护甲,技能增加的额外生命、护甲、魔法盾，都可看做是额外护甲形式
	this.data.exp   = 0;
	this.data.exp_thislvl= 0;
	this.data.gold  = 0;
	this.data.gold_total = 0;
	this.data.buyCount = 0;
	//this.data.skillexp = 0;
    this.data.points = 0;
	//记录游戏buff
	this.data.buff = {};

	//怪物存在时产生作用的属性
	//玩家受持续伤害
	this.data.poison = 0;
	//基础防御力减少
	this.data.def_reduce = 0;
	//玩家每轮受到的伤害
	this.data.finalDmg = 0;
	//能不能对怪物造成伤害
	this.data.canDamageMon = true;
	//火焰状态的gems
	this.data.fireGems = [];
	this.data.fireDmg = 0;
	//是否虚弱
	this.data.isWeanken = false;

	//记录获得经验后，应弹几次升级对话框
	this.pop = {};
	this.pop.shop = 0;
	this.pop.lvl = 0;
	this.pop.skill = 0;
	//顶层是否已有弹窗
	this.ispoping = false;

	//技能相关参数初始化
	this.data.attack_addtion = 0; 
	this.data.attack_ratio = 0;
	this.data.def_extra = 0 
	this.data.dmgRatio = 1
	this.data.doublegain = 0;
	this.data.extAvoid  = 0
	this.data.reduceDmg = 0
	this.data.noDmg = 0;
	this.data.canCD = true;
	this.data.longestLine = 0;
	this.data.killspecial = 0;
	this.data.killcommon = 0;

	//已经存在的特殊怪物
	this.data.specialMon = {};
	//技能CD
	this.data.skillCD = {};
}

/**
 *
 *
 */
dm.Game.prototype.pressHandler_ = function(e){
	var dp = dm.Display;
	dp.init();
	var pos = e.position;
	pos.x -= dp.framework.com.width/2;
	pos.y -= dp.framework.com.height/2;
	function inArea(cp, cs){
		return (pos.x > cp.x - cs.w/2 && pos.x < cp.x + cs.w/2 && pos.y > cp.y - cs.h/2 && pos.y < cp.y + cs.h/2)
	}
	
	var i, j, cpoint, csize, skid;
	for(i=0;i<4;i++){
		cpoint = dp.skillslot[i].pos;
		csize = dp.skillslot.size;
		if(inArea(cpoint, csize)){
			skid = this.disp.skillslot[i].sk.no;
			this.disp.skillslot[i].sk && (!this.data.skillCD[skid]) && this.skillUse(this.disp.skillslot[i].sk);
		}
	}

	//weapon info
	cpoint = dp.bowClickArea.pos;
	csize = dp.bowClickArea.size;
	if(inArea(cpoint, csize) && this.user.data.equips[0]){
		if( e.type == 'touchstart' || e.type == 'mousedown'){
			this.disp.weaponTip = new lime.Sprite().setSize(dp.bowTip.size.w, dp.bowTip.size.h).setPosition(dp.bowTip.pos.x, dp.bowTip.pos.y)
			.setFill(dp.bowTip.img);
			this.backGround.appendChild(this.disp.weaponTip);
			var conf = dm.conf.WP;
			var equip = this.user.data.equips[0];
			var fpname, fpval, info, h=0

			for(i in conf['0_'+equip.lvlneed].func){
				fpname = dm.conf.FP[i].tips;
				fpval  = conf['0_'+equip.lvlneed].fp[i];
				info = new lime.Label().setFontSize(25).setPosition(0, 10);
				info.setText(fpname + ' +' + fpval);
				h += info.getSize().height;
				this.disp.weaponTip.appendChild(info);
			}
		}else if(e.type == 'touchend' || e.type == 'mouseup'){
			this.backGround.removeChild(this.disp.weaponTip);
			this.disp.weaponTip = null;
		}
	}

	//shield info
	cpoint = dp.shieldClickArea.pos;
	csize = dp.shieldClickArea.size;
	if(inArea(cpoint, csize) && this.user.data.equips[1]){
		if( e.type == 'touchstart' || e.type == 'mousedown'){
			this.disp.shieldTip = new lime.Sprite().setSize(dp.shieldTip.size.w, dp.shieldTip.size.h).setPosition(dp.shieldTip.pos.x, dp.shieldTip.pos.y)
			.setFill(dp.shieldTip.img);
			this.backGround.appendChild(this.disp.shieldTip);
			conf = dm.conf.SLD;
			equip = this.user.data.equips[1];
			fpname, fpval, info, h=0

			for(i in conf['1_'+equip.lvlneed].func){
				fpname = dm.conf.FP[i].tips;
				fpval  = conf['1_'+equip.lvlneed].fp[i];
				info = new lime.Label().setFontSize(25).setPosition(0, 10);
				info.setText(fpname + ' +' + fpval);
				h += info.getSize().height;
				this.disp.shieldTip.appendChild(info);
			}
		}else if(e.type == 'touchend' || e.type == 'mouseup'){
			this.backGround.removeChild(this.disp.shieldTip);
			this.disp.shieldTip = null;
		}
	}

	//player
	cpoint = dp.player.pos;
	csize = dp.player.size;
	if(inArea(cpoint, csize)){
		if( e.type == 'touchstart' || e.type == 'mousedown'){
			this.showStat();
		}else if(e.type == 'touchend' || e.type == 'mouseup'){
			this.backGround.removeChild(this.disp.charTip);
			this.disp.charTip = null;
		}
	}
	
	//killed
	var kp, ks;
	cpoint = dp.killClickArea.pos;
	csize = dp.killClickArea.size;
	if(inArea(cpoint, csize)){
		if( e.type == 'touchstart' || e.type == 'mousedown'){
			this.showKilled();
			//this.saveData();
			//this.loadGame();
		}else if(e.type == 'touchend' || e.type == 'mouseup'){
			this.backGround.removeChild(this.disp.killedTip);
			this.disp.killedTip = null;
		}
	}
}

/*
 * 点击人物状态的图标，可以显示人物相关信息：武器装备，人物二级属性
 */
dm.Game.prototype.showStat = function(){
	dm.Display.init();
	var dialog = dm.Display.charTip;
	var loc = dialog.substr;
	var i, j, value, label, charTip;
	this.disp.charTip = new lime.Sprite().setSize(dialog.size.w, dialog.size.h)
	.setFill(dm.Display.url + dialog.img).setPosition(dialog.pos.x, dialog.pos.y);
	charTip = this.disp.charTip;

	this.backGround.appendChild(charTip);

	for(i in loc){
		if(i[0] == 'a'){
			value = this.user.data.fp[i]; 
		}else if(i[0] == 'b'){
			value = this.user.data.sp[i]; 
		}else{
			value = this.user.data.lvl;
		}
		label = new lime.Label().setText(value).setPosition(loc[i].x, loc[i].y); 
		charTip.appendChild(label);
	}
}

dm.Game.prototype.showKilled = function(){
	var i, j, value, label, killedTip;
	this.disp.killedTip = new lime.Sprite().setSize(this.dp.killtip.w, this.dp.killtip.h)
	.setFill(this.dp.url + this.dp.killtip.img).setPosition(this.dp.killtip.pos.x, this.dp.killtip.pos.y);
	killedTip = this.disp.killedTip;
	this.backGround.appendChild(killedTip);
	var sub = this.dp.killtip.sub;
	for(i in sub){
		label = new lime.Label().setText(this.data[sub[i].value] || 0).setPosition(sub[i].x, sub[i].y); 
		killedTip.appendChild(label);
	}
}



/*
 * 点击menu按钮，实现弹出主菜单功能，有重新开始等功能
 */
 /*
dm.Game.prototype.mainShow = function(game){
		var board = game.board;
		goog.events.unlisten(board, ['mousedown', 'touchstart'], board.pressHandler_);
		goog.events.unlisten(game, ['mousedown', 'touchstart'], game.pressHandler_, false, game);
		var dialog = new lime.RoundedRect().setFill(0, 0, 0, .7).setSize(500, 480).setPosition(120, 260).setAnchorPoint(0, 0).setRadius(20);
		game.appendChild(dialog);
		var label = new lime.Label().setText('退回主菜单将丢失本轮游戏进度').setFontColor('#FFF').setFontSize(30).setAnchorPoint(0, 0).setPosition(50, 200);
		dialog.appendChild(label);
		var btn_ok = new dm.Button('重来').setSize(dm.Display.btn.com.s.width, dm.Display.btn.com.s.height).setAnchorPoint(0, 0).setPosition(180,300);
		var btn_cancel = new dm.Button('返回').setSize(dm.Display.btn.com.s.width, dm.Display.btn.com.s.height).setAnchorPoint(0, 0).setPosition(350,300);
		dialog.appendChild(btn_ok);
		dialog.appendChild(btn_cancel);
		goog.events.listen(btn_ok, ['mousedown', 'touchstart'], function() {

			var dialog = new lime.RoundedRect().setFill(0, 0, 0, .7).setSize(500, 480).setPosition(120, 260).setAnchorPoint(0, 0).setRadius(20);
			this.getParent().getParent().appendChild(dialog);
			var btn_ok = new dm.Button('确定').setSize(dm.Display.btn.com.s.width, dm.Display.btn.com.s.height).setAnchorPoint(0, 0).setPosition(180,300);
			var btn_cancel = new dm.Button('取消').setSize(dm.Display.btn.com.s.width, dm.Display.btn.com.s.height).setAnchorPoint(0, 0).setPosition(350,300);
			dialog.appendChild(btn_ok);
			dialog.appendChild(btn_cancel);
			this.getParent().getParent().removeChild(this.getParent());
			goog.events.listen(btn_ok, ['mousedown', 'touchstart'], function() {
				//test save game data
				var game = this.getParent().getParent();
				//game.parseData(game.saveData());
				game.loadGame(game.saveData());
				//
				//dm.loadMenu();
			});
			goog.events.listen(btn_cancel, ['mousedown', 'touchstart'], function() {
				var game = this.getParent().getParent();
				var board = game.board;
				game.removeChild(this.getParent());
				goog.events.listen(board, ['mousedown', 'touchstart'], board.pressHandler_);
				goog.events.listen(game, ['mousedown', 'touchstart'], game.pressHandler_, false, game );
			});
		});
		goog.events.listen(btn_cancel, ['mousedown', 'touchstart'], function() {
			var game = this.getParent().getParent();
			var board = game.board;
			game.removeChild(this.getParent());
			goog.events.listen(board, ['mousedown', 'touchstart'], board.pressHandler_);
			goog.events.listen(game, ['mousedown', 'touchstart'], game.pressHandler_, false, game);
		});

}
*/


/**
 * 加相应的数值
 */
 dm.Game.prototype.updateData = function(key, value, method){
	 var fp = this.user.data.fp;
	 var data = this.data;
	 var udata = this.user.data;
	 var i;
	 data[key] = data[key] || 0;

	 var exp_conf = dm.conf.Exp;
	 var eqp_conf = dm.conf.Eqpup;

	 if(method == 'add'){
		 data[key] += value;
		 if(data[key] <= 0){
			 data[key] = 0;
		 }
		 if(key == 'gold'){
			 data['gold_total'] += value;
		 }
	 }else{
		 data[key] = value;
	 }
	 switch(key){
		 case 'exp':{
			 while(data['exp'] >= exp_conf[udata.lvl + 1 + this.pop.lvl].total_exp){
				 this.pop.lvl++;
			 }
			 break;
		 }
		 case 'mana':{
			 data['mana'] = Math.min(fp.a5, data['mana']);
			 break;
		 }
		 case 'gold':{
			 while(data['gold'] >= eqp_conf[this.data.buyCount + this.pop.shop].equ_gold){
				 data['gold'] -= eqp_conf[this.data.buyCount + this.pop.shop].equ_gold;
				 this.pop.shop += 1;
				 this.data.buyCount++;
			 }
			 break;
		 }
		 case 'hp':{
			 data['hp'] = Math.min(data['hp'], fp.a6);
			 break;
		 }
	 }
	 this.board.changeProg(this, key);
 }


/**
 * 存储游戏的数值game.data ; user.data; board里面的gems相关;
 */
 dm.Game.prototype.saveData = function(){
	 var i, gamedata={}, userdata = {};
	 for(i in this.data){
		 if(i != "fireGems"){
			 gamedata[i] = this.data[i];
		 }
	 }
	 for(i in this.user.data){
		 if(i != "equips" && i != "attr_arm" && i != "attr_def" && i != "skills"){
			 userdata[i] = this.user.data[i];
		 }
	 }

	 userdata["skills"] = {};
	 for(i in this.user.data.skills){
		 userdata["skills"][i] = this.user.data.skills[i].id;
	 }

	 //处理装备
	 userdata["equips"] = {};
	 for(i in this.user.data.equips){
		 userdata["equips"][i] = this.user.data.equips[i].lvlneed;
	 }

	 var savedata = {};
	 savedata['gamedata'] = gamedata;
	 savedata['userdata'] = userdata;
	 savedata['gems'] = this.saveAllGems();
	 //处理gems
	 var json_data = JSON.stringify(savedata);
	 //dm.api('System.save',{"id":"wangkun", "data":json_data});
	 this.database = dm.LDB;
	 //this.database._lc = 'wangkun';//用id来区分每个用户
	 this.database.save('data', savedata);

	 var topscore = this.data.points;
	 var oldtopscore;
	 this.database.get('topscore', function(data){
		 oldtopscore = data;
		 oldtopscore = oldtopscore || 0;
		 topscore = Math.max(topscore, oldtopscore);
		 this.database.save('topscore', topscore);
	 }, this);
 }

 dm.Game.prototype.loadGame = function(){
	 /*
	 var game = this;
	 dm.api('System.read',{"id":"wangkun"}, function(obj){game.parseData(obj.d)});
	 */
	 dm.LDB.get('data',function(data){
		 if(data){
			 this.parseData(data);
		 }else{
			 dm.newgame(6);
		 }
	 }, this);
 }

 /**
  * 解析储存的游戏数据
  */
  dm.Game.prototype.parseData = function(sdata){

	  //var sdata = JSON.parse(savedata);
	  var json;
	  //var sdata;
	  var gdata = sdata['gamedata'];
	  var udata = sdata['userdata'];
	  var gems  = sdata['gems'];
	  
	  var icon;
	  var i, c, r;
	  this.data = gdata;

	  for(i in this.user.data){
		  if(i != "equips" && i != "skills"){
			  this.user.data[i] = udata[i];
		  }
	  }
	  this.board.show_att = this.user.data.fp.a1;
	  this.disp.lvl.setText(this.user.data.lvl);
	  this.disp.attack.setText(this.user.data.fp.a1);
	  this.disp.defense.setText(this.user.data.fp.a3);
	  this.disp.turn.setText(this.data.turn);
	  this.disp.killLabel.setText((this.data.killcommon + this.data.killspecial) || 0);

	  this.user.data["skills"] = {};
	  for(i in udata["skills"]){
		  //this.user.data.skills[i] = dm.conf.SK[udata["skills"][i]];
		  this.user.skillUp(dm.conf.SK[udata["skills"][i]]);
	  }
	  //根据装备的id附加装备
	  this.user.data["equips"] = {};

	  var eqplvl, conf;
	  for(i in udata["equips"]){
		  if(i == 0){
			  slot = this.disp.weapon;
			  conf = dm.conf.WP;
		  }else if(i == 1){
			  slot = this.disp.shield;
			  conf = dm.conf.SLD;
		  }
		  eqplvl = udata["equips"][i];
		  //eqptype = i;
		  this.user.data.equips[i] = conf[i+'_'+eqplvl] || {};
		  slot.setFill(dm.IconManager.getImg('dmdata/dmimg/equip/'+i+'_'+Math.floor(eqplvl/5+1)+'.png'))
	  }

	  //改变状态属性:gold ,exp, mana, hp;
	  //
	  this.updateData('gold', 0, "add");
	  this.updateData('exp', 0, "add");
	  this.updateData('mana', 0, "add");
	  this.updateData('hp', 0, "add");

	  //重新生成gems
	  var action = this.board.loadGems(gems);
	  /*
	  goog.events.listen(
		  action, lime.animation.Event.STOP, function(){
		  this.board.setAllSpecial();
	  },false ,this);
	  */
  }

/**
 *保存gem的数据
 *为了节省空间，只存非默认的数据
 */
 dm.Game.prototype.saveGem = function(gem){
	 //id, hp, attack, defense, poison, canConnect, isBroken, isOnFire, stone, canAttack, poison_start
	 var data = {};
	 !gem.keep && (data["keep"] = gem.keep);

	 data["type"] = gem.type;
	 data["index"] = gem.index;

	 !gem.canSelect && (data["canSelect"] = gem.canSelect);
	 gem.isBroken && (data["isBroken"] = gem.isBroken);
	 gem.isOnFire && (data["isOnFire"] = gem.isOnFire);

	 if(gem.monster){
		 data["monster"] = {};
		 data["monster"]["id"] = gem.monster.id;
		 data["monster"]["hp"] = gem.monster.hp;
		 data["monster"]["hp_max"] = gem.monster.hp_left;
		 data["monster"]["def"] = gem.monster.def;
		 data["monster"]["def_max"] = gem.monster.def_left;
		 data["monster"]["att"] = gem.monster.attack ;
		 data["monster"]["att_max"] = gem.monster.attack ;
		 data["monster"]["aliveturn"] = gem.monster.aliveturn;

		 gem.monster.poison && (data["monster"]["poison"] = gem.monster.poison);
		 gem.monster.stone && (data["monster"]["stone"] = gem.monster.stone);
		 !gem.monster.canAttack && (data["monster"]["canAttack"] = gem.monster.canAttack);
	 }
	 return data;
 }

 /**
  * 找出所有的Gem,然后返回存储的Gems数据
  */
 dm.Game.prototype.saveAllGems = function(){
	 var c, r, gems={};
	  for (c = 0; c < this.board.cols; c++) {
		  if(!gems[c]){
			  gems[c] = {};
		  }
		  for (r = 0; r < this.board.rows; r++) {
			  gems[c][r] = this.saveGem(this.board.gems[c][r]);
		  }
	  }
	  return gems;
 }

/**
 *将数字对应成图片
 */
dm.Game.genDigtalImg = function(num){
	var bit_arr = [];
	var bit = 0;
	var url = 'dmdata/dmimg/';
	var height = 20;
	if(num < 10){
		return new lime.Sprite().setSize(height, height).//setPosition(0, 20).
			setFill(dm.IconManager.getImg(url + num + '.png'));
	}
	while(num >= 1){
		bit_arr[bit] = num % 10;
		bit++;
		num = parseInt(num/10);
	}
	var width = (bit-1)*20 + 20*0.5;
	var digt = new lime.Sprite().setSize(width, height).setAnchorPoint(1, 0.5).setPosition(25/2, 0);
	var i = bit-1;
	var t = {};
	for(i in bit_arr){
		t = new lime.Sprite().setSize(height, height).setAnchorPoint(1, 0.5).setPosition(-i*height*0.5, 0).
			setFill(dm.IconManager.getImg(url + bit_arr[i] + '.png'));
		digt.appendChild(t);
	}
	return digt;
}

/**
 * 每隔一定帧来检测是否达到升级等条件，然后弹出窗口
 */
dm.Game.prototype.createPopWindow = function() {
	if(this.ispoping) // || this.board.isMoving_)
		return;
	if(this.pop.shop > 0 ){
		this.pop.shop--;
		this.popWindow('Shop');
		return;
	} 
	if(this.pop.lvl > 0 ){
		this.pop.lvl--;
		this.popWindow('lvl');
		return;
	} 
	if(this.pop.skill > 0 ){
		this.pop.skill--;
		this.popWindow('Skill');
		return;
	} 
};

/**
 * Increase value of score label when points have changed
 */
dm.Game.prototype.updateScore = function() {
    var curscore = parseInt(this.disp.score.getText() || 0, 10);
    if (curscore < this.data.points) {
		this.step += 1;
		if(this.step < 5)
			this.disp.score.setText(curscore + 1);
		else{
			this.disp.score.setText(this.data.points);
		}
	}else
		this.step = 0;
};


/**
 * Update points
 * @param {number} p Points to add to current score.
 */
dm.Game.prototype.setScore = function(p) {
    this.data.points += p;
};


/**
 * 改变数值等动画效果
 */
 /*
dm.Game.prototype.changeAnim = function(str){
	this.notify.setText(str);
	var disappeal = new lime.animation.FadeTo(0).setDuration(4);
	var show = new lime.animation.FadeTo(1).setDuration(2);
	var large = new lime.animation.ScaleTo(2).setDuration(2);
	var small = new lime.animation.ScaleTo(0.5).setDuration(2);
	var move = new lime.animation.MoveTo(dm.Display.position.hp_p.x , dm.Display.position.hp_p.y).setDuration(3);
	var appearl = new lime.animation.Spawn(
		show,
		large
	);
	var hide = new lime.animation.Spawn(
		move,
		disappeal,
		small
	);
	
	var step = new lime.animation.Sequence(
		appearl,
		hide
	);
	this.notify.runAction(step);
};

*/

/**
 * Show game-over dialog
 */
dm.Game.prototype.endGame = function() {
	this.board.lineLayer.removeAllChildren();
	this.pop = {};
	goog.events.unlisten(this.board, ['mousedown', 'touchstart'], this.board.pressHandler_);
	goog.events.unlisten(this, ['mousedown', 'touchstart', 'mouseup', 'touchend'], this.pressHandler_);

	var greyMask = new lime.Sprite().setFill(0,0,0,.7).setSize(720, 1004).setPosition(360, 502);
	this.appendChild(greyMask);

	lime.scheduleManager.unschedule(this.updateScore, this);

	var dialog = new lime.Sprite().setFill('dmdata/dmimg/endgame.png').setPosition(360, 502);
	this.appendChild(dialog);

	var score = new lime.Label().setFontSize(30).setFontColor('#A00F0F').setSize(120, 35).setPosition(19.5, -68.5).setText(this.data.points);
	dialog.appendChild(score);

	var turn = new lime.Label().setFontSize(20).setFontColor('#A00F0F').setSize(40, 20).setPosition(-66.5, -19.5).setText(this.data.turn);
	dialog.appendChild(turn);

	var lvl = new lime.Label().setFontSize(20).setFontColor('#A00F0F').setSize(40, 20).setPosition(91.5, -19.5).setText(this.user.data.lvl);
	dialog.appendChild(lvl);

	var killBoss = new lime.Label().setFontSize(20).setFontColor('#A00F0F').setSize(40, 20).setPosition(-66.5, 12.5).setText(this.data.killspecial);
	dialog.appendChild(killBoss);

	var gold = new lime.Label().setFontSize(20).setFontColor('#A00F0F').setSize(40, 20).setPosition(91.5, 12.5).setText(this.data.gold_total);
	dialog.appendChild(gold);

	var killMonster = new lime.Label().setFontSize(20).setFontColor('#A00F0F').setSize(40, 20).setPosition(-66.5, 47.5).setText(this.data.killcommon);
	dialog.appendChild(killMonster);

	var longestLine = new lime.Label().setFontSize(20).setFontColor('#A00F0F').setSize(40, 20).setPosition(91.5, 47.5).setText(this.data.longestLine);
	dialog.appendChild(longestLine);

	var topscoreLabelEndGame = new lime.Label().setFontSize(30).setFontColor('#A00F0F').setSize(120, 35).setPosition(130, -60);
	dm.LDB.get('topscore', function(topscore){
		if(this.data.points > topscore){
			dm.LDB.save('topscore', this.data.points);
			topscoreLabelEndGame.setText(this.data.points);
		}else{
			topscoreLabelEndGame.setText(topscore);
		}
	}, this);

	var restart = new lime.Sprite().setSize(160, 50).setPosition(-79.5, 245.5);
	dialog.appendChild(restart);
    goog.events.listen(restart, ['click', 'touchstart'], function(){
		dm.game.removeAllChildren();
		dm.newgame(6);
	}, false, this);

	var menu = new lime.Sprite().setSize(120, 50).setPosition(109.5, 245.5);
	dialog.appendChild(menu);
    goog.events.listen(menu, ['click', 'touchstart'], function(){
		dm.game.removeAllChildren();
		dm.loadCover();
	}, false, this);

};

/**
 * 技能对话框
 * @param {action} 
 *     study -- 学习; use -- 使用
 *        {sk}
 */
dm.Game.prototype.skillStudy = function(){
	var conf = dm.Display.skpop;
	var user = this.user;
	var i;
	//goog.events.unlisten(this.board, ['mousedown', 'touchstart'], this.board.pressHandler_);
	//goog.events.unlisten(this, ['mousedown', 'touchstart'], this.pressHandler_);
	var dialog = new lime.Sprite().setSize(conf.study.size.w, conf.study.size.h).setPosition(conf.study.pos.x, conf.study.pos.y);
	this.appendChild(dialog);

	var textarea = new lime.RoundedRect().setSize(conf.textarea.size.w, conf.textarea.size.h).setPosition(conf.textarea.pos.x, conf.textarea.pos.y);
	dialog.appendChild(textarea);
	dialog.setFill(dm.IconManager.getImg(conf.study.img));

	var icon;

	/*
	var btn_use = new lime.Sprite().setSize(87, 33).setPosition(-130, 150);
	btn_use.setFill(dm.IconManager.getImg("dmdata/dmimg/use.png"));
	dialog.appendChild(btn_use);
	*/

	var btn_study = new lime.Sprite().setPosition(conf.btn_study.pos.x, conf.btn_study.pos.y).setSize(conf.btn_study.size.w, conf.btn_study.size.h);
	btn_study.setFill(dm.IconManager.getImg(conf.btn_study.img));
	dialog.appendChild(btn_study);
	var sn=0, sk_key;

	//test 

	sk_key = this.user.findSkill()
	//
	/*
	for(i in this.user.data.skills){
		sn++;
	}
	if(sn < 4){ //可以随机新技能
		sk_key = dm.User.randSel(dm.User.findKey(dm.conf.SK), 2); //随机两个技能，选择学习或者升级
	}else if(sn == 4){
		sk_key = dm.User.randSel(dm.User.findKey(user.data.skills), 2);
	}
	*/
	//test
	sk_key[0] = 'sk10';
	this.disp.select = this.disp.select || new lime.Sprite().setFill(dm.Display.popSelector.img)
	.setSize(dm.Display.popSelector.size.w, dm.Display.popSelector.size.h);
	this.disp.select.setPosition(dm.Display.popSelector.one.x, dm.Display.popSelector.one.y);//-143, -123);
	dialog.appendChild(this.disp.select);

	var j = 0;
	for(i in sk_key){
		icon = new lime.Sprite().setSize(90, 85).setPosition(-145 + i*140, -125);
		icon.skill = dm.conf.SK[sk_key[i]]; //传递选中技能
		icon.button = btn_study; // 传递选中技能到btn中
		icon.textarea = textarea;
		icon.no = j;
		icon.setFill(dm.IconManager.getImg('dmdata/dmimg/sk/'+sk_key[i]+'.png'));
		dialog.appendChild(icon);
		dialog.appendChild(textarea);
		goog.events.listen(icon, ['mousedown', 'touchstart'], this.skillInfoShow);

		//默认选中的技能
		if(j == 0){
			btn_study.skill = icon.skill;
			this.skillInfoShow.call(icon);
		}
		j++;
	}


	var btn_cancel = new lime.Sprite().setPosition(conf.btn_cancel.pos.x, conf.btn_cancel.pos.y).setFill(dm.IconManager.getImg(conf.btn_cancel.img))
	.setSize(conf.btn_cancel.size.w, conf.btn_cancel.size.h);
	dialog.appendChild(btn_cancel);
	goog.events.listen(btn_cancel, ['mousedown', 'touchstart'], function() {
		game = this.getParent().getParent();
		board = game.board;
		goog.events.listen(board, ['mousedown', 'touchstart'], board.pressHandler_);
		goog.events.listen(game, ['mousedown', 'touchstart', 'mouseup', 'touchend'], game.pressHandler_);
		game.removeChild(this.getParent());
		game.ispoping = false;
	});

	goog.events.listen(btn_study, ['mousedown', 'touchstart'], function(){
		game = this.getParent().getParent();
		board = game.board;
		//goog.events.unlisten(board, ['mousedown', 'touchstart'], board.pressHandler_);
		this.getParent().setFill
		if(this.skill){
			game.user.skillUp(this.skill);
			goog.events.listen(board, ['mousedown', 'touchstart'], board.pressHandler_);
			goog.events.listen(game, ['mousedown', 'touchstart', 'mouseup', 'touchend'], game.pressHandler_);
			var dialog = this.getParent();
			game.removeChild(this.getParent());
			game.ispoping = false;
			dialog = null;
		}else{
			alert('choose one!');
		}
	});
}

/**
 * 使用技能
 */
dm.Game.prototype.skillUse = function(sk){
	var dp = dm.Display;
	var user = this.user;
	goog.events.unlisten(this.board, ['mousedown', 'touchstart'], this.board.pressHandler_);
	goog.events.unlisten(this, ['mousedown', 'touchstart', 'mouseup', 'touchstart'], this.pressHandler_);
	var dialog = new lime.Sprite().setSize(dp.skpop.use.size.w, dp.skpop.use.size.h).setPosition(dp.skpop.use.pos.x, dp.skpop.use.pos.y);
	this.appendChild(dialog);
	var textarea = new lime.RoundedRect().setSize(dp.skpop.textarea.size.w, dp.skpop.textarea.size.h)
	.setPosition(dp.skpop.textarea.pos.x, dp.skpop.textarea.pos.y);
	dialog.appendChild(textarea);
	dialog.setFill(dm.IconManager.getImg(dp.skpop.use.img));
	var btn_use = new lime.Sprite().setPosition(dp.skpop.btn_use.pos.x, dp.skpop.btn_use.pos.y).setSize(dp.skpop.btn_use.size.w, dp.skpop.btn_use.size.h);
	btn_use.setFill(dm.IconManager.getImg(dp.skpop.btn_use.img));
	dialog.appendChild(btn_use);

	var icon = new lime.Sprite().setSize(dp.skpop.use.icon.size.w, dp.skpop.use.icon.size.h).setPosition(dp.skpop.use.icon.pos.x, dp.skpop.use.icon.pos.y);
	icon.setFill(dm.IconManager.getImg("dmdata/dmimg/sk/"+sk.id+".png"));
	icon.skill = sk; //传递选中技能
	icon.button = btn_use; // 传递选中技能到btn中
	icon.textarea = textarea;
	dialog.appendChild(icon);
	this.skillInfoShow.call(icon);
	//goog.events.listen(icon, ['mousedown', 'touchstart'], this.iconShow);

	btn_use.sk = sk;
	goog.events.listen(btn_use, ['mousedown', 'touchstart'], function(){
		game=this.getParent().getParent();
		board = game.board;
		goog.events.listen(board, ['mousedown', 'touchstart'], board.pressHandler_);
		goog.events.listen(game, ['mousedown', 'touchstart', 'mouseup', 'touchend'], game.pressHandler_);
		var dialog = this.getParent();
		game.removeChild(this.getParent());
		game.ispoping = false;
		dialog = null;
		var action = board.skill;
		action.use(this.sk.no);
	});

	var btn_cancel = new lime.Sprite().setPosition(dp.skpop.btn_cancel.pos.x, dp.skpop.btn_cancel.pos.y)
	.setSize(dp.skpop.btn_cancel.size.w, dp.skpop.btn_cancel.size.h)
	.setFill(dm.IconManager.getImg(dp.skpop.btn_cancel.img));
	dialog.appendChild(btn_cancel);
	goog.events.listen(btn_cancel, ['mousedown', 'touchstart'], function() {
		game = this.getParent().getParent();
		board = game.board;
		goog.events.listen(board, ['mousedown', 'touchstart'], board.pressHandler_);
		goog.events.listen(game, ['mousedown', 'touchstart', 'mouseup', 'touchend'], game.pressHandler_);
		game.removeChild(this.getParent());
		var rubbish = this.getParent();
		rubbish = null;
		game.ispoping = false;
	});
}

/**
 * 显示技能信息
 */
dm.Game.prototype.skillInfoShow = function(){
	if(typeof(this.no) != 'undefined'){
		//this.getParent().setFill('dmdata/dmimg/skilldialog'+parseInt(this.no+1)+'.png');
		var game = this.getParent().getParent();
		game.disp.select = game.disp.select || new lime.Sprite().setFill('dmdata/dmimg/selected.png');
		game.disp.select.setPosition(this.getPosition().x+2, this.getPosition().y+2);
		this.getParent().appendChild(game.disp.select);
	}
	//技能相关描述
	this.textarea.removeAllChildren();
	this.button.skill = this.skill;
	var textarea = this.textarea;
	var pos;

	var nm = new lime.Label().setFontColor('#000').setFontSize(25).setPosition(0, -60);
	nm.setText(' 技能：'+this.skill['name']);
	this.textarea.appendChild(nm.setSize(textarea.getSize().width, nm.getSize().height));
	pos = nm.getPosition().y + nm.getSize().height/2;

	var disc = new lime.Label().setFontColor('#000').setFontSize(25);
	disc.setText(' 描述：'+this.skill['tips']);
	disc.setPosition(0, pos + disc.getSize().height/2 + 10);
	if(disc.getSize().width > textarea.getSize().width){
		var line = Math.ceil(disc.getSize().width / textarea.getSize().width);
	}
	pos += disc.getSize().height*(line || 1);
	this.textarea.appendChild(disc.setSize(textarea.getSize().width, disc.getSize().height));

	var cd = new lime.Label().setFontColor('#000').setFontSize(25);
	cd.setText(' 冷却时间(轮)：'+this.skill['cd']);
	cd.setPosition(0, pos + cd.getSize().height/2 + 20);
	pos += cd.getSize().height;
	this.textarea.appendChild(cd.setSize(textarea.getSize().width, cd.getSize().height));

	var cost = new lime.Label().setFontColor('#000').setFontSize(25);
	cost.setText(' 魔法消耗：'+this.skill['mana']);
	cost.setPosition(0, pos + cost.getSize().height/2 + 30);
	this.textarea.appendChild(cost.setSize(textarea.getSize().width, cost.getSize().height));
}

/**
 *人物升级
 */
dm.Game.prototype.lvlup = function(){
	var conf = dm.Display.lvlpop;
	var user = this.user;
	var dialog = new lime.Sprite().setSize(conf.size.w, conf.size.h).setPosition(conf.pos.x, conf.pos.y);
	this.appendChild(dialog);

	var textarea = new lime.RoundedRect().setSize(conf.textarea.size.w, conf.textarea.size.h).setPosition(conf.textarea.pos.x, conf.textarea.pos.y);
	dialog.appendChild(textarea);
	dialog.setFill(dm.IconManager.getImg(conf.img));

	var btn_ok = new lime.Sprite().setPosition(conf.ok.pos.x, conf.ok.pos.y).setSize(conf.ok.size.w, conf.ok.size.h);
	btn_ok.setFill(dm.IconManager.getImg(conf.ok.img));
	dialog.appendChild(btn_ok);

	/*
	var icon = new lime.Sprite().setSize(90, 85).setPosition(-5, -125);
	icon.setFill(dm.IconManager.getImg("dmdata/dmimg/lvlup.png"));
	dialog.appendChild(icon);
	*/

	var i, spname, spval, label, loc=20;
	for(i in dm.conf.SP){
		spname = dm.conf.SP[i].name;
		spval = this.user.data.sp[i];
		label = new lime.Label().setFontSize(30).setText(spname +' '+(parseInt(spval)+parseInt(dm.conf.SP[i].inc)));
		textarea.appendChild(label.setPosition(0, loc - 75));
		loc += label.getSize().height;
	}

	goog.events.listen(btn_ok, ['mousedown', 'touchstart'], function() {
		var game = this.getParent().getParent();
		var board = game.board;
		game.user.lvlUp();

		goog.events.listen(board, ['mousedown', 'touchstart'], board.pressHandler_);
		goog.events.listen(game, ['mousedown', 'touchstart', 'mouseup', 'touchend'], game.pressHandler_);
		board.show_att = board.getBaseAttack() + game.data['attack_addtion'];
		board.show_dmg = board.getDamage();
		game.disp.attack.setText(board.show_att);
		game.disp.defense.setText(game.user.data.fp.a3);
		//game.mon.setText(board.show_dmg);
		game.data['hp'] += parseInt(dm.conf.FP.a6.inc); //每级增加血上限
		game.data['mana'] += parseInt(dm.conf.FP.a5.inc);
		board.turnEndShow();
		game.ispoping = false;
		game.removeChild(this.getParent());
	});
}


/**
 *装备升级
 */
dm.Game.prototype.itemBuy = function(){
	var user = this.user;
	var conf = dm.Display.itempop;
	var dialog = new lime.Sprite().setSize(conf.size.w, conf.size.h).setPosition(conf.pos.x, conf.pos.y);
	this.appendChild(dialog);

	var textarea = new lime.RoundedRect().setSize(conf.textarea.size.w, conf.textarea.size.h).setPosition(conf.textarea.pos.x, conf.textarea.pos.y);
	dialog.appendChild(textarea);
	dialog.setFill(dm.IconManager.getImg(conf.img));

	var btn_buy = new lime.Sprite().setPosition(conf.buy.pos.x, conf.buy.pos.y).setSize(conf.buy.size.w, conf.buy.size.h);
	btn_buy.setFill(dm.IconManager.getImg(conf.buy.img));
	dialog.appendChild(btn_buy);


	this.disp.select = this.disp.select || new lime.Sprite().setFill(dm.Display.popSelector.img);
	this.disp.select.setPosition(dm.Display.popSelector.one.x, dm.Display.popSelector.one.y);
	dialog.appendChild(this.disp.select);

	var equip, i;
	for(i=0;i<2;i++){
		equip = new lime.Sprite().setSize(64, 64).setPosition(-145 + i*140, -125);
		equip.textarea = textarea;
		equip.btn = btn_buy;
		equip.eqplvl = user.data.equips[i] && parseInt(user.data.equips[i].lvlneed)+1 || 1;
		equip.eqptype = i;
		equip.no = i;
		equip.setFill(dm.IconManager.getImg('dmdata/dmimg/equip/'+ i +'_'+ Math.floor(equip.eqplvl/5+1) +'.png'));
		goog.events.listen(equip, ['mousedown', 'touchstart'], this.equipInfo);
		dialog.appendChild(equip);
		if(i == 0){
			//默认
			btn_buy.item = {type:equip.eqptype, lvl:equip.eqplvl};
			this.equipInfo.call(equip);
		}
	}


	goog.events.listen(btn_buy,  ['mousedown', 'touchstart'], function() {
		game = this.getParent().getParent();
		board = game.board;
		if(this.item){
			game.user.itemBuy(this.item.type, this.item.lvl);
			board.turnEndShow();
			board.show_att = board.getBaseAttack();
			board.show_dmg = board.getDamage();
			game.disp.attack.setText(board.show_att);
			game.disp.defense.setText(game.user.data.fp.a3);
			//game.mon.setText(board.show_dmg);
			goog.events.listen(board, ['mousedown', 'touchstart'], board.pressHandler_);
			goog.events.listen(game, ['mousedown', 'touchstart', 'mouseup', 'touchend'], game.pressHandler_);
			game.ispoping = false;
			game.removeChild(this.getParent());
		}else{
			alert('choose one');
		}
	});
}

/**
 * 显示装备信息
 */
dm.Game.prototype.equipInfo = function(){
	var i, h=0, fpname, fpval, info, conf;
	this.btn.item = {type:this.eqptype, lvl:this.eqplvl};
	this.textarea.removeAllChildren();
	//this.getParent().setFill('dmdata/dmimg/skilldialog'+parseInt(this.no+1)+'.png');
	if(typeof(this.no) != 'undefined'){
		var game = this.getParent().getParent();
		game.disp.select = game.disp.select || new lime.Sprite().setFill('dmdata/dmimg/selected.png');
		game.disp.select.setPosition(this.getPosition().x+2, this.getPosition().y+2);
		this.getParent().appendChild(game.disp.select);
	}
	switch(this.eqptype){
		case 0:{
			conf = dm.conf.WP;
			break;
		}
		case 1:{
			conf = dm.conf.SLD;
		}
	}

	for(i in conf[this.eqptype+'_'+this.eqplvl].func){
		fpname = dm.conf.FP[i].tips;
		fpval  = conf[this.eqptype+'_'+this.eqplvl].fp[i];
		info = new lime.Label().setFontSize(30).setPosition(-10, 10);
		info.setText(fpname + ' +' + fpval);
		h += info.getSize().height;
		this.textarea.appendChild(info);
	}

}

/**
 * 弹窗口,购买，升级技能，等级升级等的相关窗口
 */
 dm.Game.prototype.popWindow = function(text){
	 this.ispoping = true;
	 goog.events.unlisten(this.board, ['mousedown', 'touchstart'], this.board.pressHandler_);
	 goog.events.unlisten(this, ['mousedown', 'touchstart', 'mouseup', 'touchend'], this.pressHandler_);

	 //
	 switch(text){
		 case 'lvl':{
			 this.lvlup();
			 break;
		 }
		 case 'Skill':{
			 this.skillStudy();
			 break;
		 }

		 case 'Shop':
			 this.itemBuy();
			 /*
			 btn = new dm.Button().setText('升级装备').setSize(200, 50).setPosition(250, 570);
			 popdialog.appendChild(btn);
			 frame = new lime.RoundedRect().setSize(500, 200).setPosition(40, 240).setFill(0,0,0,.7).setRadius(20).setAnchorPoint(0,0); 
			 popdialog.appendChild(frame);
			 //newequip = new lime.Sprite().setSize(100, 100).setPosition(10, 10).setFill(0,0,0,.7).setRadius(20).setAnchorPoint(0,0); 
			 //frame.appendChild(newequip);

			 var eqp_sel = this.game.user.randSel([0,1,2,3,4], 3); //随机选3个部位购买装备
			 var eqp = this.game.user.data.equips;
			 var oldeqpicon, eqpicon, oldeqplvl, eqplvl;
			 j=0;
			 for(i in eqp_sel){
				 icon = new lime.Sprite().setSize(100, 100).setPosition(80 + j*120, 20).setAnchorPoint(0,0);
				 j++;
				 eqplvl = (eqp[eqp_sel[i]] && (parseInt(eqp[eqp_sel[i]].lvlneed) + 1)) || 1;
				 oldeqplvl = eqplvl -1;
				 if(oldeqplvl){
					 oldeqpicon = dm.IconManager.getFileIcon('assets/icons.png', ((oldeqplvl-1)%20)*50, parseInt(eqp_sel[i])*4*50, 2, 2, 1);
					 icon.setFill(oldeqpicon);
					 //旧图标
				 }else{
					 //没有装备的默认图标
					 icon.setFill(0,0,0,.7);
				 }
				 eqpicon = dm.IconManager.getFileIcon('assets/icons.png', ((eqplvl-1)%20)*50, parseInt(eqp_sel[i])*4*50, 2, 2, 1);


				 icon.popdialog = popdialog;
				 icon.frame = frame;
				 icon.eqpid = parseInt(eqp_sel[i]);
				 icon.eqplvl = eqplvl;
				 icon.eqpic = eqpicon; //传递新图标

				 icon.btn = btn;

				 popdialog.appendChild(icon);

				 goog.events.listen(icon,  ['mousedown', 'touchstart'], function() {
					 this.popdialog.removeChild(this.popdialog.btn2); //先移除刷新按钮，选择了可以刷新的装备才出现
					 this.frame.removeAllChildren();
					 var h = 0, fpname, fpval;
					 var user = this.getParent().getParent().game.user;
					 var newequip = new lime.Sprite().setSize(100, 100).setPosition(10, 10).setFill(0,0,0,.7).setAnchorPoint(0,0); 
					 newequip.setFill(this.eqpic);
					 this.frame.appendChild(newequip);
					 for(j in dm.conf.EP[this.eqpid+'_'+(this.eqplvl-1)].func){
						 fpname = dm.conf.FP[j].tips;
						 fpval  = dm.conf.EP[this.eqpid+'_'+this.eqplvl].fp[j];
						 var wpinfo = new lime.Label().setFontColor('#FFF').setAnchorPoint(0, 0).setFontSize(30).setPosition(110, 10+h);
						 wpinfo.setText(fpname + ' +' + fpval);
						 h += wpinfo.getSize().height;
						 this.frame.appendChild(wpinfo);
					 }
					 this.btn.icon ={};
					 this.btn.icon = this;
					 if(this.eqplvl > 1){ //当前有装备才可以刷新
						 var btn2 = new dm.Button().setText('刷新属性').setSize(200, 50).setPosition(250,470);
						 this.popdialog.appendChild(btn2);
						 this.popdialog.btn2 = btn2;

						 goog.events.listen(btn2,  ['mousedown', 'touchstart'], function() {
							 var popdialog = this.getParent(),
							 user = popdialog.getParent().game.user,
							 fpname, fpval, winfo, h=0;
							 //
							 popdialog.removeAllChildren();
							 //要刷新的装备图标
							 //
							 var equip_icon = new lime.Sprite().setSize(100, 100).setPosition(200, 20).setAnchorPoint(0,0).setFill(this.icon.eqpic);
							 var oldinfo = new lime.RoundedRect().setSize(400, 140).setPosition(50, 140).setFill(0,0,0,.7).setRadius(20).setAnchorPoint(0,0); 
							 var newinfo = new lime.RoundedRect().setSize(400, 140).setPosition(50, 300).setFill(0,0,0,.7).setRadius(20).setAnchorPoint(0,0); 
							 var confirm = new dm.Button().setText('刷新').setSize(200, 50).setPosition(100,470);
							// var back = new dm.Button().setText('返回').setSize(200, 50).setPosition(300,470);
							 popdialog.appendChild(equip_icon);
							 popdialog.appendChild(oldinfo);
							 popdialog.appendChild(newinfo);
							 popdialog.appendChild(confirm);
							// popdialog.appendChild(back);
							 
							 //旧的附加属性
							 for(j in user.data.eqp_add[this.icon.eqpid]){
								 fpname = dm.conf.FP[j].tips;
								 fpval = user.data.eqp_add[this.icon.eqpid][j];
								 wpinfo = new lime.Label().setFontColor('#FFF').setAnchorPoint(0, 0).setFontSize(30).setPosition(0, h);
								 wpinfo.setText(fpname + ' +' + fpval);
								 h += wpinfo.getSize().height;
								 oldinfo.appendChild(wpinfo);
							 }

							 //新的附加属性
							 var atts = user.genAttr(this.icon);
							 confirm.atts = atts;
							 confirm.icon = this.icon;
							 h = 0;
							 for(j in atts){
								 fpname = dm.conf.FP[j].tips;
								 fpval  = atts[j];
								 wpinfo = new lime.Label().setFontColor('#FFF').setAnchorPoint(0, 0).setFontSize(30).setPosition(0, h);
								 wpinfo.setText(fpname + ' +' + fpval);
								 h += wpinfo.getSize().height;
								 newinfo.appendChild(wpinfo);
							 }

							 goog.events.listen(confirm,  ['mousedown', 'touchstart'], function() {
								 var board = this.getParent().getParent();
								 board.game.user.refresh(this.icon, atts);
								 goog.events.listen(board, ['mousedown', 'touchstart'], board.pressHandler_);
								 this.getParent().getParent().removeChild(this.getParent());

								 board.game.ispoping = false;
							 });
						 });
					 }
					 if(btn2){
						 btn2.icon ={};
						 btn2.icon = this;
					 }
				 });
			 }
			 
			 goog.events.listen(btn,  ['mousedown', 'touchstart'], function() {
				 board = this.getParent().getParent();
				 game = board.game
				 if(this.icon){
					 board.game.user.upgrade(this.icon);
					 board.turnEndShow();
					 board.show_att = board.getBaseAttack();
					 board.show_dmg = board.getDamage();
					 game.att.setText(board.show_att);
					 game.mon.setText(board.show_dmg);
					 goog.events.listen(board, ['mousedown', 'touchstart'], board.pressHandler_);
					 game.ispoping = false;
					 board.removeChild(this.getParent());
				 }else{
					 alert('choose one');
				 }
			 });
		 break;
		 */
	 }
 }


