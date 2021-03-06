/// <reference path="../../../_references.ts" />

import keysM = module("../../../../../common/keyCodes");

export class displayHelp implements IGame.IKeyboardAction {

  id = "display help";
  description = "displays a help window";
  keySequence = [keysM.enter];

  private window: IJQuery.JQuery;
  private isDisplayed = false;

  constructor(private p: IGame.IKeyboardParams) {
    var o = this;
    $.get("inputs/keyboard/actions/displayHelp/_assets/overlay.html?1").done((result) => {
      $(result).appendTo("body");
      o.window = $("#displayHelpOverlay");
    });
    
  }

  triggerAction() {
    var o = this;
    o.isDisplayed = !o.isDisplayed;
    o.p.params.setParam("p_isPaused", o.isDisplayed);
    o.display();
  }

  getCurrentState() {
    var o = this;
    return o.isDisplayed;
  }

  private display() {
    var o = this;
    if (o.isDisplayed) {
      o.p.actions.done((actions: IGame.IKeyboardAction[]) => {
        o.p.params.subscribe("displayHelp", ".*", (name, value) => {
          o.refillTable(actions);
        });  
        o.refillTable(actions);
        o.window.css("display", "block");
      });
    } else {
      o.p.params.unsubscribe("displayHelp");
      o.window.css("display", "none");
    }
  }

  private refillTable(actions: IGame.IKeyboardAction[]) {
    var o = this;
    var table = o.window.children("table");
    table.find("tr:has(td)").html("");
    var sortedActions = actions.sort((a,b) => {
      return a.id > b.id;
    });
    sortedActions.forEach((action) => {
      var row = $("<tr/>").appendTo(table);
      var idCell = $("<td class='idCell'/>").appendTo(row);
      var keyCell = $("<td class='keyCell'/>").appendTo(row);
      var descriptionCell = $("<td class='descriptionCell'/>").appendTo(row);
      var currentCell = $("<td class='currentCell'/>").appendTo(row);
      idCell.text(action.id);
      keyCell.text("" + o.keyCodesToNames(action.keySequence));
      descriptionCell.text(action.description);
      currentCell.text(o.tryRoundValue(action.getCurrentState()));
    });
  }

  private keyCodesToNames(keyCodes: number[]): string[] {
    return keyCodes.map((code) => {
      for (var prop in keysM) {
        if (keysM[prop] === code) {
          return prop;
        }
      }
    });
  }

  private tryRoundValue(value: any) {
    if (typeof value == "number") { return Math.round(100 * value) / 100; }
    else { return value; }
  }

}