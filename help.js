goog.provide('dm.Help');

goog.require('lime.Label');
goog.require('lime.RoundedRect');
goog.require('lime.Scene');
goog.require('lime.Polygon');
goog.require('lime.Sprite');
goog.require('dm.Button');

/**
 * Help scene
 * @constructor
 * @extends lime.Scene
 */
dm.Help = function() {
    lime.Scene.call(this);

	/*
    var btn = new dm.Button('Back').setPosition(360, 870).setSize(300, 90);
    goog.events.listen(btn, 'click', function() {dm.loadMenu()});
    this.appendChild(btn);
	*/
	var start = new lime.Sprite().setSize(170, 50).setPosition(-80, 245);//.setFill(0,0,0,.7);
	var menu = new lime.Sprite().setSize(130, 50).setPosition(105, 245);//.setFill(0,0,0,.7);

	goog.events.listen(menu, ['mousedown', 'touchstart'], function(){dm.loadCover()});
	goog.events.listen(start, ['mousedown', 'touchstart'], function(){dm.newgame(6)});


	var i;
	var url = 'dmdata/dmimg/help';
	var ext = '.png'
	this.img = [];
	for(i=0;i<4;i++){
		this.img[i] = url + i + ext;
	}
	this.no = 0;

	this.contents = new lime.RoundedRect().setRadius(20).setFill(this.img[0]).setPosition(720/2, 1004/2);
	this.appendChild(this.contents);

	var last = new lime.Polygon().addPoints(-16, 0, 12, 20, 12, -20).setPosition(-29.5, 177.5);//.setFill(0,0,0, .7);
	var next = new lime.Polygon().addPoints(16, 0, -12, 20, -12, -20).setPosition(56.5, 177.5);//.setFill(0,0,0, .7);
	this.contents.appendChild(last);
	this.contents.appendChild(next);

		
	this.contents.appendChild(start);
	this.contents.appendChild(menu);

	goog.events.listen(last, ['mousedown', 'touchstart'], this.lastPage, false, this);
	goog.events.listen(next, ['mousedown', 'touchstart'], this.nextPage, false, this);

};
goog.inherits(dm.Help, lime.Scene);

dm.Help.prototype.pressHandler_ = function(e){

}

dm.Help.prototype.lastPage = function(){
	var url = 'dmdata/dmimg/help';
	var ext = '.png'
	if(this.no > 0){
		this.no -= 1;
	}else{
		this.no = 3;
	}
	this.contents.setFill(url+this.no+ext);
}

dm.Help.prototype.nextPage = function(){
	var url = 'dmdata/dmimg/help';
	var ext = '.png'
	if(this.no < 3){
		this.no += 1;
	}else{
		this.no = 0;
	}
	this.contents.setFill(url+this.no+ext);
}
