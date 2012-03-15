goog.provide('dm.Game');
goog.require('dm.Progress');
goog.require('lime.CanvasContext');
goog.require('lime.animation.RotateBy');
goog.require('lime.animation.MoveBy');
goog.require('lime.animation.Loop');

/**
 * Game scene for Roundball game.
 * @constructor
 * @extends lime.Scene
 */
dm.Game = function(size,user){

	dm.log.fine('for ad',size,user)

    lime.Scene.call(this);
	//初始化数据
	this.initData(size, user);
	this.createPanel();
	this.createBoard();
	//显示数据
	this.showData();

    // update score when points have changed
    lime.scheduleManager.scheduleWithDelay(this.updateScore, this, 100);

    lime.scheduleManager.scheduleWithDelay(this.changeData, this, 500);
     // show lime logo
    dm.builtWithLime(this);
	goog.events.listen(this, ['mousedown', 'touchstart', 'mouseup', 'touchend'], this.pressHandler_, false, this);
	//
	//加数值动画label
	//this.notify = new lime.Label().setText('loading').setFontSize(80).setFontColor('#000').setPosition(dm.WIDTH/2, dm.HEIGHT/2).setOpacity(1);
	//this.appendChild(this.notify);

   /* lime.scheduleManager.scheduleWithDelay(function(){
		var rotate = new lime.animation.RotateBy(-150);
		this.disp.weapon_bg.runAction(rotate);
		}, this, 200);
		*/
};
goog.inherits(dm.Game, lime.Scene);


/*
 * 面板的UI生成
 */
dm.Game.prototype.createPanel = function(){
	//背景层
	//this.panel = new lime.Layer();

	var i, j, slot
	var gold_bar, blood_bar, skill_exp_bar, exp_bar;
	var blood_mask;

	var url = 'dmdata/dmimg/';
	var ext = '.png';

	//背景图片
	//this.backGround = new lime.Sprite().setSize(720, 1004).setFill(dm.IconManager.getImg('dmdata/dmimg/background.png'));
	this.backGround = new lime.Sprite().setSize(720, 1004).setFill('dmdata/dmimg/background.png');
	this.backGround.setPosition(720/2, 1004/2);
	this.appendChild(this.backGround);
	//
	this.disp.lvl = new lime.Label().setFontSize(20).setText("lv."+this.user.data.lvl).setPosition(-310, -330);
	this.backGround.appendChild(this.disp.lvl);
	//
	this.disp.turn = new lime.Label().setFontSize(20).setText(this.data.turn).setPosition(317, 353);
	this.backGround.appendChild(this.disp.turn);

	//player
	this.disp.player = new lime.Sprite().setSize(75, 160).setFill(dm.IconManager.getImg(url+'boy'+ext)).setPosition(-250, -400);
	this.backGround.appendChild(this.disp.player);
	//
	//conterpart
	this.disp.enemy = new lime.Sprite().setSize(108, 158).setFill(dm.IconManager.getImg(url+'boss'+ext)).setPosition(250, -400);
	this.backGround.appendChild(this.disp.enemy);//.setScale(-1, 1));

	//box
	this.disp.box = new lime.Sprite().setSize(90, 80).setFill(dm.IconManager.getImg(url+'box'+ext)).setPosition(10, -393);
	this.backGround.appendChild(this.disp.box);

	//4个技能槽
	for( i=0; i<2; i++){
		for(j=0; j<2; j++){
			slot = new lime.Sprite().setSize(60, 60).setPosition(-270 + i*73 , 368 + j*73 ).setFill(0, 0, 0, 0.7);
			this.disp.skillslot[i+j*2] = slot;
			this.backGround.appendChild(slot);
		}
	}

	blood_bar  = new lime.Sprite().setPosition(245, 404).setSize(76, 130);
	blood_bar.setFill(dm.IconManager.getImg(url + 'blood_inside' + ext));
    blood_mask = new lime.Sprite().setFill(100, 0, 0, .1).setAnchorPoint(0.5, 1).setPosition(0,65).setSize(76, 130);
	blood_bar.setMask(blood_mask);
	blood_bar.appendChild(blood_mask);
	this.disp.blood_mask = blood_mask;

	this.backGround.appendChild(blood_bar);

	//menu
	/*
	this.disp.menu = new lime.Sprite().setSize(104, 40).setAnchorPoint(0, 0).setPosition(580, 60).setFill(dm.IconManager.getImg(url+'menu'+ext));
	this.disp.menu.func = this.mainShow;
	*/

	//stat
	/*
	this.disp.stat = new lime.Sprite().setSize(104, 40).setAnchorPoint(0, 0).setPosition(580, 125).setFill(dm.IconManager.getImg(url+'start'+ext));
	this.disp.stat.func = this.statShow;

	this.backGround.appendChild(this.disp.menu);
	this.backGround.appendChild(this.disp.stat);
	*/

}

