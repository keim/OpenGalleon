class Description {
  constructor() {
  }


  updateRule(rule) {
    this.wordTypes = rule.types.map(type=>type.name);
    this.wordSubTypes = rule.subtypes.map(type=>type.name);
    this.wordValueBase = Object.assign(rule.types.reduce((o, type)=>{
      o["type"+type.id+"_count"] = "フィールド全体の"+type.description+"カード数";
      o["player_type"+type.id+"_count"] = "自フィールドの"+type.description+"カード数";
      o["opponent_type"+type.id+"_count"] = "相手フィールドの"+type.description+"カード数";
      return o;
    }, {}), Description.wordValueBase);
    this.wordRarities = rule.rarities.map(type=>type.description);
    this.wordPackages = rule.packages.map(type=>type.description);
    this.cardDict = rule.cards;
  }

  toString(sequence) {
    const actions = sequence.actions;
    if (actions.length==0 || actions[0].properties.type=="none") return "(無し)";
    let ret = this.sequenceToString(sequence);
    if (actions.length==1 || actions[1].properties.type=="none") return ret + this.actionToString(0, actions[0].properties, true);
    ret += this.actionToString(0, actions[0].properties, false);
    if (Action.isSameRange(actions[0].properties, actions[1].properties)) return ret + "同範囲" + this._type(actions[1].properties, true);
    for (let i=1; i<actions.length; i++) {
      ret += this.actionToString(i, actions[i].properties, (i==actions.length-1));
    }
    return ret;
  }

  sequenceToString(seq) {
    const p = seq.properties;
    if (seq.isAbility) {
      return Description.wordConditionType[p.conditionType].replace("%v", p.conditionValue).replace("%c", this.wordTypes[p.conditionValue]) + Description.wordTrigger[p.trigger];
    } else if (seq.isSpecialMove) {
      return (p.turns < 2) ? "" : p.turns + "ターンの間、";
    }
    return "";
  }

  actionToString(i, act, isLast) {
    return this._target(i, act) + this._type(act, isLast);
  }

  _target(i, act) {
    return (!act.isRangeAbs && act.range == 0x00010 && (act.filterType == "alive"||act.filterType == "all")) ? "自身" : 
           (this._range(i, act)　+ this._filter(act) + this._condition(act));
  }

  _range(i, act) {
    return (act.isRangeAbs) ? (
      (act.range == 0x3ffff) ? "フィールド全体" :
      (act.range == 0x3fe00) ? "相手フィールド全体" :
      (act.range == 0x001ff) ? "自フィールド全体" : 
      (act.range == 0x00007 || act.range == 0x00e00) ? "前列" : 
      (act.range == 0x00038 || act.range == 0x07000) ? "中列" : 
      (act.range == 0x001c0 || act.range == 0x38000) ? "後列" : 
      (act.range == 0x0003f || act.range == 0x07e00) ? "前・中列" : ("範囲"　+ String(i+1))
    ) : (act.range == 0x00002) ? "自身の前" :
        (act.range == 0x00080) ? "自身の後" : ("範囲"　+ String(i+1));
  }

  _filter(act) {
    const filterValue = (act.filterType == "type") ? this._typeFilter(act) : 
                        (act.filterType == "cardid")  ? (this.cardDict[act.filterValue] && this.cardDict[act.filterValue].properties.name) : 
                        (act.filterType == "rarity")  ? this.wordRarities[act.filterValue] : 
                        (act.filterType == "package") ? this.wordPackages[act.filterValue] : String(act.filterValue);
    return ((act.filterType == "type") ? "の" + this._typeFilter(act) :
      (act.filterType == "alive" && act.count == 18) ? "の" :
      Description.wordFilterType[act.filterType].replace("%v", filterValue)
    ) + ((act.filterType == "void") ? "" : 
         (act.filterType == "all") ? Description.wordTarget[0] : Description.wordTarget[Action.rangeTarget(act)]);
  }

  _typeFilter(act) {
    let typeFilter    = (1<<this.wordTypes.length) - 1,
        subtypeFilter = (1<<this.wordSubTypes.length) - 1,
        typeFlags    = act.filterValue & typeFilter,
        subtypeFlags = act.filterValue >> this.wordTypes.length;
    return ((typeFlags == typeFilter　|| typeFlags == 0) ? "" : this.wordTypes.filter((t, i)=>((typeFlags & (1<<i))!=0)).join("・") + "属性の") + 
           ((subtypeFlags == subtypeFilter || subtypeFlags == 0) ? "" : this.wordSubTypes.filter((t, i)=>((subtypeFlags & (1<<i))!=0)).join("・") + "の")　;
  }

  _condition(act) {
    return (act.count == 18) ? ((Action.countCells(act) == 1) ? "" : "全て")　: ("の内、" + 
      ((act.sortBy == "dice") ? "ランダムに" : Description.wordSortBy[act.sortBy] + ((act.orderBy == -1)　?　"が高い" : "が低い")) + 
      String(act.count) + "体"
    );
  }

  _value(act) {
    return (act.valBase=="zero" || act.valRatio==0) ? act.valConst : 
           (this.wordValueBase[act.valBase] + "x" + String(act.valRatio) + ((act.valConst!=0) ? ("+"+String(act.valConst)) : ""));
  }

  _prob(act) {
    return (act.prob == 1) ? "" : String(act.prob*100) + "%の確率で";
  }

  _type(act, isLast) {
    var str = Description.wordActionType[act.type] + ((isLast) ? "。" : "、");
    if (act.type == "swap") {
      const cnt = Action.countCells(act);
      str = str.split("/")[(cnt<2)?0:(cnt==2)?1:2];
    }
    str = str.replace(/\[(.+)\|(.+)\]/, (isLast)?"$2":"$1");
    str = str.replace("%t", act.turns).replace("%v", this._value(act)).replace("%p", this._prob(act));
    return str.replace("%c", this.wordTypes[act.valConst]);
  }
}

