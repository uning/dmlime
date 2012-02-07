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
goog.require('dm.Skill');



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
dm.Board.prototype.fillGems = function(type) {
	var c,r;
    for (c = 0; c < this.cols; c++) {
        if (!this.gems[c]) this.gems[c] = [];
        var i = 0;
        for (r = this.gems[c].length; r < this.rows; r++) {
            i++;
            var gem = dm.Gem.random(this.GAP, this.GAP, type);
			gem.genAttribute(this.game.data.turn);
            gem.r = r;
            gem.c = c;
            gem.setPosition((c + .5) * this.GAP, (-i + .5) * this.GAP);
            //gem.setSize(this.GAP, this.GAP);
            this.gems[c].push(gem);
            this.layers[c].appendChild(gem);
        }
    }
	this.show_att = this.fp.a1 + (this.game.data.attack_addtion || 0);
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
	this.genType = -1;
	
    var action = new lime.animation.Spawn(
        new lime.animation.ScaleTo(0).setDuration(.1),
        new lime.animation.FadeTo(0).setDuration(.1)
    ).enableOptimizations();

    var s = this.selectedGems,g,type,i,leech,attack_real,dtom
	,fp = this.game.user.fp
	,sp = this.game.user.sp
	,data = this.game.data
	,buff = this.game.buff
	,sk_action = new dm.Skill(this.game)
	,keep
	,attack = fp.a1 + this.game.data.attack_addtion 
	,defense = fp.a3
	,p_type = []
	,ispoping = this.game.ispoping;
	
	//初始化


	for(i in buff){
		if(buff[i] && dm.conf.SK['sk'+i]['delay'] == 1){ //回合中产生作用
			sk_action.action(i);
		}
	}
	
	var indexes = 1;
	//* 分类处理
	if(s[0].type == 'sword' || s[0].type == 'monster'){
		var weapon_dmg = 0;
		for(i = 0; i < s.length; i++){
			if(s[i].type == 'sword'){
				weapon_dmg += fp.a2*(100 + data['attack_ratio']*i)/100; //每个武器伤害递增
				//
				//attack *= data['attack_ratio'];
				//attack *= data['dmgRatio'];
			}
		}
		attack += weapon_dmg;
		attack *= data['dmgRatio'];
		attack = Math.round(attack);

		for(i = 0; i < s.length; i++){
			g = s[i];
			type = g.type;
			if(type == 'monster'){
				var def_real = Math.round(g.def_left*(100-fp.a31)/100); //实际防御值 = 防御数值 - 忽略掉的防御值
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
					console.log('leech: '+leech);
				}else{
					if(attack_real > def_real){
						g.hp_left = g.hp_left + def_real - attack_real;
						leech = attack_real*fp.a36/100;
					}
					g.keep = true;
					if(Math.random()*100 < fp.a32){//毒伤害,todo: 加入持续时间
                        g.setSpecial('poison');
						g.poison = Math.round(attack_real*10/100) || 1;//fp.a33/100);
						console.log('poison : '+g.poison);
						g.poison_start = 1;
					}
					if(Math.random()*100 < fp.a35){ //fp.a35){//石化
						console.log('freeze ');
						g.setSpecial('freeze');
						g.stone = 1;
					}
					p_type = 0;
				}
				g.hplabel.setText(g.hp_left);
			}
		}

		while(data['exp'] >= 13){
			this.game.pop.lvl += 1;
			data['exp'] -= 13;
		}
	}

	if(s[0].type == 'gold'){
		p_type = 'gold';
		data['gold'] += s.length*fp.a13*(data['doublegain']?2:1); //double表示是否有双倍效果;
		if(s.length > 3)
			data['gold'] += this.randExtra(fp.a13,fp.a14,fp.a15,fp.a16)

		while(data['gold'] >= 13){
			data['gold'] -= 13;
			this.game.pop.shop += 1;
		}
	}

	if(s[0].type == 'blood'){
		p_type = 'hp';
		data['hp'] += s.length*fp.a9;//*(doublegain?2:1);
		if(s.length > 3){
			data['hp'] += this.randExtra(fp.a9,fp.a10,fp.a11,fp.a12)
		}
		data['hp'] = Math.min(data['hp'], fp.a6);
	}
	
	if(s[0].type == 'mana'){
		p_type = 'mana';
		data['mana'] += s.length*fp.a21;//*(doublegain?2:1);
		if(s.length > 3){
			data['mana'] += this.randExtra(fp.a21,fp.a22,fp.a23,fp.a24)
		}
		data['skillexp'] += Math.max(0, data['mana'] - fp.a5);
		data['mana'] = Math.min(fp.a5, data[p_type]);
		while(data['skillexp'] >= 3){
			data['skillexp'] -= 3;
			this.game.pop.skill += 1;
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
	if(Math.random()*100 > (fp.a38 + data['extAvoid'])){
		if(!data['noDmg']){ 
		//伤害减少
			var def_extra = data['def_extra'];

			total_dmg = Math.ceil(total_dmg*(100-fp.a29)/100);//被动属性减少伤害
			data['hp'] -= Math.max(0, total_dmg - def_extra); //伤害减去额外防御
			data['def_extra'] = Math.max(0, def_extra - total_dmg);
			total_dmg = Math.max(0, total_dmg - def_extra);

			dtom = Math.round(total_dmg*fp.a28/100);//实际伤害转到魔法的增加
			data['mana'] = Math.min(fp.a5, data['mana']+dtom);
		}else{
			alert('不受伤害');//
		}
	}else{
		alert('闪避');
	}

	if(data['hp'] <= 0){
		if(data.revive == 1){
			data['hp'] = fp.a6;
			this.changeProg(this.game, 'hp');
			data['mana'] = fp.a6;
			this.changeProg(this.game, 'mana');
			console.log('revive');
			
		}else{
			this.game.endGame();
		}
	}
	
	//
	//回合末技能生效
	for(i in buff){
		if(buff[i] && dm.conf.SK['sk'+i]['delay'] == 2){ //回合末技能生效
			sk_action.action(i);
		}
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
	var animationStop = function(gemtype) {
		dm.log.fine('checkSolutions : animation stop');
        goog.array.forEach(s, function(g) {
            if(g.keep == false){
				g.parent_.removeChild(g);
			    delete g;
			}
        },this);
		me.fillGems(gemtype);
		dm.log.fine('in checkSolutions : moveGems start');
        me.moveGems();
    }
	goog.events.listen(action, lime.animation.Event.STOP,animationStop ,false, this);

	this.game.data.turn += 1;
	dm.log.fine('in checkSolutions : action start');
    //action.play();
	animationStop(this.genType); //不播动画

	//只持续一回合的一些参数
	//回合末的结尾工作
	for(i in buff){
		if(buff[i]){ //技能持续时间到期时候的游戏参数设置。
			buff[i]--; 
			if(buff[i] == 0){
				sk_action.actionEnd(i);
				delete buff[i];
			}
		}
	}
	
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
			if(this.show_att *(this.game.data['dmgRatio'] || 1) >= line[element].hp_left + line[element].def_left){
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

	var valid_min = this.GAP*0.10,
		valid_max = this.GAP*0.90,  //落在GEM矩形框内中心部分才有效
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
	var reduceDmg = this.game.data.reduceDmg || 0;
	damage = Math.ceil(damage*(100 - reduceDmg)/100);//技能减少伤害
	return Math.max(0, damage - this.game.user.fp.a3*this.game.user.fp.a4);

};

/*
 *
 * 弹窗口,购买，升级技能，等级升级等的相关窗口
 *
 */
 dm.Board.prototype.popWindow = function(text){
	 this.game.ispoping = true;
	 var i,j,ct=0,id=[],board,game,btn,btn2,rand,
	 user = this.game.user,
	 equips = user.equips;
	 goog.events.unlisten(this, ['mousedown', 'touchstart'], this.pressHandler_);

	 var popdialog = new lime.RoundedRect().setFill(0, 0, 0, .7).setSize(600, 600).setPosition(45,45).setRadius(20).setAnchorPoint(0,0);
	 this.appendChild(popdialog);

	 switch(text){
		 case 'lvl Up':
			 btn = new dm.Button().setText(text).setSize(200, 100).setPosition(250,440);
			 popdialog.appendChild(btn);
			 var labal, spname, spval, loc=80;
			 for(i in dm.conf.SP){
				 spname = dm.conf.SP[i].name;
				 spval = this.game.user.sp[i];
				 label = new lime.Label().setFontSize(40).setFontColor('#FFF').setText(spname +' '+spval+' + '+dm.conf.SP[i].inc);
				 popdialog.appendChild(label.setAnchorPoint(0.5,0).setPosition(250, loc));
				 loc += label.getSize().height;
			 }
			 goog.events.listen(btn, ['mousedown', 'touchstart'], function() {
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
				 game.ispoping = false;
				 board.removeChild(this.getParent());
				 delete this.getParent();  
			 });
		 break;

		 //
		 case 'Skill':

			 //-------------------------------------------------
			 var sn=0, icon, frame, sk_key;
		 for(i in this.game.user.skills){
			 sn++;
		 }
			 if(sn < 4){ //可以随机新技能
				 sk_key = user.randSel(user.findKey(dm.conf.SK), 2); //随机两个技能，选择学习或者升级
			 }else if(sn == 4){
				 sk_key = user.randSel(user.findKey(user.skills), 2);
			 }
			 frame = new lime.RoundedRect().setSize(500, 300).setPosition(0, 130).setFill(0,0,0,.7).setRadius(20).setAnchorPoint(0,0); 
			 btn = new dm.Button().setText(text).setSize(200, 50).setPosition(250, 470);
			 popdialog.appendChild(frame);
			 popdialog.appendChild(btn);

			 for(i in sk_key){
				 icon = new lime.Sprite().setSize(100, 100).setPosition(100+ i*200, 20).setAnchorPoint(0,0);
				 icon.skill = dm.conf.SK[sk_key[i]]; //传递选中技能
				 icon.button = btn; // 传递选中技能到btn中
				 icon.frame = frame;
				 icon.setFill(dm.IconManager.getFileIcon('assets/tiles.png', 510+((parseInt(icon.skill.no)-1)%10)*50, Math.floor((parseInt(icon.skill.no))/10)*50 , 2, 2.1, 1));
				 popdialog.appendChild(icon);
				 //

				 goog.events.listen(icon, ['mousedown', 'touchstart'], function() {
					 //技能相关描述
					 this.frame.removeAllChildren();
					 this.button.skill = this.skill;

					 var nm = new lime.Label().setFontColor('#FFF').setFontSize(20).setAnchorPoint(0, 0).setPosition(0, 10);
					 nm.setText(' 技能：'+this.skill['name']);
					 this.frame.appendChild(nm);

					 var disc = new lime.Label().setFontColor('#FFF').setFontSize(20).setAnchorPoint(0, 0).setPosition(0, 40);
					 disc.setText(' 描述：'+this.skill['disc']);
					 this.frame.appendChild(disc);

					 var cd = new lime.Label().setFontColor('#FFF').setFontSize(20).setAnchorPoint(0, 0).setPosition(0, 70);
					 cd.setText(' 冷却时间(轮)：'+this.skill['cd']);
					 this.frame.appendChild(cd);

					 var cost = new lime.Label().setFontColor('#FFF').setFontSize(20).setAnchorPoint(0, 0).setPosition(0, 100);
					 cost.setText(' 魔法消耗：'+this.skill['mana']);
					 this.frame.appendChild(cost);
				 });
			 };

		 //-------------------------------------------------
			 goog.events.listen(btn, ['mousedown', 'touchstart'], function() {
				 board = this.getParent().getParent();
				 game = board.game
				 if(this.skill){
					 game.user.skillUp(this.skill);
					 goog.events.listen(board, ['mousedown', 'touchstart'], board.pressHandler_);
					 board.removeChild(this.getParent());
					 game.ispoping = false;
					 delete this.getParent();
				 }else{
					 alert('choose one!');
				 }

			 });
			 break;



		 case 'Shop':
			 btn = new dm.Button().setText('升级装备').setSize(200, 50).setPosition(250, 570);
			 popdialog.appendChild(btn);
			 frame = new lime.RoundedRect().setSize(500, 200).setPosition(40, 240).setFill(0,0,0,.7).setRadius(20).setAnchorPoint(0,0); 
			 popdialog.appendChild(frame);
			 //newequip = new lime.Sprite().setSize(100, 100).setPosition(10, 10).setFill(0,0,0,.7).setRadius(20).setAnchorPoint(0,0); 
			 //frame.appendChild(newequip);

			 var eqp_sel = this.game.user.randSel([0,1,2,3,4], 3); //随机选3个部位购买装备
			 var eqp = this.game.user.equips;
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
						 fpname = dm.conf.FP[j].disp;
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
							 for(j in user.eqp_add[this.icon.eqpid]){
								 fpname = dm.conf.FP[j].disp;
								 fpval = user.eqp_add[this.icon.eqpid][j];
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
								 fpname = dm.conf.FP[j].disp;
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
								 delete this.getParent();  
							 });
							/* goog.events.listen(back, lime.Button.Event.CLICK, function() {
								 goog.events.listen(board, ['mousedown', 'touchstart'], board.pressHandler_);
								 this.getParent().getParent().removeChild(this.getParent());
								 delete this.getParent();  
							 });
							 */
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
					 delete this.getParent();  
				 }else{
					 alert('choose one');
				 }
			 });
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
			 //game.show_vars[type]._pg.setProgress(game.data[type]/100);
			 game.show_vars[type]._lct.setText(game.data[type]+'/'+100);
			 break;
		 case 'hp':
			 //game.show_vars['hp']._pg.setProgress(game.data['hp']/game.user.fp.a6);
			 game.show_vars['hp']._lct.setText(game.data['hp']+'/'+game.user.fp.a6);
			 break;
		 case 'mana':
			 //game.show_vars['mana']._pg.setProgress(game.data['mana']/game.user.fp.a5);
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
  * param: mod -- all 所有怪物 --‘type’ 某一特殊状态的怪物
  * func -- 作用于monster上的回调函数, params ---其他参数、/
  */
  dm.Board.prototype.findMonster = function(mod, func, context, param){
	  var c, i, r, remove_arr=[];
	  for (c = 0; c < this.cols; c++) {
		  for (r = 0; r < this.gems[c].length; r++) {
			  if(this.gems[c][r].type == "monster"){
				  console.log('c = '+c, '; r = '+r);
				  if(mod == 'all'){
					  func(this.gems[c][r], context, param);
					  if(this.gems[c][r].keep == false){
						  remove_arr.push(this.gems[c][r]);
					  }
				  }
			  }
		  }
	  }
	  for(i = 0; i < remove_arr.length; i++){ 
		  if(remove_arr[i].keep == false){
			  goog.array.remove(this.gems[remove_arr[i].c], remove_arr[i]);
		  }
	  }
	  this.fillGems(this.genType);
	  this.moveGems();
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


/**
 * 技能：替换所有的图标，全部刷新
 */
 dm.Board.prototype.wipeAll = function(){
	 var s = this.findGem('All');
	 this.changeGem(s, true);
 }

 /**
  * 技能：随机消除图中3*3的格子
  */
  dm.Board.prototype.wipeBlock = function(){
	  var s = this.findGem();
	  var i;
	  for(i in s){
		  this.gainGem(s[i]);
	  }
	  this.changeGem(s, false);
  }

  /**
   * 技能：搜集某类图标
   * param@ type:搜集图标的类型， value：搜集图标增加的值的类型
   */
   dm.Board.prototype.collect = function(type, value){
	   context = this;
	   this.findType(type,function(g, value, context){
		   g.keep = false;
		   context.game.data[value] += 1;
		   //
		   if(context.game.data[value] > 13){
			   if(value == 'exp'){
				   context.game.pop['lvl'] += 1;
			   }
		   }else{
			   //context.game.
		   }
		   //
		   g.parent_.removeChild(g);
		   return g;
	   },value, context)
   }

   /**
	* 找到某类gems，对每个对象调用回调函数
	*/
   dm.Board.prototype.findType = function(type, func, param){
	   var c, i, r, g, arr = [];
	   for (c = 0; c < this.cols; c++) {
		   for (r = 0; r < this.rows; r++) {
			   if(this.gems[c][r].type == type){
				   g = func(this.gems[c][r], param, this);
				   arr.push(g);
			   }
		   }
	   }
	   for(i in arr){
		   goog.array.remove(this.gems[arr[i].c], arr[i]);
	   }
	   this.fillGems(this.genType);
	   this.moveGems();
   }


  /**
   * 找到要改变的gems,
   * param: mod -- all 全部选中 
   */
   dm.Board.prototype.findGem = function(mod){
	   var s = [];
	   if(mod == 'All'){
		   var c, r;
		   for (c = 0; c < this.cols; c++) {
			   for (r = 0; r < this.rows; r++) {
				   s.push(this.gems[c][r]);
			   }
		   }
	   }else{//取3*3的一个方块内的元素
		   var anchor = [
			   Math.round(1 + Math.random()*(this.cols - 3)),
			   Math.round(1 + Math.random()*(this.rows - 3))
		   ];

		   for(c = -1; c < 2; c++){
			   for(r = -1; r < 2; r++){
				   s.push(this.gems[anchor[0] + c][anchor[1] + r]);
				   //console.log('findGem: ' + 'anch = ' + anchor[0] + ' , c= ' + c + ' ; ' + 'anch = ' + anchor[1] + ', r= ' + r);
				   //console.log(this.gems[anchor[0]+c][anchor[1]+r].type);
			   }
		   }
	   }
	   return s;
   }


 /**
  * 改变board里面的元素块结构
  * param:
  *      s ：要改变的元素的位置数组， keep : 0 --消除 1 -- 重排列
  */
   dm.Board.prototype.changeGem = function(s, keep){
	   //先删除显示层元素
	   var i, g;
	   goog.array.forEach(s, function(g) {
		   if(g.keep == false){
			   g.parent_.removeChild(g);
			   delete g;
		   }
	   },this);
	   //删除在gem矩阵中的元素
	   for(i = 0; i < s.length; i++){
		   goog.array.remove(this.gems[s[i].c], s[i]);
	   }

	   if(!keep){
		   //完全随机生成新的
		   this.fillGems();
		   this.moveGems();
	   }else{
		   var c, r, copy;
		   for (c = 0; c < this.cols; c++) {
			   if ( !this.gems[c] ) 
				   this.gems[c] = [];
			   i = 0;
			   for (r = this.gems[c].length; r < this.rows; r++) {
				   copy = s.splice(Math.round(Math.random()*(s.length-1)), 1);//随机选择一个gem
				   i++;
				   var gem = copy[0];
				   gem.r = r;
				   gem.c = c;
				   gem.setPosition((c + .5) * this.GAP, (-i + .5) * this.GAP);
				   //gem.setSize(this.GAP, this.GAP);
				   this.gems[c].push(gem);
				   this.layers[c].appendChild(gem);
			   }
		   }
		   this.moveGems();
	   }
   }


 /**
  * 收集图标产生作用
*/
   dm.Board.prototype.gainGem = function(gem){
	   var fp = this.game.user.fp
	   ,sp = this.game.user.sp
	   ,data = this.game.data
	   ,p_type
	   switch(gem.type){
		   case 'sword':{
			   this.game.data.attack_addtion += fp.a2;
		   }
		   break;
		   case 'monster':{
			   data['exp'] += fp.a17;
			   while(data['exp'] >= 13){
				   data['exp'] -= 13;
				   this.game.pop.lvl += 1;
			   }
			   p_type = 'exp';
		   }
		   break;
		   case 'blood':{
			   data['hp'] += fp.a9;
			   data['hp'] = Math.min(data['hp'], fp.a6);
			   p_type = 'hp';
		   }
		   break;
		   case 'gold':{
			   data['gold'] += fp.a13;
			   p_type = 'gold';
			   while(data['gold'] >= 13){
				   data['gold'] -= 13;
				   this.game.pop.shop += 1;
			   }
		   }
		   break;
		   case 'mana':{
			   data['mana'] += fp.a21;
			   data['skillexp'] += Math.max(0, data['mana'] - fp.a5);
			   data['mana'] = Math.min(fp.a5, data['mana']);
			   while(data['skillexp'] >= 3){
				   data['skillexp'] -= 3;
				   this.game.pop.skill += 1;
			   }
			   p_type = 'mana';
		   }
		   break;
		   default:
			   break;
	   }

	   this.changeProg(this.game, p_type);
   }


  /**
   * 魔法攻击，造成剩余魔法值等量的伤害
   */
  dm.Board.prototype.magicAttack = function(monster, game){
	  var i;
	  var dmg = game.data.attack_magic;
	  monster.hp_left = monster.def_left + monster.hp_left - dmg;
	  if(monster.hp_left <= 0){
		  monster.keep = false;
		  monster.getParent().removeChild(monster);
	  }else{
		  monster.hplabel.setText(monster.hp_left);
		  monster.keep = true;
	  }
  } 
