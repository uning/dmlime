goog.provide('dm.Gem');

goog.require('dm.Monster');


/**
 * Single bubble object
 * @constructor
 * @extends lime.Sprite
 */
dm.Gem = function() {
    goog.base(this);

    // grphical body obejct
    this.domClassName = goog.getCssName('lime-button');

	/*
    this.label = new lime.Label().setFontSize(15);
    this.label.domClassName = goog.getCssName('lime-button');
	
    this.appendChild(this.label);
	*/

    this.circle = new lime.Sprite();
    this.appendChild(this.circle);
	
	//最上层 特殊效果文字
	this.special = new lime.Label().setFontFamily('Trebuchet MS').setFontColor('#000').setFontSize(30).setAnchorPoint(0.5, 0.5).setOpacity(0);
	this.appendChild(this.special);
	
    this.selected_ = false;

    this.index = -1;
	this.keep = true;

	this.canSelect = true; //可不可以连接
	this.isBroken = false; //可不可以起作用

	this.r = 0 ;
	this.c = 0 ;

    this.qualityRenderer = true;
	
};
goog.inherits(dm.Gem, lime.Sprite);
 
dm.Gem.prototype.ICONS = {
	'size':52
	,'hp':{x:0,y:0}
	,'monster':{x:0,y:53}
	,'gold':{x:0,y:105}
	,'mana':{x:0,y:512}
	,'sword':{x:0,y:212}
};


//是否可以连接
dm.Gem.prototype.canConnect = function(g) {
	return (Math.abs(g.r - this.r) < 2 && Math.abs(g.c - this.c) < 2 )
	&& (g.index == this.index || 
		//宝石怪如果进入倒计时状态，不可以和剑或者怪物连接，只能跟金币连接才可以杀死
		 (g.type == 'monster' && (g.monster.id != 15 || (g.monster.id == 15 && g.monster.revive_timeout == -1)) && this.type == 'sword') ||

		 (this.type == 'monster' && (this.monster.id != 15 || (this.monster.id == 15 && this.monster.revive_timeout == -1)) 
		  && this.monster.id != 15 && g.type == 'sword') ||
		 //
		 //宝石怪物，死亡后需要和金币一起消除才能消灭
		 (this.monster.id == 15 && this.monster.killed == true && g.type == 'gold') ||
		 (this.type == 'gold' && g.type == 'monster' && g.monster.killed == true)
	   ) 
	&& g.canSelect
}


/**
 * Generate bubble with random color
 * @return {dm.Gem} New bubble.
 * 如果指定了类型，则随机出某种类型的
 */
dm.Gem.random = function(w, h, type) {
	//简单随机出
	//
    var gem = new dm.Gem();
	if(!type || type == -1){
		var id = Math.floor(Math.random() * dm.GEMTYPES.length);
		gem.index = id; 
		gem.type = dm.GEMTYPES[id];
	}else{
		gem.index = type;
		gem.type = dm.GEMTYPES[type];
	}
	//gem.label.setText(gem.type);
	gem.setSize(w,h);

    //gem.circle.setFill('assets/ball_' + id + '.png');
	gem.fillImage(w,h);

    return gem;
};

dm.Gem.prototype.fillImage = function(w,h){
	/*
	var x =   Math.floor(Math.random() * this.ICONS.xmax),size = this.ICONS['size']
	 x = 0;

	 x  *=  (this.ICONS.xgap + size) 
	 y = (this.ICONS.ygap + size)* this.ICONS[this.type].y   
	 */
	 var x,y,scale,size
	 x = this.ICONS[this.type].x
	 y = this.ICONS[this.type].y
	 size = this.ICONS['size']

	 scale = w/(size+2) ;
	 //console.log(size,x,y,scale)
	 this.setFill(dm.IconManager.getFileIcon('assets/tiles.png',x,y,scale));
	
}

/**
 * Select bubble. Show highlight
 */
dm.Gem.prototype.select = function() {
    if (this.selected_) return;
    var size = this.getSize().clone();
    this.highlight = this.highlight || new lime.Sprite().setSize(size).setFill('assets/selection.png');
    this.appendChild(this.highlight, 0);
    this.selected_ = true;
};

/**
 * Remove selection highlight form bubble.
 */
dm.Gem.prototype.deselect = function() {
    if (!this.selected_) return;
    this.removeChild(this.highlight);
    this.selected_ = false;
	
};


dm.Gem.prototype.setSpecial = function(str) {
	this.special.setText(str).setOpacity(1);
}

dm.Gem.prototype.unsetSpecial = function() {
	this.special.setOpacity(0);
}


/**
 * @inheritDoc
 */
dm.Gem.prototype.update = function() {

    // make circle size relative form bubble size
    // todo: replace with AutoResize mask
	/*
    var size = this.getSize();
    this.circle.setSize(size.width * .75, size.height * .75);
	//*/
    lime.Node.prototype.update.call(this);
};