/*
 * create board
 */
dm.Game.prototype.createBoard = function(){
    this.board = new dm.Board(this.size, this.size, this);
    if(dm.isBrokenChrome()) this.board.setRenderer(lime.Renderer.CANVAS);
    this.backGround.appendChild(this.board);
}

/**
 * 显示游戏中的数值
 */
dm.Game.prototype.showData = function(){
    this.score = new lime.Label().setFontColor('#000').setFontSize(24).setText('0').setAnchorPoint(0, 0).setFontWeight(700);
	this.show_vars = {
		exp:{curdata:this.data.exp, max:100, loc:{x:370 - 720/2,y:940 - 1004/2}}
		,gold:{curdata:this.data.gold, max:100, loc:{x:100 - 360,y:900 - 502}}
		,mana:{curdata:this.data.mana, max:this.user.data.fp.a5, loc:{x:370 -360, y:910 - 502}}
		,hp:{curdata:this.data.hp, max:this.user.data.fp.a6, loc:{x:600 - 360, y:890 - 502}}
	}
	
	for( var i in this.show_vars){
		var p = this.show_vars[i];
		p._lct = new lime.Label().setFontSize(28).setText(p.curdata+'/'+p.max).setPosition(p.loc.x, p.loc.y);
		this.backGround.appendChild(p._lct);
	}
	this.mon = new lime.Label().setFontColor('#000').setFontSize(34).setText(this.board.getDamage()).setPosition(260-360, 880-502);
	this.att = new lime.Label().setFontColor('#000').setFontSize(34).setText(this.user.data.fp.a1).setPosition(470-360, 880-502);
	this.backGround.appendChild(this.mon);
	this.backGround.appendChild(this.att);	
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
	this.disp = {};

	//游戏数据
	this.data = {};
	this.data.turn = 0; //回合数
	this.data.hp    = this.user.data.fp.a6;
	this.data.mana  = this.user.data.fp.a5;
	this.data.def   = this.user.data.fp.a3;
	this.data.def_extra = 0; //额外护甲,技能增加的额外生命、护甲、魔法盾，都可看做是额外护甲形式
	this.data.score = 0;
	this.data.lvl   = 0;
	this.data.exp   = 0;
	this.data.gold  = 0;
	this.data.skillexp = 0;
    this.data.points = 0;
	//this.panel;
	this.disp.skillslot = {};
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
	this.data.canCD = 1;
	//
	//已经存在的特殊怪物
	this.data.specialMon = [];
	for(var i=0;i<20;i++){
		//将特殊怪物存入一个数组，同一个特殊怪物，只能出现一次
		this.data.specialMon[i] = i+1;
	}
	//技能CD
	this.data.skillCD = {};

	//var testjson = JSON.stringify(this.data);
	//var testdecode = JSON.parse(testjson);

}

/**
 *
 *
 */
dm.Game.prototype.pressHandler_ = function(e){
	var clickArea = {
		skArea:{
			0:{w:60 ,h:60 ,x:-270 ,y:370},
			1:{w:60 ,h:60 ,x:-195 ,y:370},
			2:{w:60 ,h:60 ,x:-270 ,y:440},
			3:{w:60 ,h:60 ,x:-195 ,y:440}
		},
		charArea:{
			player:{w:75, h:160 ,x:-250, y:-400},
			enemy:{w:108, h:160, x:250, y:-400}
		},
		killed:{
			killed:{w:60, h:60, x:-90 ,y:337}
		}
	};
	var pos = e.position;
	var i,j;
	for(i in clickArea){
		for(j in clickArea[i]){
			if(pos.x - 360 > clickArea[i][j].x - clickArea[i][j].w/2  &&  pos.x - 360 < clickArea[i][j].x + clickArea[i][j].w/2
			   && pos.y - 502 > clickArea[i][j].y - clickArea[i][j].h/2 && pos.y - 502 < clickArea[i][j].y + clickArea[i][j].h/2){
				   if(i == "skArea" && this.disp.skillslot[j].sk){
					   this.skillUse(this.disp.skillslot[j].sk);
				   }else if(i == "charArea" && j == "player"){
					   if( e.type == 'touchstart' || e.type == 'mousedown'){
						   this.showStat();
					   }else if(e.type == 'touchend' || e.type == 'mouseup'){
						   this.backGround.removeChild(this.disp.charTip);
						   this.disp.charTip = null;
					   }
				   }else if(i == "killed"){
					   if( e.type == 'touchstart' || e.type == 'mousedown'){
						   this.showKilled();
					   }else if(e.type == 'touchend' || e.type == 'mouseup'){
						   this.backGround.removeChild(this.disp.killedTip);
						   this.disp.killedTip = null;
					   }
				   }
			   }
		}
	}
}

