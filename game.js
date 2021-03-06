goog.provide('dm.Game');
goog.require('dm.Progress');
goog.require('lime.CanvasContext');
goog.require('lime.animation.RotateBy');
goog.require('lime.animation.MoveBy');
goog.require('lime.animation.Loop');

/**
 *
 * Game scene for Roundball game.
 * @constructor
 * @extends lime.Scene
 * 
 */


dm.Game = function(size,user){
    lime.Scene.call(this);
	//初始化数据
	this.initData(size, user);
	this.createBoard();
	this.createPanel();

	//this.skill = new dm.Skill(this);
	
    // update score when points have changed
    lime.scheduleManager.scheduleWithDelay(this.updateScore, this, 100);

    lime.scheduleManager.scheduleWithDelay(this.changeData, this, 500);

     // show lime logo
    dm.builtWithLime(this);


	//
	//加数值动画label
	this.notify = new lime.Label().setFontSize(80).setFontColor('#000').setPosition(dm.WIDTH/2, dm.HEIGHT/2).setOpacity(0);
	this.appendChild(this.notify);

};
goog.inherits(dm.Game, lime.Scene);

/**
 * 每隔一定帧来检测是否达到升级等条件，然后弹出窗口
 */
dm.Game.prototype.changeData = function() {
	if(this.ispoping)
		return;
	if(this.pop.shop > 0 ){
		this.pop.shop--;
		this.board.popWindow('Shop');
		return;
	} 
	if(this.pop.lvl > 0 ){
		this.pop.lvl--;
		this.board.popWindow('lvl Up');
		return;
	} 
	if(this.pop.skill > 0 ){
		this.pop.skill--;
		this.board.popWindow('Skill');
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
 * Show game-over dialog
 */
dm.Game.prototype.endGame = function() {

   //unregister the event listeners and schedulers
	//
   goog.events.unlisten(this.board, ['mousedown', 'touchstart'], this.board.pressHandler_);
   lime.scheduleManager.unschedule(this.updateScore, this);
   lime.scheduleManager.unschedule(this.decreaseTime, this);

    var dialog = new lime.RoundedRect().setFill(0, 0, 0, .7).setSize(500, 480).setPosition(360, 260).
        setAnchorPoint(.5, 0).setRadius(20);
    this.appendChild(dialog);

    var title = new lime.Label().setText(this.curTime < 1 ? 'No more time!' : 'You are killed!').
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
 * 改变数值等动画效果
 */
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


/*
 * 面板的UI生成
 */
dm.Game.prototype.createPanel = function(){
	this.panel = new lime.Layer();
	var panel  = this.panel;
	var i,slot,tailer, show_board; //slot 技能槽
	tailer = dm.Display.boardtailer;//尾部
	//顶部技能槽
	show_board = new lime.Sprite().setSize(690, 140).setAnchorPoint(0,0).setPosition(tailer.location.x, tailer.location.y).
		setFill(dm.IconManager.getFileIcon('assets/tiles.png', tailer.img.x, tailer.img.y, 690/320, 140/76, 1));

	panel.appendChild(show_board);

	var icon = dm.IconManager.getFileIcon('assets/menus.png', 248, 0, 110/53, 110/53, 1);
	//
	//4个技能槽
	for( i=0; i<4; i++){
		slot = new lime.Sprite().setSize(110,110).setAnchorPoint(0,0).setPosition(60 + i*120, 0).setFill(icon);
		this.skillslot[i] = slot;
		panel.appendChild(slot);
		goog.events.listen(this.skillslot[i], ['mousedown', 'touchstart'], function() {
			if(this.sk) //slot对应的skill存在
				this.getParent().getParent().skillShow(this);
		});
	}


	//menu
	icon = dm.IconManager.getFileIcon('assets/tiles.png', 342, 336, 148/72, 50/26, 1);
	var menu = new lime.Sprite().setSize(152, 50).setAnchorPoint(0, 0).setPosition(60 + 4*120, 0).setFill(icon);
    menu.domClassName = goog.getCssName('lime-button');
	panel.appendChild(menu);
	goog.events.listen(menu, ['mousedown', 'touchstart'], function() {
		this.getParent().getParent().mainShow();
    });


	//stat
	icon = dm.IconManager.getFileIcon('assets/tiles.png', 268, 336, 148/72, 50/26, 1);
	var stat = new lime.Sprite().setSize(152, 50).setAnchorPoint(0, 0).setPosition(60 + 4*120, 60).setFill(icon);
    stat.domClassName = goog.getCssName('lime-button');
	panel.appendChild(stat);
    goog.events.listen(stat, ['mousedown', 'touchstart'], function() {
		this.getParent().getParent().statShow();
    });
	this.appendChild(panel);


    this.score = new lime.Label().setFontColor('#000').setFontSize(24).setText('0').setAnchorPoint(0, 0).setFontWeight(700);
	this.show_vars = {
		exp:{curdata:this.data.exp, max:100, loc:{x:370,y:940}}
		,gold:{curdata:this.data.gold, max:100, loc:{x:100,y:900}}
		,mana:{curdata:this.data.mana, max:this.user.data.fp.a5, loc:{x:370, y:910}}
		,hp:{curdata:this.data.hp, max:this.user.data.fp.a6, loc:{x:600, y:890}}
	}
	
	for( i in this.show_vars){
		p = this.show_vars[i];
		p._lct = new lime.Label().setFontSize(28).setText(p.curdata+'/'+p.max).setPosition(p.loc.x, p.loc.y);
		panel.appendChild(p._lct);
	}
	this.mon = new lime.Label().setFontColor('#000').setFontSize(34).setText(this.board.getDamage()).setPosition(260, 880);
	this.att = new lime.Label().setFontColor('#000').setFontSize(34).setText(this.user.data.fp.a1).setPosition(470, 880);
	panel.appendChild(this.mon);
	panel.appendChild(this.att);	
	this.show_create = 1;

}

/*
 * create board
 */
dm.Game.prototype.createBoard = function(){
    this.board = new dm.Board(this.size, this.size, this).setPosition(25, 134);
    if(dm.isBrokenChrome()) this.board.setRenderer(lime.Renderer.CANVAS);
    this.appendChild(this.board);
}

/*
 * 游戏数据初始化
 */
dm.Game.prototype.initData = function(size, user){
	//初始化数据
	this.size  = size ||  6;
	this.user = user || new dm.User(1);
	this.user.game = this;
	this.data = {};
	this.data.turn = 0; //回合数
	/*
	this.data.appearNum = {};
	for( i = 0 ; i < dm.GEMTYPES.length ; ++i){
		this.data.appearNum[i] = 0;
	}
	*/
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
	this.panel;
	this.skillslot = [];
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

	var testjson = JSON.stringify(this.data);
	var testdecode = JSON.parse(testjson);

}

/*
 * 点击人物状态的图标，可以显示人物相关信息：武器装备，人物二级属性
 */
dm.Game.prototype.statShow = function(){
	var i,j,fp,dialog,eqpslot,sloticon,eqp,eqpicon,pos,eqpdetail,charinfo,charloc;
	var sp = dm.conf.SP;
	var spname,spval,fpname,fpval,loc=0; 
	pos = this.board.getPosition();
	goog.events.unlisten(this.board, ['mousedown','touchstart'], this.board.pressHandler_);
    dialog = new lime.RoundedRect().setFill(0, 0, 0, .7).setSize(590, 590).setPosition(pos.x+50, pos.y+50).setAnchorPoint(0, 0).setRadius(20);
	this.appendChild(dialog);
	var frame = new lime.RoundedRect().setAnchorPoint(0,0).setFill(0,0,0,0.7).setPosition(10, 340).setSize(210, 240).setRadius(20);
	dialog.appendChild(frame);
	//
	sloticon = dm.IconManager.getFileIcon('assets/menus.png', 50, 0, 1.9, 1.85, 1);
	eqp = this.user.data.equips;
	fp = dm.conf.FP;

	for(i=0;i<5;i++){
		eqpslot = new lime.Sprite().setSize(100, 100).setAnchorPoint(0,0).setFill(sloticon).setPosition(10+(i%2)*110, 10+(i%3)*110);
		eqpslot.no = i;
		eqpslot.disp = frame;
		if(eqp[i] && eqp[i].icon){
			//eqpicon = dm.IconManager.getFileIcon('assets/icons.png',eqp[i].icon['x'],eqp[i].icon['y'],2,2,1);
			eqpicon = this.user.data.equips[i].icon;
			eqpslot.setFill(eqpicon); //装备图标

			goog.events.listen(eqpslot, ['mousedown', 'touchstart'], function() {
				//装备属性信息
				this.disp.removeAllChildren();
				var h = 0;
				var user = this.getParent().getParent().user;
				for(j in user.data.equips[this.no].fp){
					fpname = dm.conf.FP[j].tips;
					fpval  = user.data.equips[this.no].fp[j];
					var wpinfo = new lime.Label().setFontColor('#FFF').setAnchorPoint(0,0).setFontSize(30).setPosition(10, h);
					wpinfo.setText(fpname + ' +' + fpval);
					h += wpinfo.getSize().height;
					this.disp.appendChild(wpinfo);
				}
			});
		}
		dialog.appendChild(eqpslot);
	}

	//人物属性信息
	charinfo = new lime.RoundedRect().setAnchorPoint(0,0).setFill(0,0,0,.7).setPosition(230, 10).setSize(350, 470).setRadius(20);
	dialog.appendChild(charinfo);
	for(i in this.user.data.sp){
		spname = sp[i].name; //二级属性名字
		spval = this.user.data.sp[i];
		var splabel = new lime.Label().setAnchorPoint(0,0).setFontColor('#FFF').setFontSize(30);
		splabel.setText(spname + ' +'+spval).setPosition(10, loc);
		charinfo.appendChild(splabel);//二级属性条目显示
		loc += splabel.getSize().height + 4;

		for(j in sp[i].showfps){//二级属性点对应的一级属性
			fpname = sp[i].showfps[j];
			fpval = this.user.data.fp[j];
			var fplabel = new lime.Label().setAnchorPoint(0,0).setFontColor('#FFF').setFontSize(20);
			fplabel.setText(fpname + ' +'+fpval).setPosition(30,loc );
			loc += fplabel.getSize().height + 4;
			charinfo.appendChild(fplabel);
		}
	}
	//


    btn = new dm.Button().setText('return').setSize(200, 70).setPosition(480, 540),
    dialog.appendChild(btn);
    goog.events.listen(btn, ['mousedown', 'touchstart'], function() {
		var game = this.getParent().getParent();
		game.removeChild(this.getParent());
		goog.events.listen(game.board, ['mousedown','touchstart'], game.board.pressHandler_);
    });
}


/*
 * 点击menu按钮，实现弹出主菜单功能，有重新开始等功能
 */
dm.Game.prototype.mainShow = function(){
		var board = this.board;
		goog.events.unlisten(board, ['mousedown', 'touchstart'], board.pressHandler_);
		var dialog = new lime.RoundedRect().setFill(0, 0, 0, .7).setSize(500, 480).setPosition(120, 260).setAnchorPoint(0, 0).setRadius(20);
		this.appendChild(dialog);
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
				var board = this.getParent().getParent().board;
				this.getParent().getParent().removeChild(this.getParent());
				goog.events.listen(board, ['mousedown', 'touchstart'], board.pressHandler_);
			});
		});
		goog.events.listen(btn_cancel, ['mousedown', 'touchstart'], function() {
			var board = this.getParent().getParent().board;
			var game = this.getParent().getParent();
			this.getParent().getParent().removeChild(this.getParent());
			goog.events.listen(board, ['mousedown', 'touchstart'], board.pressHandler_);
		});

}

