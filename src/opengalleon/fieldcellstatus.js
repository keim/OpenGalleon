class FieldCellStatus {
  constructor(type, value, turn, statusType) {
    this.type = type;
    this.value = value;
    this.turn = turn;
    this.statusType = statusType;
  }


  static start(cell, type, value, turn, cellActionFrom, statusType) {
    if (cell._checkStable()) {
      switch(type) {
        case "agup":   if (cell.isAGInverted) value=-value; cell.agsup+=value; cell._log("update_ag", cell.ag); break;
        case "agdown": if (cell.isAGInverted) value=-value; cell.agsup-=value; cell._log("update_ag", cell.ag); break;
        case "atup":   if (cell.isATInverted) value=-value; cell.atsup+=value; cell._log("update_at", cell.at); break;
        case "atdown": if (cell.isATInverted) value=-value; cell.atsup-=value; cell._log("update_at", cell.at); break;
        case "probup":     cell.probsup += value; cell._log("update_prob", cell.probsup); break;
        case "probdown":   cell.probsup -= value; cell._log("update_prob", cell.probsup); break;
        case "spprobup":   cell.spprobsup += value; cell._log("update_spprob", cell.spprobsup); break;
        case "spprobdown": cell.spprobsup -= value; cell._log("update_spprob", cell.spprobsup); break;
        case "critup":     cell.critsup += value; cell._log("update_crit", cell.critsup); break;
        case "critdown":   cell.critsup -= value; cell._log("update_crit", cell.critsup); break;
        case "typechange":   cell.typeChangeStatus   = cell._log("status_typechange", value, turn); break;
        case "targetchange": cell.targetChangeStatus = cell._log("status_targetchange", value = cellActionFrom.cardid, turn); break;
        case "agatup":
          FieldCellStatus.start(cell, "agup", value, turn, cellActionFrom, statusType);
          FieldCellStatus.start(cell, "atup", value, turn, cellActionFrom, statusType);
          break;
        case "agatdown":
          FieldCellStatus.start(cell, "agdown", value, turn, cellActionFrom, statusType);
          FieldCellStatus.start(cell, "atdown", value, turn, cellActionFrom, statusType);
          break;
        default:
          cell._log("status_"+type, value, turn);
          break;
      }

      cell.status.push(new FieldCellStatus(type, value, turn, statusType));
    }
  }


  static cancel(cell, cancelStatusType, value, turn, cellActionFrom) {
    if (cell._checkStable()) {
      switch (cancelStatusType) {
        case "all":
          cell.status = cell.status.filter(stat=>stat.end(cell));
          break;
        case "agat":
          cell.status = cell.status.filter(stat=>(!FieldCellStatus.isAGATStatus[stat.type]) || stat.end(cell));
          break;
        case "positive":
          cell.status = cell.status.filter(stat=>(!stat.statusType == "posi") || stat.end(cell));
          break;
        case "negative":
          cell.status = cell.status.filter(stat=>(!stat.statusType == "nega") || stat.end(cell));
          break;
        case "damagectrl":
          FieldCellStatus.cancel(cell, "shield");
          FieldCellStatus.cancel(cell, "barrier");
          FieldCellStatus.cancel(cell, "damagedown");
          break;
        case "damagealt":
          FieldCellStatus.cancel(cell, "shield");
          FieldCellStatus.cancel(cell, "reflect");
          FieldCellStatus.cancel(cell, "antidamage");
          FieldCellStatus.cancel(cell, "damagedown");
          break;
        case "shield":
          cell.shield = [];
          cell._log("status_end_shield", 0);
          break;
        default:
          cell.status = cell.status.filter(stat=>(stat.type != cancelStatusType) || stat.end(cell));
          break;
      }
    }
  }


  end(cell) {
    let value = this.value;

    cell._log("status_end_"+this.type, value);
    switch(this.type) {
      case "agup":   if (cell.isAGInverted) value=-value; cell.agsup-=value; cell._log("update_ag", cell.ag); break;
      case "agdown": if (cell.isAGInverted) value=-value; cell.agsup+=value; cell._log("update_ag", cell.ag); break;
      case "atup":   if (cell.isATInverted) value=-value; cell.atsup-=value; cell._log("update_at", cell.at); break;
      case "atdown": if (cell.isATInverted) value=-value; cell.atsup+=value; cell._log("update_at", cell.at); break;
      case "probup":     cell.probsup -= value; cell._log("update_prob", cell.probsup); break;
      case "probdown":   cell.probsup += value; cell._log("update_prob", cell.probsup); break;
      case "spprobup":   cell.spprobsup -= value; cell._log("update_spprob", cell.spprobsup); break;
      case "spprobdown": cell.spprobsup += value; cell._log("update_spprob", cell.spprobsup); break;
      case "critup":     cell.critsup -= value; cell._log("update_crit", cell.critsup); break;
      case "critdown":   cell.critsup += value; cell._log("update_crit", cell.critsup); break;
      case "typechange":   cell.typeChangeStatus = null;   break;
      case "targetchange": cell.targetChangeStatus = null; break;
      default:
        break;
    }
    return false;
  }
}


FieldCellStatus.isAGATStatus = {
  "agup" : true,
  "agdown" : true,
  "atup" : true,
  "atdown" : true,
  "agatup" : true,
  "agatdown" : true
};