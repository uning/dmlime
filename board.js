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
    this.setSize(this.SIZE, this.SIZE);
    /* mask out edges so bubbles flowing in won't be over game controls.
    this.maskSprite = new lime.Sprite().setSize(this.SIZE, this.SIZE)
    this.appendChild(this.maskSprite);
	this.setMask(this.maskSprite);
    // space that one bubble takes
	 //*/
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
	var c,r,pos;
	
    this.mm = new lime.animation.Spawn(
        new lime.animation.ScaleTo(1)
		,new lime.animation.FadeTo(1).setDuration(.8)
    ).enableOptimizations();

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
            pos = new goog.math.Coordinate((c + .5) * this.GAP - this.SIZE/2, this.getSize().height - (r + .5) * this.GAP -this.SIZE/2);
            //gem.setPosition((c + .5) * this.GAP - this.SIZE/2, (-i + .5) * this.GAP - this.SIZE/2);
			gem.setPosition(pos);
			gem.setScale(0.5);
			gem.setOpacity(0);
			this.mm.addTarget(gem);
            this.gems[c].push(gem);
            this.layers[c].appendChild(gem);
        }
    }
	this.show_att = this.fp.a1 + (this.game.data.attack_addtion || 0);
	this.show_dmg = this.getDamage();
	if(this.game.show_create == 1){
		//this.game.mon.setText(this.show_dmg);
		this.game.disp.attack.setText(this.show_att);
	}
	this.mm.play();
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
            pos = new goog.math.Coordinate((c + .5) * this.GAP - this.SIZE/2, this.getSize().height - (r + .5) * this.GAP -this.SIZE/2);
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
			//this.mm.play();
        },false, this);
    }else{
			//this.mm.play();
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
	


	this.checkStart();
	this.playerAction();
	this.monsterAttack();
	this.checkEnd();
	
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
dm.Board.prototype.playerAction = function(){
	var fireDmg = 0,i;
	var data = this.game.data,s=this.selectedGems;

	for(i=0;i<s.length;i++){
		s[i].keep = false;
		if(s[i].isOnFire == true){
			fireDmg += parseInt(data['fireDmg']);
		}
	}
	if(s[0].type == 'sword' || s[0].type == 'monster'){
		this.playerAttack(s);
	}else{
		this.gainGems(s);
	};
	//火焰伤害
	if(!data['noDmg']){
		this.game.updateData('hp', -fireDmg, 'add');//火焰伤害
	}
}

/**
 *玩家回合完成，怪物回合开始
 */
dm.Board.prototype.checkEnd = function(){
    var s = this.selectedGems;	
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
	this.game.disp.turn.setText(this.game.data.turn);
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
				//reduceDmg += monster.att //死亡怪物不再造成伤害，从总显示数值中去掉。
				//this.game.mon.setText(Math.max(0,this.getDamage() - reduceDmg));
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
		this.lineLayer.removeChild(this.lineEnd);
		this.lineEnd.setPosition(pos1);
		this.lineEnd.setRotation(degree);
		this.lineLayer.appendChild(this.lineEnd);
		this.trypos = trypos || false;
	}
	if(g){
		g.select();
		dm.log.fine('addSelGem',g.r,g.c)
		//实时计算伤害：
		if(g.type == 'sword' && !g.isBroken){
			this.show_att += this.fp.a2;
			//显示
			this.game.disp.attack.setText(this.show_att);
		}
		this.selectedGems.push(g);
	}
}

/**
 * 取消选择
 */