/*
 * 点击人物状态的图标，可以显示人物相关信息：武器装备，人物二级属性
 */
dm.Game.prototype.showStat = function(){
	var loc = {
		lvl:{x:48, y:-65},
		b1:{x:-11, y:-45},
		b2:{x:75, y:-45},
		b3:{x:-11, y:-20},
		b4:{x:75, y:-20},
		a1:{x:50, y:0},
		a2:{x:50, y:24},
		a37:{x:15, y:43},
		a38:{x:15, y:67}
	}
	var i, j, value, label, charTip;
	this.disp.charTip = new lime.Sprite().setSize(210, 166).setFill(dm.IconManager.getImg('dmdata/dmimg/chartip.png')).setPosition(-125, -390);
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
	var loc = {
		common:{x:35, y:-16, value:this.data.killcommon || 0},
		special:{x:35, y:7, value:this.data.killspecial || 0}
	}
	var i, j, value, label, killedTip;
	this.disp.killedTip = new lime.Sprite().setSize(126, 58).setFill(dm.IconManager.getImg('dmdata/dmimg/killtip.png')).setPosition(-90, 280);
	killedTip = this.disp.killedTip;
	this.backGround.appendChild(killedTip);
	for(i in loc){
		label = new lime.Label().setText(loc[i].value).setPosition(loc[i].x, loc[i].y); 
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
	 data[key] = data[key] || 0;

	 if(method == 'add'){
		 data[key] += value;
		 if(data[key] <= 0){
			 data[key] = 0;
		 }
	 }else{
		 data[key] = value;
	 }
	 switch(key){
		 case 'exp':{
			 while(data['exp'] >= 5){
				 data['exp'] -= 5;
				 //this.pop.lvl++;
			 }
			 break;
		 }
		 case 'mana':{
			 data['skillexp'] += Math.max(0, data['mana'] - fp.a5);
			 data['mana'] = Math.min(fp.a5, data['mana']);
			 while(data['skillexp'] >= 3){
				 data['skillexp'] -= 3;
				 //this.pop.skill += 1;
			 }
			 break;
		}
		case 'gold':{
			while(data['gold'] >= 3){
				data['gold'] -= 3;

				//this.pop.shop += 1;
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
	 dm.api('System.save',{"id":"wangkun", "data":json_data});

	 return JSON.stringify(savedata); 
 }

 dm.Game.prototype.loadGame = function(){
	 var game = this;
	 dm.api('System.read',{"id":"wangkun"}, function(obj){game.parseData(obj.d)});
 }

 /**
  * 解析储存的游戏数据
  */
  dm.Game.prototype.parseData = function(savedata){

	  var sdata = JSON.parse(savedata);
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

	  this.user.data["skills"] = {};
	  for(i in udata["skills"]){
		  this.user.data.skills[i] = dm.conf.SK[udata["skills"][i]];
	  }
	  //根据装备的id附加装备
	  this.user.data["equips"] = {};

	  var eqplvl, eqptype;
	  for(i in udata["equips"]){
		  eqplvl = parseInt(udata["equips"][i]);
		  eqptype = i;
		  this.user.data.equips[i] = dm.conf.EP[i+'_'+udata["equips"][i]] || {};

		  icon = dm.IconManager.getFileIcon('assets/icons.png', ((eqplvl-1)%20)*50, eqptype*4*50, 2, 2, 1);
		  this.user.data.equips[i].icon = icon;
	  }

	  //改变技能槽
	  this.changeSkillSlot();

	  //改变状态属性:gold ,exp, mana, hp;
	  //
	  this.updateData('gold', 0, "add");
	  this.updateData('exp', 0, "add");
	  this.updateData('mana', 0, "add");
	  this.updateData('hp', 0, "add");

	  //重新生成gems
	  this.board.loadGems(gems);
	  var action = this.board.moveGems();
	  goog.events.listen(
		  action, lime.animation.Event.STOP, function(){
		  this.board.setAllSpecial();
	  },false ,this
	  );
  }

/**
 * 刷新技能槽图标
 */
 dm.Game.prototype.changeSkillSlot = function(){
	 var i, slot=0;
	 for(i in this.user.data.skills){
		 var sk = this.user.data.skills[i];
		 var img = dm.IconManager.getFileIcon('assets/tiles.png', 510+((parseInt(sk.no) - 1)%10)*50, Math.floor(parseInt(sk.no)/10)*50 , 2, 2.1, 1);
		 this.disp.skillslot[slot].setFill(img);
		 this.disp.skillslot[slot].no = sk.no;
		 this.disp.skillslot[slot].sk = sk;
		 slot++;
	 }
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
		 data["monster"]["hp_left"] = gem.monster.hp_left;
		 data["monster"]["def"] = gem.monster.def;
		 data["monster"]["def_left"] = gem.monster.def_left;
		 data["monster"]["attack"] = gem.monster.attack ;
		 data["monster"]["aliveturn"] = gem.monster.aliveturn;

		 gem.monster.poison && (data["monster"]["poison"] = gem.monster.poison);
		 //!gem.monster.poison_start && (data["monster"]["poison_start"] = gem.monster.poison_start);
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
dm.Game.prototype.changeData = function() {
	if(this.ispoping)
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
    var curscore = parseInt(this.score.getText(), 10);
    if (curscore < this.data.points) {
		this.step += 1;
		if(this.step < 5)
			this.score.setText(curscore + 1);
		else{
			this.score.setText(this.data.points);
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
    this.curTime += p;
    if (this.curTime > this.maxTime) this.curTime = this.maxTime;
    if (this.time_left)
    this.time_left.setProgress(this.curTime / this.maxTime);
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
   goog.events.unlisten(this.board, ['mousedown', 'touchstart'], this.board.pressHandler_);
   goog.events.unlisten(this, ['mousedown', 'touchstart'],this.pressHandler_);

   lime.scheduleManager.unschedule(this.updateScore, this);

    var dialog = new lime.RoundedRect().setFill(0, 0, 0, .7).setSize(500, 480).setPosition(360, 260).
        setAnchorPoint(.5, 0).setRadius(20);
    this.appendChild(dialog);

    var title = new lime.Label().setText('You are killed!').
        setFontColor('#ddd').setFontSize(40).setPosition(0, 70);
    dialog.appendChild(title);

    var score_lbl = new lime.Label().setText('Your score:').setFontSize(24).setFontColor('#ccc').setPosition(0, 145);
    dialog.appendChild(score_lbl);

    var score = new lime.Label().setText(this.data.points).setFontSize(150).setFontColor('#fff').
        setPosition(0, 240).setFontWeight(700);
    dialog.appendChild(score);

    var btn = new dm.Button().setText('重来').setSize(200, 90).setPosition(-110, 400);
    dialog.appendChild(btn);
    goog.events.listen(btn, ['mousedown', 'touchstart'], function() {
         dm.newgame(this.board.cols);
    },false, this);

    btn = new dm.Button().setText('主菜单').setSize(200, 90).setPosition(110, 400);
    dialog.appendChild(btn);
    goog.events.listen(btn, ['mousedown', 'touchstart'], function() {
        dm.loadMenu();
    });
};

/**
 * 技能对话框
 * @param {action} 
 *     study -- 学习; use -- 使用
 *        {sk}
 */
dm.Game.prototype.skillStudy = function(){
	var user = this.user;

	var dialog = new lime.Sprite().setSize(473, 416).setPosition(720/2, 1004/2);
	this.appendChild(dialog);

	var textarea = new lime.RoundedRect().setSize(390, 150).setPosition(0, 35).setFill(0,0,0,.3);
	dialog.appendChild(textarea);
	dialog.setFill(dm.IconManager.getImg("dmdata/dmimg/skilldialog.png"));

	var icon;
	var btn_study = new lime.Sprite().setSize(87, 33).setPosition(0, 150);
	btn_study.setFill(dm.IconManager.getImg("dmdata/dmimg/study.png"));
	dialog.appendChild(btn_study);
	var sn=0, sk_key;

	for(i in this.user.data.skills){
		sn++;
	}
	if(sn < 4){ //可以随机新技能
		sk_key = user.randSel(user.findKey(dm.conf.SK), 2); //随机两个技能，选择学习或者升级
	}else if(sn == 4){
		sk_key = user.randSel(user.findKey(user.data.skills), 2);
	}

	for(i in sk_key){
		icon = new lime.Sprite().setSize(90, 85).setPosition(-145 + i*140, -125);
		icon.skill = dm.conf.SK[sk_key[i]]; //传递选中技能
		icon.button = btn_study; // 传递选中技能到btn中
		icon.textarea = textarea;
		icon.setFill(dm.IconManager.getImg('dmdata/dmimg/sk/'+sk_key[i]+'.png'));
		dialog.appendChild(icon);
		dialog.appendChild(textarea);
		goog.events.listen(icon, ['mousedown', 'touchstart'], this.skillInfoShow);
	}

	goog.events.listen(btn_study, ['mousedown', 'touchstart'], function(){
		game = this.getParent().getParent();
		board = game.board;
		goog.events.unlisten(board, ['mousedown', 'touchstart'], board.pressHandler_);
		if(this.skill){
			game.user.skillUp(this.skill);
			goog.events.listen(board, ['mousedown', 'touchstart'], board.pressHandler_);
		//	goog.events.listen(game, ['mousedown', 'touchstart'], game.pressHandler_);
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
	var user = this.user;
	var dialog = new lime.Sprite().setSize(473, 416).setPosition(720/2, 1004/2);
	this.appendChild(dialog);
	var textarea = new lime.RoundedRect().setSize(390, 150).setPosition(0, 35).setFill(0,0,0,.3);
	dialog.appendChild(textarea);
	dialog.setFill(dm.IconManager.getImg("dmdata/dmimg/skilluse.png"));
	var btn_use = new lime.Sprite().setSize(87, 33).setPosition(-130, 150);
	btn_use.setFill(dm.IconManager.getImg("dmdata/dmimg/use.png"));
	dialog.appendChild(btn_use);

	var icon = new lime.Sprite().setSize(90, 85).setPosition(-5, -125);
	icon.setFill(dm.IconManager.getImg("dmdata/dmimg/sk/"+sk.id+".png"));
	icon.skill = sk; //传递选中技能
	icon.button = btn_use; // 传递选中技能到btn中
	icon.textarea = textarea;
	this.skillInfoShow.call(icon);
	dialog.appendChild(icon);
	//goog.events.listen(icon, ['mousedown', 'touchstart'], this.iconShow);

	btn_use.sk = sk;
	goog.events.listen(btn_use, ['mousedown', 'touchstart'], function(){
		game=this.getParent().getParent();
		board = game.board;
	//	goog.events.listen(board, ['mousedown', 'touchstart'], board.pressHandler_);
	//	goog.events.listen(game, ['mousedown', 'touchstart'], game.pressHandler_);
		var dialog = this.getParent();
		game.removeChild(this.getParent());
		game.ispoping = false;
		dialog = null;
		var action = new dm.Skill(game);
		action.use(this.sk.no);
	});

	var btn_cancel = new lime.Sprite().setSize(87, 33).setPosition(120, 150).setFill(dm.IconManager.getImg("dmdata/dmimg/cancel.png"));
	dialog.appendChild(btn_cancel);
	goog.events.listen(btn_cancel, ['mousedown', 'touchstart'], function() {
		game = this.getParent().getParent();
		board = game.board;
		goog.events.listen(board, ['mousedown', 'touchstart'], board.pressHandler_);
	//	goog.events.listen(game, ['mousedown', 'touchstart'], game.pressHandler_);
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
		//技能相关描述
		this.textarea.removeAllChildren();
		this.button.skill = this.skill;
		var textarea = this.textarea;

		var nm = new lime.Label().setFontColor('#FFF').setFontSize(20).setPosition(0, 00);
		nm.setText(' 技能：'+this.skill['name']);
		this.textarea.appendChild(nm.setSize(textarea.getSize().width, nm.getSize().height));

		var disc = new lime.Label().setFontColor('#FFF').setFontSize(20).setPosition(0, 30);
		disc.setText(' 描述：'+this.skill['tips']);
		this.textarea.appendChild(disc.setSize(textarea.getSize().width, disc.getSize().height));

		var cd = new lime.Label().setFontColor('#FFF').setFontSize(20).setPosition(0, 60);
		cd.setText(' 冷却时间(轮)：'+this.skill['cd']);
		this.textarea.appendChild(cd.setSize(textarea.getSize().width, cd.getSize().height));

		var cost = new lime.Label().setFontColor('#FFF').setFontSize(20).setPosition(0, 90);
		cost.setText(' 魔法消耗：'+this.skill['mana']);
		this.textarea.appendChild(cost.setSize(textarea.getSize().width, cost.getSize().height));
}

/**
 *人物升级
 */
dm.Game.prototype.lvlup = function(){
	var user = this.user;
	var dialog = new lime.Sprite().setSize(473, 416).setPosition(720/2, 1004/2);
	this.appendChild(dialog);

	var textarea = new lime.RoundedRect().setSize(390, 150).setPosition(0, 35).setFill(0,0,0,.3);
	dialog.appendChild(textarea);
	dialog.setFill(dm.IconManager.getImg("dmdata/dmimg/skilluse.png"));

	var btn_ok = new lime.Sprite().setSize(87, 33).setPosition(0, 150);
	btn_ok.setFill(dm.IconManager.getImg("dmdata/dmimg/study.png"));
	dialog.appendChild(btn_ok);

	var icon = new lime.Sprite().setSize(90, 85).setPosition(-5, -125);
	icon.setFill(dm.IconManager.getImg("dmdata/dmimg/lvlup.png"));
	dialog.appendChild(icon);

	var i, spname, spval, label, loc=20;
	for(i in dm.conf.SP){
		spname = dm.conf.SP[i].name;
		spval = this.user.data.sp[i];
		label = new lime.Label().setFontSize(30).setText(spname +' '+spval+' + '+dm.conf.SP[i].inc);
		textarea.appendChild(label.setPosition(0, loc - 75));
		loc += label.getSize().height;
	}

	goog.events.listen(btn_ok, ['mousedown', 'touchstart'], function() {
		var game = this.getParent().getParent();
		var board = game.board;
		game.user.lvlUp();

		goog.events.listen(board, ['mousedown', 'touchstart'], board.pressHandler_);
		board.show_att = board.getBaseAttack() + game.data['attack_addtion'];
		board.show_dmg = board.getDamage();
		game.att.setText(board.show_att);
		game.mon.setText(board.show_dmg);
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
	var dialog = new lime.Sprite().setSize(473, 416).setPosition(720/2, 1004/2);
	this.appendChild(dialog);

	var textarea = new lime.RoundedRect().setSize(390, 150).setPosition(0, 35).setFill(0,0,0,.3);
	dialog.appendChild(textarea);
	dialog.setFill(dm.IconManager.getImg("dmdata/dmimg/skilldialog.png"));

	var btn_buy = new lime.Sprite().setSize(87, 33).setPosition(0, 150);
	btn_buy.setFill(dm.IconManager.getImg("dmdata/dmimg/study.png"));
	dialog.appendChild(btn_buy);

	var equip, i;
	for(i=0;i<2;i++){
		equip = new lime.Sprite().setSize(64, 64).setPosition(-145 + i*140, -125);
		equip.textarea = textarea;
		equip.btn = btn_buy;
		equip.eqplvl = user.data.equips[i] && parseInt(user.data.equips[i].lvlneed)+1 || 1;
		equip.eqptype = i;
		equip.setFill(dm.IconManager.getImg('dmdata/dmimg/equip/'+ i +'_'+ equip.eqplvl +'.png'));
		goog.events.listen(equip, ['mousedown', 'touchstart'], this.equipInfo);
		dialog.appendChild(equip);
	}


	goog.events.listen(btn_buy,  ['mousedown', 'touchstart'], function() {
		game = this.getParent().getParent();
		board = game.board;
		if(this.item){
			game.user.buyItem(this.item.type, this.item.lvl);
			board.turnEndShow();
			board.show_att = board.getBaseAttack();
			board.show_dmg = board.getDamage();
			game.att.setText(board.show_att);
			game.mon.setText(board.show_dmg);
			goog.events.listen(board, ['mousedown', 'touchstart'], board.pressHandler_);
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
	var i, h=0, fpname, fpval, info;
	this.btn.item = {type:this.eqptype, lvl:this.eqplvl};
	this.textarea.removeAllChildren();
	for(i in dm.conf.EP[this.eqptype+'_'+this.eqplvl].func){
		fpname = dm.conf.FP[i].tips;
		fpval  = dm.conf.EP[this.eqptype+'_'+this.eqplvl].fp[i];
		info = new lime.Label().setFontColor('#FFF').setFontSize(20).setPosition(-10, 10);
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