dm.Game.prototype.skillShow = function(slot){
	goog.events.unlisten(this.board, ['mousedown', 'touchstart'], this.board.pressHandler_);
	var sk = slot.sk;
	var dialog = new lime.RoundedRect().setFill(0, 0, 0, .7).setSize(500, 480).setPosition(120, 260).setAnchorPoint(0, 0).setRadius(20);
	this.appendChild(dialog);

	var nm = new lime.Label().setFontColor('#FFF').setFontSize(30).setAnchorPoint(0, 0).setPosition(50, 10);
	nm.setText(' 技能：'+sk['name']);
	dialog.appendChild(nm);

	var disc = new lime.Label().setFontColor('#FFF').setFontSize(30).setAnchorPoint(0, 0).setPosition(50, 40);
	disc.setText(' 描述：'+sk['tips']);
	dialog.appendChild(disc);

	var cd = new lime.Label().setFontColor('#FFF').setFontSize(30).setAnchorPoint(0, 0).setPosition(50, 70);
	cd.setText(' 冷却时间(轮)：'+sk['cd']);
	dialog.appendChild(cd);

	var cost = new lime.Label().setFontColor('#FFF').setFontSize(30).setAnchorPoint(0, 0).setPosition(50, 100);
	cost.setText(' 魔法消耗：'+sk['mana']);
	dialog.appendChild(cost);

	var btn_ok = new dm.Button('使用技能').setSize(dm.Display.btn.com.s.width, dm.Display.btn.com.s.height).setAnchorPoint(0, 0).setPosition(180,300);
	//传递技能
	btn_ok.sk_no = sk.no;

	var btn_cancel = new dm.Button('取消').setSize(dm.Display.btn.com.s.width, dm.Display.btn.com.s.height).setAnchorPoint(0, 0).setPosition(350,300);

	dialog.appendChild(btn_ok);
	dialog.appendChild(btn_cancel);

	goog.events.listen(btn_ok, ['mousedown', 'touchstart'], function() {
		var game = this.getParent().getParent();
		var board = game.board;
		var action = new dm.Skill(game);
		action.use(this.sk_no);
		this.getParent().getParent().removeChild(this.getParent());
		goog.events.listen(board, ['mousedown', 'touchstart'], board.pressHandler_);
	});
	goog.events.listen(btn_cancel, ['mousedown', 'touchstart'], function() {
		var board = this.getParent().getParent().board;
		this.getParent().getParent().removeChild(this.getParent());
		goog.events.listen(board, ['mousedown', 'touchstart'], board.pressHandler_);
	});
}


/**
 * 加相应的数值
 */
 dm.Game.prototype.updateData = function(key, value, method){
	 var fp = this.user.data.fp;
	 var data = this.data;

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
				 this.pop.lvl++;
			 }
			 break;
		 }
		 case 'mana':{
			 data['skillexp'] += Math.max(0, data['mana'] - fp.a5);
			 data['mana'] = Math.min(fp.a5, data['mana']);
			 while(data['skillexp'] >= 3){
				 data['skillexp'] -= 3;
				 this.pop.skill += 1;
			 }
			 break;
		}
		case 'gold':{
			while(data['gold'] >= 3){
				data['gold'] -= 3;

				this.pop.shop += 1;
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
  *
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
		 this.skillslot[slot].setFill(img);
		 this.skillslot[slot].no = sk.no;
		 this.skillslot[slot].sk = sk;
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
