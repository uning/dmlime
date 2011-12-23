goog.provide('dm.Gem');

goog.require('lime.Circle');

/**
 * Single bubble object
 * @constructor
 * @extends lime.Sprite
 */
dm.Gem = function() {
    goog.base(this);

    // grphical body obejct
    this.circle = new lime.Sprite();
    this.label = new lime.Label().setFontSize(15);
    this.label.domClassName = goog.getCssName('lime-button');
	
    this.domClassName = goog.getCssName('lime-button');
    this.appendChild(this.circle);
    this.appendChild(this.label);
	
	//最上层 特殊效果文字
	this.special = new lime.Label().setFontFamily('Trebuchet MS').setFontColor('#000').setFontSize(30).setAnchorPoint(0.5, 0.5).setOpacity(0);
	this.appendChild(this.special);
	
    this.selected_ = false;

    this.index = -1;
	this.r = 0 ;
	this.c = 0 ;

    this.qualityRenderer = true;
	
};
goog.inherits(dm.Gem, lime.Sprite);
 
//是否可以连接
dm.Gem.prototype.canConnect = function(g) {
	return (Math.abs(g.r - this.r) < 2 && Math.abs(g.c - this.c) < 2 )
	&& (g.index == this.index || 
		 (g.type == 'monster' && this.type == 'sword')|| (this.type == 'monster' && g.type == 'sword'))
}

/**
 * Generate bubble with random color
 * @return {dm.Gem} New bubble.
 */
dm.Gem.random = function(x, y) {

	//简单随机出
	//
    var gem = new dm.Gem();
    var id = Math.floor(Math.random() * dm.GEMTYPES.length);
    gem.index = id; 
	gem.type = dm.GEMTYPES[id];
	gem.label.setText(gem.type);
	gem.setSize(x,y);
	//生成属性
	gem.genAttribute();
    gem.circle.setFill('assets/ball_' + id + '.png');

    return gem;
};

/**
 * 产生特殊属性，如怪物技能等
 */
dm.Gem.prototype.genAttribute= function(){
	if (this.type == 'monster'){
		//属性
		this.attack = 1;
		this.hp = 1;
		this.hp_left = this.hp;
		this.def = 1;
		this.def_left = this.def;
		//标签
		var size = this.getSize(), h=size.height, w=size.width;
		this.attlabel = new lime.Label().setFontFamily('Trebuchet MS').setFontColor('#000').setFontSize(30).setAnchorPoint(1, 0.5).setText(this.attack);
		this.hplabel = new lime.Label().setFontFamily('Trebuchet MS').setFontColor('#f00').setFontSize(30).setAnchorPoint(1, 0.5).setText(this.hp_left);
		this.deflabel = new lime.Label().setFontFamily('Trebuchet MS').setFontColor('#00f').setFontSize(30).setAnchorPoint(1, 0.5).setText(this.def);
		this.appendChild(this.attlabel.setPosition(w*0.4, -h/4));
		this.appendChild(this.hplabel.setPosition(w*0.4, 0));
		this.appendChild(this.deflabel.setPosition(w*0.4, h/4));
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
    this.selected_ = false;
	
	if(this.type == 'monster'){
		
	}
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
    var size = this.getSize();
    this.circle.setSize(size.width * .75, size.height * .75);
    lime.Node.prototype.update.call(this);
};
