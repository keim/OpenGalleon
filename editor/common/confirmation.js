class Confirmation {
  constructor($modal){
    this.$modal = $modal;
    this.$title = $modal.find(".modal-title");
    this.$message = $modal.find(".message");
    this.$cancel = $modal.find("#cancel");
    this.$ok = $modal.find("#ok");
    this.$ok.on("click", e=>{
      if (this.onConfirm) this.onConfirm();
      this.onConfirm = null;
      this.$modal.modal("hide");
    });
  }

  check(test, message, onConfirm, title, cancel, ok) {
    if (test) this.show(message, onConfirm, title, cancel, ok);
    else if (onConfirm) onConfirm();
  }

  show(message, onConfirm, title, cancel, ok) {
    this.$message.text(message);
    this.$cancel.toggle(onConfirm != null).text(cancel);
    this.$ok.text(ok);
    this.$title.text(title);

    this.onConfirm = onConfirm;
    this.$modal.modal("show");
  }
}