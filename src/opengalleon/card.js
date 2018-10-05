class Card {
  constructor(rule, id) {
    this.rule = rule;
    this._id = id;
    this.listPropName = "_cards";
    this.properties = Object.assign({}, Card.defaultProperties);
    this.skills = {
      "front":   new Skill(this, "front"),
      "support": new Skill(this, "support"),
      "back":    new Skill(this, "back"),
      "special": new Skill(this, "special")
    };
    this.abilityIDs = [];
  }

  get id() { return this._id; }

  fromHash(hash) {
    Object.assign(this.properties, hash.properties);
    for (const k in hash.skills) {
      this.skills[k].fromHash(hash.skills[k]);
    }
    if (hash.abilityIDs) this.abilityIDs = hash.abilityIDs.concat();
    return this;
  }

  toHash() {
    return {
      "properties": this.properties,
      "skills": {
        "front":   this.skills.front.toHash(),
        "support": this.skills.support.toHash(),
        "back":    this.skills.back.toHash(),
        "special": this.skills.special.toHash()
      },
      "abilityIDs": this.abilityIDs
    };
  }

  execAbility(cell, trigger) {
    for (let i=0; i<this.abilityIDs.length; i++) {
      this.rlue.abilities[this.abilityIDs[i]].exec(cell, trigger);
    }
  }

  execSkill(cell, skillType) {
    this.skills[skillType].exec(cell, skillType);
  }
}


Card.defaultProperties = {
  "name":"",
  "imgurl":"",
  "regulation":0,
  "restriction":7,
  "package":0,
  "rarity":0,
  "type":0,
  "subtype":0,
  "metadata":"",
  "hp":0,
  "ag":0,
  "at":0,
  "sp":1,
  "cost":1,
};