goog.provide('dm.Board');

goog.require('goog.events');
goog.require('lime.Sprite');
goog.require('lime.Polygon');
goog.require('lime.Circle');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.MoveTo');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.Spawn');
goog.require('dm.Gem');
goog.require('dm.MultiMove');
goog.require('dm.Log');



/**
 * Board object. Manages the square area with bubbles.
 * @param {number} rows Number of rows on board.
 * @param {number} cols Number of cols on board.
 * @param {lime.Game} game
 * @constructor
 * @extends lime.Sprite
 */
dm.Board = function(rows,cols,game) {
    lime.Sprite.call(this);
	//this.setRenderer(lime.Renderer.CANVAS);

    this.game = game ;

    /**
     * @const
     * @type {number}
     */
	
    this.SIZE = dm.Display.framework.board;

    this.rows = rows;
    this.cols = cols;
    this.gems = new Array(cols);

	//
	this.selectedGems = [];
	this.drawedLines = [];
	this.m_arr = [];

	//用于显示的数值
	
	this.fp = this.game.user.fp;
	this.show_att = this.fp.a1;
	this.show_dmg = 0;
	
	//
    this.setSize(this.SIZE, this.SIZE).setAnchorPoint(0, 0);

    // mask out edges so bubbles flowing in won't be over game controls.
    this.maskSprite = new lime.Sprite().setSize(this.SIZE, this.SIZE).setFill(100, 0, 0, .1).setAnchorPoint(0, 0);

	this.backGround = new lime.Sprite().setSize(this.SIZE, this.SIZE).setFill(255,255,255).setAnchorPoint(0,0);//背景
	this.appendChild(this.backGround);
    this.appendChild(this.maskSprite);
    this.setMask(this.maskSprite);

	

    // space that one bubble takes
    this.GAP = Math.round(this.SIZE / cols);

    // we will keep every column in own layer so they can be animated together
    this.layers = [];
    for (var i = 0; i < cols; i++) {
        this.layers[i] = new lime.Layer();
        this.appendChild(this.layers[i]);
    }

	//划线
	this.lineLayer = new lime.Layer();
	this.appendChild(this.lineLayer);

    // load in first bubbles
    this.fillGems();

    // register listener
    goog.events.listen(this, ['mousedown', 'touchstart','gesturestart'], this.pressHandler_);
	var EVENTS = goog.object.getValues(this.EventType);
	dm.log.fine('Listening for: ' + EVENTS.join(', ') + '.');

	//register event debugger

    // start moving (but give some time to load) //自动触发move 操作
    lime.scheduleManager.callAfter(this.moveGems, this, 100);


	//tool function sense neighbor
	
	


};
goog.inherits(dm.Board, lime.Sprite);


/**
 * Fill the board so that all columns have max amount
 * of bubbles again. Poistion out of screen so they can be animated in
 */
dm.Board.prototype.fillGems = function() {
	var c,r;
    for (c = 0; c < this.cols; c++) {
        if (!this.gems[c]) this.gems[c] = [];
        var i = 0;
        for (r = this.gems[c].length; r < this.rows; r++) {
            i++;
            var gem = dm.Gem.random(this.GAP, this.GAP);
			gem.genAttribute(this.game.data.turn);
            gem.r = r;
            gem.c = c;
            gem.setPosition((c + .5) * this.GAP, (-i + .5) * this.GAP);
            //gem.setSize(this.GAP, this.GAP);
            this.gems[c].push(gem);
            this.layers[c].appendChild(gem);
        }
    }
	this.show_att = this.fp.a1;
	this.show_dmg = this.getDamage();
	if(this.game.show_create == 1){
		this.game.mon.setText(this.show_dmg);
		this.game.att.setText(this.show_att);
	}
};

/**
 * Animate all the bubbles that are not in their correct position
 * to the board. Same function is used in the beginning and also when
 * some bubbles have been removed
 * @return {boolean} If something was moved or not.
 */
