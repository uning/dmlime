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

	gem:{
		size:100
	},


	exp:{max:50, inc:5},
	mana:{max:50, inc:5},

	init:function(){
		this.background = {pos:{x:this.framework.com.width/2, y:this.framework.com.height/2}, img:'background.png'}
		//panel
		this.score = {pos:{x:147, y:-433}, fontsize:25}
		this.hp = {pos:{x:240, y:444}, fontsize:25, fontcolor:'#2482ff'}
		this.mana = {pos:{x:-137, y:-457}, size:{w:120,h:11}, img:'mana_bar.png'}
		this.exp = {pos:{x:this.mana.pos.x, y:-429}, size:this.mana.size, img:'exp_bar.png'}
		this.player = {pos:{x:-250, y:-400}, size:{w:75, h:160}, img:{m:'boy.png', f:'girl.png'}}
		this.enemy = {pos:{x:285, y:-400}, size:{w:108, h:158}}
		this.box = {pos:{x:10, y:-393}, size:{w:90, h:80}, img:'box.png'}
		this.blood_bar = {pos:{x:245, y:404}, size:{w:76, h:130}, img:'blood_inside.png'}
		this.blood_mask = {pos:{x:0, y:65}, size:this.blood_bar.size}

		this.weapon = {pos:{x:-170, y:-350}, size:{w:64, h:64}, url:this.url+'equips/0_'}
		this.shield = {pos:{x:-170+85, y:-350}, size:this.weapon.size, url:this.url+'equips/1_'}

		this.defense = {pos:{x:-77, y:345}, fontsize:35, fontcolor:"#693807"}
		this.attack = {pos:{x:46, y:345}, fontsize:this.defense.fontsize, fontcolor:this.defense.fontcolor}
		this.gold = {pos:{x:152, y:345}, fontsize:this.defense.fontsize, fontcolor:this.defense.fontcolor}
		this.lvl = {pos:{x:-310, y:-325}, fontsize:25}
		this.turn = {pos:{x:317, y:360}, fontsize:this.lvl.fontsize}

		this.skillslot = {
			0:{pos:{x:-220, y:420}},
			1:{pos:{x:-104, y:420}},
			2:{pos:{x:13, y:420}},
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
				a3:{x:50, y:24},
				a37:{x:15, y:43},
				a38:{x:15, y:67}
			}
		}

		//点击区域
		this.killarea= {pos:{x:-240, y:335}, size:{w:60, h:60}}
		//文字
		this.kill = {pos:{x:-180, y:345}, fontsize:35, fontcolor:this.defense.fontcolor}
		//弹框
		this.killtip = {
			pos:{x:-230, y:280},
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
		this.itempop= {
			size:{w:473, h:416},
			pos:{x:this.framework.com.width/2, y:this.framework.com.height/2},
			img:this.url+'skilldialog.png',
			buy:{
				pos:{x:0, y:150},
				size:{w:87, h:33},
				img:this.url+'buy.png'
			}
		}

		this.lvlpop= {
			size:{w:473, h:416},
			pos:this.itempop.pos,
			img:this.url+'skilluse.png',
			buy:{
				pos:{x:0, y:150},
				size:{w:87, h:33},
				img:this.url+'study.png'
			}
		}

		this.skpop= {
			use:{
				size:{w:473, h:416},
				pos:this.itempop.pos,
				img:this.url+'skilluse.png',
				btn_use:{
					size:{w:87, h:33},
					pos:{x:-130, y:150},
					img:this.url+'use.png'
				},
				btn_cancel:{
					size:{w:87, h:33},
					pos:{x:120, y:150},
					img:this.url+'cancel.png'
				}
			},
			study:{
				size:{w:473, h:416},
				pos:this.itempop.pos,
				img:this.url+'skilluse.png',
				btn_study:{
					size:{w:87, h:33},
					pos:{x:0, y:150},
					img:this.url+'study.png'
				}
			}
		}
	}
}

//dm.Display.init();
//console.log(dm.Display);
