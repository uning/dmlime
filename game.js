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
	
    // update score when points have changed
    lime.scheduleManager.scheduleWithDelay(this.updateScore, this, 100);

     // show lime logo
    dm.builtWithLime(this);


	//
	//加数值动画label
	this.notify = new lime.Label().setFontSize(80).setFontColor('#000').setPosition(dm.WIDTH/2, dm.HEIGHT/2).setOpacity(0);
	this.appendChild(this.notify);

};
goog.inherits(dm.Game, lime.Scene);


/**
 * Increase value of score label when points have changed
 */
dm.Game.prototype.updateScore = function() {
    var curscore = parseInt(this.score.getText(), 10);
    if (curscore < this.points) {
		this.step += 1;
		if(this.step < 5)
			this.score.setText(curscore + 1);
		else{
			this.score.setText(this.points);
		}
	}else
		this.step = 0;
};


/**
 * Update points
 * @param {number} p Points to add to current score.
 */
dm.Game.prototype.setScore = function(p) {
    this.points += p;
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

    var score = new lime.Label().setText(this.points).setFontSize(150).setFontColor('#fff').
        setPosition(0, 240).setFontWeight(700);
    dialog.appendChild(score);

    var btn = new dm.Button().setText('重来').setSize(200, 90).setPosition(-110, 400);
    dialog.appendChild(btn);
    goog.events.listen(btn, lime.Button.Event.CLICK, function() {
         dm.newgame(this.board.cols);
    },false, this);


    btn = new dm.Button().setText('主菜单').setSize(200, 90).setPosition(110, 400);
    dialog.appendChild(btn);
    goog.events.listen(btn, lime.Button.Event.CLICK, function() {
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
	var i,slot,taile,show_board; //slot 技能槽
	tailer = dm.Display.boardtailer;
	show_board = new lime.Sprite().setSize(690, 140).setAnchorPoint(0,0).setPosition(tailer.location.x, tailer.location.y).setFill(dm.IconManager.getFileIcon('assets/tiles.png', tailer.img.x, tailer.img.y, 690/320, 140/76, 1));
	panel.appendChild(show_board);
	var icon = dm.IconManager.getFileIcon('assets/menus.png', 248, 0, 110/53, 110/53, 1);
	for( i=0;i<4;i++){
		slot = new lime.Sprite().setSize(110,110).setAnchorPoint(0,0).setPosition(60 + i*120, 0).setFill(icon);
		slot.domClassName = goog.getCssName('lime-button');
		this.skillslot[i] = slot;
		panel.appendChild(slot);
	}

	//menu
	icon = dm.IconManager.getFileIcon('assets/tiles.png', 342, 336, 148/72, 50/26, 1);
	var menu = new lime.Sprite().setSize(152, 50).setAnchorPoint(0, 0).setPosition(60 + 4*120, 0).setFill(icon);
    menu.domClassName = goog.getCssName('lime-button');
	panel.appendChild(menu);
    goog.events.listen(menu, lime.Button.Event.CLICK, function() {
		var game = this.getParent().getParent();
		var board = game.board;
		goog.events.unlisten(board, ['mousedown', 'touchstart'], board.pressHandler_);
		var dialog = new lime.RoundedRect().setFill(0, 0, 0, .7).setSize(500, 480).setPosition(120, 260).setAnchorPoint(0, 0).setRadius(20);
		game.appendChild(dialog);
		var label = new lime.Label().setText('退回主菜单将丢失本轮游戏进度').setFontColor('#FFF').setFontSize(30).setAnchorPoint(0, 0).setPosition(50, 200);
		dialog.appendChild(label);
		var btn_ok = new dm.Button('重来').setSize(dm.Display.btn.com.s.width, dm.Display.btn.com.s.height).setAnchorPoint(0, 0).setPosition(180,300);
		var btn_cancel = new dm.Button('返回').setSize(dm.Display.btn.com.s.width, dm.Display.btn.com.s.height).setAnchorPoint(0, 0).setPosition(350,300);
		dialog.appendChild(btn_ok);
		dialog.appendChild(btn_cancel);
		goog.events.listen(btn_ok, lime.Button.Event.CLICK, function() {

			var dialog = new lime.RoundedRect().setFill(0, 0, 0, .7).setSize(500, 480).setPosition(120, 260).setAnchorPoint(0, 0).setRadius(20);
			this.getParent().getParent().appendChild(dialog);
			var btn_ok = new dm.Button('确定').setSize(dm.Display.btn.com.s.width, dm.Display.btn.com.s.height).setAnchorPoint(0, 0).setPosition(180,300);
			var btn_cancel = new dm.Button('取消').setSize(dm.Display.btn.com.s.width, dm.Display.btn.com.s.height).setAnchorPoint(0, 0).setPosition(350,300);
			dialog.appendChild(btn_ok);
			dialog.appendChild(btn_cancel);
			this.getParent().getParent().removeChild(this.getParent());
			goog.events.listen(btn_ok, lime.Button.Event.CLICK, function() {
				dm.loadMenu();
			});
			goog.events.listen(btn_cancel, lime.Button.Event.CLICK, function() {
				var board = this.getParent().getParent().board;
				this.getParent().getParent().removeChild(this.getParent());
				goog.events.listen(board, ['mousedown', 'touchstart'], board.pressHandler_);
		});
		});
		goog.events.listen(btn_cancel, lime.Button.Event.CLICK, function() {
			var board = this.getParent().getParent().board;
			this.getParent().getParent().removeChild(this.getParent());
			goog.events.listen(board, ['mousedown', 'touchstart'], board.pressHandler_);
		});
    });
	//stat
	icon = dm.IconManager.getFileIcon('assets/tiles.png', 268, 336, 148/72, 50/26, 1);
	var stat = new lime.Sprite().setSize(152, 50).setAnchorPoint(0, 0).setPosition(60 + 4*120, 60).setFill(icon);
    stat.domClassName = goog.getCssName('lime-button');
	panel.appendChild(stat);
    goog.events.listen(stat, lime.Button.Event.CLICK, function() {
		this.getParent().getParent().statShow();
    });
	this.appendChild(panel);

   /**********/

    //empty layer for contents
    var layer = new lime.Layer();
    //this.appendChild(layer);


    // label for score message
	var fcolor = '#4f96ed' //label颜色
	,h = 30  //每行高度
	,lh = 22 //起始
	,gap = 5 //间隔
	,lx=30   //lbl 坐标起点
	,lxx=90  //第二个x坐标起点
	//exp 
	fcolor = '#00ff00';
	plen = 260;
	this.show_vars = {
		exp:{color:'#00ff00',txt:'经验',curdata:this.data.exp, max:100}
		,gold:{color:'#ffff00',txt:'金币',curdata:this.data.gold, max:100}
		,mana:{color:'#0000ff',txt:'魔法',curdata:this.data.mana, init:1, max:this.user.fp.a5}
		,hp:{color:'#FF0000',txt:'血量',curdata:this.data.hp,init:1, max:this.user.fp.a6}
	}
	
	var odd = 0;
	for( i in this.show_vars){
		p = this.show_vars[i];
		j =  odd * (plen + lxx - lx +20);
		p._lbl = new lime.Label().setFontFamily('Trebuchet MS').setFontSize(24).setPosition(lx + j, lh).setText(p.txt).setAnchorPoint(0, 0);
		
		layer.appendChild(p._lbl);
		
		p.init = p.init || 0.001;
		p._pg = new dm.Progress(p.init ,p.color,plen,h,10,2,p.bcolor).setPosition(lxx + j, lh);//
		layer.appendChild(p._pg);
		
		p._lct = new lime.Label().setFontFamily('Trebuchet MS').setFontSize(24).setPosition(plen/2 + lxx + j, lh).setAnchorPoint(0.5, 0).setText(p.curdata+'/'+p.max);
		layer.appendChild(p._lct);
		
		if(odd)
			lh += h + gap;
		odd = odd ? 0 : 1;
	}

    var score_lbl = new lime.Label().setFontFamily('Trebuchet MS').setFontColor('#4f96ed').setFontSize(24).
        setPosition(lx, lh).setText('分数').setAnchorPoint(0, 0);
    layer.appendChild(score_lbl);
    //this.appendChild(score_lbl);
	


    // score message label
    this.score = new lime.Label().setFontColor('#000').setFontSize(24).setText('0').setPosition(lxx,lh).setAnchorPoint(0, 0).setFontWeight(700);
    layer.appendChild(this.score);
    //this.appendChild(this.score);

	
	lh += gap+h;
    // graphical lines for visual effect
    var line = new lime.Sprite().setSize(670, 2).setFill('#295081').setPosition(720 * .5, lh);
    layer.appendChild(line);

	lh += gap+2;
	lh += 690+gap;
    // graphical lines for visual effect
    line = new lime.Sprite().setSize(670, 2).setFill('#295081').setPosition(720 * .5, lh );
    layer.appendChild(line);
	
	lh += gap +40;
    // Menu button
    this.btn_menu = new dm.Button('主菜单').setSize(dm.Display.btn.com.s.width, dm.Display.btn.com.s.height).setPosition(dm.Display.position.btn_menu.x,dm.Display.position.btn_menu.y);
    goog.events.listen(this.btn_menu, 'click', function() {
		
        dm.loadMenu();
    });
    //this.appendChild(this.btn_menu);

    // Hint button
    this.btn_hint = new dm.Button('人物').setSize(dm.Display.btn.com.s.width, dm.Display.btn.com.s.height).setPosition(dm.Display.position.btn_hint.x, dm.Display.position.btn_hint.y);
    goog.events.listen(this.btn_hint, 'click', function() {
        //this.changeAnim('Hello');
		this.board.popWindow();
    },false, this);
    //this.appendChild(this.btn_hint);

	//其他显示的数据
	var monster_lbl = new lime.Label().setFontFamily('Trebuchet MS').setFontColor('#000').setFontSize(24).
        setPosition(250, lh -25).setText('怪物伤害').setAnchorPoint(0, 0);
    
	//this.appendChild(monster_lbl);
	
	var att_lbl = new lime.Label().setFontFamily('Trebuchet MS').setFontColor('#000').setFontSize(24).
        setPosition(250, lh+5).setText('玩家攻击').setAnchorPoint(0, 0);

	this.mon = new lime.Label().setFontColor('#000').setFontSize(24).setText(this.board.getDamage()).setPosition(360,lh -25).setAnchorPoint(0, 0).setFontSize(40);
	this.att = new lime.Label().setFontColor('#000').setFontSize(24).setText(this.user.fp.a1).setPosition(360,lh + 5).setAnchorPoint(0, 0).setFontSize(40);
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
	this.data.appearNum = {};
	for( i = 0 ; i < dm.GEMTYPES.length ; ++i){
		this.data.appearNum[i] = 0;
	}
	this.data.hp    = this.user.fp.a6;
	this.data.mana  = this.user.fp.a5;
	this.data.def   = this.user.fp.a3;
	this.data.score = 0;
	this.data.lvl   = 0;
	this.data.exp   = 0;
	this.data.gold  = 0;
	this.data.skillexp = 0;
    this.points = 0;
	this.panel;
	this.skillslot = [];
}

dm.Game.prototype.statShow = function(){
	var i,dialog,eqpslot,sloticon,eqp,eqpicon;
	goog.events.unlisten(this.board, ['mousedown','touchstart'], this.board.pressHandler_);
    dialog = new lime.RoundedRect().setFill(0, 0, 0, .7).setSize(500, 480).setPosition(120, 260).setAnchorPoint(0, 0).setRadius(20);
	this.appendChild(dialog);
	//
	sloticon = dm.IconManager.getFileIcon('assets/menus.png', 50, 0, 1.9, 1.85, 1);
	eqp = this.user.equips;
	for(i=0;i<5;i++){
		eqpslot = new lime.Sprite().setSize(100, 100).setAnchorPoint(0,0).setFill(sloticon).setPosition(10+(i%2)*110, 10+(i%3)*110);
		if(eqp[i] && eqp[i].icon){
			eqpicon = dm.IconManager.getFileIcon('assets/icons.png',eqp[i].icon['x'],eqp[i].icon['y'],2,2,1);
			eqpslot.setFill(eqpicon);
		}
		dialog.appendChild(eqpslot);
	}
	//
    btn = new dm.Button().setText('return').setSize(200, 90).setPosition(110, 400);
    dialog.appendChild(btn);
    goog.events.listen(btn, lime.Button.Event.CLICK, function() {
		var game = this.getParent().getParent();
		game.removeChild(this.getParent());
		goog.events.listen(game.board, ['mousedown','touchstart'], game.board.pressHandler_);
    });
}

