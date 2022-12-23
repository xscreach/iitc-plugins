import {WasabeeMarker} from "../globals";
import type {ProgressWindow} from "../progress/progressWindow";
import type {WmSearch} from "../progress/search";
import {Dialog} from "../ui/dialog";
import {BooleanCheckBoxField} from "../ui/forms/booleanCheckBoxField";
import {Form} from "../ui/forms/forms";
import {NumberInputField} from "../ui/forms/numberInputField";
import {SelectField, SelectFieldOptions} from "../ui/forms/selectFieldOptions";
import {ConditionDialog} from "./conditionDialog";
import {WmCondition, WmConfigHolder, WmModRarityText} from "./config";
import "./configWindow.scss";

export class ConfigWindow extends Dialog {

  private readonly table: HTMLDivElement;
  private form: Form;

  private readonly searchButton: JQueryUI.ButtonOptions = {
    text: 'Search',
    click: () => {
      this.search.start();
      this.progress.enable();
    }
  }

  private readonly buttons: JQueryUI.ButtonOptions[] = [
    this.searchButton,
    {
      text: "Add Condition",
      click: () => {
        this.conditionDialog();
      }
    },
    {
      text: "Save",
      click: () => {
        this.search.config.save();
      }
    }, {
      text: "Close",
      click: () => {
        this.closeDialog();
      }
    }];

  constructor(private readonly search: WmSearch, private readonly progress: ProgressWindow) {
    super();
    this.form = this.createForm();
    this.table = L.DomUtil.create('div', 'wm-condition-table')
    this.updateButtons();
  }

  addHooks() {
    this._displayDialog();
  }

  private _displayDialog() {
    const html = L.DomUtil.create("div", "container");
    html.append(this.form.html());
    this.renderTable();
    html.append(this.table);

    this.createDialog({
      title: "Wasabee Marker Config",
      html: html,
      width: "350",
      dialogClass: "wm-config",
      buttons: this.buttons,
      id: 'wm-config',
      closeCallback: () => { this.search.config = WmConfigHolder.config.copy() }
    });
  }

  private createForm() {
    let strings: { [key: string]: string } = {};
    if (plugin.wasabee?.static.strings) {
      const language = localStorage['wasabee-language'] || 'English'
      strings = plugin.wasabee?.static.strings[language]
    }

    const options = Array(Object.keys(WasabeeMarker).length / 2)
      .fill(0)
      .map((_, index) => new SelectFieldOptions(WasabeeMarker[index], strings[WasabeeMarker[index]] || WasabeeMarker[index]));
    const formConfig = [
      new BooleanCheckBoxField("keepScanning", "Scan when map with portals loaded"),
      new BooleanCheckBoxField("autoUpload", "Upload operation when done"),
      new BooleanCheckBoxField("showProgress", "Show progress"),
      new BooleanCheckBoxField("showResults", "Show results"),
      new NumberInputField("portalDetailThreads", "Max simultaneous portal detail requests", 1),
      new NumberInputField("portalDetailRequestDelay", "Delay between portal detail requests (ms)", 0),
      new SelectField("markerType", "Marker type", options),
    ];
    return new Form(this.search.config, formConfig);
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
      this.search.config.conditions.splice(index, 1);
      this.updateWindow();
    });
  }

  private updateWindow() {
    this.updateButtons();
    this.renderTable();
  }

  private renderTable() {
    L.DomUtil.empty(this.table);
    this.search.config.conditions.forEach((condition, i) => this.conditionLine(i, condition, this.table))
  }

  private conditionDialog(condition ?: WmCondition) {
    new ConditionDialog(this.search.config, condition)
      .onClose(() => this.updateWindow())
      .enable();
  }

  private updateButtons() {
    this.searchButton.disabled = !this.search.hasConditions();
    if (this.enabled()) {
      this.setButtons(this.buttons);
    }
  }
}
