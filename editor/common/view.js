class View {
  constructor() {
    ActionSequenceCard.$original = $(".action-sequence-card").remove();
    this.dashBoard    = new DashBoard($("#dash-board"));
    this.ruleEditor   = new RuleEditor($("#rule-editor"));
    this.cardEditor   = new CardEditor($("#card-editor"));
    this.deckEditor   = new DeckEditor($("#deck-editor"));
    this.testfield    = new TestField($("#test-field"));
    this.navMenu      = new NavMenu($("#header"), $(".nav-target"));
    this.actionInput  = new ActionInput($("#action-input"));
    this.confirmation = new Confirmation($("#confirmation"));
  }


  // action input modal 
  actionPopup(title, sequence, onSubmit, onDelete) {
    this.actionInput.show(title, sequence, onSubmit, onDelete);
  }


  // confirmation modal 
  confirm(message, onConfirm=null, title="確認", cancel="Cancel", ok="OK") {
    this.confirmation.show(message, onConfirm, title, cancel, ok);
  }

  confirmOrExec(check, message, onConfirm=null, title="確認", cancel="Cancel", ok="OK") {
    if (check) this.confirmation.show(message, onConfirm, title, cancel, ok);
    else if (onConfirm) onConfirm();
  }


  // set rule
  setRule(rule) {
    this.actionInput.setRule(rule);
    this.ruleEditor.setRule(rule);
    this.cardEditor.categolykey = "package";
    this.cardEditor.setRule(rule);
    this.cardEditor.setCard(rule.cards[Object.keys(rule.cards)[0]]);
  }
}