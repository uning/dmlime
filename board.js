goog.provide('dm.Board');

goog.require('goog.events');
goog.require('lime.Sprite');
goog.require('lime.Polygon');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.MoveTo');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.Spawn');
goog.require('dm.Gem');
goog.require('dm.MultiMove');



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

	//用于显示的数值
	
	this.fp = this.game.user.fp;
	this.show_att = this.fp.a1;
	this.show_dmg = 0;
	
	//
    this.setSize(this.SIZE, this.SIZE).setAnchorPoint(0, 0);

    // mask out edges so bubbles flowing in won't be over game controls.
    this.maskSprite = new lime.Sprite().setSize(this.SIZE, this.SIZE).setFill(100, 0, 0, .1).setAnchorPoint(0, 0);
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
    goog.events.listen(this, ['mousedown', 'touchstart'], this.pressHandler_);
	var EVENTS = goog.object.getValues(this.EventType);
	dm.log.fine('Listening for: ' + EVENTS.join(', ') + '.');

	//register event debugger

    // start moving (but give some time to load) //自动触发move 操作
    lime.scheduleManager.callAfter(this.moveGems, this, 100);


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
	this.updateLine();

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
    var action = mm.play(opt_static);

    if (action) {
        // check if new solutions have appeared after move
        goog.events.listen(action, lime.animation.Event.STOP, function() {
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


    var s = this.selectedGems,g,type,i
	,fp = this.game.user.fp
	,sp = this.game.user.sp
	,keep
	,attack = fp.a1 
	,gold = 0
	,defense = fp.a3
	,exp = 0
	,blood = 0
	,mana = 0
	,p_type = [];
	
	var indexes = 1;

	//计算攻击力
	for(i = 0; i < s.length; i++){
		type= s[i].type;
		//计算经验
		if(type == 'sword'){
			attack += fp.a2
		}else if(type != 'monster'){
			break;			
		}
		
	}

	for(i = 0; i < s.length; i++){
		g = s[i]
		type = g.type
		s[i].keep = false;
		if(type == 'monster'){
			var def_real = Math.round(g.def_left*(1-fp.a9/100)); //实际防御值 = 防御数值 - 忽略掉的防御值
			if(attack >= g.hp_left + def_real){
				g.hp_left = 0;
				//g.def_left = 0;
				exp += this.randExtra(fp.a31,fp.a32,fp.a33,fp.a34);
				p_type = 'exp';
			}else{
				if(attack > def_real){
					g.hp_left = g.hp_left + def_real - attack;
				//	g.def_left = 0;
				}else{
				//	g.def_left = def_left - Math.round(attack/(1-fp.a9/100));
				}
				s[i].keep = true;
				p_type = 0;
			}
		//	g.deflabel.setText(g.def_left);
			g.hplabel.setText(g.hp_left);
		}else if(type == 'blood'){
			p_type = 'hp'; //进度条
			blood += this.randExtra(fp.a23,fp.a24,fp.a25,fp.a26)
		}else if(type == 'gold'){
			p_type = 'gold';
			gold += this.randExtra(fp.a27,fp.a28,fp.a29,fp.a30)
		}else if(type == 'mana'){ //以后改成魔法
			p_type = 'mana'
			mana += this.randExtra(fp.a35,fp.a36,fp.a37,fp.a38)
		}

	}
	switch(p_type){
		case 'exp':
		this.game.data[p_type] += exp;
		while(this.game.data[p_type] >= 10){
			this.game.user.lvlUp();
			this.game.data['hp'] += 5; //每级增加血上限
			this.game.data['mana'] += 1; //每级增加血上限
			this.game.data[p_type] -= 10;
		}
		break;
		case 'hp':
		this.game.data[p_type] = Math.min(fp.a6, this.game.data[p_type] + blood);
		break;
		case 'gold':
		this.game.data[p_type] = Math.min(100, this.game.data['gold'] + gold);
		break;
		case 'mana':
		this.game.data[p_type] = Math.min(fp.a5, this.game.data[p_type] + mana);
		break;
	}
	if(p_type!=0 && p_type!='hp' && p_type!='mana'){
		this.game.show_vars[p_type]._pg.setProgress(this.game.data[p_type]/100);
		this.game.show_vars[p_type]._lct.setText(this.game.data[p_type]+'/'+100);
	}
	
	var solutions = s;
    for(i = 0; i < solutions.length; i++){
		if(solutions[i].keep == false){
        //action.addTarget(solutions[i]);
        // remove form array but not yet form display list
			goog.array.remove(this.gems[solutions[i].c], solutions[i]);
		}
    }

	this.game.setScore(solutions.length * (solutions.length - 2));
	
//计算剩余防御和hp
	var total_dmg = this.getDamage();
	//var reduce_dmg = this.game.user.fp.a3*fp.a4; 
	var hp_dmg = Math.max(0,total_dmg);// - reduce_dmg);
	
	/*
	this.game.data['def'] -= reduce_dmg;
	if(this.game.data['def'] < 0){
		this.game.data['hp'] -= this.game.data['def'];
	}
	this.game.data['def'] = Math.max(0,this.game.data['def'])
	*/
	this.game.data['hp'] -= hp_dmg;
	if(this.game.data['hp'] <= 0){
		this.game.endGame();
	}
    //
	goog.events.listen(action, lime.animation.Event.STOP, function() {
        //remove objects after they have faded
        goog.array.forEach(solutions, function(g) {
            if(g.keep == false)
				g.parent_.removeChild(g);
        },this);
        // move other bubbles to place.
        this.moveGems();
    },false, this);
    // fill the gaps
	this.game.data.turn += 1;

    this.fillGems();
    action.play();
	this.isMoving_ = 0;
	
	this.game.show_vars['hp']._pg.setProgress(this.game.data['hp']/fp.a6);
	this.game.show_vars['mana']._pg.setProgress(this.game.data['mana']/fp.a5);
    this.game.show_vars['hp']._lct.setText(this.game.data['hp']+'/'+fp.a6);
	this.game.show_vars['mana']._lct.setText(this.game.data['mana']+'/'+fp.a5);
	
	//this.show_att = this.fp.a1;

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
 * Return possible solutions for current board layout.
 * @return {Array.<lime.Gem>} Array of solutions.
 */
dm.Board.prototype.getSolutions = function() {
    var r, c, g, group, res = [];

	/*
    //todo: this can be done with one loop

    //check rows
    for (r = 0; r < this.rows; r++) {
        i = -1;
        group = [];
        for (c = 0; c < this.cols; c++) {
            g = this.gems[c][r];
            if (g.index == i) {
                group.push(g);
            }

            if (g.index != i || c == (this.cols - 1)) {
                if (group.length >= 3) {
                    goog.array.insertArrayAt(res, group);
                }
                group = [g];
            }
            i = g.index;
        }
    }

    //check cols
    for (c = 0; c < this.cols; c++) {
        i = -1;
        group = [];
        for (r = 0; r < this.rows; r++) {
            g = this.gems[c][r];
            if (g.index == i) {
                group.push(g);
            }

            if (g.index != i || r == (this.rows - 1)) {
                if (group.length >= 3) {
                    goog.array.insertArrayAt(res, group);
                }
                group = [g];
            }
            i = g.index;
        }
    }
	*/
    return res;

};


/**
 * 选中一个gem
 * 划线
 * 更新，相应的攻击力等
 *
 *
 */
dm.Board.prototype.addSelGem = function(g) {
	var lidx = this.selectedGems.length - 1 ,
	line,linec,exist,i
	,LWIDTH=8
	,LCOLOR='#00FF00'
	,pos,pos1
	,tw = LWIDTH*2,th = LWIDTH*2
	,lecolor=LCOLOR
	
	//初始化三角形
	this.lineEnd = this.lineEnd || new lime.Polygon().addPoints(-tw/2,-th/2, tw/2,0, -tw/2,th/2).setFill(lecolor);//.setAnchorPoint(0,0);//这是相对位置 
	if(lidx > -1){
		//末尾三角形
		pos = this.selectedGems[lidx].getPosition()
		,pos1 = g.getPosition(),
		len = goog.math.Coordinate.distance(pos,pos1),
		rota = goog.math.Vec2.difference(pos1,pos),
		degree = Math.atan(-rota.y/rota.x)*180/Math.PI;//+270;
		if(rota.x < 0){
			degree += 180;
		}
		for(i=0;i<this.selectedGems.length;i++){
			if(g == this.selectedGems[i]){
				exist = 1;
			}
		}
		if(exist != 1){		
			line = new lime.Sprite().setSize(len, LWIDTH).setFill(LCOLOR).setAnchorPoint(0,0.5).setPosition(pos).setRotation(degree); //划线
			linec = new lime.Circle().setSize(LWIDTH+1,LWIDTH+1).setFill(LCOLOR).setPosition(pos); //画线上小圆

			this.lineLayer.appendChild(linec);
			this.lineLayer.appendChild(line);

			//*
			this.lineLayer.removeChild(this.lineEnd);
			this.lineEnd.setPosition(pos1);
			this.lineEnd.setRotation(degree);
			this.lineLayer.appendChild(this.lineEnd);
			//*/

		}
	}
    g.select();
	//实时计算伤害：
	if(g.type == 'sword'){
		this.show_att += this.fp.a2;
		//显示
		this.game.att.setText(this.show_att);
	}
	this.selectedGems.push(g);
}

/**
 * 取消选择
 *
 */
dm.Board.prototype.cancelSelGem = function() {
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
	var rotation,lc=this.lineLayer.children_;
	this.lineLayer.removeChildAt(lc.length-1); //箭头
	this.lineLayer.removeChildAt(lc.length-1); //圆角
	this.lineLayer.removeChildAt(lc.length-1); //线


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
/**
 * Handle presses on the board
 * @param {lime.Event} e Event.
 */
dm.Board.prototype.pressHandler_ = function(e) {
    // no touching allowed when still moving
    if (this.isMoving_) return;
	if((e.type =='mousemove' || e.type == 'touchmove')){
		if(! this.doing_ )
			return;

	}
	this.selectedGems = this.selectedGems || [];
	this.checkLine(this.selectedGems);
	//结束
	if(e.type == 'mouseup'  || e.type == 'touchend' || e.type == 'touchcancel'){
		this.doing_ = false;
		for( i = 0 ;i < this.selectedGems.length ; i ++){
			this.selectedGems[i].deselect();
			this.selectedGems[i].unsetSpecial();
			if(this.selectedGems[i].type == 'sword'){
				this.show_att -= this.fp.a2;
				this.game.att.setText(this.show_att);					
			}
		}

		this.lineLayer.removeAllChildren();//消除线
		if(this.selectedGems.length > 2){//消除
				this.checkSolutions();
		}
		this.selectedGems = [];
		this.drawedLines = [];
		return;
	}


    var pos = e.position;
    // get the cell and row value for the touch
    var c = Math.floor(pos.x / this.GAP),
        r = this.rows - Math.ceil(pos.y / this.GAP);

	var valid_min = this.GAP*0.15,
		valid_max = this.GAP*0.85,  //落在GEM矩形框内中心部分才有效
		x_valid = pos.x - this.GAP*c;
		y_valid = pos.y - this.GAP*(this.rows - 1 - r);


	if(c >= this.cols || c < 0 || r < 0 || r >= this.rows ){
		return;
	}
	if(x_valid < valid_min || x_valid > valid_max || y_valid < valid_min || y_valid > valid_max){
		this.touchPos = pos //记录try pos
		return;
	}

    var g = this.gems[c][r];


	var lastg;
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


	if((e.type =='mousemove' || e.type == 'touchmove')){
		if(selid > -1){
			//if(selid == this.selectedGems.length - 2 ){//取消最近一条线
			while(this.selectedGems.length > selid +1){
				this.cancelSelGem();
				return;
			}

		}

	}

	
    // flick from one cell to another is also supported
    if (e.type == 'mousedown' || e.type == 'touchstart') {
		for( i = 0 ;i < this.selectedGems.length ; i ++){
			this.selectedGems[i].deselect();
		}
		this.doing_ = true;
		this.selectedGems = [];
		this.drawedLines = [];
        e.swallow(['mouseup','mousemove','touchmove', 'touchend','touchcancel'], dm.Board.prototype.pressHandler_);
    }

	
	//如果不相邻
	if(lastg && !lastg.canConnect(g)){
		return;
	}
	this.addSelGem(g);	
	/*
    g.select();
	
	//实时计算伤害：
	if(g.type == 'sword'){
		this.show_att += this.fp.a2;
		//显示
		this.game.att.setText(this.show_att);
	}
	this.selectedGems.push(g);
	this.updateLine();
	*/
};



/**
 * Swap two object in bubbles array
 * @param {dm.Gem} g1 First.
 * @param {dm.Gem} g2 Second.
 */
dm.Board.prototype.swap = function(g1,g2) {
    var tempc = g1.c, tempr = g1.r;
    g1.c = g2.c;
    g1.r = g2.r;
    g2.c = tempc;
    g2.r = tempr;
    this.gems[g1.c][g1.r] = g1;
    this.gems[g2.c][g2.r] = g2;
};

/**
 * Animate current hint bubble.
 */
dm.Board.prototype.showHint = function() {
    if (this.hint)
    this.hint.runAction(
        new lime.animation.Sequence(
            new lime.animation.ScaleTo(1.3).setDuration(.4),
            new lime.animation.ScaleTo(1).setDuration(.4)
        )
    );
};

/**
 * Return best hint for current board state.
 * Best hint is a bubble the wen swapping with another
 * make most combinations
 */
dm.Board.prototype.getHint = function() {
    var maxhint, hintvalue = 0;
    this.hint = this.gems[0][0];
    //send also to game object
    this.game.setHint(this.hint);

    return maxhint;
};

dm.Board.prototype.getDamage = function(){
	var c, r, damage = 0;
    for (c = 0; c < this.cols; c++) {
        for (r = 0; r < this.gems[c].length; r++) {
			if(this.gems[c][r].type == "monster"){
			//	console.log(this.gems[c][r].attack);
				damage += this.gems[c][r].attack;
				}
        }
    }
	return Math.max(0,damage - this.game.user.fp.a3*this.game.user.fp.a4);
};