dm.Board.prototype.moveGems = function(opt_static) {
    // multimove is a custom helper object that puts bubbles in their own
    // owen layer before moving. everything works same way without it and
    // even without any performance change on 90% of devices.
    var g, pos, mm = new dm.MultiMove();
    for (var c = 0; c < this.cols; c++) {
        for (var r = 0; r < this.rows; r++) {
            g = this.gems[c][r];
            g.r = r;
            g.c = c;
            pos = new goog.math.Coordinate((c + .5) * this.GAP, this.getSize().height - (r + .5) * this.GAP);
            if (!goog.math.Coordinate.equals(pos, g.getPosition())) {
                mm.addNode(g, goog.math.Coordinate.difference(pos, g.getPosition()));
            }
        }
    }
	dm.log.fine('in moveGems : action.play start')
    var action = mm.play(opt_static);
    if (action) {
        // check if new solutions have appeared after move
        goog.events.listen(action, lime.animation.Event.STOP, function() {
			dm.log.fine('in moveGems : action.play stop')
			this.isMoving_ = 0;
        },false, this);
    }
    return action || false;
};


/**
 * 计算是否额外奖励
 * basev, 基础值
 * randratio 是否奖励
 * baseadd, 增加值
 * ratio, 增加比例
 */
dm.Board.prototype.randExtra = function(basev,randratio,baseadd,ratio) {
	if(Math.random()*100 <= randratio){
		return Math.round(basev*(1+ratio/100)+baseadd);  
	}else{
		return basev;
	}
	return 0;
}


 
/**
 * 计算分数
 */
dm.Board.prototype.checkSolutions = function() {
	this.isMoving_ = 1;
    var action = new lime.animation.Spawn(
        new lime.animation.ScaleTo(0).setDuration(.1),
        new lime.animation.FadeTo(0).setDuration(.1)
    ).enableOptimizations();

    var s = this.selectedGems,g,type,i,leech,attack_real,dtom
	,fp = this.game.user.fp
	,sp = this.game.user.sp
	,data = this.game.data
	,keep
	,attack = fp.a1 
	,defense = fp.a3
	,p_type = []
	,ispoping = 0;
	
	var indexes = 1;
	//* 分类处理
	if(s[0].type == 'sword' || s[0].type == 'monster'){
		for(i = 0; i < s.length; i++){
			if(s[i].type == 'sword'){
				attack += fp.a2;
			}
		}
		for(i = 0; i < s.length; i++){
			g = s[i];
			type = g.type;
			if(type == 'monster'){
				var def_real = Math.round(g.def_left*(100-fp.a9)/100); //实际防御值 = 防御数值 - 忽略掉的防御值
				if(Math.random()*100 < fp.a37){//双倍伤害
					attack_real = attack * 2;
				}else{
					attack_real = attack;
				}
				if(attack_real >= g.hp_left + def_real){
					g.hp_left = 0;
					g.keep = false;
					data['exp'] += this.randExtra(fp.a17,fp.a18,fp.a19,fp.a20);
					p_type = 'exp';
					leech = g.hp*fp.a36/100; //生命偷取
				}else{
					if(attack_real > def_real){
						g.hp_left = g.hp_left + def_real - attack_real;
						leech = attack_real*fp.a36/100;
					}
					g.keep = true;
					if(Math.random()*100 < fp.a32){//毒伤害
                        g.setSpecial('poison');
						g.poison = Math.round(attack_real*10/100) || 1;//fp.a33/100);
						g.poison_start = 1;
					}
					if(Math.random()*100 < 100){ //fp.a35){//石化
						g.setSpecial('freeze');
						g.stone = 1;
					}
					p_type = 0;
				}
				g.hplabel.setText(g.hp_left);
			}
		}

		while(data['exp'] >= 100){
			this.popWindow('lvl Up');
			ispoping = 1;
			data['exp'] -= 100;
		}
	}

	if(s[0].type == 'gold'){
		p_type = 'gold';
		data['gold'] += s.length*fp.a13;
		if(s.length > 3)
			data['gold'] += this.randExtra(fp.a13,fp.a14,fp.a15,fp.a16)

		while(data['gold'] >= 3){
			this.popWindow('Shop');
			ispoping = 1;
			data['gold'] -= 3;
		}
	}

	if(s[0].type == 'blood'){
		p_type = 'hp';
		data['hp'] += s.length*fp.a9;
		if(s.length > 3)
			data['hp'] += this.randExtra(fp.a9,fp.a10,fp.a11,fp.a12)
		data['hp'] = Math.min(data['hp'], fp.a6);
	}
	
	if(s[0].type == 'mana'){
		p_type = 'mana';
		data['mana'] += s.length*fp.a21;
		if(s.length > 3)
			data['mana'] += this.randExtra(fp.a21,fp.a22,fp.a23,fp.a24)
		data['skillexp'] += Math.min(data['mana'] - fp.a5);
		data['mana'] = Math.min(fp.a5, data[p_type]);
		while(data['skillexp'] >= 5){
			this.popWindow('Skill');
			data['skillexp'] -= 5;
		}
	}
	//回合结束其他动作
	this.Poison(s); //其他怪物的毒伤害等
	//
	//反弹伤害
	//
    for(i = 0; i < s.length; i++){
		if(s[i].keep == false){
			goog.array.remove(this.gems[s[i].c], s[i]);
		}
    }
	 

	this.game.setScore(s.length * (s.length - 2));

	var total_dmg = this.getDamage();
	//闪避？
	if(Math.random()*100 > fp.a38){
		//伤害减少
		total_dmg = Math.ceil(total_dmg*(100-fp.a29)/100);
		this.game.data['hp'] -= total_dmg;
		dtom = Math.round(total_dmg*fp.a28/100);//伤害转到魔法的增加
		data['mana'] = Math.min(fp.a5, data['mana']+dtom);
	}

	if(this.game.data['hp'] <= 0){
		this.game.endGame();
	}
	//生命魔法恢复
	if(fp.a26 && fp.a26>0){
		data['hp'] = Math.min(fp.a6, data['hp']+fp.a26);
	}
	if(fp.a27 && fp.a27>0){
		data['mana'] = Math.min(fp.a5, data['mana']+fp.a27);
	}
	this.unStone();

	if(!ispoping){
		this.turnEndShow();
	}
	this.changeProg(this.game, p_type);

	var me = this;
	var animationStop = function() {
		dm.log.fine('checkSolutions : animation stop');
        goog.array.forEach(s, function(g) {
            if(g.keep == false){
				g.parent_.removeChild(g);
			    delete g;
			}
        },this);
		me.fillGems();
		dm.log.fine('in checkSolutions : moveGems start');
        me.moveGems();
    }
	goog.events.listen(action, lime.animation.Event.STOP,animationStop ,false, this);

	this.game.data.turn += 1;
	dm.log.fine('in checkSolutions : action start');
    //action.play();
	animationStop(); //不播动画
	
	this.isMoving_ = 0;
	
	return true;
};

