class ActionSequenceCard {
  constructor(option, smallMode=false, onSubmit=null, onDelete=null) {
    this.$card = ActionSequenceCard.$original.clone();
    this.$card.toggleClass("small", smallMode);
    this.$desc = this.$card.find(".card-description");
    this.$range1 = this.$card.find(".range1");
    this.$range2 = this.$card.find(".range2");
    this.$caption = this.$card.find(".card-caption");
    this.$card.find(".action-edit-button").on("click", this._onClickEditButton.bind(this));
    this.sequence = null;
    this.onSubmit = onSubmit;
    this.onDelete = onDelete;
    this.option = option;
  }

  appendTo($appendTo) {
    this.$card.appendTo($appendTo);
    return this;
  }

  _onClickEditButton() {
    view.actionPopup(this.sequence.name, this.sequence, 
                     this._onActionUpdated.bind(this), 
                     (this.onDelete!=null) ? this._onActionDelete.bind(this) : null);
  }

  _onActionUpdated() {
    this.updateView();
    if (this.onSubmit) this.onSubmit(this.option);
  }

  _onActionDelete() {
    if (this.onDelete) this.onDelete(this.option);
  }

  setSequence(sequence) {
    this.sequence = sequence;
    this.updateView();
  }

  updateView() {
    const act = this.sequence.actions;
    this.$caption.text(this.sequence.name);
    this.$desc.text(model.description.toString(this.sequence));
    if (act.length == 0) {
      this.$range1.addClass("disabled");
      this.$range2.addClass("disabled");
    } else {
      this._setRange(this.$range1, act[0]);
      if (act.length == 1 || Action.isSameRange(act[0].properties, act[1].properties)) {
        this.$range2.addClass("disabled");
      } else {
        this._setRange(this.$range2, act[1]);
      }
    }
  }

  _setRange($range, action) {
    const actionProp = action.properties;
    $range.toggleClass("disabled", (actionProp.type == "none"));
    $range.toggleClass("range-relative", !actionProp.isRangeAbs);
    $range.attr("actionTarget", Action.rangeTarget(actionProp));
    $range.find(".cell").each((i,e)=>{
      const $e = $(e);
      $e.toggleClass("active", (actionProp.range & (1<<$e.attr("cellid")))!=0);
    });
  }
}


