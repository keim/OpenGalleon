class Skill extends ActionSequence {
  constructor(card, key) {
    super(null, card && card.rule, key, {
      "name" : ""
    });
    this.card = card;
    this.key = key;
    this.isSkill = true;
  }

  get name() {
    return "["+ Description.wordRowName[this.key] + "] " + this.properties.name;
  }
}
