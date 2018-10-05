class CardType {
  constructor(opt, isPrimary) {
    this.name = opt.name || "";
    this.description = opt.description || "";
    this.isPrimary = isPrimary;
    if (isPrimary) {
      this.isCountable = opt.isCountable || false;
      this.attackRateMatrix = opt.attackRateMatrix || [];
    }
  }

  toHash() {
    let hash = {
      "name":this.name,
      "description":this.description
    };
    if (this.isPrimary) {
      hash.isCountable = this.isCountable;
      hash.attackRateMatrix = this.attackRateMatrix;
    }
    return hash;
  }
}
