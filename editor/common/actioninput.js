class ActionInput {
  constructor($modal) {
    // frequently accessed elements
    this.$modal = $modal;
    this.$field = $modal.find("#field");
    this.$parameters = $modal.find("#parameters");
    this.$sequenceParams = $modal.find("#sequence-parameters");
    this.$filterValueField = this.$parameters.find("#filterfield");
    this.$filterValue      = this.$filterValueField.find("#param-filterValue");
    this.$filterValueTypes = this.$filterValueField.find("[valuetype='type']");
    this.$valBase  = this.$parameters.find("#param-valBase");
    this.$valRatio = this.$parameters.find("#param-valRatio");
    this.$valConst = this.$parameters.find("#param-valConst");
    this.$typeID   = this.$parameters.find("#param-valConst-typeID").hide();
    this.$abilityField = this.$modal.find("#ability-action").hide();
    this.$specialField = this.$modal.find("#specialmove-action").hide();

    this.$navs = $modal.find("#action-navs");
    this.$navitem = this.$navs.children(".nav-item").remove();

    this._setHandlers();

    this.sequenceOrginal = null;
    this.sequence = new ActionSequence(null, "");
    this.clipboard = new ActionSequence(null, "");
    this.currentActionIndex = 0;
    this.onSubmit = null;
    this.onDelete = null;
  }

  //---- handlers
  _setHandlers() {
    // action select tab
    this.$navs.on("click", ".action-nav", e=>{
      this._updateData();
      let idx = parseInt($(e.target).tab('show').attr("index"));
      if (idx == this.sequence.actions.length) {
        this.sequence.newAction();
        this._updateNavs();
      }
      this.currentActionIndex = idx;
      this._updateView();
    });

    // action copy and paste
    this.$modal.find("#param-skill-copy").on("click", e=>{
      this._updateData();
      this.clipboard.fromHash(this.sequence);
    });
    this.$modal.find("#param-skill-paste").on("click", e=>{
      this.sequence.fromHash(this.clipboard);
      this._updateView();
    });

    // field range selector
    this.$modal.find(".act-field-input.cell").on("click", e=>{
      const $range = $(e.target).toggleClass('active').parent();
      $range.children('.set-all').toggleClass('active', ($range.children('.cell.active').length == 9));
    });
    this.$modal.find(".act-field-input.set-all").on("click", e=>{
      const $target = $(e.target).toggleClass('active');
      $target.siblings('.cell').toggleClass('active', $target.hasClass('active'));
    });
    this.$modal.find(".act-field-input.position").on("click", e=>{
      this.$field.attr("israngeabs", $(e.target).hasClass('pos-absolute'));
      this.$field.attr("hassideatk", $(e.target).hasClass('pos-relative'));
    });
    this.$modal.find(".act-field-input.sideattack").on("click", e=>{
      if (this.$field.attr("israngeabs")=="true") return;
      this.$field.attr("hassideatk", !(this.$field.attr("hassideatk")=="true"));
    });

    // action type change
    this.$modal.find("#param-type").on("change", e=>{
      this._updateData();
      this.sequence.actions[this.currentActionIndex].type = $(e.target).val();
      this._updateView();
    });

    // type selector as a constant value 
    this.$typeID.on("change", e=>{
      this.$valConst.val(this.$typeID.val());
    });

    // filter type selector
    this.$modal.find("#param-filterType").on("change", e=>{
      this._updateFilterField($(e.target).val());
    });
    this.$filterValueTypes.on("click", ".btn", e=>{
      let flg = 0;
      $(e.target).toggleClass("active");
      this.$filterValueTypes.children(".btn").each((i,e)=>{ flg |= $(e).hasClass("active") ? (1<<i) : 0; });
      this.$filterValue.val(flg);
    });
    this.$filterValueField.find("[linkto='param-filterValue']").on("change", (e)=>{
      this.$filterValue.val($(e.target).val());
    });

    // submit
    this.$modal.find("#submit").on("click", e=>{
      this.submit();
      if (this.onSubmit) this.onSubmit();
      this.$modal.modal('hide');
    });

    this.$modal.find("#delete").on("click", e=>{
      if (this.onDelete) this.onDelete();
      this.$modal.modal('hide');
    });

    this.$modal.on("hide.bs.modal", e=>{
      this.onSubmit = null;
      this.onDelete = null;
    });
  }

  setRule(rule) {
    this.$filterValueTypes.children("button").remove();
    this.$typeID.children("option").remove();
    this.$valBase.children("option.valbasetypes").remove();
    rule.types.forEach(type=>{
      $("<button/>", {"class":"btn btn-sm btn-light ml-1", "text":type.name}).appendTo(this.$filterValueTypes);
      $("<option/>", {"value":type.id, "text":type.description}).appendTo(this.$typeID);
      $("<option/>", {"value":"type"+type.id+"_count", "text":type.description+" 生存数(全体)", "class":"valbasetypes"}).appendTo(this.$valBase);
      $("<option/>", {"value":"player_type"+type.id+"_count", "text":type.description+" 生存数(自陣)", "class":"valbasetypes"}).appendTo(this.$valBase);
      $("<option/>", {"value":"opponent_type"+type.id+"_count", "text":type.description+" 生存数(敵陣)", "class":"valbasetypes"}).appendTo(this.$valBase);
    })
    rule.subtypes.forEach(type=>{
      $("<button/>", {"class":"btn btn-sm btn-light ml-1", "text":type.name}).appendTo(this.$filterValueTypes);
    });
    this.$modal.find("select[listkey]").each((i,e)=>RuleEditor.setSelectOption(rule, $(e)));
  }

  show(title, sequence, onSubmit, onDelete) {
    this.sequenceOrginal = sequence;
    this.sequence.fromHash(sequence);
    this.onSubmit = onSubmit;
    this.onDelete = onDelete;
    this.currentActionIndex = 0;
    this._updateNavs();
    this._updateView();

    for (let key in sequence.properties) {
      this.$sequenceParams.find("[key='"+key+"']").val(sequence.properties[key]);
    }
    this.$abilityField.toggle(sequence.isAbility);
    this.$specialField.toggle(sequence.isSpecialMove);
    this.$modal.find("#delete").toggle(onDelete!=null);

    this.$modal.find(".modal-title").text(title);
    this.$modal.modal('show');
  }

  _updateNavs() {
    this.$navs.children(".nav-item").remove();
    for (let i=0; i<this.sequence.actions.length; i++) {
      let $i = this.$navitem.clone();
      $i.children("a").attr("index", i).text("行動"+String(i+1));
      this.$navs.append($i);
    }
    let $i = this.$navitem.clone();
    $i.children("a").attr("index", this.sequence.actions.length).text("+行動追加");
    this.$navs.append($i);
  }

  _updateView() {
    if (this.sequence.actions.length == 0) return;
    const prop = this.sequence.actions[this.currentActionIndex].properties;
    this.$modal.find(".action-nav[index="+String(this.currentActionIndex)+"]").tab('show');
    this.$field.attr("israngeabs", prop.isRangeAbs);
    this.$field.attr("hassideatk", prop.hasSideAtk);
    for (let i=0; i<18; i++) {
      this.$field.find('#rangebit'+String(i)).toggleClass('active', (prop.range & (1<<i))!=0);
    }
    this.$field.find('#act-field-p0>.set-all').toggleClass('active', (prop.range & 0x001ff) == 0x001ff);
    this.$field.find('#act-field-p1>.set-all').toggleClass('active', (prop.range & 0x3fe00) == 0x3fe00);
    for (let key in prop) {
      this.$parameters.find("[key="+key+"]").val(prop[key]);
    }
    this._updateValueField(prop.type);
    this._updateFilterField(prop.filterType);
  }

  _updateValueField(actionType) {
    switch(Action.info[actionType].valueType) {
    case "none":
      this.__updateValueFieladEnables(false, false, false, false);
      break;
    case "constant":
      this.__updateValueFieladEnables(false, false, true, false);
      break;
    case "cardid":
    case "actionid":
      this.__updateValueFieladEnables(false, false, true, false);
      break;
    case "typeid":
      this.__updateValueFieladEnables(false, false, true, true);
      break;
    default:
      this.__updateValueFieladEnables(true, true, true, false);
      break;
    }
  }

  __updateValueFieladEnables(bas, rat, con, type) {
    this.$valBase.prop("disabled", !bas);
    this.$valRatio.prop("disabled", !rat);
    this.$valConst.toggle(!type).prop("disabled", !con);
    this.$typeID.toggle(type);
    if (!bas) this.$valBase.val("zero");
    if (!rat) this.$valRatio.val("0");
    if (!con) this.$valConst.val("0");
  }

  _updateFilterField(filterType) {
    const valueType = Filters.info[filterType].valueType;
    this.$filterValueField.children(".row").hide().filter("[valuetype="+valueType+"]").show();
  }

  _updateData() {
    if (this.sequence.actions.length == 0) return null;
    const prop = this.sequence.actions[this.currentActionIndex].properties;
    let $p;
    for (let key in prop) {
      switch (key) {
      case "isRangeAbs":
        prop.isRangeAbs = (this.$field.attr("israngeabs") == "true");
        break;
      case "hasSideAtk":
        prop.hasSideAtk = (this.$field.attr("hassideatk") == "true");
        break;
      case "range":
        prop.range = 0;
        for (let i=0; i<18; i++) {
          prop.range |= this.$field.find('#rangebit'+String(i)).hasClass('active') ? (1<<i) : 0;
        }
        break;
      case "valBase":
        if (!this.$valBase.prop("disabled"))  prop.valBase = this.$valBase.val();
        break;
      case "valRatio":
        if (!this.$valRatio.prop("disabled")) prop.valRatio = this.$valRatio.val();
        break;
      case "valConst":
        if (!this.$valConst.prop("disabled")) prop.valConst = this.$valConst.val();
        break;
      default:
        $p = this.$parameters.find("[key="+key+"]");
        if ($p.length != 0) prop[key] = $p.val();
        break;
      }
    }
    return prop;
  }

  submit() {
    let prop = this._updateData();
    if (prop) {
      prop.valBase  = this.$parameters.find("[key='valBase']").val();
      prop.valRatio = this.$parameters.find("[key='valRatio']").val();
      prop.valConst = this.$parameters.find("[key='valConst']").val();
    }
    for (let key in this.sequence.properties) {
      this.sequence.properties[key] = this.$sequenceParams.find("[key='"+key+"']").val();
    }
    this.sequence.name = this.$modal.find("#param-skill-name").val();
    this.sequence.actions = this.sequence.actions.filter(act=>act.type!="none");
    this.sequenceOrginal.fromHash(this.sequence);
    this.sequenceOrginal = null;
  }
}


