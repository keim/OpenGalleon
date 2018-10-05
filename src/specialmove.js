class SpecialMove extends ActionSequence {
  constructor(rule, id) {
    super("_specialMoves", rule, id, {
      "name" : "",
      "turnRangeMin" : 1,
      "turnRangeMax" : 20,
      "turns" : 1,
    });
    this.isSpecialMove = true;
  }

  exec(cell) {
    
  }
}
