class Action {
  constructor(sequence, index) {
    this.sequence = sequence;
    this.index = index;
    this.properties = Object.assign({}, Action.defaultProperties);
  }

  // copy
  fromHash(hash) {
    if (hash.properties) hash = hash.properties;
    Object.assign(this.properties, Action.info[hash.type], hash);
  }

  toHash() {
    return {"properties" : this.properties};
  }

  // range check with others
  static isSameRange(prop1, prop2) {
    return (prop1.range == prop2.range && prop1.isRangeAbs == prop2.isRangeAbs);
  }

  // 0=?, 1=player, 2=opponent, 3=both
  static rangeTarget(prop) {
    return (((prop.range & 0x3fe00)!=0) ? 1 : 0) + (((prop.range & 0x001ff)!=0) ? 2 : 0);
  }

  // count cells in prop.range
  static countCells(prop) {
    let n = prop.range;
    n = (n & 0x15555)+(n>>1 & 0x15555);
    n = (n & 0x3333) +(n>>2 & 0x3333);
    n = (n & 0xf0f)  +(n>>4 & 0xf0f);
    return (n & 0xff)+(n>>8 & 0xff);
  }


  // exec one turn
  exec(cell) {
    const prop = this.properties;
    const field = cell.field, sequence = field.sequence;
    for (let t = prop.times; t>0; --t) {
      // calc range (taking account of side attack)
      const actionRange = cell._calcRangeOnField(prop.range, prop.isRangeAbs, prop.hasSideAtk);
      const reactionRange = field._calcReactionRange(actionRange, prop.filterType, prop.filterValue, prop.count, prop.sortBy, prop.orderBy);
      const sideAttackRatio = ((actionRange >> 18) & 1) ? 0.8 : 1;

      // check probability
      if (field._random() < cell._calcProb(this)) {
        const crit = cell._calcCritical(this);
        const critRatio = (crit == 2) ? prop.crit2ratio : (crit == 1) ? prop.crit1ratio : 1;
        const reactionValue = Math.floor((cell[prop.valBase] * prop.valRatio * critRatio + prop.valConst) * sideAttackRatio + 0.5);
        // push action log
        sequence.push(new Log("critical", 0, cell.id, crit, 0));
        sequence.push(new Log(prop.type, reactionRange, cell.id, reactionValue, prop.turns));
        for (let i=0; i<18; i++) {
          // push reaction log
          if (reactionRange & (1<<i)) {
            switch(prop.statusChange) {
            case "no":     FieldCellReaction[prop.type](field.cells[i], reactionValue, prop.turn, cell);  break;
            case "cancel": field.cells[i].cancelStatus(prop.targetStatus, reactionValue, prop.turns, cell); break;
            default:       field.cells[i].startStatus(prop.type, reactionValue, prop.turns, cell, prop.statusChange);  break;
            }
          }
        }
      } else {
        // push action failuer
        sequence.push(new Log("failed", reactionRange, cell.id, prop.type));
      }
    }
  }
}


Action.defaultProperties = {
  "type"       : "none",   // action タイプ
  "range"      : 0,        // 範囲(LSB 18bit=field)
  "isRangeAbs" : false,    // 相対範囲 or 絶対範囲
  "hasSideAtk" : true,     // サイドアタック有無
  "times"      : 1,        // 実施回数

  "filterType" : "alive",  // セル抽出条件 (alive, dead, type, atgt, atlt, aggt, aglt, hpgt, hplt, spgt, splt, costgt, costlt)
  "filterValue": 0,        // セル抽出条件の閾値
  "count"      : 18,       // 対象人数 (count=18の場合、フィルタした全員が対象となるため、ソートしない)
  "sortBy"     : "dice",   // 順序計算対象 (hp, at, ag, sp, cost, dice(ランダム))
  "orderBy"    : -1,       // 順序 (asc=1, dec=-1)
  "valBase"    : "at",     // 効果値算出のベース(at, hp, alive, dead, type0~4, player_**, opponent_**)
  "valRatio"   : 1,        // 効果値係数
  "valConst"   : 0,        // 効果値定数
  "prob"       : 1,        // 行動確率
  "turns"      : 1,        // 効果時間

  "aula"       : 0,        // オーラ(0=無し, 1=オーラ ,2=オーラR)
  "crit1prob"  : 0,        // クリティカル1 確率
  "crit2prob"  : 0,        // クリティカル2 確率
  "crit1ratio" : 1.5,      // クリティカル1 効果係数倍率
  "crit2ratio" : 2,        // クリティカル2 効果係数倍率
};

