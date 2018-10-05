class Filters {
  constructor() {}
  static all(cell, value) { return true; }
  static alive(cell, value) { return (cell.card && !cell.isDead); }
  static dead(cell, value) { return (cell.card && cell.isDead); }
  static void(cell, value) { return (!cell.card); }
  static type(cell, value) { return (cell.card && (value & (1<<cell.typeDefense))); }
  static atgt(cell, value) { return (cell.card && (cell.at >= value)); }
  static atlt(cell, value) { return (cell.card && (cell.at <= value)); }
  static aggt(cell, value) { return (cell.card && (cell.ag >= value)); }
  static aglt(cell, value) { return (cell.card && (cell.ag <= value)); }
  static atrgt(cell, value) { return (cell.card && (cell.at >= cell.card.properties.at*value)); }
  static atrlt(cell, value) { return (cell.card && (cell.at <= cell.card.properties.at*value)); }
  static agrgt(cell, value) { return (cell.card && (cell.ag >= cell.card.properties.ag*value)); }
  static agrlt(cell, value) { return (cell.card && (cell.ag <= cell.card.properties.ag*value)); }
  static hpgt(cell, value) { return (cell.card && (cell.hp >= value)); }
  static hplt(cell, value) { return (cell.card && (cell.hp <= value)); }
  static spgt(cell, value) { return (cell.card && (cell.sp >= value)); }
  static splt(cell, value) { return (cell.card && (cell.sp <= value)); }
  static costgt(cell, value) { return (cell.card && (cell.card.properties.cost >= value)); }
  static costlt(cell, value) { return (cell.card && (cell.card.properties.cost <= value)); }
  static cardid(cell, value) { return (cell.card && (cell.card.id == value)); }
  static package(cell, value) { return (cell.card && (cell.card.properties.package == value)); }
  static rarity(cell, value) { return (cell.card && (cell.card.properties.rarity == value)); }
  static poison(cell, value) { return (cell.card && cell.hasPoison); }
  static curse(cell, value) { return (cell.card && cell.hasCurse); }
  static burst(cell, value) { return (cell.card && cell.hasBurst); }
}

Filters.info = {
  "all":     {"valueType":"none"},
  "alive":   {"valueType":"none"},
  "dead":    {"valueType":"none"},
  "void":    {"valueType":"none"},
  "type":    {"valueType":"type"},
  "atgt":    {"valueType":"value"},
  "atlt":    {"valueType":"value"},
  "aggt":    {"valueType":"value"},
  "aglt":    {"valueType":"value"},
  "atrgt":   {"valueType":"value"},
  "atrlt":   {"valueType":"value"},
  "agrgt":   {"valueType":"value"},
  "agrlt":   {"valueType":"value"},
  "hpgt":    {"valueType":"value"},
  "hplt":    {"valueType":"value"},
  "spgt":    {"valueType":"value"},
  "splt":    {"valueType":"value"},
  "costgt":  {"valueType":"value"},
  "costlt":  {"valueType":"value"},
  "cardid":  {"valueType":"cardid"},
  "package": {"valueType":"package"},
  "rarity":  {"valueType":"rarity"},
  "poison":  {"valueType":"none"},
  "curse":   {"valueType":"none"},
  "burst":   {"valueType":"none"},
};