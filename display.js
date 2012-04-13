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
		this.mana = {pos:{x:-137, y:-456}, size:{w:120,h:11}, img:'mana_bar.png'}
		this.exp = {pos:{x:this.mana.pos.x, y:-428}, size:this.mana.size, img:'exp_bar.png'}
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
			0:{pos:{x:-220, y:422}},
			1:{pos:{x:-104, y:422}},
			2:{pos:{x:13, y:422}},
			3:{pos:{x:128, y:422}},
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

		this.bowClickArea = {pos:this.weapon.pos, size:this.weapon.size}
		this.bowTip = {pos:{x:-230, y:-260}, size:{w:205, h:120}, img: this.url+'bowtip.png'}
		this.shieldClickArea = {pos:this.shield.pos, size:this.shield.size}
		this.shieldTip = {pos:{x:-18, y:-260}, size:{w:205, h:120}, img: this.url+'shieldtip.png'}

		//点击区域
		this.killClickArea= {pos:{x:-240, y:335}, size:{w:60, h:60}}
		//文字
		this.killLabel = {pos:{x:-180, y:345}, fontsize:35, fontcolor:this.defense.fontcolor}
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
		this.menu = {
			size:{w:104, h:42},
			pos:{x:10, y:-470},
			img:this.url+'menu.png'
		}
		//
		this.topscoreLabelInner = { //游戏内的最高分显示
			fontsize:25,
			pos:{x:140, y:-386}
		}

		this.topscoreLabelEndGame = {
		}
		//
		this.itempop= {
			size:{w:473, h:416},
			pos:{x:this.framework.com.width/2, y:this.framework.com.height/2},
			img:this.url+'equipdialog.png',
			textarea:{
				pos:{x:0, y:20},
				size:{w:390, h:150}
			},
			buy:{
				pos:{x:0, y:150},
				img:this.url+'buy.png',
				size:{w:129, h:49}
			}
		}

		this.lvlpop= {
			size:{w:473, h:416},
			pos:this.itempop.pos,
			img:this.url+'charlvlup.png',
			textarea:{
				pos:{x:0, y:20},
				size:{w:390, h:150}
			},
			ok:{
				pos:{x:0, y:150},
				size:{w:129, h:49},
				img:this.url+'confirm.png'
			}
		}

		this.skpop= {
			textarea:{
				pos:{x:0, y:20},
				size:{w:390, h:150}
			},
			use:{
				size:{w:473, h:416},
				pos:this.itempop.pos,
				img:this.url+'skilluse.png',
				icon:{
					size:{w:90, h:85},
					pos:{x:-5, y:-125}
				}
			},
			study:{
				size:{w:473, h:416},
				pos:this.itempop.pos,
				img:this.url+'skilldialog.png'
			},
			btn_use:{
				size:this.lvlpop.ok.size,
				pos:{x:-130, y:150},
				img:this.url+'use.png'
			},
			btn_cancel:{
				size:this.lvlpop.ok.size,
				pos:{x:120, y:150},
				img:this.url+'cancel.png'
			},
			btn_study:{
				size:this.lvlpop.ok.size,
				pos:{x:-130, y:150},
				img:this.url+'study.png'
			}
		}

		this.popSelector = {
			size:{w:125, h:125},
			img:this.url + 'selected.png',
			one:{x:-143, y:-123},
			tow:{x:-5, y:-125}
		}
	}
}

//dm.Display.init();
//console.log(dm.Display);
