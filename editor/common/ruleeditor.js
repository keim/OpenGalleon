class RuleEditor {
  constructor($editor) {
    this.$editor = $editor;
    this.$sidebar = $editor.find("#sidebar");
    this.$main = $editor.find("#main");
    this.$generalPane = $editor.find("#general-pane");
    this.$abilityPane = $editor.find("#ability-pane").hide();
    this.$specialPane = $editor.find("#special-pane").hide();
    this.$deckEffectsPane = $editor.find("#deckeffect-pane").hide();
    this.$cardtypeinput = $editor.find("#cardtype-input");
    this._cardTypeInputListkey = null;
    this._cardTypeInputIndex = 0;
 
    this.$sidebar.find("a").on("click", e=>{
      e.preventDefault();
      $(e.target).addClass("active").siblings().removeClass("active");
      this.$main.children(".row").hide().filter("#"+$(e.target).attr("targetid")).show();
    });

    this.$generalPane.on("click", ".cardtype-button", e=>{
      const $e = $(e.target), listkey = $e.parents("[listkey]").attr("listkey");
      let index = parseInt($e.attr("index"));
      this.inputCardType(listkey, index);
    });

    
    this.$specialPane.find(".append").on("click", e=>{
      this.rule.newSpecialMove(null, {}, true);
      this.updateSpecialPain();
    });
    this.$deckEffectsPane.find(".append").on("click", e=>{
      this.rule.newDeckEffect(null, {}, true);
      this.updateDeckEffectPain();
    });
    this.$abilityPane.find(".append").on("click", e=>{
      this.rule.newAbility(null, {}, true);
      this.updateAbilityPain();
    });

  //---- card type popup  
    this.$cardtypeinput.on("hide.bs.modal", e=>{
      this._cardTypeInputListkey = null;
      this._cardTypeInputIndex = 0;
    });

    this.$cardtypeinput.find("#delete").on("click", e=>{
      if (this._cardTypeInputListkey) {
        view.confirm("属性を削除しても、カード内の属性情報は更新されません。※属性に対応した番号が更新されるため、削除する対象より後の属性は設定がズレます。十分に検討の上、実行してください。", ()=>{
          this.rule.deleteCardType(this._cardTypeInputListkey, this._cardTypeInputIndex);
          this.$cardtypeinput.modal("hide");
          this.updateGeneralPain();
        }, "属性削除の確認", "キャンセル", "削除");
      }
    });

    this.$cardtypeinput.find("#submit").on("click", e=>{
      if (this._cardTypeInputListkey) {
        try {
          const cardtype = (this._cardTypeInputIndex == -1) ? this.rule.appendCardType(this._cardTypeInputListkey) : this.rule[this._cardTypeInputListkey][this._cardTypeInputIndex];
          if (cardtype.isPrimary) {
            cardtype.attackRateMatrix = JSON.parse(this.$cardtypeinput.find("#param-cardtype-attackRate").val());
            cardtype.isCountable = (this.$cardtypeinput.find("[key='isCountable']").val() == "true");
          }
          cardtype.name = this.$cardtypeinput.find("[key='name']").val();
          cardtype.description = this.$cardtypeinput.find("[key='description']").val();
          this.$cardtypeinput.modal("hide");
          this.updateGeneralPain();
        } catch(e) {
          console.error(e.message);
          view.confirm("攻撃値補正は [1,1,1,1,1] の配列の形で記述してください。");
        }
      }
    });
  }

  static setSelectOption(rule, $select, attrName="name") {
    $select.children("option").remove();
    const key = $select.attr("listkey");
    if (key == "maxTurns") {
      for (let i=0; i<rule.properties.maxTurns; i++) {
        $("<option/>", {"value":i+1, "text":String(i+1)+"ターン"}).appendTo($select);
      }
    } else {
      if (key=="abilities" || key=="specialMoves" || !rule[key] || rule[key].length==0) {
        $("<option/>", {"value":0, "text":"(無し)"}).appendTo($select);
      }
      if (Array.isArray(rule[key])){
        rule[key].forEach((type, index)=>{
          $("<option/>", {"value":index, "text":type[attrName]}).appendTo($select);
        });
      } else {
        Object.keys(rule[key]).sort().forEach(id=>{
          $("<option/>", {"value":id, "text":rule[key][id][attrName]}).appendTo($select);
        });
      }
    }
  }


  onDeleteAbility(option) {
    view.confirm("選択中の能力を削除しますか？※能力を削除してもカード情報は更新されません。", ()=>{
      this.rule.unregister(this.rule.abilities[option.key]);
      this.updateAbilityPain();
    }, "削除確認", "キャンセル", "削除");
  }

  onDeleteSpecial(option) {
    view.confirm("選択中の必殺技を削除しますか？", ()=>{
      this.rule.unregister(this.rule.specialMoves[option.key]);
      this.updateSpecialPain();
    }, "削除確認", "キャンセル", "削除");
  }

  onDeleteDeckEffect(option) {
    view.confirm("選択中のデッキ効果を削除しますか？", ()=>{
      this.rule.unregister(this.rule.deckEffects[option.key]);
      this.updateDeckEffectPain();
    }, "削除確認", "キャンセル", "削除");
  }


  updateAbilityPain() {
    this.$abilityPane.find(".action-sequence-card").remove();
    for (const key in this.rule.abilities) {
      new ActionSequenceCard({key}, true, null, this.onDeleteAbility.bind(this)).appendTo(this.$abilityPane).setSequence(this.rule.abilities[key]);
    }
  }

  updateSpecialPain() {
    this.$specialPane.find(".action-sequence-card").remove();
    for (const key in this.rule.specialMoves) {
      new ActionSequenceCard({key}, true, null, this.onDeleteSpecial.bind(this)).appendTo(this.$specialPane).setSequence(this.rule.specialMoves[key]);
    }
  }

  updateDeckEffectPain() {
    this.$deckEffectsPane.find(".action-sequence-card").remove();
    for (const key in this.rule.deckEffects) {
      new ActionSequenceCard({key}, true, null, this.onDeleteDeckEffect.bind(this)).appendTo(this.$deckEffectsPane).setSequence(this.rule.deckEffects[key]);
    }
  }

  updateGeneralPain() {
    this.$generalPane.find(".cardtype-button").remove();
    this.$generalPane.children("[listkey]").each((i,e)=>{
      const $e = $(e), listkey = $e.attr("listkey"), $container = $e.find(".card-body");
      this.rule[listkey].forEach(((type, index)=>{
        $("<button/>", {
          "class":"btn btn-sm btn-outline-primary mr-1 cardtype-button", 
          "text" :type.description
        }).attr("index", index).appendTo($container);
      }));
      $("<button/>", {
        "class":"btn btn-sm btn-primary cardtype-button append",
        "text":"+追加"
      }).attr("index", -1).appendTo($container);
    });
  }


  setRule(rule) {
    this.rule = rule;
    this.updateAbilityPain();
    this.updateSpecialPain();
    this.updateGeneralPain();
    this.updateDeckEffectPain();
  }


  //---- card type editor
  inputCardType(listkey, index) {
    this._cardTypeInputListkey = listkey;
    this._cardTypeInputIndex = index;
    if (index == -1) {
      this.$cardtypeinput.find("#param-cardtype-attackRate").val("[]");
      this.$cardtypeinput.find("[key]").each((i,e)=>$(e).val(""));
      this.$cardtypeinput.find("#field-primary").toggle(listkey == "types");
    } else {
      const cardtype = this.rule[listkey][index];
      this.$cardtypeinput.find("#param-cardtype-attackRate").val(JSON.stringify(cardtype.attackRateMatrix));
      this.$cardtypeinput.find("[key]").each((i,e)=>$(e).val(String(cardtype[$(e).attr("key")])));
      this.$cardtypeinput.find("#field-primary").toggle(cardtype.isPrimary);
    }
    this.$cardtypeinput.modal("show");
  }
}