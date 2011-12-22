//set main namespace
goog.provide('dm');


//get requirements
goog.require('lime.Director');
goog.require('lime.GlossyButton');
goog.require('lime.Layer');
goog.require('lime.Scene');
goog.require('lime.transitions.Dissolve');
goog.require('dm.Board');
goog.require('dm.Button');
goog.require('dm.Game');
goog.require('dm.Help');
goog.require('dm.User');
goog.require('dm.Display');

//constant iPad size
dm.WIDTH = 720;
dm.HEIGHT = 1004;
dm.BOARDSIZE = 690;
dm.GEMTYPES = ['monster','blood','defend','sword','gold'];
//等级到每个属性定义
dm.LVLCONF = [
	{   
	 gold: 1000 
	,gold_add: 1
	,gold_ratio: 1  

	,defense:1000
	,hp:30
	,attack:3
	,wattack:1
	,exp:100
}
	,{gold:1000,defense:10000,hp:30,attack:3,wattack:1}
]


dm.curdata={
	gold: 0
	,defense:0
	,lvl:0
	,exp:0
	,hp:100
	,mhp:0
	,mdfense:0
}


// entrypoint
dm.start = function() {
/*
    //enable for non-seeded random. useful for debugging
    var pseudoRandom = new goog.testing.PseudoRandom(109);
    pseudoRandom.install();
    */

	dm.director = new lime.Director(document.body, dm.WIDTH, dm.HEIGHT);
	dm.director.makeMobileWebAppCapable();


	dm.loadMenu();

};

/**
 * Different modes
 * @enum {number}
 */
dm.Mode = {
    CLASSIC: 0,
    TIMED: 1
};

// load menu scene
dm.loadMenu = function() {
    var scene = new lime.Scene(),
	    layer = new lime.Layer().setPosition(dm.WIDTH / 2, 0);

	if(dm.isBrokenChrome()) layer.setRenderer(lime.Renderer.CANVAS);


/*
	var title = new lime.Sprite().setFill('assets/main_title.png').setPosition(0, 290);
	title.qualityRenderer = true;
	layer.appendChild(title);
*/

	var btns = new lime.Layer().setPosition(0, 430);
	layer.appendChild(btns);
	var move = new lime.animation.MoveBy(-dm.WIDTH, 0).enableOptimizations();

	var btn = dm.makeButton('开始').setPosition(0, 200);
	goog.events.listen(btn, 'click', function() {
		console.log('game start');
	    //dm.newgame(8);
	    btns.runAction(move);
	});
	btns.appendChild(btn);

	/*
	btn = dm.makeButton('Play Timed').setPosition(0, 320);
	goog.events.listen(btn, 'click', function() {
	    dm.usemode = dm.Mode.TIMED;
	    btns.runAction(move);
	});
	btns.appendChild(btn);

	btn = dm.makeButton('帮助').setPosition(0, 440);
	goog.events.listen(btn, 'click', function() {
	    dm.loadHelpScene();
	});
	btns.appendChild(btn);
    */


    //second area that will slide in
	
	//*
    var btns2 = new lime.Layer().setPosition(dm.WIDTH, 0);
    btns.appendChild(btns2);

    var lbl = new lime.Label().setText('Select board size:').setFontColor('#fff').setFontSize(24).setPosition(0, 140);
    btns2.appendChild(lbl);

    btn = dm.makeButton('6x6').setPosition(0, 200);
	goog.events.listen(btn, 'click', function() {
	    dm.newgame(6);
	});
	btns2.appendChild(btn);

    btn = dm.makeButton('7x7').setPosition(0, 320);
	goog.events.listen(btn, 'click', function() {
	    dm.newgame(7);
	});
	btns2.appendChild(btn);

    btn = dm.makeButton('8x8').setPosition(0, 440);
	goog.events.listen(btn, 'click', function() {
	    dm.newgame(8);
	});
	btns2.appendChild(btn);



	scene.appendChild(layer);
	//lime logo
	dm.builtWithLime(scene);
	//*/

	// set current scene active
	dm.director.replaceScene(scene, lime.transitions.Dissolve);
};

// helper for same size buttons
dm.makeButton = function(text) {
    var btn = new dm.Button(text).setSize(300, 90);
    return btn;
};

dm.isBrokenChrome = function(){
   return (/Chrome\/9\.0\.597/).test(goog.userAgent.getUserAgentString());
}

/*
dm.makeButton = function(size){

	return btn;
}*/

// load new game scene
dm.newgame = function(size) {
	dm.game =   new dm.Game(size);
	dm.director.replaceScene(dm.game, lime.transitions.Dissolve);
};

// load new help scene
dm.loadHelpScene = function() {
    var scene = new dm.Help();

	dm.builtWithLime(scene);
	dm.director.replaceScene(scene, lime.transitions.Dissolve);
};

// add lime credintials to a scene
dm.builtWithLime = function(scene) {
	return;
};

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('dm.start', dm.start);
