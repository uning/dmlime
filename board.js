goog.provide('dm.Board');

goog.require('goog.events');
goog.require('lime.Sprite');
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
	
    this.SIZE = dm.BOARDSIZE;

    this.rows = rows;
    this.cols = cols;
    this.gems = new Array(cols);

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



	/*
     //drawline but not work
	 var cvs = goog.dom.createDom('canvas');
	 cvs.width= this.WIDTH;
	 cvs.height = this.WIDTH;
	 var ctx = this.ctx = cvs.getContext('2d');
	 this.appendChild(cvs);

	 console.log(this.getSize());
	 this.graphics = new lime.CanvasContext().setSize(this.getSize().clone()).setPosition(this.WIDTH/2,this.WIDTH/2);//.setQuality(.5);
	 //this.graphics = new lime.CanvasContext().setSize(this.getSize().clone()).setQuality(.5);
	 this.appendChild(this.graphics);
	 this.graphics.draw = goog.bind(this.drawLine,this);
    //*/

	 /*
	var moveandrotate = new lime.animation.Spawn(
	    new lime.animation.MoveBy(300,0).setDuration(3),
	    new lime.animation.RotateBy(-40).setDuration(3)
	);
	this.graphics.runAction(new lime.animation.Loop(new lime.animation.Sequence(moveandrotate,moveandrotate.reverse())));
	*/

    // start moving (but give some time to load) //自动触发move 操作
    lime.scheduleManager.callAfter(this.moveGems, this, 700);


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
            var gem = dm.Gem.random();
            gem.r = r;
            gem.c = c;
            gem.setPosition((c + .5) * this.GAP, (-i + .5) * this.GAP);
            gem.setSize(this.GAP, this.GAP);
            this.gems[c].push(gem);
            this.layers[c].appendChild(gem);
        }
    }
	this.show_dmg = this.getDamage();
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
		return Math.floor((baseadd + basev)*(1+ratio/100));  
	}
	return 0;
}


 
/**
 * 计算分数
 */
dm.Board.prototype.checkSolutions = function() {
	this.lineLayer.removeAllChildren();
	this.isMoving_ = 1;

    var action = new lime.animation.Spawn(
        new lime.animation.ScaleTo(0),
        new lime.animation.FadeTo(0).setDuration(.8)
    ).enableOptimizations();


    var s = this.selectedGems,g,type,i
	,fp = this.game.user.fp,keep
	,attack = fp.a1 
	,gold = 0
	,defense = 0
	,exp = 0
	,blood = 0
	,p_type = [];
	
	var indexes = 1;

	//计算攻击力
	for(i = 0; i < s.length; i++){
		type= s[i].type;
		//计算经验
		if(type == 'sword'){
			attack += fp.a2
		}else if(type != 'monster'){
			g = 1;
			break;			
		}
		
	}

	for(i = 0; i < s.length; i++){
		g = s[i]
		type = g.type
		s[i].keep = false;
		if(type == 'monster'){
			if(attack >= g.hp ){
				g.hp = 0;
				exp += fp.a23;
				if(i > 2){
					exp += this.randExtra(fp.a24,fp.a25,fp.a26,fp.a27)
				}
				p_type = 'exp';
				
			}else{
				g.hp  -= attack;
				s[i].keep = true;
				p_type = 0;
			}
		}else if(type == 'blood'){
			p_type = 'hp'; //进度条
			blood += fp.a13;
			if(i > 2){
				blood += this.randExtra(fp.a14,fp.a15,fp.a16,fp.a17)
			}	
		}else if(type == 'gold'){
			p_type = 'gold';
			gold += fp.a18;
			if(i > 2){
				gold += this.randExtra(fp.a19,fp.a20,fp.a21,fp.a22)
			}
		}else if(type == 'defend'){
			p_type = 'def'
			defense += fp.a28;
			if(i > 2){
				defense += this.randExtra(fp.a29,fp.a30,fp.a31,fp.a32)
			}
		}

	}
		switch(p_type){
		case 'exp':
		this.game.data[p_type] = Math.min(100, this.game.data[p_type] + exp);
		break;
		case 'hp':
		this.game.data[p_type] = Math.min(100, this.game.data[p_type] + blood);
		break;
		case 'gold':
		this.game.data[p_type] = Math.min(100, this.game.data[p_type] + gold);
		break;
		case 'def':
		this.game.data[p_type] = Math.min(100, this.game.data[p_type] + defense);
		break;
		}
		if(p_type!=0 && p_type!='hp' && p_type!='def'){
	//	this.game.show_vars[p_type]._pg.setProgress(1/2);
	//*	
		
		this.game.show_vars[p_type]._pg.setProgress(this.game.data[p_type]/100);
		this.game.show_vars[p_type]._lct.setText(this.game.data[p_type]+'/'+100);
		}
	//*/
	
	var solutions = s;
    for(i = 0; i < solutions.length; i++){
		if(solutions[i].keep == false){
        action.addTarget(solutions[i]);
        // remove form array but not yet form display list
        goog.array.remove(this.gems[solutions[i].c], solutions[i]);

		}
    }

	this.game.setScore(solutions.length * (solutions.length - 2));
	
//计算剩余防御和hp
	var total_dmg = this.getDamage(),
	reduce_dmg = Math.round(total_dmg/2),
	hp_dmg = Math.max(0, total_dmg - reduce_dmg);
	
	this.game.data['def'] -= reduce_dmg;
	this.game.data['def'] = Math.max(0,this.game.data['def'])
	this.game.data['hp'] -= hp_dmg;
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
	

    this.fillGems();
    action.play();
	this.isMoving_ = 0;
	
	this.game.show_vars['hp']._pg.setProgress(this.game.data['hp']/100);
	this.game.show_vars['def']._pg.setProgress(this.game.data['def']/100);
    this.game.show_vars['hp']._lct.setText(this.game.data['hp']+'/'+100);
	this.game.show_vars['def']._lct.setText(this.game.data['def']+'/'+100);
	
	this.show_att = this.fp.a2;

	return true;
};

