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
goog.require('dm.Monster');

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
	this.setRenderer(lime.Renderer.CANVAS);
    this.game = game ;
    /**
     * @const
     * @type {number}
     */
	this.SIZE = 600;
    this.rows = rows;
    this.cols = cols;
    this.gems = new Array(cols);
	//每一轮的各种宝石的数组
	this.type_arr = new Array(5);
	this.type_arr['hp']=[];
	this.type_arr['mana']=[];
	this.type_arr['gold']=[];
	this.type_arr['sword']=[];
	this.type_arr['monster']=[];
	//
	this.selectedGems = [];
	this.drawedLines = [];
	//用于显示的数值
	this.fp = this.game.user.data.fp;
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
    goog.events.listen(this, ['mousedown', 'touchstart','gesturestart'], this.pressHandler_);
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
dm.Board.prototype.fillGems = function(type) {
	var c,r;
    for (c = 0; c < this.cols; c++) {
        if (!this.gems[c]) this.gems[c] = [];
        var i = 0;
        for (r = this.gems[c].length; r < this.rows; r++) {
            i++;
            var gem = dm.Gem.random(this.GAP, this.GAP, type);
			if(gem.type == 'monster'){
				gem.monster = new dm.Monster(this.game.data.turn, gem, this.game);
			}
            gem.r = r;
            gem.c = c;
            gem.setPosition((c + .5) * this.GAP, (-i + .5) * this.GAP);
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
	this.findGemsType();
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

    var s = this.selectedGems;	
	this.checkStart();
	this.playerAction(s);
	this.monsterAttack();
	this.checkEnd(s);
	
	this.isMoving_ = 0;
	
	return true;
};

/**
 * 玩家进行攻击
 */
dm.Board.prototype.playerAttack = function(s){
	var data = this.game.data;
	var userdata = this.game.user.data;
	var fp = userdata.fp;
	var sp = userdata.sp;
	var attack = fp.a1 + data.attack_addtion;
	var i, g;
	var weapon_dmg = 0;
	var reflectionDmg = 0;
	for(i = 0; i < s.length; i++){
		if(s[i].type == 'sword' && !s[i].isBroken){
			weapon_dmg += fp.a2*(100 + data['attack_ratio']*i)/100; //每个武器伤害递增
		}
	}
	attack += weapon_dmg;
	attack *= data['dmgRatio'];
	attack = Math.round(attack);
	for(i = 0; i < s.length; i++){
		g = s[i];
		type = g.type;
		if(type == 'monster' && (data['canDamageMon'] || g.monster.id == 16)){//可以对怪物造成伤害
			var mon_def_real = Math.round(g.monster.def*(100-fp.a31)/100); //实际防御值 = 防御数值 - 忽略掉的防御值
			if(Math.random()*100 < fp.a37){//双倍伤害
				attack_real = attack * 2;
			}else{
				attack_real = attack;
			}
			if(data['isWeaken'] == true){//玩家虚弱，伤害减半
				attack_real = Math.round(attack_real*0.5);
			}
			if(attack_real >= g.monster.hp + mon_def_real){
				if(g.monster.id == 18){//反弹伤害的怪物
					reflectionDmg += g.monster.hp;
				}
				leech = g.monster.hp*fp.a36/100; //生命偷取
				if(g.monster.id != 15){ //不是宝石骷髅
					g.monster.hp = 0;
					g.keep = false;
					g.monster.onDeath(true);
					this.game.updateData('exp', this.randExtra(fp.a17,fp.a18,fp.a19,fp.a20), 'add');
				}else{
					g.monster.canAttack = false; //不会攻击
					g.monster.revive_timeout = 1; //开始复活倒计时
					g.type = 'gold';
					g.keep = true;
				}
			}else{
				if(attack_real > mon_def_real){
					g.monster.hp = g.monster.hp + mon_def_real - attack_real;
					if(g.monster.id == 18){//反弹伤害的怪物
						reflectionDmg += attack_real - mon_def_real;
					}
					leech = attack_real*fp.a36/100;
				}
				g.keep = true;
				if(Math.random()*100 < fp.a32){//毒伤害,todo: 加入持续时间
					g.setSpecial('poison');
					g.monster.poison = Math.round(attack_real*10/100) || 1;//fp.a33/100);
				}
				if(Math.random()*100 < fp.a35){ //fp.a35){//石化
					g.setSpecial('freeze');
					g.monster.stone = true;
				}
			}
			g.monster.changeDisplay('hp');
		}else if(g.type == 'monster'){
			g.setSpecial('noDmg');
			g.keep = true;
		}
	}

	if(!data['noDmg']){
		this.game.updateData('hp', -reflectionDmg, 'add');//反弹的伤害
	}
}

/**
 * 怪物开始攻击
 */
dm.Board.prototype.monsterAttack = function(){
	var data = this.game.data;
	var fp = this.game.user.data.fp;
	var sp = this.game.user.data.sp
	var total_dmg = this.getDamage();
	//闪避？
	if(Math.random()*100 > (fp.a38 + data['extAvoid'])){
		if(!data['noDmg']){ 
		//伤害减少
			var def_extra = data['def_extra'];
			//怪物减少玩家防御
			var def_reduce = data['def_reduce'];

			total_dmg = Math.ceil(total_dmg*(100-fp.a29)/100);//被动属性减少伤害
			this.game.updateData('hp', -Math.max(0, total_dmg - def_extra), 'add');
			this.game.updateData('def_extra', Math.max(0, def_extra - total_dmg));

			total_dmg = Math.max(0, total_dmg - def_extra);
			//记录玩家最终所承受的伤害
			data['finalDmg'] = total_dmg;
			//

			var dtom = Math.round(total_dmg*fp.a28/100);//实际伤害转到魔法的增加
			this.game.updateData('mana', Math.min(fp.a5, data['mana']+dtom));
		}else{
			alert('不受伤害');//
		}
	}else{
		alert('闪避');
	}
}

/**
 * 收获其他类型的宝石
 */
dm.Board.prototype.gainGems = function(s){
	var data = this.game.data;
	var fp = this.game.user.data.fp;
	var sp = this.game.user.data.sp
	if(s[0].type == 'gold'){// || s[0].monster.id == 15){
		var gold = 0;
		for(i in s){
			if(!s[i].isBroken){
				gold += fp.a13*(data['doublegain']?2:1); //double表示是否有双倍效果;
			}
			if(s[i].monster && s[i].monster.id == 15){
				s[i].keep = false;
				s[i].monster.onDeath(true);
			}
		}
		if(s.length > 3){
			gold += this.randExtra(fp.a13,fp.a14,fp.a15,fp.a16)
		}
		this.game.updateData('gold', gold, 'add');
	}

	if(s[0].type == 'hp'){
		var hp = 0;
		for(i in s){
			if(!s[i].isBroken){
				if(s[0].ispoison && s[0].ispoison == true){
					//吃到的是毒药
					hp -= fp.a9;
				}else{
					hp += fp.a9;//*(doublegain?2:1);
					//吃到血瓶则解毒
					this.game.updateData('poison', 0);
				}
			}
		}
		if(s.length > 3){
			hp += this.randExtra(fp.a9,fp.a10,fp.a11,fp.a12)
		}
		this.game.updateData('hp', hp, 'add');
	}
	
	if(s[0].type == 'mana'){
		var mana = 0;
		for(i in s){
			if(!s[i].isBroken){
				mana += fp.a21;//*(doublegain?2:1);
			}
		}
		if(s.length > 3){
			mana += this.randExtra(fp.a21,fp.a22,fp.a23,fp.a24)
		}
		this.game.updateData('mana', mana, 'add');
	}
 }



/**
 *checkSolutions开始阶段的动作
 */
dm.Board.prototype.checkStart = function(){
	this.unStoneMonsters(); //上一轮被石化的怪物恢复
}

/**
 *玩家回合开始
 */
dm.Board.prototype.playerAction = function(s){
	var fireDmg = 0;
	var data = this.game.data;
	if(s[0].type == 'sword' || s[0].type == 'monster'){
		this.playerAttack(s);
	}else{
		this.gainGems(s);
	};
	//火焰伤害
	for(i=0;i<s.length;i++){
		s[i].keep = false;
		if(s[i].isOnFire == true){
			fireDmg += parseInt(data['fireDmg']);
		}
	}
	if(!data['noDmg']){
		this.game.updateData('hp', -fireDmg, 'add');//火焰伤害
	}
}

/**
 *玩家回合完成，怪物回合开始
 */
dm.Board.prototype.checkEnd = function(s){
	var i;
	var data = this.game.data;
	var buff = data['buff'];
	var sk_action = new dm.Skill(this.game);

	//回合结束其他动作
	this.poisonMonsters(s); //其他怪物的毒伤害等
	this.game.setScore(s.length * (s.length - 2));

	//回合末技能生效
	for(i in buff){
		if(buff[i] && dm.conf.SK['sk'+i]['delay'] == 2){ //回合末技能生效
			sk_action.action(i);
		}
	}

	//毒伤害
	if(data['poison'] > 0){
		this.game.updateData('hp', -data['poison'], 'add');
	}

	this.recover();

	if(data['hp'] <= 0){
		if(data.revive == 1){
			this.game.updateData('hp', fp.a6);
			this.game.updateData('mana', fp.a5);
		}else{
			this.game.endGame();
		}
	}
	
	if(!this.game.ispoping){
		this.turnEndShow();
	}
	//this.changeProg(this.game, p_type);
	this.game.updateData('turn', 1, 'add');
	//冷却时间减少
	if(data['canCD']){
		for(i in data['skillCD']){
			if(data['skillCD'][i] > 0){
				data['skillCD'][i]--; 
			}
		}
	}

	this.clearGem();
	if(!data['disableSkill']){ //怪物可以使用技能
		var mon_arr = this.findMonster();
		for(i in mon_arr){
			mon_arr[i].monster.startSkill();
		}
	}

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
}

/**
 * 玩家恢复
 */
dm.Board.prototype.recover = function(){
	var fp = this.game.user.data.fp;
	//生命魔法恢复
	if(fp.a26 && fp.a26>0){
		this.game.updateData('hp', fp.a26, 'add');
	}
	if(fp.a27 && fp.a27>0){
		this.game.updateData('mana', fp.a27, 'add');
	}
}

/**
 * 计算选中序列
 */
 dm.Board.prototype.checkLine = function( line ) {
	var monster, element, reduceDmg=0;
	for(element in line){
		if(line[element].type == 'monster'){
			monster = line[element].monster;
			if(this.show_att *(this.game.data['dmgRatio'] || 1) >= monster.hp + monster.def){
				//杀死怪物了
				monster.setKilled();
				reduceDmg += monster.att //死亡怪物不再造成伤害，从总显示数值中去掉。
				this.game.mon.setText(Math.max(0,this.getDamage() - reduceDmg));
			}else{
				monster.unsetKilled();
			}
		}
	}
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
		if(g.type == 'sword' && !g.isBroken){
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

		if(g.type == 'sword' && !g.isBroken){
			this.show_att -= this.fp.a2;
			this.game.att.setText(this.show_att);

		}
		if(g.type == 'monster'){
			g.unsetSpecial();
			this.show_dmg = this.getDamage();
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
	if(lastg && !lastg.canConnect(g) || !g.canSelect){
	
		
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
			if(this.gems[c][r].monster){
				if(this.gems[c][r].monster.stone == 0 && this.gems[c][r].monster.canAttack){
					damage += this.gems[c][r].monster.att;
				}
			}
		}
	}
	var reduceDmg = this.game.data.reduceDmg || 0;
	damage = Math.ceil(damage*(100 - reduceDmg)/100);//技能减少伤害
	defense = Math.max(this.game.user.data.fp.a3 - this.game.data['def_reduce'], 0)*this.game.user.data.fp.a4;
	if(this.game.data['isWeaken'] == true){//玩家虚弱，防御力减半
		defense = Math.round(defense/2);
	}
	return Math.max(0, damage - defense);

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
	 equips = user.data.equips;
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
				 spval = this.game.user.data.sp[i];
				 label = new lime.Label().setFontSize(40).setFontColor('#FFF').setText(spname +' '+spval+' + '+dm.conf.SP[i].inc);
				 popdialog.appendChild(label.setAnchorPoint(0.5,0).setPosition(250, loc));
				 loc += label.getSize().height;
			 }
			 goog.events.listen(btn, ['mousedown', 'touchstart'], function() {
				 board = this.getParent().getParent();
				 game = board.game
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
				 board.removeChild(this.getParent());
			 });
		 break;

		 //
		 case 'Skill':{
			 this.createSkillDialog();
			 break;
		 }

		 case 'Shop':
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
	 }
 }


 dm.Board.prototype.getBaseAttack = function(){
	return this.game.user.data.fp['a1'] || 0;
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
			 game.show_vars['hp']._lct.setText(game.data['hp']+'/'+game.user.data.fp.a6);
			 break;
		 case 'mana':
			 //game.show_vars['mana']._pg.setProgress(game.data['mana']/game.user.fp.a5);
			 game.show_vars['mana']._lct.setText(game.data['mana']+'/'+game.user.data.fp.a5);
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

 /**
  * 寻找某个gem
  */
 dm.Board.prototype.findGemsType = function(){
	 var c, r;
	 for(var i in this.type_arr){
		 this.type_arr[i] = [];
	 }
	 for (c = 0; c < this.cols; c++) {
		 for (r = 0; r < this.gems[c].length; r++) {
			 this.type_arr[this.gems[c][r].type].push(this.gems[c][r]);
		 }
	 }
 }

 /*
  * 找出本轮所有的怪物
  * param: mod -- all 所有怪物 --‘type’ 某一特殊状态的怪物
  * func -- 作用于monster上的回调函数, params ---其他参数、/
  */
  dm.Board.prototype.findMonster = function(func, context, param){
	  var c, i, r, mon_arr=[];
	  for (c = 0; c < this.cols; c++) {
		  for (r = 0; r < this.gems[c].length; r++) {
			  if(this.gems[c][r].monster && this.gems[c][r].keep == true){
				  if(func){
					  func(this.gems[c][r], context, param);
				  }else{
					  mon_arr.push(this.gems[c][r]);
				  }
			  }
		  }
	  }
	  if(!func){
		  return mon_arr;
	  }
	  this.clearGem();
  }

 /*
  * 每回合结束对怪物造成毒伤害
  */
  dm.Board.prototype.poisonMonsters = function(s){
	var c, r, g, gem, exist=0;
    for (c = 0; c < this.cols; c++) {
        for (r in this.gems[c]) {
			g = this.gems[c][r];
            if(g.type == 'monster' && g.monster.hp > 0 && g.monster.poison && g.monster.poison > 0){
				g.monster.hp -= g.monster.poison;
				if(g.monster.hp <= 0){
					g.monster.hp = 0;
					g.monster.changeDisplay('hp');
					g.monster.setKilled();
					g.keep = false;
					exist = 0;
				}
				g.monster.changeDisplay('hp');
			}   
        }
    }
 }

 dm.Board.prototype.unStoneMonsters = function(){
	var c,r,g,gem,exist=0;
    for (c = 0; c < this.cols; c++) {
        for (r in this.gems[c]) {
			g = this.gems[c][r];
            if(g.type == 'monster' && g.monster.stone == 1){
				g.monster.stone = 0;
				g.unsetSpecial();
			}
		}
	}
 }

 /**
  * 找到keep = false 的图标，然后将其移除
  */
 dm.Board.prototype.clearGem = function(notfill){
	 var s = [];
	 for (var c = 0; c < this.cols; c++) {
		 for (var r = 0; r < this.gems[c].length; r++) {
			 if(this.gems[c][r] && (this.gems[c][r].keep == false)){
				 if(this.gems[c][r].type == 'monster'){
					 this.gems[c][r].monster.endSkill();
				 }
				 this.gems[c][r].getParent().removeChild(this.gems[c][r]);
				 goog.array.remove(this.gems[c], this.gems[c][r]);
				 r--;
			 }
		 }
	 }
	 if(!notfill){
		 this.fillGems(this.genType);
		 this.moveGems();
	 }
 }

 /**
  * 读取存储的gems信息，重新填充board里面的gems
  */
 dm.Board.prototype.loadGems = function(gems){
	 var c, r, i;
	 for (c = 0; c < this.cols; c++) {
		 for (r = 0; r < this.rows; r++) {
			 this.gems[c][r].getParent().removeChild(this.gems[c][r]);
		 }
		 this.gems[c] = [];
	 }
	 for (c = 0; c < this.cols; c++) {
		 if (!this.gems[c]) this.gems[c] = [];
		 i = 0;
		 for (r = 0; r < this.rows; r++) {
			 i++;
			 var gem  = dm.Gem.random(this.GAP, this.GAP, gems[c][r].index);
			 var old  = gems[c][r];
			 var prop;
			 for(prop in old){
				 if(prop != "monster"){
					 gem[prop] = old[prop];
				 }
			 }

			 if(gem.type == 'monster'){
				 gem.monster = new dm.Monster(this.game.data.turn, gem, this.game, gems[c][r].monster.id);
				 for(prop in old.monster){
					 gem.monster[prop] = old.monster[prop];
				 }

				 gem.monster.changeDisp('hp');
				 gem.monster.changeDisp('def');
				 gem.monster.changeDisp('att');
			 }
			 gem.r = r;
			 gem.c = c;
			 gem.setPosition((c + .5) * this.GAP, (-i + .5) * this.GAP);

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
	 this.findGemsType();
 }

/**
 * 找到有特殊状态的gems，加载状态
 */
 dm.Board.prototype.setAllSpecial = function(){
	var c, r, i, gem;
	var status = {'isOnFire':true, 'canSelect':false, 'isBroken':true, 'stone':true, 'canAttack':false, 'poison':true};//可能的状态
	var disp = {'isOnFire':'Fire', 'canSelect':'discon', 'isBroken':'broken', 'stone':'stone', 'canAttack':'freeze', 'poison':'poison'};//可能的状态
    for (c = 0; c < this.cols; c++) {
        for (r = 0; r < this.rows; r++) {
			gem = this.gems[c][r];
			for(i in status){
				if(gem[i] == status[i] ||(gem.monster && gem.monster[i] == status[i])){ //处于其中的状态
					gem.setSpecial(disp[i]);
				}
			}
		}
	}
 }

/**
 * 技能对话框
 * @param {action} 
 *     study -- 学习; use -- 使用
 */
dm.Board.prototype.createSkillDialog = function(action){
	var user = this.game.user;
	action = "study";
	var dialog = new lime.Sprite().setSize(473, 416).setAnchorPoint(0, 0).
		setPosition(720/2-473/2, 1004/2-416/2).setFill(dm.IconManager.getImg("dmdata/dmimg/skilldialog.png"));
	this.game.appendChild(dialog);
	var btn_cancel = new lime.Sprite().setSize(87, 33).setAnchorPoint(0,0).
		setPosition(300, 335).setFill(dm.IconManager.getImg("dmdata/dmimg/cancel.png"));
	dialog.appendChild(btn_cancel);
	var textarea = new lime.RoundedRect().setSize(390, 150).setPosition(40, 160).setFill(0,0,0,.3).setAnchorPoint(0,0); 
	dialog.appendChild(textarea);
	var icon;
	switch(action){
		case "study":{
			var sn=0, frame, sk_key;
			for(i in this.game.user.data.skills){
				sn++;
			}
			if(sn < 4){ //可以随机新技能
				sk_key = user.randSel(user.findKey(dm.conf.SK), 2); //随机两个技能，选择学习或者升级
			}else if(sn == 4){
				sk_key = user.randSel(user.findKey(user.data.skills), 2);
			}
			for(i in sk_key){
				icon = new lime.Sprite().setSize(90, 85).setAnchorPoint(0,0).
					setPosition(46 + i*140, 42);
				icon.skill = dm.conf.SK[sk_key[i]]; //传递选中技能


		//		icon.button = btn; // 传递选中技能到btn中
				icon.textarea = textarea;
				icon.setFill(dm.IconManager.getImg('dmdata/dmimg/sk/'+sk_key[i]+'.png'));
				dialog.appendChild(icon);
				dialog.appendChild(textarea);
				goog.events.listen(icon, ['mousedown', 'touchstart'], function(){
					//技能相关描述
					this.textarea.removeAllChildren();
					//this.button.skill = this.skill;

					var nm = new lime.Label().setFontColor('#FFF').setFontSize(20).setAnchorPoint(0, 0).setPosition(0, 00);
					nm.setText(' 技能：'+this.skill['name']);
					this.textarea.appendChild(nm.setSize(textarea.getSize().width, nm.getSize().height));

					var disc = new lime.Label().setFontColor('#FFF').setFontSize(20).setAnchorPoint(0, 0).setPosition(0, 30);
					disc.setText(' 描述：'+this.skill['tips']);
					this.textarea.appendChild(disc.setSize(textarea.getSize().width, disc.getSize().height));

					var cd = new lime.Label().setFontColor('#FFF').setFontSize(20).setAnchorPoint(0, 0).setPosition(0, 60);
					cd.setText(' 冷却时间(轮)：'+this.skill['cd']);
					this.textarea.appendChild(cd.setSize(textarea.getSize().width, cd.getSize().height));

					var cost = new lime.Label().setFontColor('#FFF').setFontSize(20).setAnchorPoint(0, 0).setPosition(0, 90);
					cost.setText(' 魔法消耗：'+this.skill['mana']);
					this.textarea.appendChild(cost.setSize(textarea.getSize().width, cost.getSize().height));
				});
			};
			var btn_study = new lime.Sprite().setSize(87, 33).setAnchorPoint(0,0).setPosition(100,335).
				setFill(dm.IconManager.getImg("dmdata/dmimg/study.png"));
			dialog.appendChild(btn_study);

			break;
		}
		case "use":{

			break;
		}
	}
	/*

			 //-------------------------------------------------
			 //frame = new lime.RoundedRect().setSize(500, 300).setPosition(0, 130).setFill(0,0,0,.7).setRadius(20).setAnchorPoint(0,0); 
			 //btn = new dm.Button().setText(text).setSize(200, 50).setPosition(250, 470);
			 popdialog.appendChild(frame);
			 popdialog.appendChild(btn);

				 //

				 goog.events.listen(icon, ['mousedown', 'touchstart'], function() {
					 //技能相关描述
					 this.frame.removeAllChildren();
					 this.button.skill = this.skill;

					 var nm = new lime.Label().setFontColor('#FFF').setFontSize(20).setAnchorPoint(0, 0).setPosition(0, 10);
					 nm.setText(' 技能：'+this.skill['name']);
					 this.frame.appendChild(nm);

					 var disc = new lime.Label().setFontColor('#FFF').setFontSize(20).setAnchorPoint(0, 0).setPosition(0, 40);
					 disc.setText(' 描述：'+this.skill['tips']);
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
				 }else{
					 alert('choose one!');
				 }

			 });
			 */
}

