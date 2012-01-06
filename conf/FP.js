goog.provide('dm.conf.FP');
	dm.conf.FP = {
    "a1": {
        "id": "a1",
        "def": "3",
        "inc": "0",
        "max": "-1",
        "name": "基础攻击力",
        "desc": "连骷髅图标时的初始攻击力"
    },
    "a2": {
        "id": "a2",
        "def": "1",
        "inc": "0",
        "max": "-1",
        "name": "武器攻击力",
        "desc": "每连1个武器图标的攻击力？每个图标对基础攻击力加成？"
    },
    "a3": {
        "id": "a3",
        "def": "0",
        "inc": "0",
        "max": "-1",
        "name": "基础防御力"
    },
    "a4": {
        "id": "a4",
        "def": "1",
        "inc": "0",
        "max": "-1",
        "name": "每点防御减少伤害",
        "desc": "防御值可以抵挡伤害值"
    },
    "a5": {
        "id": "a5",
        "def": "10",
        "inc": "1",
        "max": "-1",
        "name": "法力值上限"
    },
    "a6": {
        "id": "a6",
        "def": "100",
        "inc": "5",
        "max": "-1",
        "name": "生命值上限"
    },
    "a7": {
        "id": "a7",
        "def": "100",
        "inc": "0",
        "max": "100",
        "name": "强化升级上限",
        "desc": "当前值大于等于上限时,可以进行1次强化"
    },
    "a8": {
        "id": "a8",
        "def": "100",
        "inc": "0",
        "max": "100",
        "name": "金钱升级上限",
        "desc": "当前值大于等于上限时,可以购买1次新装备(旧装备提升属性)"
    },
    "a9": {
        "id": "a9",
        "def": "1",
        "inc": "0",
        "max": "1",
        "name": "每连1个血瓶图标获得当前生命值",
        "desc": "if(暴击几率)->基础*（1+加成比例\/100)+加成"
    },
    "a10": {
        "id": "a10",
        "def": "0",
        "inc": "5",
        "max": "100",
        "name": "blood暴击几率"
    },
    "a11": {
        "id": "a11",
        "def": "1",
        "inc": "1",
        "max": "8",
        "name": "blood暴击加成值"
    },
    "a12": {
        "id": "a12",
        "def": "0",
        "inc": "10",
        "max": "100",
        "name": "blood暴击值增加比例"
    },
    "a13": {
        "id": "a13",
        "def": "1",
        "inc": "1",
        "max": "5",
        "name": "每连1个金钱图标获得金钱值",
        "desc": "消除1个金钱图标后获得的当前金钱值"
    },
    "a14": {
        "id": "a14",
        "def": "5",
        "inc": "5",
        "max": "100",
        "name": "金钱暴击几率"
    },
    "a15": {
        "id": "a15",
        "def": "1",
        "inc": "1",
        "max": "5",
        "name": "金钱暴击加成值"
    },
    "a16": {
        "id": "a16",
        "def": "10",
        "inc": "10",
        "max": "100",
        "name": "金钱暴击值增加比例"
    },
    "a17": {
        "id": "a17",
        "def": "1",
        "inc": "1",
        "max": "5",
        "name": "每连1个经验图标获得经验值",
        "desc": "消除1个骷髅图标后获得的当前经验值"
    },
    "a18": {
        "id": "a18",
        "def": "5",
        "inc": "5",
        "max": "100",
        "name": "经验暴击几率"
    },
    "a19": {
        "id": "a19",
        "def": "1",
        "inc": "1",
        "max": "5",
        "name": "经验暴击加成值"
    },
    "a20": {
        "id": "a20",
        "def": "10",
        "inc": "10",
        "max": "100",
        "name": "经验暴击值增加比例"
    },
    "a21": {
        "id": "a21",
        "def": "1",
        "inc": "1",
        "max": "5",
        "name": "每连1个魔法图标获得魔法值",
        "desc": "消除1个魔法图标后获得的当前魔法值"
    },
    "a22": {
        "id": "a22",
        "def": "5",
        "inc": "5",
        "max": "100",
        "name": "魔法暴击几率"
    },
    "a23": {
        "id": "a23",
        "def": "1",
        "inc": "1",
        "max": "5",
        "name": "魔法暴击加成值"
    },
    "a24": {
        "id": "a24",
        "def": "10",
        "inc": "10",
        "max": "100",
        "name": "魔法暴击值增加比例"
    },
    "a25": {
        "id": "a25",
        "def": "0",
        "inc": "1",
        "max": "5",
        "name": "快速冷却",
        "desc": "技能cd时间减1"
    },
    "a26": {
        "id": "a26",
        "def": "0",
        "inc": "1",
        "max": "-1",
        "name": "生命恢复",
        "desc": "每回合生命恢复点数"
    },
    "a27": {
        "id": "a27",
        "def": "0",
        "inc": "1",
        "max": "-1",
        "name": "魔法恢复",
        "desc": "每回合魔法恢复点数"
    },
    "a28": {
        "id": "a28",
        "def": "0",
        "inc": "5",
        "max": "30",
        "name": "伤害转换为法力",
        "desc": "受到的伤害按比例转换为法力的提高"
    },
    "a29": {
        "id": "a29",
        "def": "0",
        "inc": "2",
        "max": "20",
        "name": "伤害减免",
        "desc": "降低最终受到的伤害值(按百分比)"
    },
    "a30": {
        "id": "a30",
        "def": "0",
        "inc": "2",
        "max": "10",
        "name": "属性加强",
        "desc": "基础属性按百分比加强"
    },
    "a31": {
        "id": "a31",
        "def": "0",
        "inc": "5",
        "max": "30",
        "name": "无视对方防御百分比",
        "desc": "攻击时无视对方的防御值"
    },
    "a32": {
        "id": "a32",
        "def": "0",
        "inc": "5",
        "max": "30",
        "name": "毒伤害几率"
    },
    "a33": {
        "id": "a33",
        "def": "0",
        "inc": "10",
        "max": "10",
        "name": "毒药buff伤害(无视防御)",
        "desc": "中毒的骷髅每回合受到多少毒药伤害"
    },
    "a34": {
        "id": "a34",
        "def": "0",
        "inc": "5",
        "max": "50",
        "name": "反弹伤害百分比",
        "desc": "每回合每个骷髅发生过攻击的骷髅必然损失的HP值"
    },
    "a35": {
        "id": "a35",
        "def": "0",
        "inc": "2",
        "max": "20",
        "name": "石化buff几率"
    },
    "a36": {
        "id": "a36",
        "def": "0",
        "inc": "5",
        "max": "20",
        "name": "吸血比例"
    },
    "a37": {
        "id": "a37",
        "def": "0",
        "inc": "2",
        "max": "20",
        "name": "双倍伤害几率",
        "desc": "伤害值*2"
    },
    "a38": {
        "id": "a38",
        "def": "0",
        "inc": "2",
        "max": "20",
        "name": "回避伤害几率",
        "desc": "完全不受伤害的概率"
    }
}