goog.provide 'dm'

goog.require 'goog.events'
goog.require 'goog.events.EventType'
goog.require 'goog.debug.DivConsole'
goog.require 'goog.dom'
goog.require 'bootstrap'
goog.require 'goog.dom.classes'
goog.require 'goog.object'
goog.require 'lime.Director'
goog.require 'lime.GlossyButton'
goog.require 'lime.Layer'
goog.require 'lime.Scene'
goog.require 'lime.transitions.Dissolve'
goog.require 'dm.Board'
goog.require 'dm.IconManager'
goog.require 'dm.Button'
goog.require 'dm.Game'
goog.require 'dm.Help'
goog.require 'dm.User'
goog.require 'dm.Display'

goog.require 'goog.net.XhrIo'
goog.require 'goog.json'
goog.require 'dm.Log'
goog.require 'dm.Login'

goog.require 'dm.Loader'
goog.require 'dm.LDB'


#constant iPad size
dm.WIDTH = 720
dm.HEIGHT = 1004
dm.BOARDSIZE = 690
dm.GEMTYPES = ['monster','hp','mana','sword','gold']
dm.SERVER='http://dm.playcrab.com/'
dm.SERVER='./'
dm.APIURL='api.php'

#返回json数据
dm.api  =(m,param,callback) ->
	dm.log.fine m,'api call ',param
	proc =(e)->
		xhr = e.target
		obj = xhr.getResponseJson()
		dm.log.fine m,'api response',obj
		callback && callback obj  #回调
	

	goog.net.XhrIo.send dm.APIURL+'?m='+m,proc,'POST',goog.json.serialize({m:m,p:param}),{'Content-Type':'application/json;charset=utf-8'}

# game start page
dm.loadCover = ->
	scene = new lime.Scene
	layer = new lime.Layer()
		.setPosition dm.WIDTH/2, dm.HEIGHT/2
	cover = new lime.Sprite()
		.setFill 'dmdata/dmimg/cover.png'
	layer.appendChild cover

	### btns ###
	#start = new lime.Sprite().setPosition(100, -230).setFill('dmdata/dmimg/cstart1.png')
	#load = new lime.Sprite().setPosition(120, -150).setFill('dmdata/dmimg/cload1.png')
	#score = new lime.Sprite().setPosition(140, -70).setFill('dmdata/dmimg/cscore1.png')
	#help = new lime.Sprite().setPosition(160, 10).setFill('dmdata/dmimg/chelp1.png')

	start = new lime.Sprite().setPosition(120, -150).setFill('dmdata/dmimg/cstart1.png')
	load = new lime.Sprite().setPosition(140, -70).setFill('dmdata/dmimg/cload1.png')
	score = new lime.Sprite().setPosition(140, -70).setFill('dmdata/dmimg/cscore1.png')
	help = new lime.Sprite().setPosition(160, 10).setFill('dmdata/dmimg/chelp1.png')

	goog.events.listen start, ['mousedown', 'touchstart'],
		(e)->
			this.setFill('dmdata/dmimg/cstart3.png')
			e.swallow ['mouseup', 'touchend', 'touchcancel'],
				()->
					this.setFill('dmdata/dmimg/cstart1.png')
					fc = ()->
							dm.newgame(6)
					fc()


	goog.events.listen help, ['mousedown','touchstart'],
		(e)->
			this.setFill('dmdata/dmimg/chelp3.png')
			e.swallow ['mouseup', 'touchend', 'touchcancel'],
				()->
					this.setFill('dmdata/dmimg/chelp1.png')
					dm.loadHelpScene()

	goog.events.listen load, ['mousedown', 'touchstart'],
		(e)->
			this.setFill('dmdata/dmimg/cload3.png')
			e.swallow ['mouseup', 'touchend', 'touchcancel'],
				()->
					this.setFill('dmdata/dmimg/cload1.png')
					dm.loadGame()

	goog.events.listen score, ['mousedown', 'touchstart'],
		(e)->
			this.setFill('dmdata/dmimg/cscore3.png')
			e.swallow ['mouseup', 'touchend', 'touchcancel'],
				()->
					this.setFill('dmdata/dmimg/cscore1.png')
					
	cover.appendChild start
	#cover.appendChild score
	cover.appendChild load
	cover.appendChild help

	#topscore = new lime.Sprite().setPosition(-230, -180).setFill('dmdata/dmimg/topscore.png').setSize(140, 50)
	#topscoreLabel = new lime.Label().setPosition(0, 8)
	#topscore.appendChild topscoreLabel
	#cover.appendChild topscore

	scene.appendChild layer
	dm.LDB.get('topscore',
		(data)->
			if data
				topscore = new lime.Sprite().setPosition(-230, -180).setFill('dmdata/dmimg/topscore.png').setSize(140, 50)
				topscoreLabel = new lime.Label().setPosition(0, 8).setText(data)
				topscore.appendChild topscoreLabel
				this.appendChild topscore
		, this)
	dm.director.replaceScene scene, lime.transitions.Dissolve

