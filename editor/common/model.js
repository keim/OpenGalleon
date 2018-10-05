class Model {
  constructor() {
    this.rule = new Rule();
    this.description = new Description();
  }


  fromHash(hash) {
    this.rule.fromHash(hash);
    this.description.updateRule(this.rule);
  }


  toHash() {
    return this.rule.toHash();
  }
}
