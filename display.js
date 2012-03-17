goog.provide('dm.Display');

/**
 * 定义显示元素
 */
//dm = {}
dm.Display = {
	url:'dmdata/dmimg/',
	framework:{
		com:{
			width: 720,
			height: 1004
		},
		hor:{
			width: 1004,
			height: 720
		}
	},
	board:{ 
		size:600   //board 参数
	},
	init:function(){
		this.background = {pos:{x:this.framework.com.width/2, y:this.framework.com.height/2}, img:'background.png'}
		//panel
		this.score = {pos:{x:147, y:-440}, fontsize:30}
		this.hp = {pos:{x:244, y:444}, fontsize:30}
		this.mana = {pos:{x:-134, y:-458}, size:{w:192,h:11}}
		this.exp = {pos:{x:this.mana.pos.x, y:-430}, size:this.mana.size}
		this.player = {pos:{x:-250, y:-400}, size:{w:75, h:160}, img:{m:'boy.png', f:'girl.png'}}
		this.enemy = {pos:{x:285, y:-400}, size:{w:108, h:158}}
		this.box = {pos:{x:10, y:-393}, size:{w:90, h:80}, img:'box.png'}
		this.blood_bar = {pos:{x:245, y:404}, size:{w:76, h:130}, img:'blood_inside.png'}
		this.blood_mask = {pos:{x:0, y:65}, size:this.blood_bar.size}

		this.weapon = {pos:{x:-170, y:-350}, size:{w:64, h:64}, url:this.url+'equips/0_'}
		this.shield = {pos:{x:-170+85, y:-350}, size:this.weapon.size, url:this.url+'equips/1_'}

		this.defense = {pos:{x:-75, y:345}, fontsize:35}
		this.attack = {pos:{x:50, y:345}, fontsize:this.defense.fontsize}
		this.gold = {pos:{x:152, y:345}, fontsize:this.defense.fontsize}
		this.lvl = {pos:{x:-310, y:-330}, fontsize:30}
		this.turn = {pos:{x:317, y:353}, fontsize:this.lvl.fontsize}

		this.skillslot = {
			0:{pos:{x:-220, y:420}},
			1:{pos:{x:-104, y:420}},
			2:{pos:{x:14, y:420}},
			3:{pos:{x:128, y:420}},
			size:{w:90, h:85}
		}

		//charTip
		this.charTip = {
			pos:{x:-130, y:-390},
			size:{w:210, h:166},
			img:'chartip.png',
			substr:{
				lvl:{x:48, y:-65},
				b1:{x:-11, y:-45},
				b2:{x:75, y:-45},
				b3:{x:-11, y:-20},
				b4:{x:75, y:-20},
				a1:{x:50, y:0},
				a2:{x:50, y:24},
				a37:{x:15, y:43},
				a38:{x:15, y:67}
			}
		}

		//点击区域
		this.killarea= {pos:{x:-240, y:335}, size:{w:60, h:60}}
		//文字
		this.kill = {pos:{x:-173, y:345}, fontsize:35}
		//弹框
		this.killtip = {
			pos:{x:-190, y:280},
			size:{w:126, h:58},
			img:'killtip.png',
			sub:{
				common:{x:35, y:-16, value:'killcommon'},
				special:{x:35, y:7, value:'killspecial'}
			}
		}
		//board
		this.board.pos = {x:this.background.x, y:this.background.y}
		this.gemSize = this.board.size/2;
		this.gemImg = {
			'hp':this.url+'hp.png',
			'mana':this.url+'mana.png',
			'sword':this.url+'sword.png',
			'gold':this.url+'gold.png'
		}
		//
	}
}

//dm.Display.init();
//console.log(dm.Display);