# load menu scene
dm.loadMenu =  ->
	scene = new lime.Scene
	layer = new lime.Layer()
		.setPosition dm.WIDTH / 2, 0

	btns = new lime.Layer()
		.setPosition( 0,0)
	layer.appendChild btns
	move = new lime.animation.MoveBy(-dm.WIDTH, 0).enableOptimizations()
	btn = dm.makeButton('开始').setPosition 0, 200
	goog.events.listen btn, ['click','touchstart'],
		->
			dm.log.fine 'game start'
			btns.runAction move

	btns.appendChild btn

	btn_help = dm.makeButton('帮助').setPosition 0, 400
	goog.events.listen btn_help, ['click','touchstart'],
		->
			dm.loadHelpScene()

	btns.appendChild btn_help

	btn_load = dm.makeButton('载入').setPosition 0, 600
	goog.events.listen btn_load, ['click','touchstart'],
		->
			dm.newgame(6)
			dm.game.loadGame()

	btns.appendChild btn_load
	#second area that will slide in
	
	btns2 = new lime.Layer 
	btns2.setPosition dm.WIDTH, 0

	btns.appendChild btns2 
	lbl = new lime.Label().setText('Select board size:').setFontColor('#fff').setFontSize(24).setPosition 0, 140
	btns2.appendChild lbl

	btn = dm.makeButton('6x6') .setPosition 0, 200
	goog.events.listen btn, 'click',
		->
			dm.newgame 6

	btns2.appendChild btn

	btn = dm.makeButton('7x7') .setPosition 0, 320
	goog.events.listen btn, 'click',
		->
			dm.newgame 7
	#btns2.appendChild btn

	btn = dm.makeButton('8x8') .setPosition 0, 440
	goog.events.listen btn, 'click',
		->
			dm.newgame 8

	#btns2.appendChild btn


	scene.appendChild layer

	# set current scene active
	dm.director.replaceScene scene, lime.transitions.Dissolve


# helper for same size buttons
dm.makeButton = (text)   ->
	btn = new dm.Button( text ).setSize 300, 90

dm.isBrokenChrome =   ->
	/Chrome\/9\.0\.597/ .test goog.userAgent.getUserAgentString 

# load new game scene
dm.newgame = (size)  ->
	func = (old)->
		if(typeof(old) == 'undefined' or old == null)
			old = false
		dm.game = new dm.Game(size, null, !old)
		dm.director.replaceScene(dm.game, lime.transitions.Dissolve)
	dm.LDB.get('olduser', func, this)
	#dm.game =   new dm.Game size
	#dm.director.replaceScene dm.game, lime.transitions.Dissolve


# load new help scene
dm.loadHelpScene = ->
	scene = new dm.Help
	dm.builtWithLime scene
	dm.director.replaceScene scene, lime.transitions.Dissolve

dm.loadGame = ->
	func = (data)->
		if(typeof(data) == 'undefined' or data == null)
			guide = true
			dm.game = new dm.Game(6, null, guide)
		else
			dm.game = new dm.Game(6, null, false)
			dm.game.loadGame()
		dm.director.replaceScene(dm.game, lime.transitions.Dissolve)
	dm.LDB.get('data', func, this)
	#dm.newgame 6
	#dm.game.loadGame()


