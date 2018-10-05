class FieldCell {
  constructor(field, playerID, cellIndex) {
    this.field = field;
    this.playerID = playerID;
    this.cellIndex = cellIndex;
    
    this.card = null;
    this.initializeBattle(0);
  }

  get id() { return this.playerID * 9 + this.cellIndex; }
  get range() { return (1<<this.id); }
  get cellRow() { return (this.cellIndex / 3)>>0; }
  get cellColumn() { return this.cellIndex % 3; }
  get dice() { return this.field._random(); }

  // status
  get ag() { return this.card.ag + this.agsup; }
  get at() { return this.card.at + this.atsup; }
  get type()           { return this.card.type; }
  get typeAttack()     { return this.card.type; }
  get typeDefense()    { return (this.typeChangeStatus) ? this.typeChangeStatus.value : this.card.type; }
  get shieldCount()    { return this.shield.reduce((sum, stat)=>(sum+stat.value), 0); }
  get damageBarrier()  { return this.status.reduce((sum, stat)=>((stat.type=="barrier")?(sum+stat.value):sum), 0); }
  get damageControl()  { return this.status.reduce((sum, stat)=>((stat.type=="damageup")?(sum+stat.value):(stat.type=="damagedown")?(sum-stat.value):sum), 0); }
  get isDead()         { return (this.hp == 0); }
  get isConstant()     { return this.status.some(s=>s.type=="constant"); }
  get isStabled()      { return this.status.some(s=>s.type=="stable"); }
  get isLocked()       { return this.status.some(s=>s.type=="lock"); }
  get isConfused()     { return this.status.some(s=>s.type=="confuse"); }
  get isTrance()       { return this.status.some(s=>s.type=="trance"); }
  get isUndead()       { return this.status.some(s=>s.type=="undead"); }
  get isATInverted()   { return this.status.some(s=>s.type=="invertat" || s.type=="invertagat"); }
  get isAGInverted()   { return this.status.some(s=>s.type=="invertag" || s.type=="invertagat"); }
  get hasReflect()     { return this.status.some(s=>s.type=="reflect"); }
  get hasPoison()      { return this.status.some(s=>s.type=="poison"); }
  get hasCurse()       { return this.status.some(s=>s.type=="curse"); }
  get hasBurst()       { return this.status.some(s=>s.type=="burst"); }
  get hasHeal()        { return this.status.some(s=>s.type=="heal"); }
  get hasHealbar()     { return this.status.some(s=>s.type=="healbar"); }
  get hasDamageTrap()  { return this.status.some(s=>s.type=="damagetrap"); }
  get hasPoisonTrap()  { return this.status.some(s=>s.type=="poisontrap"); }
  get hasDeathTrap()   { return this.status.some(s=>s.type=="deathtrap"); }
  get hasAntiDamage()  { return this.status.some(s=>s.type=="antidamage"); }
  get hasAntiHeal()    { return this.status.some(s=>s.type=="antiheal"); }
  get hasAntiDeath()   { return this.status.some(s=>s.type=="antideath"); }
  get hasAntiRebirth() { return this.status.some(s=>s.type=="antirebirth"); }
  get hasAvoidLethal() { return this.status.some(s=>s.type=="avoidlethal"); }

  get zero() { return 0; }
  get alive() { return this.field.countAlive(-1); }
  get dead()  { return this.field.countDead(-1); }
  get player_alive() { return this.field.countAlive(0); }
  get player_dead()  { return this.field.countDead(0); }
  get opponent_alive() { return this.field.countAlive(1); }
  get opponent_dead()  { return this.field.countDead(1); }
  get type0_count() { return this.field.countType(-1, 0); }
  get type1_count() { return this.field.countType(-1, 1); }
  get type2_count() { return this.field.countType(-1, 2); }
  get type3_count() { return this.field.countType(-1, 3); }
  get type4_count() { return this.field.countType(-1, 4); }
  get type5_count() { return this.field.countType(-1, 5); }
  get type6_count() { return this.field.countType(-1, 6); }
  get type7_count() { return this.field.countType(-1, 7); }
  get type8_count() { return this.field.countType(-1, 8); }
  get player_type0_count() { return this.field.countType(0, 0); }
  get player_type1_count() { return this.field.countType(0, 1); }
  get player_type2_count() { return this.field.countType(0, 2); }
  get player_type3_count() { return this.field.countType(0, 3); }
  get player_type4_count() { return this.field.countType(0, 4); }
  get player_type5_count() { return this.field.countType(0, 5); }
  get player_type6_count() { return this.field.countType(0, 6); }
  get player_type7_count() { return this.field.countType(0, 7); }
  get player_type8_count() { return this.field.countType(0, 8); }
  get opponent_type0_count() { return this.field.countType(1, 0); }
  get opponent_type1_count() { return this.field.countType(1, 1); }
  get opponent_type2_count() { return this.field.countType(1, 2); }
  get opponent_type3_count() { return this.field.countType(1, 3); }
  get opponent_type4_count() { return this.field.countType(1, 4); }
  get opponent_type5_count() { return this.field.countType(1, 5); }
  get opponent_type6_count() { return this.field.countType(1, 6); }
  get opponent_type7_count() { return this.field.countType(1, 7); }
  get opponent_type8_count() { return this.field.countType(1, 8); }

  // calculate probability 
  _calcProb(action) { return action.prob + (action.skill.row == 3) ? this.spprobsup : this.probsup; }
  _calcCritical(action) { 
    const dice = this.field._random();
    if (dice > action.crit1prob + action.crit2prob + this.critsup*2) return 0;
    if (dice > action.crit2prob + this.critsup) return 1;
    return 2;
  }

  // calculate range(18bit) on field from card spec. bit19 = sideattack flag.
  _calcRangeOnField(range, isRangeAbs, hasSideAttack) {
    // flip side
    if (this.playerID == 1) range = ((range & 0x3fe00)>>9) | ((range & 0x1ff)<<9);
    if (isRangeAbs) return range;

    let ret, pid = 1-this.playerID;
    switch (this.cellColumn) {
    case 0: // left
      ret = this._shiftRangeLeft(range);
      if (hasSideAttack) {
        if (!this.field._checkColumnCellsAlive(pid, 0)) {
          ret = ((!this.field._checkColumnCellsAlive(pid, 1)) ? range : this._shiftRangeRight(range)) | 0x40000;
        }
      }
      break;
    case 1: // center
      ret = range;
      if (hasSideAttack) {
        if (!this.field._checkColumnCellsAlive(pid, 1)) {
          ret = ((!this.field._checkColumnCellsAlive(pid, 2)) ? this._shiftRangeLeft(range) : this._shiftRangeRight(range)) | 0x40000;
        }
      }
      break;
    case 2: // right
      ret = this._shiftRangeRight(range);
      if (hasSideAttack) {
        if (!this.field._checkColumnCellsAlive(pid, 2)) {
          ret = ((!this.field._checkColumnCellsAlive(pid, 1)) ? range : this._shiftRangeLeft(range)) | 0x40000;
        }
      }
      break;
    }
    return ret;
  }
  _shiftRangeLeft(range)  { return  (range & 0x36db6) >> 1; }
  _shiftRangeRight(range) { return  (range & 0x1b6db) << 1; }


  //----- execution
  setCard(card) {
    this.card = card;
    this.initializeBattle(0);
  }

  // initialize before battle starts
  initializeBattle(cardid) {
    if (this.card) {
      this.maxhp = this.card.hp;
      this.maxsp = this.card.sp;
      this.hp = this.maxhp;
      this.sp = this.maxsp;
      this.cardid = cardid;
    } else {
      this.maxhp = 0;   // max HP
      this.maxsp = 0;   // max SP
      this.hp = 0;      // HP (0 means dead)
      this.sp = 0;      // SP
      this.cardid = 0;
    } 
    this.status = [];     // all status
    this.shield = [];     // all shield
    this.agsup = 0;     // additional at by status
    this.atsup = 0;     // additional ag by status
    this.probsup = 0;   // additional probability by status
    this.spprobsup = 0; // additional spcial attack probability by status
    this.critsup = 0;   // additional critical probability by status
    this.rebirthStatus = null;
    this.typeChangeStatus = null;   // type changed by status
    this.targetChangeStatus = null; // target changed by status
    this.done = false;
  }

  copyFrom(cell) {
    this.card   = cell.card;
    this.cardid = cell.cardid;
    this.maxhp = cell.maxhp;
    this.maxsp = cell.maxsp;
    this.atsup = cell.atsup;
    this.agsup = cell.agsup;
    this.probsup = cell.probsup;
    this.spprobsup = cell.spprobsup;
    this.critsup = cell.critsup;
    this.hp = cell.hp;
    this.sp = cell.sp;
    this.status = cell.status;
    this.shield = cell.shield;
    this.rebirthStatus = cell.rebirthStatus;
    this.typeChangeStatus = cell.typeChangeStatus;
    this.targetChangeStatus = cell.targetChangeStatus;
    this.done = cell.done;
  }

  // count down rebirth 
  rebirthCountDownPhase() {
    if (this.isDead && this.rebirthStatus) {
      if (--this.rebirthStatus.turn == 0) {
        this.rebirthStatus = null;
        this.rebirth();
      }
    }
  }

  // execute card.first_ability
  firstAbilirtyPhase() {
    if (this.field.turn == 1)     this.card.execAbility(this, "firstturn");
    if (this.field.turn % 5 == 0) this.card.execAbility(this, "5turnsevery");
    if (this.field.turn % 2 == 1) this.card.execAbility(this, "oddturns");
    if (this.field.turn % 2 == 0) this.card.execAbility(this, "eventurns");
    this.card.execAbility(this, "allturns");
  }

  // execute card.turn
  mainPhase() {
    let skillType = this.cellRow;
    if (--this.sp <= 0) {
      this.sp = 0;
      skillType = 3;
    }
    if (this.isLocked) {
      this._log("exec_lock", 0);
    } else if (this.isConfused) {
      this._log("exec_confuse", 0);
      /**/
    } else {
      if (skillType == 3) this.sp = this.maxsp;
      this.card.execSkill(this, skillType);
    }
  }

  // execute card.last_ability
  lastAbilirtyPhase() {
    this.card.execAbility(this, "allturnslast");
  }

  // decrease status.turn and update status, this calls FieldCellStatus.end() internally
  statusUpdatePhase() {
    let _filter = (stat)=>{
      if (--stat.turn > 0) return true;
      FieldCellStatus.end(this, stat.type, stat.value);
      return false;
    };
    if (!this.isDead) {
      this.status  = this.status.filter(_filter);
      this.shield  = this.shield.filter(_filter);
    }
  }


  //----- reactions
  _log(type, value, turn) {
    const log = new Log(type, 0, this.id, value, turn);
    this.field.sequence.push(log);
    return log;
  }

  _checkStable() {
         if (this.isTrance) this._log("exec_trance", 0);
    else if (this.isConstant) this._log("exec_constant", 0);
    else if (this.isStabled) this._log("exec_stable", 0);
    else return true;
    return false;
  }


  //----- subroutine for reactions, call from FieldCellReaction
  checkShield() {
    if (this.shield.length == 0) return false;
    if (--this.shield[0].value == 0) this.shield.shift();
    return true;
  }


  damage(value) {
    const dambar = this.damageBarrier,
          damcon = this.damageControl + 100;
    if (dambar > 0) {
      this._log("exec_barrier", dambar);
      value -= dambar;
    } else if (damcon != 100) {
      if (damcon < 0) damcon = 0;
      this._log("exec_damagectrl", damcon);
      value = Math.floor(value * damcon/100 + 0.5);
    }

    if (value < 0) value = 0;
    this.hp -= value;
    if (this.hp <= 0) {
      if (this.hasAntiHeal) {
        this._log("exec_antiheal", 0);
        this.hp = 1;
      } else {
        this.hp = 0;
      }
    }
    if (this.hp > this.maxhp) this.hp = this.maxhp;
    this._log("update_hp", this.hp);
    if (this.isConfused) FieldCellStatus.cancel(this, "confuse");
    if (this.isDead) this._log("dead", 0);
  }


  //---- execute by status
  exec_poison(value) {}
  exec_curse(value) {}
  exec_burst(value) {}

  exec_heal(value, max) {
    if (this._checkStable()) {
      this.hp = Math.min(this.hp+((this.isUndead) ? -value : value), max);
      this._log("update_hp", this.hp);
    }
  }

  exec_damagetrap(value, cellAttackingFrom) {
    this.status.forEach(status=>{
      if (status.type = "damagetrap") {
        cellAttackingFrom.react_attack(Math.floor(value * status.value / 100 + 0.5), 0, this, true);
      }
    });
  }

  exec_poisontrap(value, cellAttackingFrom) {
    this.status.forEach(status=>{
      if (status.type = "poisontrap") {
        //status.value = damage% + (turns << 8)
        let poisonRatio = status.value & 255,
            poisonTurn = status.value >> 8;
        cellAttackingFrom.react_poison(Math.floor(value * poisonRatio / 100 + 0.5), poisonTurn);
      }
    });
  }

  exec_deathtrap() {}
}
