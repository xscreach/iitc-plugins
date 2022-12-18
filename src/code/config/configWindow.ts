import {WmCondition, WmConfig, WmConfigHolder, WmModRarityText} from "../config";
import {WmSearch} from "../progress/search";
import {WasabeeMarker} from "../types/globals";
import {Dialog} from "../ui/dialog";
import {Form} from "../ui/forms/forms";
import {NumberInputField} from "../ui/forms/numberInputField";
import {SelectField, SelectFieldOptions} from "../ui/forms/selectFieldOptions";
import {ConditionDialog} from "./conditionDialog";
import "./configWindow.scss";
import {ProgressWindow} from "./progressWindow";

export class ConfigWindow extends Dialog {

  private readonly config: WmConfig;
  private readonly search: WmSearch
  private readonly table: HTMLDivElement;
  private form: Form;

  constructor() {
    super();
    this.config = WmConfigHolder.config.copy();
    this.search = new WmSearch(this.config);
    this.form = this.createForm();
    this.table = L.DomUtil.create('div', 'wm-condition-table')
  }

  addHooks() {
    this._displayDialog();
  }


  private _displayDialog() {
    const html = L.DomUtil.create("div", "container");
    html.append(this.form.html());
    this.renderTable();
    html.append(this.table);

    const buttons = {
      "Search": () => {
        this.search.start();
        new ProgressWindow(this.search).enable();
      },
      "Add Condition": () => {
        this.conditionDialog();
      },
      "Save": () => {
        this.config.save();
      },
      "Close": () => {
        this.closeDialog();
      }
    };

    this.createDialog({
      title: "Wasabee Marker Config",
      html: html,
      width: "350",
      dialogClass: "wm-config",
      buttons: buttons,
      id: 'wm-config',
      closeCallback: () => this.renderTable()
    });
  }

  private createForm() {
    const options = Array(Object.keys(WasabeeMarker).length / 2)
      .fill(0)
      .map((_, index) => new SelectFieldOptions(WasabeeMarker[index], WasabeeMarker[index]));
    const formConfig = [
      new NumberInputField("portalDetailRequestDelay", "Delay between portal detail requests (ms)", 0),
      new SelectField("markerType", "Marker type", options),
    ];
    return new Form(this.config, formConfig);
  }

  private conditionLine(index: number, condition: WmCondition, html: HTMLDivElement) {
    const row = L.DomUtil.create('div', 'wm-condition-row', html);

    const id = L.DomUtil.create('div', 'wm-condition-index', row);
    id.textContent = String(index);

    const conditionElement = L.DomUtil.create('div', 'wm-condition-condition', row);
    const conditionAnchor = L.DomUtil.create('a', undefined, conditionElement);
    conditionAnchor.title = 'Edit';
    conditionAnchor.addEventListener('click', () => this.conditionDialog(condition));

    conditionAnchor.textContent += '('
    conditionAnchor.textContent += condition.factions.map(value => TEAM_NAMES[value]).join(', ')
    conditionAnchor.textContent += ') '

    conditionAnchor.textContent += String(condition.levelComparator)
    conditionAnchor.textContent += ' '
    conditionAnchor.textContent += String(condition.level);

    if (condition.mods && condition.mods.length > 0) {
      conditionAnchor.textContent += ` + [${condition.mods.map(v => WmModRarityText[v.rarity] + " " + v.type).join(", ")}]`
    }

    const actions = L.DomUtil.create('div', 'wm-condition-actions', row);

    const dlt = L.DomUtil.create('a', 'wm-condition-action-delete', actions);
    dlt.title = 'Delete';
    dlt.textContent = 'x';
    dlt.addEventListener('click', () => {
      this.config.conditions.splice(index, 1);
      this.renderTable();
    });
  }

  private renderTable() {
    L.DomUtil.empty(this.table);
    this.config.conditions.forEach((condition, i) => this.conditionLine(i, condition, this.table))
  }

  private conditionDialog(condition?: WmCondition) {
    new ConditionDialog(this.config, condition)
      .onClose(() => this.renderTable())
      .enable();
  }
}
