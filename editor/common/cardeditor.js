class CardEditor {
  constructor($editor) {
    this.$editor = $editor;
    this.$cardimage = $editor.find("#card-image>img");
    this.$id = $editor.find("#param-id");
    this.$parameters = $editor.find("#parameters");
    this.$skillCards = $editor.find("#skill-cards");
    this.$cardlist = $editor.find("#cardlist");
    this.$listitemOriginal = this.$cardlist.children(".nav-item").remove();

    this._setHandlers();

    this.skillCards = [
      new ActionSequenceCard({"row":"front"},   false, this._onActionUpdated.bind(this)).appendTo(this.$skillCards),
      new ActionSequenceCard({"row":"support"}, false, this._onActionUpdated.bind(this)).appendTo(this.$skillCards),
      new ActionSequenceCard({"row":"back"},    false, this._onActionUpdated.bind(this)).appendTo(this.$skillCards),
      new ActionSequenceCard({"row":"special"}, false, this._onActionUpdated.bind(this)).appendTo(this.$skillCards)
    ];
    this.cardOriginal = null;
    this.card = new Card();

    this.updated = false;
  }


  //---- properties
  set categolykey(key) { this.$cardlist.attr("categolykey", key); }
  get categolykey() { return this.$cardlist.attr("categolykey"); }
  get categolyid() { return this.$cardlist.children(".folder.opened").children("a").attr("cateid") || 0; }
  get cardid() { return this.cardOriginal.id; }
  set updated(flag) {
    this.$parameters.toggleClass("updated", flag);
    this.$parameters.find("#card-update").toggleClass("disabled", !flag);
  }
  get updated() { return this.$parameters.hasClass("updated");}


  //---- handlers
  _setHandlers() {
    // card list
    this.$cardlist.on("click",".nav-link",this._onListItemClicked.bind(this));

    // update parameters
    this.$parameters.find("input,select").on("change", e=>{
      this.updated = true;
    });
    // operations
    this.$editor.find("#card-update").on("click", this.save.bind(this));
    this.$editor.find("#card-duplicate").on("click", this.duplicate.bind(this));
    this.$editor.find("#card-delete").on("click", this.delete.bind(this));

    // update image
    this.$editor.find("#param-imgurl").on("change", e=>{
      this.$cardimage.attr("src", $(e.target).val());
    })
  }

  _onListItemClicked(e) {
    view.confirmOrExec(this.updated, "変更が保存されていません。変更を破棄して移動しますか？", ()=>{
      const $t = $(e.target);

      if ($t.parent().hasClass("folder")) {
        this.updateListView($t.attr("cateid"));
        this.updated = false;
      } else {
        let card;
        if ($t.parent().hasClass("append")) {
          card = this.rule.newCard(null, {"properties":{"name":"新規カード"}}, true);
          card.properties[this.categolykey] = this.categolyid;
        } else {
          card = this.rule.cards[$t.attr("cardid")];
        }
        this.setCard(card);
        this.updateListView();
      }
    }, "確認", "編集に戻る", "破棄する");
  }

  _onActionUpdated() {
    this.updated = true;
  }


  //---- model-view operations
  updateListView(categoly=null) {
    this.$cardlist.children(".nav-item").remove();
    if (Object.keys(this.rule.cards).length > 0) {
      const categolykey = this.categolykey;
      const openkey = categoly || this.card.properties[categolykey];

      const dict = Object.keys(this.rule.cards).reduce((dict,key)=>{
        const card = this.rule.cards[key];
        const categoly = card.properties[categolykey];
        if (categoly in dict) dict[categoly].push(card);
        else dict[categoly] = [card];
        return dict;
      }, {});

      this.$cardlist.append(this.$listitemOriginal.clone().addClass("append"));
      Object.keys(dict).sort().forEach(key=>{
        const opened = (key == openkey);
        let $item = this.$listitemOriginal.clone().addClass("folder").toggleClass("opened", opened);
        $item.children(".nav-link").text(this._categolyName(categolykey, key)).attr("cateid", key);
        this.$cardlist.append($item);
        if (opened) {
          dict[key].forEach(card=>{
            $item = this.$listitemOriginal.clone().addClass("item");
            $item.children(".nav-link").text(card.properties.name).attr("cardid", card.id).toggleClass("active", card.id == this.cardid);
            this.$cardlist.append($item);
          });
        }
      });
    }
  }

  _categolyName(categolykey, key) {
    switch (categolykey) {
    case "package": return this.rule.packages[key].description;
    }
    return key;
  }

  updateView() {
    this.skillCards[0].setSequence(this.card.skills["front"]);
    this.skillCards[1].setSequence(this.card.skills["support"]);
    this.skillCards[2].setSequence(this.card.skills["back"]);
    this.skillCards[3].setSequence(this.card.skills["special"]);
    for (let key in this.card.properties) {
      const v = (key == "metadata") ? JSON.stringify(this.card.properties[key]) : this.card.properties[key];
      this.$parameters.find("[key="+key+"]").val(v);
    }
    this.$id.val(this.cardid);
    this.$cardimage.attr("src", this.card.properties.imgurl);
  }

  updateData() {
    let key;
    try {
      for (key in this.card.properties) {
        const v = this.$parameters.find("[key="+key+"]").val();
        this.card.properties[key] = (key == "metadata") ? JSON.parse(v) : v;
      }
    } catch(e) {
      view.confirm("エラー；パラメータ「"+key+"」が適切ではありません。(メタデータはJSON形式です）");
    }
  }


  //---- othres
  save() {
    this.updateData();
    const newCardID = this.$id.val();
    if (this.cardid == newCardID) {
      this.cardOriginal.fromHash(this.card);
      this.updateListView();
      this.updated = false;
    } else {
      view.confirmOrExec(this.rule.cards[newCardID], "同じカードIDが既に存在しています。カードデータを上書きしますか？", ()=>{
        this.cardOriginal.fromHash(this.card);
        this.rule.changeID(this.cardOriginal, newCardID);
        this.updateListView();
        this.updated = false;
      }, "確認", "編集に戻る", "上書きする");
    }
  }

  duplicate() {
    this.updateData();
    const card = this.rule.newCard(null, this.card, true);
    if (!/複製$/.test(card.properties.name)) card.properties.name += " -複製";
    this.setCard(card);
    this.updateListView();
    this.updated = false;
  }

  delete() {
    view.confirm("編集中のカードを削除します。よろしいですか？", ()=>{
      this.rule.unregister(this.cardOriginal);
      this.updateListView();
      this.updated = false;
    }, "削除", "編集に戻る", "削除する");
  }


  setRule(rule) {
    this.$parameters.find("select[listkey]").each((i,e)=>RuleEditor.setSelectOption(rule, $(e)));
    this.rule = rule;
  }

  setCard(card) {
    this.cardOriginal = card;
    this.card.fromHash(card);
    this.updateListView();
    this.updateView();
    this.updated = false;
  }
}