# add lime credintials to a scene
dm.builtWithLime = (scene) ->
	return

###
#
# 检查版本
###
dm.checkVersion = ->
	#
	dm.LDB.get('uuid'
	,(uuid)->
		if not uuid
			uuid = dm.LDB.lc().uuid()
			dm.olduser = true
		dm.uuid = uuid
		dm.LDB.save('uuid',uuid)
		l = new dm.Loader()
		l.add({type:'js',src:dm.SERVER+'vc.php?uuid='+uuid})
		l.itemLoad = (succ)->
			if succ
				_VER = window._VER
				_VER and _VER.action()
		l.load()
	)



dm.hidegame = ->
	if(dm.ishide)
		return
	dm.director and dm.director.setPaused(true)
	$('.lime-director').hide()
	dm.ishide  = true
dm.showgame = ->
	if(not dm.ishide)
		return
	dm.director and dm.director.setPaused(false)
	$('.lime-director').show()
	dm.ishide  = false

dm.checkLoginDiv = ->
	dm.hidegame()
	el = document.getElementById ''
	if not el 
		el = goog.dom.createDom 'div',{class:'hidden',id:'register'}
		el.innerHTML = """
		"""
	$(el).show()

	  

dm.continuegame = ->
	$('.subpage').hide()
	$('.alert').hide()
	dm.showgame()
	return false


	



# entrypoint
dm.start = ->
	# Set up a logger to track responses
	el = document.getElementById 'gamearea'
	el or= document.body
	#el.height =  document.body.clientHeight
	$('#loading').hide()

	logdiv = document.getElementById 'log-wrapper'
	if not logdiv and goog.DEBUG
		logdiv = goog.dom.createDom 'div',{style:'
						 position: absolute;
						 width: 20%;
						 right: 0%;
						 height: 100%;
						 top: 40px;
						 overflow: auto;
						 border: 1px solid #cccccc;',id:'log-wrapper'}
		logdiv.innerHTML="""
					 <button id='log-clear-btn' class='lime-button'
					 style='width: 100%; height: 50px;  display: block;'
					 onclick="dm.Log.clear()">Clear</button>
						 <div id='log-div' style='border: 1px solid #cccccc; overflow: auto;'></div>
					 """
		goog.dom.appendChild el,logdiv
		goog.events.listen document.getElementById('log-clear-btn'), ['click','touchstart'],dm.Log.clear
		


	






	###
	goog.debug.LogManager.getRoot().setLevel goog.debug.Logger.Level.ALL
	dm.logconsole = new goog.debug.DivConsole document.getElementById 'log-div'
	dm.logconsole.setCapturing true
	# A helper function to handle events.
	dm.handler4Event = (elementType)->
		(e) ->
			dm.log.info elementType + ' ' + e.type + '.'
	###
	if goog.DEBUG
	   dm.Log.init document.getElementById('log-div'),'fine'
	else
	   dm.Log.init null,'fine'
	dm.log = dm.Log



	dm.director = new lime.Director el, dm.WIDTH, dm.HEIGHT
	dm.director.makeMobileWebAppCapable()

  #	dm.log.debug 'width',el.clientWidth,'height',el.clientHeight,'offsetX',el.offsetLeft,'offsetY',el.offsetTop
	dm.log.debug 'width'+' ' + el.clientWidth+' ' + 'height'+' ' + el.clientHeight+' ' + 'offsetX'+' ' + el.offsetLeft+' ' + 'offsetY'+' ' + el.offsetTop
	goog.events.listen( goog.global , ['orientationchange', goog.events.EventType.RESIZE]
		,(e)->
		  dm.log.debug 'goog.global@orientationchange|RESIZE',e
		  dm.log.debug 'width'+' '+el.clientWidth+' '+'height'+' '+ el.clientHeight+' '+'offsetX'+' ' + el.offsetLeft+' ' + 'offsetY'+' ' + el.offsetTop
	)
	#dm.loadMenu()
	dm.loadCover()
	dm.checkVersion()


#this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol 'dm.start', dm.start

	
