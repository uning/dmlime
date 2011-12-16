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

    this.SIZE = 690;

    this.rows = rows;
    this.cols = cols;
    this.gems = new Array(cols);

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

    // load in first bubbles
    this.fillGems();


    // register listener
    goog.events.listen(this, ['mousedown', 'touchstart'], this.pressHandler_);



	//*
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
	this.isMoving_ = 1;

    var action = new lime.animation.Spawn(
        new lime.animation.ScaleTo(0),
        new lime.animation.FadeTo(0).setDuration(.8)
    ).enableOptimizations();


    var indexes = [];

    var s = this.selectedGems,g,type,i
	,fp = this.game.user.fp,keep
	,attack = fp.a1 
	,gold = 0
	,defense = 0
	,exp = 0
	,blood = 0

	//计算攻击力
	for(i = 0; i < s.length; i++){
		type= s[i].type;
		//计算经验
		if(type == 'sword'){
			attack += fp.a2
		}else if(type != 'monstor'){
			g = 1;
			break;
			
		}
	}

	for(i = 0; i < s.length; i++){
		g = s[i]
		type = g.type
		keep = false;
		if(type == 'monstor'){
			if(attack >= g.blood ){
				exp += fp.a17
				if(i > 2){
					exp += this.randExtra(fp.a24,f25,fp.a26,f.a27)
				}
			}else{
				g.blood  -= attack;
				keep = true;
			}
		}else if(type == 'blood'){
			blood += fp.a11;
			if(i > 2){
				blood += this.randExtra(fp.a14,f15,fp.a16,f.a17)
			}

		}
	}



    for(i = 0; i < solutions.length; i++){

        action.addTarget(solutions[i]);
        // remove form array but not yet form display list
        goog.array.remove(this.gems[solutions[i].c], solutions[i]);
        goog.array.insert(indexes, solutions[i].index);
    }

    // actual score = bubbles * colors
    this.game.setScore(solutions.length * indexes.length);

    goog.events.listen(action, lime.animation.Event.STOP, function() {
        //remove objects after they have faded
        goog.array.forEach(solutions, function(g) {
            g.parent_.removeChild(g);
        },this);
        // move other bubbles to place.
        this.moveGems();
    },false, this);
    // fill the gaps
    this.fillGems();
    action.play();
	this.isMoving_ = 0;
    return true;
};


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

dm.Board.prototype.updateLine = function() {
    this.graphics && this.graphics.setDirty(lime.Dirty.CONTENT);

}
dm.Board.prototype.drawLine = function(ctx) {
		 this.selectedGems = this.selectedGems || [];
		 /*
		 if(goog.userAgent.MOBILE)
			 this.ctx.globalCompositeOperation = 'copy';
		 else 
		 */
		 ctx.clearRect(0,0,this.SIZE,this.SIZE);

		 if(this.cancelGem){
			 ctx.strokeStyle = '#00FF00';
		 }else{
			 ctx.strokeStyle = '#FF0000';
		 }
		 ctx.lineWidth = 10;
		 ctx.shadowBlur = 0;
		 ctx.shadowColor = '#fff';

		 ctx.beginPath();


		 ctx.moveTo(0,0);
		 ctx.lineTo(600,600);
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
	//结束
	if(e.type == 'mouseup'  || e.type == 'touchend' /*|| e.type == 'touchcancel'*/){
		this.doing_ = false;
		console.log("mouseup : this.selectedGems",this.selectedGems);
		for( i = 0 ;i < this.selectedGems.length ; i ++){
			this.selectedGems[i].deselect();
		}
		if(this.selectedGems.length > 2){//消除
			this.checkSolutions();
		}
		this.selectedGems = [];
		return;
	}



    var pos = e.position;

    // get the cell and row value for the touch
    var c = Math.floor(pos.x / this.GAP),
        r = this.rows - Math.ceil(pos.y / this.GAP);

	if(c >= this.cols || c < 0 || r < 0 || r >= this.rows){
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