/**
 * 计算选中序列
 */
 dm.Board.prototype.checkLine = function( line ) {
	var killed = 0;
	for(var element in line){
		if(line[element].type == 'monster'){
			if(this.show_att >= line[element].hp_left + line[element].def_left){
				//杀死怪物了
				line[element].setSpecial('killed!');
				killed += line[element].attack //死亡怪物不再造成伤害，从总显示数值中去掉。
			}else{
				line[element].unsetSpecial();
			}
		}
	}
	this.game.att.setText(this.show_att);
	this.game.mon.setText(Math.max(0,this.getDamage() - killed));
	//
 }

/**
 * 选中一个gem
 * 划线
 * 更新，相应的攻击力等
 */
dm.Board.prototype.addSelGem = function(g,trypos) {
	var lidx = this.selectedGems.length - 1 ,
	line,linec,exist,i
	,LWIDTH=8
	,LCOLOR= trypos && '#FF0000' || '#00FF00'
	,pos,pos1
	,tw = LWIDTH*2,th = LWIDTH*2
	,lecolor=LCOLOR

	 
	//初始化三角形
	this.lineEnd = this.lineEnd || new lime.Polygon().addPoints(-tw/2,-th/2, tw/2,0, -tw/2,th/2).setFill(lecolor);//.setAnchorPoint(0,0);//这是相对位置 
	this.lineEnd.setFill(lecolor);
	
	if(lidx > -1){
		//末尾三角形
		pos = this.selectedGems[lidx].getPosition()
		,pos1 = g&& g.getPosition() || trypos,
		len = goog.math.Coordinate.distance(pos,pos1),
		rota = goog.math.Vec2.difference(pos1,pos),
		degree = Math.atan(-rota.y/rota.x)*180/Math.PI;//+270;
		if(rota.x < 0){
			degree += 180;
		}
		line = new lime.Sprite().setSize(len, LWIDTH).setFill(LCOLOR).setAnchorPoint(0,0.5).setPosition(pos).setRotation(degree); //划线
		linec = new lime.Circle().setSize(LWIDTH,LWIDTH).setFill(LCOLOR).setPosition(pos); //画线上小圆
		if(this.trypos){
			this.lineLayer.removeChildAt(this.lineLayer.children_.length - 2);
			this.lineLayer.removeChildAt(this.lineLayer.children_.length - 2);
			this.trypos = false;
		}

		this.lineLayer.appendChild(linec);
		this.lineLayer.appendChild(line);

		//*
		this.lineLayer.removeChild(this.lineEnd);
		this.lineEnd.setPosition(pos1);
		this.lineEnd.setRotation(degree);
		this.lineLayer.appendChild(this.lineEnd);
		//*/
		this.trypos = trypos || false;

	}
	if(g){
		g.select();
		dm.log.fine('addSelGem',g.r,g.c)
		//实时计算伤害：
		if(g.type == 'sword'){
			this.show_att += this.fp.a2;
			//显示
			this.game.att.setText(this.show_att);
		}
		this.selectedGems.push(g);
	}
}