/**
 * 计算选中序列
 */
 dm.Board.prototype.checkLine = function( line ) {
	var killed = 0;
	for(var element in line){
		if(line[element].type == 'monster'){
			if(this.show_att >= line[element].hp){
				//杀死怪物了
				line[element].setSpecial('Killed!');
				killed += line[element].attack
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
	var lidx = this.selectedGems.length - 1 ;
	if(lidx > -1){
		var pos = this.selectedGems[lidx].getPosition()
		,pos1 = g.getPosition(),
		len = goog.math.Coordinate.distance(pos,pos1),
		rota = goog.math.Vec2.difference(pos1,pos),
		degree = Math.atan(-rota.y/rota.x)*180/Math.PI;//+270;
		if(rota.x < 0){
			degree += 180;
		}
		var line =  new lime.Sprite().setSize(len, 4).setFill('#295081').setAnchorPoint(0,0)
		line.setPosition(pos).setRotation(degree);
		this.lineLayer.appendChild(line);
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
dm.Board.prototype.cancelSelGem = function(dto) {
	var lidx = this.selectedGems.length - 1 ;
	if(lidx > 0){
		g = this.selectedGems.pop();
	}
    g.deselect();
	//实时计算伤害：
	if(g.type == 'sword'){
		this.show_att += this.fp.a2;
		//显示
		this.game.att.setText(this.show_att);
	}
	this.selectedGems.push(g);
}

dm.Board.prototype.updateLine = function() {
	this.drawLine();
    //this.graphics && this.graphics.setDirty(lime.Dirty.CONTENT);

}
dm.Board.prototype.drawLine = function() {

		 this.selectedGems = this.selectedGems || [];


		 var pos,rota,len,x,y,line,degree,color
		 this.lineLayer.removeAllChildren();
		 for(var i =  0 ; i < this.selectedGems.length ; i++){
			 if(i > 0){
				 pos = this.selectedGems[i-1].getPosition();
				 pos1 = this.selectedGems[i].getPosition();

				 len = goog.math.Coordinate.distance(pos,pos1);
				 rota = goog.math.Vec2.difference(pos1,pos);
				 /*
				 if(rota.x > 0 && rota.y == 0){
					 degree = 0;
				 }else if(rota.x > 0 && rota.y < 0){
					 degree = 45;
				 }else if(rota.x == 0 && rota.y < 0){
					 degree = 90;
				 }else if(rota.x < 0 && rota.y < 0){
					 degree = 135;
				 }else if(rota.x < 0 && rota.y == 0){
					 degree = 180;
				 }else if(rota.x < 0 && rota.y > 0){
					 degree = 225;
				 }else if(rota.x ==0 && rota.y > 0){
					 degree = 270;
				 }else if(rota.x > 0 && rota.y > 0){
					 degree = 315;
				 }
				 //*/
				 degree = Math.atan(-rota.y/rota.x)*180/Math.PI;//+270;
				 if(rota.x < 0){
					 degree += 180;

				 }
				 
				 line =  new lime.Sprite().setSize(len, 4).setFill('#295081').setAnchorPoint(0,0)
				 line.setPosition(pos).setRotation(degree);
				 this.lineLayer.appendChild(line);

			 }
		 }


}
dm.Board.prototype.old_drawLine = function(ctx) {
		 this.selectedGems = this.selectedGems || [];


		 /*
		 if(goog.userAgent.MOBILE)
			 this.ctx.globalCompositeOperation = 'copy';
		 else 
		 */
		 //ctx.clearRect(0,0,this.SIZE,this.SIZE);

		 if(this.cancelGem){
			 ctx.strokeStyle = '#00FF00';
		 }else{
			 ctx.strokeStyle = '#FF0000';
		 }
		 ctx.lineWidth = 10;
		 ctx.shadowBlur = 0;
		 ctx.shadowColor = '#fff';

		 ctx.beginPath();


		 //ctx.moveTo(0,0);
		 //ctx.lineTo(600,600);
		 /*
		 this.selectedGems = [];
		 this.selectedGems.push(this.gems[0][0]);
		 this.selectedGems.push(this.gems[0][1]);
		 this.selectedGems.push(this.gems[1][1]);
		 this.selectedGems.push(this.gems[1][2]);
		 //*/
		 var pos,x,y;
		 for(var i =  0 ; i < this.selectedGems.length ; i++){
			 pos = this.selectedGems[i].getPosition();
			  x = pos.x -  this.SIZE/2;
			  y = pos.y +  this.SIZE/2;
			 console.log('drawline:',pos,x,y);

			 if(i > 0){
				 ctx.lineTo(x,y);
			 }
			 ctx.moveTo(x,y);
		 }
		 ctx.stroke(); 

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
	if(e.type == 'mouseup'  || e.type == 'touchend' /*|| e.type == 'touchcancel'*/){
		this.doing_ = false;
		console.log("mouseup : this.selectedGems",this.selectedGems);
		if(this.selectedGems[0].type == 'sword'){
			var h_exist = 1,
				cancel = 1;
		}else{
			h_exist = 0;
		}
		for( i = 0 ;i < this.selectedGems.length ; i ++){
			this.selectedGems[i].deselect();
			if(this.selectedGems[i].type == 'sword'){
				this.show_att -= this.fp.a2;
				this.game.att.setText(this.show_att);					
			}
		}

		this.lineLayer.removeAllChildren();//消除线
		if(this.selectedGems.length > 2){//消除
			if(!h_exist || (h_exist && cancel == 0) ){
				this.checkSolutions();
				}
		}
		this.selectedGems = [];
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

	console.log(this,r,c);
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
				this.cancelGem = this.selectedGems.pop();
				this.cancelGem.deselect();
				if(this.cancelGem.type == 'sword'){
					this.show_att -= this.fp.a2;
					this.game.att.setText(this.show_att);
					
				}
				if(this.cancelGem.type == 'monster'){
					this.cancelGem.unsetSpecial();
					this.show_dmg += this.cancelGem.attack;
					this.game.dmg.setText(this.show_dmg);
				}

				this.updateLine();
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
        e.swallow(['mouseup','mousemove','touchmove', 'touchend','touchcancel'], dm.Board.prototype.pressHandler_);
    }

	
	//如果不相邻
	if(lastg && !lastg.canConnect(g)){
		console.log('pressHandler_ not connect ',g,lastg)
		return;
	}
	
    g.select();
	
	//实时计算伤害：
	if(g.type == 'sword'){
		this.show_att += this.fp.a2;
		//显示
		this.game.att.setText(this.show_att);
	}
	this.selectedGems.push(g);
	this.updateLine();
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
				console.log(this.gems[c][r].attack);
				damage += this.gems[c][r].attack;
				}
        }
    }
	return damage;
};

