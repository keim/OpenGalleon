class NavMenu {
  constructor($nav, $panes) {
    this.$nav = $nav;
    this.$panes = $panes;
    this.$navlinks = $nav.find(".nav-link");
    this.$navlinks.on("click", this._onClickLink.bind(this));
    this.activatePane("dash-board");
  }

  activateMenu(tabid) {
    this.$navlinks.removeClass("active").filter("[tab-id='"+tabid+"']").addClass("active");
  }

  activatePane(tabid) {
    this.$panes.hide();
    this.$panes.filter("#"+tabid).show();
  }

  _onClickLink(e) {
    const tabid = $(e.target).attr("tab-id");
    e.preventDefault();
    this.activateMenu(tabid);
    this.activatePane(tabid);
  }  
}