/**
 * 取消选择
 *
 */
dm.Board.prototype.cancelSelGem = function(selid){
	var rotation,lc=this.lineLayer.children_;
	this.lineLayer.removeChildAt(lc.length-1); //箭头
	while(this.selectedGems.length > selid + 1){
		g = this.selectedGems.pop();
		g.deselect();

		if(g.type == 'sword'){
			this.show_att -= this.fp.a2;
			this.game.att.setText(this.show_att);

		}
		if(g.type == 'monster'){
			g.unsetSpecial();
			this.show_dmg += g.attack;
			this.game.mon.setText(this.show_dmg);
		}
		this.lineLayer.removeChildAt(lc.length-1); //圆角
		this.lineLayer.removeChildAt(lc.length-1); //线
	}


	if(this.selectedGems.length > 1){
		this.lineEnd.setPosition(this.selectedGems[ this.selectedGems.length - 1 ].getPosition());
		
		rotation = lc[lc.length-1].getRotation();
		console.log(lc[lc.length-1],rotation);
		this.lineEnd.setRotation(rotation);//线的旋转角度
		this.lineLayer.appendChild(this.lineEnd);
	}
}

dm.Board.prototype.updateLine = function() {
	this.selectedGems = this.selectedGems || [];
	this.lineLayer.removeAllChildren();

}


/* 
 *
 * 根据新的移动位置，寻找可能选择的gem
 *
 */
dm.Board.prototype.selSense_= function (lastg,pos){
	pos1 = lastg.getPosition();
	rota = goog.math.Vec2.difference(pos1,pos),
	degree = Math.atan(rota.y/rota.x);
	if(rota.x < 0){
		degree += Math.PI;
	}

	nc = lastg.c +  Math.cos(degree)
	

}

/**
 * Handle presses on the board
 * @param {lime.Event} e Event.
 */
dm.Board.prototype.pressHandler_ = function(e) {


    // no touching allowed when still moving
    if (this.isMoving_) return;
	if((e.type =='mousemove' || e.type == 'touchmove' || e.type == 'gesturechange')){
		if(! this.doing_ )
			return;

	}
	this.selectedGems = this.selectedGems || [];
	//结束
	if(e.type == 'mouseup'  || e.type == 'touchend' || e.type == 'touchcancel' || e.type == 'gestureend'){
		dm.log.fine('pressHandler_: end ,event '+e.type);
		this.doing_ = false;
		for( i = 0 ;i < this.selectedGems.length ; i ++){
			this.selectedGems[i].deselect();
			this.selectedGems[i].unsetSpecial();
			if(this.selectedGems[i].type == 'sword'){
				this.show_att -= this.fp.a2;
				this.game.att.setText(this.show_att);					
			}
		}

		if(this.selectedGems.length > 2){
				this.checkSolutions();
		}
		this.selectedGems = [];
		this.drawedLines = [];
		this.lineLayer.removeAllChildren();
		this.checkLine(this.selectedGems);
		return;
	}

    var pos = e.position;
    // get the cell and row value for the touch
    var c = Math.floor(pos.x / this.GAP),
        r = this.rows - Math.ceil(pos.y / this.GAP);

	var valid_min = this.GAP*0.05,
		valid_max = this.GAP*0.95,  //落在GEM矩形框内中心部分才有效
		x_valid = pos.x - this.GAP*c;
		y_valid = pos.y - this.GAP*(this.rows - 1 - r);


	if(c >= this.cols || c < 0 || r < 0 || r >= this.rows ){
		dm.log.fine('pressHandler_: outboard return '+e.type);
		return;
	}
	if(x_valid < valid_min || x_valid > valid_max || y_valid < valid_min || y_valid > valid_max){
		this.touchPos = pos 
		dm.log.fine('pressHandler_: not on focus gem '+e.type);
		return;
	}

    var g = this.gems[c][r];


	var lastg;

	//需要更智能,移动方向
	if(this.selectedGems.length > 0)
		lastg = this.selectedGems[this.selectedGems.length - 1];
	if(lastg  === g){
		return ; //
	}

	
	var selid = -1;
	for( var i = 0 ; i < this.selectedGems.length - 1; i++){
		if( this.selectedGems[i] === g){
			selid = i;
			break;
		}
	}


	//处理取消
	if((e.type =='mousemove' || e.type == 'touchmove')){
		if(selid > -1){
				this.cancelSelGem(selid);
				this.checkLine(this.selectedGems);
				return;

		}

	}

	
    if (e.type == 'mousedown' || e.type == 'touchstart' || e.type =='gesturestart') {
		for( i = 0 ;i < this.selectedGems.length ; i ++){
			this.selectedGems[i].deselect();
		}
		this.doing_ = true;
		this.selectedGems = [];
		this.lineLayer.removeAllChildren();
		dm.log.fine('pressHandler_ start:'+e.type);
        e.swallow(['mouseup','mousemove','touchmove', 'touchend','touchcancel','gestureend','gesturechange'], dm.Board.prototype.pressHandler_);
    }

	
	//如果不相邻
	if(lastg && !lastg.canConnect(g)){
	
		
	//	this.addSelGem(null,e.position);//记录try pos
		return;
	}
	this.lastPos = e.poistion;
	this.addSelGem(g);	
	this.checkLine(this.selectedGems);
};


