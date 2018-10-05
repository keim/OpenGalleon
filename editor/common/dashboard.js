class DashBoard {
  constructor($editor) {
    this.$editor = $editor;
    this.$importInput = this.$editor.find("#import");
    this.$exportButton = this.$editor.find("#export");
    this.$importInput.on("change", this.onImportRuleBook.bind(this));
    this.$exportButton.on("click", this.onExportRuleBook.bind(this));
  }


  onImportRuleBook(e) {
    const files = e.target.files;
    if (files.length > 0) {
      const reader = new FileReader();
      reader.onload = e=>{
        let hash;
        try {
          hash = JSON.parse(e.target.result);
        } catch(er) {
          view.confirm("インポートしたファイルが正しくありません。");
          return;
        }
        view.confirm("編集中のデータは全て破棄されます。ルールファイルをインポートしますか？", ()=>{
          model.fromHash(hash);
          view.setRule(model.rule);
        }, "確認", "キャンセル", "編集中のデータを破棄してインポート");
      };
      reader.readAsText(files[0]);
    }
  }


  onExportRuleBook(e) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(model.toHash())], {type: "text/plain"}));
    a.target = '_blank';
    a.download = 'rulebook.json';
    a.click();
  }
}
