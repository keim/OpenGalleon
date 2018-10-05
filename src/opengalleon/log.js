class Log {
  constructor(type, range, cellID, value, turn) {
    this.type  = type;
    this.range = range;
    this.cellID = cellID;
    this.value = value;
    this.turn = turn || 0;
  }

  get isReaction() {
  	return (this.range == 0);
  }
}
