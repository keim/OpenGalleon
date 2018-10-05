class Ability extends ActionSequence {
  constructor(rule, id) {
    super("_abilities", rule, id, {
      "name" : "",
      "trigger" : "allturnsatfirst",
      "conditionType" : "always",
      "conditionValue" : 0
    });
    this.isAbility = true;
  }

  exec(cell) {
    
  }
}
