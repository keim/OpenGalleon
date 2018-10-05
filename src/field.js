class Field {
  constructor(rule) {
    this.rule = rule;
    this.cells = new Array(18);
    for (let i=0; i<9; i++) {
      this.cells[i] = new FieldCell(this, 0, i);
      this.cells[i+9] = new FieldCell(this, 1, i);
    }
    this.sequence = null;
    this.checkSequence = [1,10,0,9,2,11,4,13,3,12,5,14,7,16,6,15,8,17];
  }

  // 1) clear field
  clear() {
    for (let i=0; i<18; i++) {
      this.cells[i].setCard(null);
    }
  }

  // 2) set card
  setCard(card, playerID, cellIndex) {
    this.cells[cellIndex+playerID*9].setCard(card);
  }

  // 3) calculate reslut and returns Array.<Log>
  startBattle() {
    let result;
    this._initializeBattle();
    do {
      this._execTurn();
      result = this._checkTurnEnd();
    } while (result == "continue");
    this.sequence.push(new Log("end_"+result, 0, 0, this.turn, this.turn));
    return this.sequence;
  }

  // count alive cards
  countAlive(pid) {
    return this.cells.reduce((sum, c)=>sum+((c.card && (pid==-1 || c.playerID==pid) && !c.isDead)?1:0), 0);
  }

  // count dead cards
  countDead(pid) {
    return this.cells.reduce((sum, c)=>sum+((c.card && (pid==-1 || c.playerID==pid) && c.isDead)?1:0), 0);
  }

  // count cards type
  countType(pid, type) {
    return this.cells.reduce((sum, c)=>sum+((c.card && (pid==-1 || c.playerID==pid) && !c.isDead && c.typeDefense==type)?1:0), 0);
  }


//---- battle 
  // returns random number [0-1)
  _random() {
    return Math.rnd();
  }


  // call at first 
  _initializeBattle() {
    for (let i=0; i<18; i++) this.cells[i].initializeBattle(i+1);
    this.sequence = [];
    this.turn = 0;
  }

  // execute one turn 
  _execTurn() {
    this.turn++;
    // turn start log
    this.sequence.push(new Log("turn_start", 0, 0, this.turn, this.turn));
    // special attack
    this.cells.forEach(cell=>cell.rebirthCountDownPhase());
    this._pickAllAliveCellsByAGOrder(cell=>cell.firstAbilirtyPhase());
    // aura
    // field status
    this._pickAllAliveCellsByAGOrder(cell=>cell.mainPhase());
    // aura R
    // healing
    // burst
    // poison
    // curse
    this.cells.forEach(cell=>cell.statusUpdatePhase());
    this._pickAllAliveCellsByAGOrder(cell=>cell.lastAbilirtyPhase());
    this._survivalMove();
  }

  // returns "p0win", "p1win", "draw", "continue"
  _checkTurnEnd() {
    let p0alive=false, p1alive=false;
    for (let i=0; i<9; i++) {
      p0alive = p0alive || !this.cells[i].isDead;
      p1alive = p1alive || !this.cells[i+9].isDead;
    }
    if (p0alive && p1alive) return (this.turn==20) ? "draw" : "continue";
    if (!p0alive && !p1alive) return "draw";
    return (p0alive) ? "p0win" : "p1win";
  }


//---- subroutines 
  // check cards alive in column 
  _checkColumnCellsAlive(playerID, column) {
    let base = column + playerID*9;
    return !(this.cells[base].isDead && this.cells[base+3].isDead && this.cells[base+6].isDead);
  }

  // change card position at the last of a turn 
  _survivalMove() {
    for (let i=0; i<3; i++) {
      if (!this.cells[i+3].isDead && this.cells[i].isDead) {
        if (!this.cells[i+6].isDead) this._survivalMove_rotCells(i,i+3,i+6);
        else this._survivalMove_swapCells(i, i+3);
      } else
      if (!this.cells[i+6].isDead && this.cells[i+3].isDead) {
        if (this.cells[i].isDead) this._survivalMove_swapCells(i, i+6);
        else this._survivalMove_swapCells(i+3, i+6);
      }
    }
  }

  _survivalMove_swapCells(id1, id2) {
    const t = new FieldCell();
    t.copyFrom(this.cells[id1]);
    this.cells[id1].copyFrom(this.cells[id2]);
    this.cells[id2].copyFrom(t);
    this.sequence.push(new Log("move", 0, id1, id2, 0));
    this.sequence.push(new Log("move", 0, id2, id1, 0));
  }

  _survivalMove_rotCells(id1, id2, id3) {
    const t = new FieldCell();
    t.copyFrom(this.cells[id1]);
    this.cells[id1].copyFrom(this.cells[id2]);
    this.cells[id2].copyFrom(this.cells[id3]);
    this.cells[id3].copyFrom(t);
    this.sequence.push(new Log("move", 0, id1, id3, 0));
    this.sequence.push(new Log("move", 0, id3, id2, 0));
    this.sequence.push(new Log("move", 0, id2, id1, 0));
  }

//---- field cell picker 
  // pickup all alive cells by AG order.
  _pickAllAliveCellsByAGOrder(callback) {
    this.cells.forEach(c=>c.done=false);
    let nextCell;
    while (nextCell = this.checkSequence.reduce((ret, cellid)=>{
      const tgt = this.cells[cellid];
      return (!(tgt.done || tgt.isDead) && (!ret || (ret.ag < tgt.ag))) ? tgt : ret;
    }, null)) {
      if (!nextCell) break;
      callback(nextCell);
      nextCell.done = true;
    }
  }

  // calculate reaction range
  _calcReactionRange(range, filterType, filterValue, count, sortBy, orderBy) {
    const flags = this.checkSequence.map(idx=>((range & (1<<idx)) && Filters[filterType](this.cells[idx], filterValue)));
    // count == 18 means sort is unnecessary
    if (count == 18) return flags.reduce((range, flg, order)=>(range|(flg?(1<<this.checkSequence[order]):0)), 0);
    // calculate range
    let reactionRange = 0, nextCell;
    for (let i=0; i<count; i++) {
      nextCell = flags.reduce((ret, flg, order)=>{
        const tgt = this.cells[this.checkSequence[order]];
        return (flg && (!ret || (ret[sortBy]*orderBy < tgt[sortBy]*orderBy))) ? tgt : ret;
      }, null);
      if (!nextCell) break;
      flags[this.checkSequence.indexOf(nextCell.id)] = false;
      reactionRange |= 1<<nextCell.id;
    }
    return reactionRange;
  }

  // search cell by cardid
  _findCellByCardID(cardid) {
    return this.cells.reduce((ret, cell)=>(cell.cardid==cardid)?cell:ret, null);
  }
}