dm.Board.prototype.cancelSelGem = function(selid){
	var rotation,lc=this.lineLayer.children_;
	this.lineLayer.removeChildAt(lc.length-1); //箭头
	while(this.selectedGems.length > selid + 1){
		g = this.selectedGems.pop();
		g.deselect();
		if(g.type == 'sword' && !g.isBroken){
			this.show_att -= this.fp.a2;
			this.game.disp.attack.setText(this.show_att);
		}
		if(g.type == 'monster'){
			g.unsetSpecial();
			this.show_dmg = this.getDamage();
			//this.game.mon.setText(this.show_dmg);
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
 * 根据新的移动位置，寻找可能选择的gem
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
	dm.log.fine(e.type);
    if (this.isMoving_) {
		dm.log.fine('pressHandler_ : isMoving_');
		return;
	}
	if((e.type =='mousemove' || e.type == 'touchmove' || e.type == 'gesturechange')){
		if(! this.doing_ ){
			dm.log.fine('pressHandler_ : not doing ');
			return;
		}

	}
	this.selectedGems = this.selectedGems || [];
	//结束
	if(e.type == 'mouseup'  || e.type == 'touchend' || e.type == 'touchcancel' || e.type == 'gestureend'){
		dm.log.fine('pressHandler_: end ,event restart  '+e.type);
		lime.scheduleManager.changeDirectorActivity(dm.directory,true);

		this.doing_ = false;
		for( i = 0 ;i < this.selectedGems.length ; i ++){
			this.selectedGems[i].deselect();
			this.selectedGems[i].unsetSpecial();
			if(this.selectedGems[i].type == 'sword'){
				this.show_att -= this.fp.a2;
				this.game.disp.attack.setText(this.show_att);					
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

	pos.x += this.SIZE/2;
	pos.y += this.SIZE/2; //中心偏移
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
		dm.log.fine('choose last ret');
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
				dm.log.fine('pressHandler_: cancel to' + selid )
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
		dm.log.fine('pressHandler_ start pause:'+e.type);
		lime.scheduleManager.changeDirectorActivity(dm.directory,false);
        e.swallow(['mouseup','mousemove','touchmove','mouseover', 'touchend','touchcancel','gestureend','gesturechange'], dm.Board.prototype.pressHandler_);
    }
	//如果不相邻
	if(lastg && !lastg.canConnect(g) || !g.canSelect){
		//	this.addSelGem(null,e.position);//记录try pos

		//寻找两点间 相邻点
		var g2 = g ,g1 = lastg , g3;
		r = g2.r - g1.r,c = g2.c - g1.c
		var rab  = r > 0 ? r : -r ,cab = c > 0 ? c : -c;



		if ( cab >= rab ){
			delta = c > 0 ? 1 : -1;
			for(i = g1.c + delta ; ;i += delta ){
				if(i != g2.c){
					g3 = this.gems[i][g1.r + Math.round((i - g1.c)*r/c)];
					if(lastg.canConnect(g3)){
						this.addSelGem(g3);
						lastg = g3;
						this.checkLine(this.selectedGems);
						dm.log.fine('line add ',g3.r,g3.c)
					}else{
						dm.log.fine('g3 not add ',g3.r,g3.c)
					}
					//ret.push([g1.r + Math.round((i - g1.c)*r/c),i] )
				}else
					break

			}
		}else{
			delta = r > 0 ? 1 : -1;
			for(i = g1.r + delta ; ;i += delta ){
				if(i != g2.r){
					g3 = this.gems[g1.c + Math.round((i - g1.r)*c/r)][i];
					if(lastg.canConnect(g3)){
						this.addSelGem(g3);
						this.checkLine(this.selectedGems);
						dm.log.fine('line add ',g3.r,g3.c)
						lastg = g3;
					}else{
						dm.log.fine('g3 not add ',g3.r,g3.c)
					}
					//ret.push([i,g1.c + Math.round((i - g1.r)*c/r)] )
				}else
					break

			}
		}
		dm.log.fine('not connect : ',g1.r,g1.c,g2.r,g.c);
		return;
	}
	//this.lastPos = e.poistion;
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
				m = this.gems[c][r].monster;
				if(m.stone == 0 && m.canAttack && m.hp > 0){
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

 dm.Board.prototype.getBaseAttack = function(){
	return this.game.user.data.fp['a1'] || 0;
 }

 //传入game对象，要设定的类型
 //更新显示数值
 dm.Board.prototype.changeProg = function(game,type){
	 switch(type){
		 case 'exp':{
			 break;
		 }
		 case 'gold':{
			 game.disp.gold.setText(game.data.gold);
			 //game.show_vars[type]._pg.setProgress(game.data[type]/100);
			 //game.disp.gold._lct.setText(game.data[type]+'/'+100);
			 break;
		 }
		 case 'hp':{
			 game.disp.hp.setText(game.data['hp']+'/'+game.user.data.fp.a6);
			 var size = game.disp.blood_mask.getSize();
			 game.disp.blood_mask.setSize(size.x, size.y*game.data['hp']/game.user.data.fp.a6);
			 break;
		 }
		 case 'mana':
			 //game.show_vars['mana']._pg.setProgress(game.data['mana']/game.user.fp.a5);
			 //game.show_vars['mana']._lct.setText(game.data['mana']+'/'+game.user.data.fp.a5);
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
	 var s = [],g,c,r,cc;
    var action = new lime.animation.Spawn(
        new lime.animation.ScaleTo(0).setDuration(.6),
        new lime.animation.FadeTo(0).setDuration(.6)
    ).enableOptimizations();

	 for (c = 0; c < this.cols; c++) {
		 cc = this.gems[c];
		 for (r = 0; r < cc.length; r++) {
			 g = cc[r];
			 if( g && g.keep == false){
				 if(g.type == 'monster'){
					 g.monster.endSkill();
				 }

				 g.getParent().removeChild(g);
				 goog.array.remove(cc, g);
				 r--;
				//action.addTarget(g);
			 }
		 }
	 }
	 if(!notfill){
		 this.fillGems(this.genType);
		 this.moveGems();
	 }
	// action.play();
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
		// this.game.mon.setText(this.show_dmg);
		 this.game.disp.attack.setText(this.show_att);
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

