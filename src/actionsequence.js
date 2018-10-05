class ActionSequence {
  constructor(listPropName, rule, id, defaultProperties) {
    this.rule = rule;
    this._id = id;
    this.listPropName = listPropName;
    this.isSkill = false;
    this.isAbility = false;
    this.isSpecialMove = false;
    this.properties = Object.assign({}, defaultProperties);
    this.actions = [];
    this.newAction();
  }

  get id() { return this._id; }
  get name() { return this.properties.name || ""; }
  set name(newName) { if (this.properties.name) this.properties.name = newName; }

  fromHash(hash) {
    Object.assign(this.properties, hash.properties);
    if (hash.actions && hash.actions.length > 0) {
      this.actions.length = hash.actions.length;
      for (let i=0; i<this.actions.length; i++) {
        if (!this.actions[i]) this.actions[i] = new Action(this, i);
        this.actions[i].fromHash(hash.actions[i]);
      }
    }
    return this;
  }

  toHash() {
    return {
      "properties": this.properties,
      "actions": this.actions.map(act=>act.toHash())
    };
  }

  newAction() {
    return this.actions.push(new Action(this, this.actions.length));
  }

  exec(cell) {
    for (let i=0; i<this.actions.length; i++) {
      this.actions[i].exec(cell);
    }
  }
}