/*
 * 计算当前怪物伤害
 */
dm.Board.prototype.getDamage = function(){
	var c, r, damage = 0;
	for (c = 0; c < this.cols; c++) {
		for (r = 0; r < this.gems[c].length; r++) {
			if(this.gems[c][r].type == "monster"){
				if(this.gems[c][r].stone == 0){
					damage += this.gems[c][r].attack;
				}
			}
		}
	}
	return Math.max(0,damage - this.game.user.fp.a3*this.game.user.fp.a4);
};

/*
 *
 * 弹窗口
 *
 */
 dm.Board.prototype.popWindow = function(text){
	
	 var i,ct=0,id,board,game,btn,btn2,rand,equips;
	 id = [];

	 equips = this.game.user.equips;
	 goog.events.unlisten(this, ['mousedown', 'touchstart'], this.pressHandler_);

	 this.popdialog = new lime.RoundedRect().setFill(0, 0, 0, .7).setSize(690, 690).setPosition(690/2,690/2).
		 setAnchorPoint(.5, .5).setRadius(20);
	 this.appendChild(this.popdialog);
	 switch(text){
		 case 'lvl Up':
			 btn = new dm.Button().setText(text).setSize(200, 100);
			 this.popdialog.appendChild(btn);
			 goog.events.listen(btn, lime.Button.Event.CLICK, function() {
				 board = this.getParent().getParent();
				 game = board.game
				 game.user.lvlUp();

				 goog.events.listen(board, ['mousedown', 'touchstart'], board.pressHandler_);
				 board.show_att = board.getBaseAttack();
				 board.show_dmg = board.getDamage();
				 game.att.setText(board.show_att);
				 game.mon.setText(board.show_dmg);
				 game.data['hp'] += parseInt(dm.conf.FP.a6.inc); //每级增加血上限
				 game.data['mana'] += parseInt(dm.conf.FP.a5.inc);
				 board.turnEndShow();
				 board.removeChild(this.getParent());
				 delete this.getParent();  
			 });
		 break;
		 case 'Skill':
			 btn = new dm.Button().setText(text).setSize(200, 100);
			 this.popdialog.appendChild(btn);
			 goog.events.listen(btn, lime.Button.Event.CLICK, function() {
				 board = this.getParent().getParent();
				 game = board.game
				 game.user.skillUp();

				 goog.events.listen(board, ['mousedown', 'touchstart'], board.pressHandler_);
				 board.removeChild(this.getParent());
				 delete this.getParent();  
			 });
			 break;
		 case 'Shop':
			 rand = Math.round(Math.random()*5);
			 if(rand > 4)
				rand = 4;
			 btn = new dm.Button().setText('Buy').setSize(200, 100).setPosition(0,-100);
			 this.popdialog.appendChild(btn);
			 goog.events.listen(btn, lime.Button.Event.CLICK, function() {
				 board = this.getParent().getParent();
				 game = board.game
				 board.game.user.upgrade(rand,0);
				 board.show_att = board.getBaseAttack();
				 board.show_dmg = board.getDamage();
				 game.att.setText(board.show_att);
				 game.mon.setText(board.show_dmg);
				 goog.events.listen(board, ['mousedown', 'touchstart'], board.pressHandler_);
				 board.removeChild(this.getParent());
				 delete this.getParent();  
			 });
			 for(i in equips){
				 id[ct] = parseInt(i);
				 ct++;
			 }
			 if(ct){
			 rand = Math.round(Math.random()*(ct-1));
			 btn2 = new dm.Button().setText('refresh').setSize(200, 100).setPosition(0,100);
			 this.popdialog.appendChild(btn2);
			 goog.events.listen(btn2, lime.Button.Event.CLICK, function() {
				 board = this.getParent().getParent();
				 board.game.user.refresh(id[rand]);
				 goog.events.listen(board, ['mousedown', 'touchstart'], board.pressHandler_);
				 board.removeChild(this.getParent());
				 delete this.getParent();  
			 });
			 }
		 break;
	 }
 }


 dm.Board.prototype.getBaseAttack = function(){
	return this.game.user.fp['a1'] || 0;
 }

 //传入game对象，要设定的类型
 //更新显示数值
 dm.Board.prototype.changeProg = function(game,type){
	 switch(type){
		 case 'exp':
		 case 'gold':
			 game.show_vars[type]._pg.setProgress(game.data[type]/100);
			 game.show_vars[type]._lct.setText(game.data[type]+'/'+100);
			 break;
		 case 'hp':
			 game.show_vars['hp']._pg.setProgress(game.data['hp']/game.user.fp.a6);
			 game.show_vars['hp']._lct.setText(game.data['hp']+'/'+game.user.fp.a6);
			 break;
		 case 'mana':
			 game.show_vars['mana']._pg.setProgress(game.data['mana']/game.user.fp.a5);
			 game.show_vars['mana']._lct.setText(game.data['mana']+'/'+game.user.fp.a5);
			 break;
	 }

 }

 /*
  *每回合结束更新显示
  */
 dm.Board.prototype.turnEndShow = function(){
	 this.changeProg(this.game, 'hp');
	 this.changeProg(this.game, 'mana');
 }

 /*
  * 找出本轮所有的怪物
  */
  dm.Board.prototype.findMonster = function(){
	var c,r,g,gem,exist,index;
    for (c = 0; c < this.cols; c++) {
        for (r in this.gems[c]) {
			g = this.gems[c][r];
            if(g.type == 'monster' && g.hp_left > 0){
				exist = 0;
				index = 0;
				for(gem in this.m_arr){
					if(this.m_arr[gem].hp_left <= 0){
						this.m_arr.splice(index,1);
					}else{
						index++
					}
					if(this.m_arr[gem] == g){
						exist = 1;
					}
				}
				if(exist != 1)
					this.m_arr.push(g);
			}
		}
	}
  }

 /*
  * 每回合结束对怪物造成毒伤害
  */
  dm.Board.prototype.Poison = function(s){
	var c,r,g,gem,exist=0;
    for (c = 0; c < this.cols; c++) {
        for (r in this.gems[c]) {
			g = this.gems[c][r];
            if(g.type == 'monster' && g.hp_left > 0 && g.poison && g.poison > 0){
				if(g.poison_start <= 0){
					g.hp_left -= g.poison;
				}
				g.poison_start--;
				if(g.hp_left <= 0){
					g.hplabel.setText(0);
					g.setSpecial('Killed');
					g.keep = false;
					exist = 0;
					for(gem in s){
						if(s[gem] == g){
							exist = 1;
						}
					}
					if(exist == 0){
						s.push(g);
					}
				}
				g.hplabel.setText(g.hp_left);
			}   
        }
    }
 }

 dm.Board.prototype.unStone = function(){
	var c,r,g,gem,exist=0;
    for (c = 0; c < this.cols; c++) {
        for (r in this.gems[c]) {
			g = this.gems[c][r];
            if(g.type == 'monster' && g.stone == 1){
				g.stone = 0;
				g.unsetSpecial();
			}
		}
	}
 }
