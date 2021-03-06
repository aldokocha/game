/// <reference path="../../../_references.ts" />

import key = module("../../../../common/keyCodes");

export class slowDown implements IGame.IKeyboardAction {

  id = "slow down";
  description = "slow down the song by 10%";
  keySequence = [key.downArrow];

  constructor(private p: IGame.IKeyboardParams) { }

  triggerAction() {
    var o = this;
    o.p.params.setParam("p_speed", o.p.params.readOnly.p_speed - 0.1);
  }

  getCurrentState() {
    var o = this;
    return o.p.params.readOnly.p_speed * 100;
  }

}