Action.info = {
  "none":        {"valueType":"none",     "statusChange":"no"},
  "create":      {"valueType":"cardid",   "statusChange":"no"},
  "swap":        {"valueType":"none",     "statusChange":"no"},
  "pushback":    {"valueType":"constant", "statusChange":"no"},
  "repeat":      {"valueType":"none",     "statusChange":"no"},

  "attack":      {"valueType":"coefficient", "statusChange":"no"},
  "death":       {"valueType":"none",        "statusChange":"no"},
  "rebirth":     {"valueType":"constant",    "statusChange":"no"},
  "sacrifice":   {"valueType":"none",        "statusChange":"no"},
  "agup":        {"valueType":"coefficient", "statusChange":"posi"},
  "agdown":      {"valueType":"coefficient", "statusChange":"nega"},
  "atup":        {"valueType":"coefficient", "statusChange":"posi"},
  "atdown":      {"valueType":"coefficient", "statusChange":"nega"},
  "agatup":      {"valueType":"coefficient", "statusChange":"posi"},
  "agatdown":    {"valueType":"coefficient", "statusChange":"nega"},
  "probup":      {"valueType":"constant",    "statusChange":"posi"},
  "probdown":    {"valueType":"constant",    "statusChange":"nega"},
  "spprobup":    {"valueType":"constant",    "statusChange":"posi"},
  "spprobdown":  {"valueType":"constant",    "statusChange":"nega"},
  "critup":      {"valueType":"constant",    "statusChange":"posi"},
  "critdown":    {"valueType":"constant",    "statusChange":"nega"},
  "hpup":        {"valueType":"coefficient", "statusChange":"no"},
  "hpdown":      {"valueType":"coefficient", "statusChange":"no"},
  "hpupalt":     {"valueType":"coefficient", "statusChange":"no"},
  "spup":        {"valueType":"constant",    "statusChange":"no"},
  "spdown":      {"valueType":"constant",    "statusChange":"no"},
  
  "agascendant": {"valueType":"none",        "statusChange":"no"},
  "cancel_aura": {"valueType":"none",        "statusChange":"nega"},
  "fieldstatus": {"valueType":"coefficient", "statusChange":"no"},
  "hpeven":      {"valueType":"none",        "statusChange":"no"},
  "hpevenalt":   {"valueType":"none",        "statusChange":"no"},
  "familieract": {"valueType":"actionid",    "statusChange":"no"},
  "penetrate":   {"valueType":"constant",    "statusChange":"posi"},
  "energydrain": {"valueType":"constant",    "statusChange":"posi"},
  "imm_curse":   {"valueType":"constant",    "statusChange":"no"},

  // status change
  "stable":      {"valueType":"none",        "statusChange":"changed"},
  "constant":    {"valueType":"none",        "statusChange":"changed"},
  "shield":      {"valueType":"constant",    "statusChange":"no"},
  "reflect":     {"valueType":"none",        "statusChange":"posi"},
  "barrier":     {"valueType":"constant",    "statusChange":"posi"},
  "undead":      {"valueType":"none",        "statusChange":"nega"},
  "poison":      {"valueType":"coefficient", "statusChange":"nega"},
  "curse":       {"valueType":"coefficient", "statusChange":"nega"},
  "burst":       {"valueType":"coefficient", "statusChange":"nega"},
  "heal":        {"valueType":"coefficient", "statusChange":"no"},
  "healbar":     {"valueType":"constant",    "statusChange":"posi"},
  "invertat":    {"valueType":"none",        "statusChange":"nega"},
  "invertag":    {"valueType":"none",        "statusChange":"nega"},
  "invertagat":  {"valueType":"none",        "statusChange":"nega"},
  "lock":        {"valueType":"none",        "statusChange":"nega"},
  "confuse":     {"valueType":"none",        "statusChange":"nega"},
  "trance":      {"valueType":"none",        "statusChange":"changed"},
  "damagedown":  {"valueType":"constant",    "statusChange":"posi"},
  "damageup":    {"valueType":"constant",    "statusChange":"nega"},
  "antidamage":  {"valueType":"none",        "statusChange":"posi"},
  "antiheal":    {"valueType":"none",        "statusChange":"nega"},
  "antideath":   {"valueType":"none",        "statusChange":"posi"},
  "antirebirth": {"valueType":"none",        "statusChange":"posi"},
  "avoidlethal": {"valueType":"constant",    "statusChange":"posi"},

  "synchro":           {"valueType":"none",     "statusChange":"changed"},
  "setrebirth":        {"valueType":"constant", "statusChange":"no"},
  "typechange":        {"valueType":"typeid",   "statusChange":"changed"},
  "targetchange":      {"valueType":"none",     "statusChange":"posi"},
  "damagetrap":        {"valueType":"constant", "statusChange":"posi"},
  "poisontrap":        {"valueType":"constant", "statusChange":"posi"},
  "deathtrap":         {"valueType":"none", "statusChange":"posi"},

  "cancel_all":        {"valueType":"none", "statusChange":"cancel", "statusType":"all"},
  "cancel_atag":       {"valueType":"none", "statusChange":"cancel", "statusType":"atag"},
  "cancel_positive":   {"valueType":"none", "statusChange":"cancel", "statusType":"positive"},
  "cancel_negative":   {"valueType":"none", "statusChange":"cancel", "statusType":"negative"},

  "cancel_damagectrl": {"valueType":"none", "statusChange":"cancel", "statusType":"damagectrl"},
  "cancel_damagedown": {"valueType":"none", "statusChange":"cancel", "statusType":"damagedown"},
  "cancel_damageup":   {"valueType":"none", "statusChange":"cancel", "statusType":"damageup"},
  "cancel_reflect":    {"valueType":"none", "statusChange":"cancel", "statusType":"reflect"},
  "cancel_barrier":    {"valueType":"none", "statusChange":"cancel", "statusType":"barrier"},
  "cancel_undead":     {"valueType":"none", "statusChange":"cancel", "statusType":"undead"},
  "cancel_poison":     {"valueType":"none", "statusChange":"cancel", "statusType":"poison"},
  "cancel_burst":      {"valueType":"none", "statusChange":"cancel", "statusType":"burst"},
  "cancel_curse":      {"valueType":"none", "statusChange":"cancel", "statusType":"curse"},
  "cancel_heal":       {"valueType":"none", "statusChange":"cancel", "statusType":"heal"},
  "cancel_healbar":    {"valueType":"none", "statusChange":"cancel", "statusType":"healbar"},
  "cancel_shield":     {"valueType":"none", "statusChange":"cancel", "statusType":"shield"},
  "cancel_lock":       {"valueType":"none", "statusChange":"cancel", "statusType":"lock"},
  "cancel_antidamage": {"valueType":"none", "statusChange":"cancel", "statusType":"antidamage"},
  "cancel_antirebirth":{"valueType":"none", "statusChange":"cancel", "statusType":"antirebirth"},
  "cancel_antiheal":   {"valueType":"none", "statusChange":"cancel", "statusType":"antiheal"}, 
  "cancel_damagealt":  {"valueType":"none", "statusChange":"cancel", "statusType":"damagealt"},
  "cancel_damagetrap": {"valueType":"none", "statusChange":"cancel", "statusType":"damagetrap"},
  "cancel_poisontrap": {"valueType":"none", "statusChange":"cancel", "statusType":"poisontrap"},
  "cancel_deathtrap":  {"valueType":"none", "statusChange":"cancel", "statusType":"deathtrap"},
  "cancel_probdown":   {"valueType":"none", "statusChange":"cancel", "statusType":"probdown"}
}
