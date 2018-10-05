class Rule {
  constructor() {
    this.base = null;
    /**/
    this.properties = {
      "maxTurns" : 20
    };
  }

  get cards()        { return this._cards        || (base && base.cards)        || []; }
  get abilities()    { return this._abilities    || (base && base.abilities)    || []; }
  get specialMoves() { return this._specialMoves || (base && base.specialMoves) || []; }
  get deckEffects()  { return this._deckEffects  || (base && base.deckEffects)  || []; }
  get types()        { return this._types    || (base && base.types)    || []; }
  get subtypes()     { return this._subtypes || (base && base.subtypes) || []; }
  get packages()     { return this._packages || (base && base.packages) || []; }
  get rarities()     { return this._rarities || (base && base.rarities) || []; }


  fromHash(hash) {
    // card informations
    if (hash.cards) {
      this._cards = {};
      for (const key in hash.cards) this.newCard(key, hash.cards[key], true);
    }
    if (hash.abilities) {
      this._abilities = {};
      for (const key in hash.abilities) this.newAbility(key, hash.abilities[key], true);
    }
    if (hash.specialMoves) {
      this._specialMoves = {};
      for (const key in hash.specialMoves) this.newSpecialMove(key, hash.specialMoves[key], true);
    }
    if (hash.deckEffects) {
      this._deckEffects = {};
      for (const key in hash.deckEffects) this.newDeckEffect(key, hash.deckEffects[key], true);
    }
    // types lists
    if (hash.types)    this._types    = hash.types.map(opt=>new CardType(opt, true));
    if (hash.subtypes) this._subtypes = hash.subtypes.map(opt=>new CardType(opt, false));
    if (hash.packages) this._packages = hash.packages.map(opt=>new CardType(opt, false));
    if (hash.rarities) this._rarities = hash.rarities.map(opt=>new CardType(opt, false));
  }


  toHash() {
    let hash = {"cards":{}, "abilities":{}, "specialMoves":{}, "deckEffects":{}};
    hash.properties = Object.assign({}, this.properties);
    hash.types = this.types.map(type=>type.toHash());
    hash.subtypes = this.subtypes.map(type=>type.toHash());
    hash.packages = this.packages.map(type=>type.toHash());
    hash.rarities = this.rarities.map(type=>type.toHash());
    for (const key in this.cards) hash.cards[key] = this.cards[key].toHash();
    for (const key in this.abilities) hash.abilities[key] = this.abilities[key].toHash();
    for (const key in this.specialMoves) hash.specialMoves[key] = this.specialMoves[key].toHash();
    for (const key in this.deckEffects) hash.deckEffects[key] = this.deckEffects[key].toHash();
    return hash;
  }


//----- card type
  appendCardType(listkey) { const card = new CardType({}, (listkey == "types")); this["_" + listkey].push(card); return card; }
  deleteCardType(listkey, index) { this["_" + listkey].splice(index, 1); }


//----- register
  _newID(propname) { return Object.keys(this[propname]).reduce((ret, key)=>(parseInt(key)<ret)?ret:(parseInt(key)+1), 1); }

  unregister(data) { if (this[data.listPropName][data.id]) delete this[data.listPropName][data.id]; }
  register(data) { return (this[data.listPropName][data.id] = data); }
  changeID(data, id) {
    if (data.id) this.unregister(data);
    data._id = id;
    return this.register(data);
  }
  

//----- cards
  newCard(id, hash, regist) {
    const instance = new Card(this, (id==null) ? this._newID("_cards") : id);
    instance.listPropName = "_cards";
    if (hash) instance.fromHash(hash);
    if (regist) this.register(instance);
    return instance;
  }

//----- abilities
  newAbility(id, hash, regist) {
    const instance = new Ability(this, (id==null) ? this._newID("_abilities") : id);
    instance.listPropName = "_abilities";
    if (hash) instance.fromHash(hash);
    if (regist) this.register(instance);
    return instance;
  }

//----- special moves
  newSpecialMove(id, hash, regist) {
    const instance = new SpecialMove(this, (id==null) ? this._newID("_specialMoves") : id);
    instance.listPropName = "_specialMoves";
    if (hash) instance.fromHash(hash);
    if (regist) this.register(instance);
    return instance;
  }

//----- deck effects
  newDeckEffect(id, hash, regist) {
    const instance = new Ability(this, (id==null) ? this._newID("_deckEffects") : id);
    instance.listPropName = "_deckEffects";
    if (hash) instance.fromHash(hash);
    if (regist) this.register(instance);
    return instance;
  }
}