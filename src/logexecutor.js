var LogExecutor = {
  // system log
  turn_start(log){},
  end_p0win(log){},
  end_p1win(log){},
  draw(log){},

  critical(log){},
  failed(log){},
  move(log){},
  dead(log){},

  // actions
  attack(log){},
  death(log){},
  rebirth(log){},
  sacrifice(log){},
  create(log){},
  swap(log){},
  pushback(log){},
  repeat(log){},
  agup(log){},
  agdown(log){},
  atup(log){},
  atdown(log){},
  agatup(log){},
  agatdown(log){},
  hpup(log){},
  hpupalt(log){},
  hpdown(log){},
  spup(log){},
  spdown(log){},
  probup(log){},
  probdown(log){},
  spprobup(log){},
  spprobdown(log){},
  critup(log){},
  critdown(log){},

  agascendant(log){},
  shuffle(log){},
  aura(log){},
  aurar(log){},
  cancel_aura(log){},
  fieldstatus(log){},
  hpeven(log){},
  familieract(log){},
  penetrate(log){},
  energydrain(log){},
  imm_curse(log){},

  // actions (status change)
  stable(log){},
  constant(log){},
  shield(log){},
  reflect(log){},
  barrier(log){},
  undead(log){},
  poison(log){},
  curse(log){},
  burst(log){},
  heal(log){},
  healbar(log){},
  invertat(log){},
  invertag(log){},
  lock(log){},
  confuse(log){},
  trance(log){},
  damagedown(log){},
  damageup(log){},
  antidamage(log){},
  antiheal(log){},
  antideath(log){},
  antirebirth(log){},
  avoidlethal(log){},

  synchro(log){},
  setrebirth(log){},
  typechange(log){},
  targetchange(log){},
  damagetrap(log){},
  poisontrap(log){},
  deathtrap(log){},
  cancel_all(log){},
  cancel_damagectrl(log){},
  cancel_damagedown(log){},
  cancel_damageup(log){},
  cancel_reflect(log){},
  cancel_barrier(log){},
  cancel_undead(log){},
  cancel_poison(log){},
  cancel_burst(log){},
  cancel_heal(log){},
  cancel_healbar(log){},
  cancel_lock(log){},

  // reactions
  exec_death(log){},
  anti_death(log){},
  exec_rebirth(log){},
  anti_rebirth(log){},
  exec_sacrifice(log){},
  exec_create(log){},
  exec_swap(log){},
  exec_pushback(log){},
  exec_repeat(log){},
  update_ag(log){},
  update_at(log){},
  update_hp(log){},
  update_sp(log){},
  update_prob(log){},
  update_spprob(log){},
  update_crit(log){},

  // reactions (status change)
  status_stable(log){},
  status_constant(log){},
  status_shield(log){},
  status_reflect(log){},
  status_barrier(log){},
  status_undead(log){},
  status_poison(log){},
  status_curse(log){},
  status_burst(log){},
  status_heal(log){},
  status_healbar(log){},
  status_invertat(log){},
  status_invertag(log){},
  status_lock(log){},
  status_confuse(log){},
  status_trance(log){},
  status_damagedown(log){},
  status_damageup(log){},
  status_antidamage(log){},
  status_antiheal(log){},
  status_antideath(log){},
  status_antirebirth(log){},
  status_avoidlethal(log){},
  status_typechange(log){},
  status_targetchange(log){},
  status_damagetrap(log){},
  status_poisontrap(log){},
  status_deathtrap(log){},

  status_end_stable(log){},
  status_end_constant(log){},
  status_end_shield(log){},
  status_end_reflect(log){},
  status_end_barrier(log){},
  status_end_undead(log){},
  status_end_poison(log){},
  status_end_curse(log){},
  status_end_burst(log){},
  status_end_heal(log){},
  status_end_healbar(log){},
  status_end_invertat(log){},
  status_end_invertag(log){},
  status_end_lock(log){},
  status_end_confuse(log){},
  status_end_trance(log){},
  status_end_damagedown(log){},
  status_end_damageup(log){},
  status_end_antidamage(log){},
  status_end_antiheal(log){},
  status_end_antideath(log){},
  status_end_antirebirth(log){},
  status_end_avoidlethal(log){},
  status_end_typechange(log){},
  statuc_end_targetchange(log){},
  status_end_damagetrap(log){},
  status_end_poisontrap(log){},
  status_end_deathtrap(log){},

  exec_cancel_all(log){},
  exec_cancel_damagectrl(log){},
  exec_cancel_damagedown(log){},
  exec_cancel_damageup(log){},
  exec_cancel_reflect(log){},
  exec_cancel_barrier(log){},
  exec_cancel_undead(log){},
  exec_cancel_poison(log){},
  exec_cancel_burst(log){},
  exec_cancel_heal(log){},
  exec_cancel_healbar(log){},
  exec_cancel_lock(log){},

  // reactions (auto-reaction by status)
  exec_constant(log){},
  exec_stable(log){},
  exec_shield(log){},
  exec_reflect(log){},
  exec_barrier(log){},
  exec_damagectrl(log){},
  exec_undead(log){},
  exec_poison(log){},
  exec_curse(log){},
  exec_burst(log){},
  exec_heal(log){},
  exec_healbar(log){},
  exec_invertat(log){},
  exec_invertag(log){},
  exec_lock(log){},
  exec_confuse(log){},
  exec_trance(log){},
  exec_antidamage(log){},
  exec_antiheal(log){},
  exec_antideath(log){},
  exec_antirebirth(log){},
  exec_avoidlethal(log){},
  exec_targetchange(log){},
  exec_damagetrap(log){},
  exec_poisontrap(log){},
  exec_deathtrap(log){}
};