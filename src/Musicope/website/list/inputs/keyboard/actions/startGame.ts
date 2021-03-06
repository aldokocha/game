/// <reference path="../../../_references.ts" />

import key = module("../../../../common/keyCodes");

export class startGame implements IList.IKeyboardAction {

  id = "start game";
  description = "";
  keySequence = [key.enter];

  private contr: IList.IController;

  constructor(p: IList.IKeyboardParams) {
    var o = this;
    o.contr = p.inputParams.controller;
  }

  triggerAction() {
    var o = this;
    var song = o.contr.displayedSongs()[o.contr.listIndex()];
    o.contr.redirect(o.contr.listIndex, song);
  }

  getCurrentState() {
    var o = this;
    return 0;
  }

}