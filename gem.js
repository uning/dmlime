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
	this.isOnFire = false;

	this.r = 0 ;
	this.c = 0 ;

    this.qualityRenderer = true;
	
};
goog.inherits(dm.Gem, lime.Sprite);
//dm.GEMTYPES = ['monster','hp','mana','sword','gold'];
 
dm.Gem.prototype.ICONS = {
	'size':100
	,'monster':'monster.png'
	,'hp':'hp.png'
	,'mana':'mana.png'
	,'sword':'bow.png'
	,'gold':'gold.png'
};


//是否可以连接
dm.Gem.prototype.canConnect = function(g) {
	return (Math.abs(g.r - this.r) < 2 && Math.abs(g.c - this.c) < 2 )
	&& (g.type == this.type || (g.type == 'monster' && this.type == 'sword') || (g.type == 'sword' && this.type == 'monster'))
		//宝石怪如果进入倒计时状态，不可以和剑或者怪物连接，只能跟金币连接才可以杀死
	&& g.canSelect
}


/**
 * Generate bubble with random color
 * @return {dm.Gem} New bubble.
 * 如果指定了类型，则随机出某种类型的
 */
dm.Gem.random = function(w, h, index) {
	//简单随机出
	//
    var gem = new dm.Gem();
	if(typeof(index) === "undefined" || index == -1){
		var id = Math.floor(Math.random() * dm.GEMTYPES.length);
		gem.index = id; 
		gem.type = dm.GEMTYPES[id];
	}else{
		gem.index = index;
		gem.type = dm.GEMTYPES[index];
	}
	gem.setSize(w,h);

    //gem.circle.setFill('assets/ball_' + id + '.png');
	gem.fillImage();

    return gem;
};

dm.Gem.prototype.fillImage = function(img){
	if(!img){
		this.setFill(dm.IconManager.getImg('dmdata/dmimg/'+ this.ICONS[this.type]));//scale));
	}else{
		this.setFill(dm.IconManager.getImg('dmdata/dmimg/monster/'+ img + '.png'));//scale));
	}
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
	if(this.type == "monster"){
		this.monster.unsetKilled();
	}
    this.selected_ = false;
	
};

dm.Gem.prototype.setSpecial = function(str) {
	this.special.setText(str).setOpacity(1);
}

dm.Gem.prototype.unsetSpecial = function() {
	this.special.setOpacity(0);
}