Description.wordTarget = ["マス","敵","味方","敵味方"];
Description.wordRowName = {
  "front":  "前列",
  "support":"中列",
  "back":   "後列",
  "special":"特技",
  "ability":"能力"
};
Description.wordFilterType = {
  "all":"の",
  "alive":"で生存している",
  "dead":"で戦闘不能の",
  "void":"で空いているマス",
  "type":"の%v",
  "atgt":"でATが%v以上の",
  "atlt":"でATが%v以下の",
  "aggt":"でAGが%v以上の",
  "aglt":"でAGが%v以下の",
  "atrgt":"でATが元のATx%v以上の",
  "atrlt":"でATが元のATx%v以下の",
  "agrgt":"でAGが元のAGx%v以上の",
  "agrlt":"でAGが元のAGx%v以下の",
  "hpgt":"でHPが%v以上の",
  "hplt":"でHPが%v以下の",
  "spgt":"でSPが%v以上の",
  "splt":"でSPが%v以下の",
  "costgt":"でコストが%v以上の",
  "costlt":"でコストが%v以下の",
  "cardid":"でカード「%v」の",
  "package":"でパッケージ「%v」の",
  "rarity":"でレアリティ「%v」の",
  "poison":"で毒効果が付与された",
  "curse":"で呪い効果が付与された",
  "burst":"でバースト効果が付与された"
};
Description.wordSortBy = {
  "hp":"HP",
  "at":"AT",
  "ag":"AG",
  "sp":"SP",
  "cost":"コスト",
  "dice":"ランダム"
};
Description.wordValueBase = {
  "zero":"0",
  "at":"AT",
  "hp":"HP",
  "alive":"フィールド全体の生存カード数",
  "dead":"フィールド全体の戦闘不能カード数",
  "player_alive":"自フィールドの生存カード数",
  "player_dead":"自フィールドの戦闘不能カード数",
  "opponent_alive":"相手フィールドの生存カード数",
  "opponent_dead":"相手フィールドの戦闘不能カード数"
};
Description.wordActionType = {
  "none":"",
  "create":"を%p生成[し|する]",
  "swap":"と自身の位置を%p交換[し|する]/の位置を%p交換[し|する]/の位置を%pランダムに交換[し|する]",
  "pushback":"を%vマス%p後方の空いているマスに移動[し|させる]",
  "repeat":"で自身の直前に行動したキャラの通常行動を%pリピート[し|させる]",

  "attack":"に%vのダメージを%p与[え|える]",
  "death":"を%p戦闘不能に[し|する]",
  "rebirth":"を%p最大HPの%v%で復活[し|させる]",
  "sacrifice":"を%p犠牲に[し|する]",
  "agup":"のAGを%p%vアップ[し|する](%tターン)",
  "agdown":"のAGを%p%vダウン[し|する](%tターン)",
  "atup":"のATを%p%vアップ[し|する](%tターン)",
  "atdown":"のATを%p%vダウン[し|する](%tターン)",
  "agatup":"のAG・ATを%p%vアップ[し|する](%tターン)",
  "agatdown":"のAG・ATを%p%vダウン[し|する](%tターン)",
  "hpupalt":"のHPを%p最大値を超えて%v回復[し|する]",
  "probup":"の通常行動発動率を%p%vアップ[し|する](%tターン)",
  "probdown":"の通常行動発動率を%p%vダウン[し|する](%tターン)",
  "spprobup":"の特技発動率を%p%vアップ[し|する](%tターン)",
  "spprobdown":"の特技発動率を%p%vダウン[し|する](%tターン)",
  "critup":"のクリティカル率を%p%vアップ[し|する](%tターン)",
  "critdown":"のクリティカル率を%p%vダウン[し|する](%tターン)",
  "hpup":"のHPを%p%v回復[し|する]",
  "hpdown":"のHPを%p%vダウン[し|する]",
  "spup":"の特技ゲージを%p%v増や[し|す]",
  "spdown":"の特技ゲージを%p%v減ら[し|す]",
  
  "agascendant":"のAGを%p昇順化[し|する]",
  "cancel_aura":"のオーラ状態を%p解除[し|する]",
  "fieldstatus":"に%vのフィールドステータスを%p付与[し|する](%tターン)",
  "hpeven":"のHPを%p平均化[し|する]",
  "hpevenalt":"のHPを%p最大値を超えて平均化[し|する]",
  "familieract":"のファミリアの行動を%p%vに[し|する](%tターン)",
  "penetrate":"に%v%のダメージ貫通効果を%p与[え|える](%tターン)",
  "energydrain":"に%v%のエナジードレイン効果を%p与[え|える](%tターン)",
  "imm_curse":"の呪い効果を%p発動[し|する]",

  // status change
  "stable":"のステータス変化を%p無効に[し|する](%tターン)",
  "constant":"の即死・再生以外の全ての変化を%p無効に[し|する](%tターン)",
  "shield":"に%v枚のシールド(%tターン)を%p付与[し|する]",
  "reflect":"にダメージ反射効果を%p与[え|える](%tターン)",
  "barrier":"に%v%のダメージを軽減するバリアを%p付与[し|する](%tターン)",
  "undead":"にアンデッド効果を%p与[え|える](%tターン)",
  "poison":"に%vのダメージを与える毒効果を%p与[え|える](%tターン)",
  "curse":"に%vのダメージを与える呪い効果を%p与[え|える](%tターン)",
  "burst":"に%vのダメージを与えるバースト効果を%p与[え|える](%tターン)",
  "heal":"に%vの継続回復効果を%p与[え|える](%tターン)",
  "healbar":"にダメージの%v%を回復するヒールバリアを%p与[え|える](%tターン)",
  "invertat":"にAT反転効果を%p与[え|える](%tターン)",
  "invertag":"にAG反転効果を%p与[え|える](%tターン)",
  "invertagat":"にAG・AT反転効果を%p与[え|える](%tターン)",
  "lock":"を%p行動不能に[し|する](%tターン)",
  "confuse":"に混乱効果を%p与[え|える](%tターン)",
  "trance":"に%tターンのトランス効果を%p与[え|える]",
  "damagedown":"に%v%のダメージ軽減効果を%p与[え|える](%tターン)",
  "damageup":"に%v%のダメージ増加効果を%p与[え|える](%tターン)",
  "antidamage":"にダメージ無効効果を%p与[え|える](%tターン)",
  "antiheal":"に回復無効効果を%p与[え|える](%tターン)",
  "antideath":"に即死無効効果を%p与[え|える](%tターン)",
  "antirebirth":"に復活無効効果を%p与[え|える](%tターン)",
  "avoidlethal":"に即死回避効果を%p与[え|える](%tターン)",

  "synchro":"にシンクロ効果を%p与[え|える]",
  "setrebirth":"に%tターン後再生効果を%p与[え|える]",
  "typechange":"を%p%c属性に変更[し|する](%tターン)",
  "targetchange":"がダメージを受けた場合、%p攻撃対象を自分に変更[し|する](%tターン)",
  "damagetrap":"にダメージの%v%を返すダメージトラップを%p付与[し|する](%tターン)",
  "poisontrap":"にダメージの%v%を返すポイズントラップを%p付与[し|する](%tターン)",
  "deathtrap":"に、ランダムに%v体に即死効果を%p与えるデストラップを付与[し|する](%tターン)",
  "cancel_all":"にかかっている全効果を%p打ち消[し|す]",
  "cancel_atag":"にかかっているAT・AG変化を%p打ち消[し|す]",
  "cancel_positive":"にかかっているプラス効果を%p打ち消[し|す]",
  "cancel_negative":"にかかっているマイナス効果を%p打ち消[し|す]",
  "cancel_damagectrl":"にかかっているシールド・バリア・ダメ軽減効果を%p打ち消[し|す]",
  "cancel_damagealt":"にかかっているシールド・反射・ダメ軽減・ダメ無効効果を%p打ち消[し|す]",
  "cancel_damagedown":"にかかっているダメージ軽減効果を%p打ち消[し|す]",
  "cancel_damageup":"にかかっているダメージ増加効果を%p打ち消[し|す]",
  "cancel_reflect":"にかかっているダメージ反射効果を%p打ち消[し|す]",
  "cancel_barrier":"にかかっているダメージバリアを%p打ち消[し|す]",
  "cancel_undead":"にかかっているアンデッド効果を%p打ち消[し|す]",
  "cancel_poison":"にかかっている毒効果を%p打ち消[し|す]",
  "cancel_burst":"にかかっているバースト効果を%p打ち消[し|す]",
  "cancel_curse":"にかかっている呪い効果を%p打ち消[し|す]",
  "cancel_heal":"にかかっている継続回復効果を%p打ち消[し|す]",
  "cancel_healbar":"にかかっているヒールバリアを%p打ち消[し|す]",
  "cancel_lock":"にかかっている行動不能効果を%p打ち消[し|す]",

  "cancel_shield":     "にかかっているシールド効果を%p打ち消[し|す]",
  "cancel_antidamage": "にかかっているダメージ無効効果を%p打ち消[し|す]",
  "cancel_antirebirth":"にかかっている復活無効効果を%p打ち消[し|す]",
  "cancel_antiheal":   "にかかっている回復無効効果を%p打ち消[し|す]",
  "cancel_damagetrap": "にかかっているダメージトラップを%p打ち消[し|す]",
  "cancel_poisontrap": "にかかっているポイズントラップを%p打ち消[し|す]",
  "cancel_deathtrap":  "にかかっているデストラップを%p打ち消[し|す]",
  "cancel_probdown":   "にかかっている行動確率ダウン効果を%p打ち消[し|す]"
};

Description.wordConditionType = {
  "always": "",
  "typecount": "デッキを構成するカードの属性が%v種類の場合、",
  "cardcount": "デッキを構成するカード枚数が%v枚の場合、",
  "types": "デッキが%c属性のみで構成されている場合、"
};
Description.wordTrigger = {
  "firstturn"   :"戦闘開始時に、",
  "5turnsevery" :"第1,6,11,16ターン開始時に、",
  "oddturns"    :"奇数ターン開始時に、",
  "eventurns"   :"偶数ターン開始時に、",
  "allturns"    :"毎ターン開始時に、",
  "allturnslast":"毎ターン終了時に、"
};