class FieldCellReaction {
  static attack(cell, value, turn, cellAttackingFrom, reflected = false) { 
         if (cell.isTrance) cell._log("exec_trance", 0);
    else if (cell.isConstant) cell._log("exec_constant", 0);
    else if (cell.checkShield()) cell._log("exec_shield", 1);
    else if (cell.targetChangeStatus) {
      cell._log("exec_targetchange", cell.targetChangeStatus.value);
      const target = cell.field._findCellByCardID(cell.targetChangeStatus.value);
      if (target) FieldCellReaction.attack(target, value);
    } else if (!reflected && cell.hasReflect) {
      cell._log("exec_reflect", 0);
      FieldCellReaction.attack(cellAttackingFrom, value, 0, this, true);
    } else if (cell.hasHealbar) {
      cell._log("exec_healbar", 0);
      FieldCellReaction.hpup(cell, value);
    } else {
      if (!reflected && cell.hasDamageTrap) {
        cell._log("exec_damagetrap", cell.targetChangeStatus.value);
        cell.exec_damagetrap(value, cellAttackingFrom);
      }
      if (!reflected && cell.hasPoisonTrap) {
        cell._log("exec_poisontrap", cell.targetChangeStatus.value);
        cell.exec_poisontrap(value, cellAttackingFrom);
      }
      if (cell.hasAntiDamage) {
        cell._log("exec_antidamage", 0);
      } else {
        value *= cell.field.rule.types[cellAttackingFrom.typeAttack].attackRateMatix[cell.typeDefense];
        cell.damage(value);
      }
    }
  }

  static death(cell, value) {
    if (cell.hasDeathTrap) {
      cell.exec_deathtrap();
    }
    if (cell.isTrance) {
      cell._log("exec_trance", 0);
    } else if (cell.hasAntiDeath) {
      cell._log("anti_death", 0);
    } else {
      cell.hp = 0;
      cell._log("exec_death", 0);
    }
  }

  static sacrifice(cell, value) {
    if (cell.isTrance) cell._log("exec_trance", 0);
    else {
      cell.hp = 0;
      cell._log("exec_sacrifice", 0);
    }
  }

  static rebirth(cell, value) {
    if (cell.hasAntiRebirth) {
      cell._log("anti_rebirth", 0);
    } else {
      cell.hp = value;
      cell._log("exec_rebirth", value);
    }
  }

  static shield(cell, value, turn) {
    if (cell._checkStable()) {
      cell.shield.push(new FieldCellStatus("shield", value, turn));
      cell._log("status_shield", value, turn);
    }
  }

  static spup(cell, value)   { if (cell._checkStable()) cell._log("update_sp", cell.sp+=value);}
  static spdown(cell, value) { if (cell._checkStable()) cell._log("update_sp", cell.sp = Math.max(cell.sp-value, 0)); }
  static hpup(cell, value)   { cell.exec_heal(value, cell.maxhp); }
  static hpupalt(cell, value){ cell.exec_heal(value, 9999); }
  static hpdown(cell, value) { if (cell._checkStable()) cell._log("update_hp", cell.hp = Math.max(cell.hp-value, 1)); }
  static swap(cell, value) {
    if (cell.field.cells[value].isDaed) {
      cell._log("move_failuer", value);
    } else {
      cell.field.sequence.push(new Log("move", 0, cell.id, value, 0));
      cell.field.sequence.push(new Log("move", 0, value, cell.id, 0));
    }
  }
  static setrebirth(cell, value, turn) {
    if (cell._checkStable()) {
      cell.rebirthStatus = new FieldCellStatus("setrebirth", value, turn);
    }
  }

  static repeat(cell, value)  { }
  static create(cell, value)  { cell._log("exec_create", value); }
  static synchro(cell, value) { cell._log("exec_synchro", value); }
  static pushback(cell, value) { cell._log("exec_pushback", value); }
  static cancel_aura(cell, value) { }
  static fieldstatus(cell, value) { }
  static hpeven(cell, value) { }
  static familieract(cell, value) { }
  static penetrate(cell, value) { }
  static energydrain(cell, value) { }
  static imm_curse(cell, value) { }
  static agascendant(cell, value) { } // nothing to do
}
