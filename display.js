goog.provide('dm.Display');
/*
goog.require('dm.Progress');
goog.require('lime.CanvasContext');
goog.require('lime.animation.RotateBy');
goog.require('lime.animation.MoveBy');
goog.require('lime.animation.Loop');
*/

/**
 * 定义显示元素
 * 
 */

dm.Display = {
//framework
	framework:{
		com:{
		//constant iPad size
			width: 720,
			height: 1004
		},
		hor:{
			width: 1004,
			height: 720
		},
		board: 690   //board 参数
	},
//
	btn:{
		com:{
			l:{
				width: 300,
				height: 90
			},
			s:{
				width: 140,
				height: 70
			}
		},
		hor:{
			l:{
				width: 90,
				height: 300
			},
			s:{
				width: 70,
				height: 140
			}
		}
	},

// 四个显示槽
	bar:{
		length: 260,
		width: 30,
		title:{ 
			exp:{color:'#00ff00', text:'经验'},
			gold:{color:'#ffff00', text:'金钱'},
			def:{color:'#0000ff', text:'防御'},
			hp:{color:'#ff0000', text:'生命'}
		},
		show:{
			current:0,
			max:100
		}
	},
//
	line:{
		length:690,
		width:2
	},

	score:{
		text:'得分',
		color:'#4f96ed'
	},

	turn:{
		text:'回合',
		color:'#4f96ed'
	},

	position:{
		btn_hint:{x:650,y:874}, //board面板下面的按钮
		btn_menu:{x:100,y:874},
		damage: {x:250, y:849},
		dmg_num:{x:360, y:849},
		attack :{x:250, y:879},
		att_num:{x:360, y:879},

		exp_l:  {x:30,  y:22},
		exp_p:  {x:220, y:22},
		gold_l: {x:370, y:22},
		gold_p: {x:560, y:22},
		def_l:  {x:30,  y:57},
		def_p:  {x:220, y:57},
		hp_l:   {x:370, y:57},
		hp_p:   {x:560, y:57}
		
	},


	gameboard:{
		sk1:{w:60, h:60, x:60, y:840}, 
		sk2:{w:60, h:60, x:134, y:(840+74)}, 
		sk3:{w:60, h:60, x:60, y:840}, 
		sk4:{w:60, h:60, x:134, y:(840+74)}, 

		blood_bar:{w:76, h:130, x:567, y:841},

		player:{w:75, h:160, x:70, y:30},
		enemy:{w:75, h:160, x:450, y:30},

		box:{w:90, h:90, x:325, y:65},

		menu:{w:104, h:40, x:580, y:60},

		stat:{w:104, h:40, x:580, y:125}

	}
}

