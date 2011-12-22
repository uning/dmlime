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

	this.user = user || new dm.User(1);
	size  = size ||  6;

	var i ,p,j,plen
	//初始化数据
	this.data = {};
	this.data.turn = 0; //回合数
	this.data.appearNum = {};
	for( i = 0 ; i < dm.GEMTYPES.length ; ++i){
		this.data.appearNum[i] = 0;
	}
	this.data.score = 0;
	this.data.hp    = 100;
	this.data.lvl   = 0;
	this.data.exp   = 0;
	this.data.def   = 100;
	this.data.gold   = 0;
	
		

    lime.Scene.call(this);
    this.points = 0;


    //empty layer for contents
    var layer = new lime.Layer();
    this.appendChild(layer);


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
		,def:{color:'#0000ff',txt:'防御',curdata:this.data.def, init:1, max:100}
		,hp:{color:'#FF0000',txt:'血量',curdata:this.data.hp,init:1, max:100}
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
	


    // score message label
    this.score = new lime.Label().setFontColor('#000').setFontSize(24).setText('0').setPosition(lxx,lh).setAnchorPoint(0, 0).setFontWeight(700);
	

    layer.appendChild(this.score);

	
	lh += gap+h;
    // graphical lines for visual effect
    var line = new lime.Sprite().setSize(670, 2).setFill('#295081').setPosition(720 * .5, lh);
    layer.appendChild(line);

	lh += gap+2;
    //make board
    this.board = new dm.Board(size, size, this).setPosition(25, lh);
    
    if(dm.isBrokenChrome()) this.board.setRenderer(lime.Renderer.CANVAS);
    // static background bubbles for baord. try dfkit.Renderer.CANVAS for this one as it is quite static
	
	///*
    var back = new lime.RoundedRect().setSize(690, 690).setAnchorPoint(0, 0).setPosition(17, lh - 8).setRadius(30);
    for (var c = 0; c < this.board.cols; c++) {
        for (var r = 0; r < this.board.rows; r++) {
            var b = new lime.Sprite().setFill('assets/shadow.png').setAnchorPoint(0, 0).
                setSize(this.board.GAP * .94, this.board.GAP * .94).
                setPosition(11 + c * this.board.GAP, 11 + r * this.board.GAP);
            b.qualityRenderer = true; // no jagged edges on moz for this one
            back.appendChild(b);
        }
    }


    layer.appendChild(back);
	//*/
    layer.appendChild(this.board);

	lh += 690+gap;
    // graphical lines for visual effect
    line = new lime.Sprite().setSize(670, 2).setFill('#295081').setPosition(720 * .5, lh );
    layer.appendChild(line);


	
	lh += gap +40;

    // Menu button
    this.btn_menu = new dm.Button('主菜单').setSize(140, 70).setPosition(100, lh);
    goog.events.listen(this.btn_menu, 'click', function() {
        dm.loadMenu();
    });
    this.appendChild(this.btn_menu);

    // Hint button
    this.btn_hint = new dm.Button('提示').setSize(140, 70).setPosition(640, lh);
    goog.events.listen(this.btn_hint, 'click', function() {
        if (this.hint)
        this.board.showHint();
    },false, this);
    this.appendChild(this.btn_hint);

	//其他显示的数据
	var monster_lbl = new lime.Label().setFontFamily('Trebuchet MS').setFontColor('#000').setFontSize(24).
        setPosition(250, lh -25).setText('怪物伤害').setAnchorPoint(0, 0);
    
	this.appendChild(monster_lbl);
	
	var att_lbl = new lime.Label().setFontFamily('Trebuchet MS').setFontColor('#000').setFontSize(24).
        setPosition(250, lh+5).setText('玩家攻击').setAnchorPoint(0, 0);
    this.appendChild(att_lbl);
	
	this.mon = new lime.Label().setFontColor('#000').setFontSize(24).setText('0').setPosition(360,lh -25
	).setAnchorPoint(0, 0).setFontWeight(700);
	
	this.att = new lime.Label().setFontColor('#000').setFontSize(24).setText('0').setPosition(360,lh + 5).setAnchorPoint(0, 0).setFontWeight(700);

	this.appendChild(this.mon);
	this.appendChild(this.att);	

	
    // update score when points have changed
    lime.scheduleManager.scheduleWithDelay(this.updateScore, this, 100);

     // show lime logo
    dm.builtWithLime(this);
};
goog.inherits(dm.Game, lime.Scene);


/**
 * 填充一个格子,不同策略实现
 */
dm.Game.prototype.newGem = function() {

    var gem = new dm.Gem();
	//默认随机
    var id = Math.floor(Math.random() * dm.GEMTYPES.length);
    //var color = dm.Gem.colors[id];
    gem.index = id; 
	gem.type = dm.GEMTYPES[id];
	gem.label.setText(gem.type);
	if(gem.type == 'monster'){
		gem.attack = 1;
		gem.blood = 2;
	}
    gem.circle.setFill('assets/ball_' + id + '.png');
	this.data.appearNum[id] += 1;
	return gem;

}


/**
 * Subtract one second from left time in timed mode
 */
dm.Game.prototype.decreaseTime = function() {
    this.curTime--;
    if (this.curTime < 1) {
        this.endGame();
    }
    // update progressbar
    this.time_left.setProgress(this.curTime / this.maxTime);
};

/**
 * Increase value of score label when points have changed
 */
dm.Game.prototype.updateScore = function() {
    var curscore = parseInt(this.score.getText(), 10);
    if (curscore < this.points) {
        this.score.setText(curscore + 1);
    }
};

/**
 * Register new hint from board object. Activate button
 * if no action soon
 * @param {dm.Gem} hint Hint gem.
 */
dm.Game.prototype.setHint = function(hint) {
    this.hint = hint;
    if (!goog.isDef(hint)) {
        return this.endGame();
    }
    else {
        lime.scheduleManager.callAfter(this.showHint, this, 3500);
    }
};

/**
 * Hide hint button
 */
dm.Game.prototype.clearHint = function() {
    lime.scheduleManager.unschedule(this.showHint, this);
    this.btn_hint.runAction(new lime.animation.FadeTo(0));
    delete this.hint;
};

/**
 * Show hint button
 */
dm.Game.prototype.showHint = function() {
    this.btn_hint.runAction(new lime.animation.FadeTo(1));
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
   goog.events.unlisten(this.board, ['mousedown', 'touchstart'], this.board.pressHandler_);
   lime.scheduleManager.unschedule(this.updateScore, this);
   lime.scheduleManager.unschedule(this.decreaseTime, this);

    var dialog = new lime.RoundedRect().setFill(0, 0, 0, .7).setSize(500, 480).setPosition(360, 260).
        setAnchorPoint(.5, 0).setRadius(20);
    this.appendChild(dialog);

    var title = new lime.Label().setText(this.curTime < 1 ? 'No more time!' : 'No more moves!').
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
