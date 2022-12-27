import type {WmSearch} from "../progress/search";
import {Dialog} from "../ui/dialog";
import {BooleanCheckBoxField} from "../ui/forms/booleanCheckBoxField";
import {Form} from "../ui/forms/forms";
import {NumberInputField} from "../ui/forms/numberInputField";
import {Table} from "../ui/table";
import {Tabs} from "../ui/tabs";
import {getMarkerTypeName} from "../utils/wasabeeUtils";
import {WmConfigHolder, WmRule} from "./config";
import "./configWindow.scss";
import {RuleDialog} from "./ruleDialog";

export class ConfigWindow extends Dialog {

  private form: Form;

  private readonly searchButton: JQueryUI.ButtonOptions = {
    text: 'Search',
    click: () => {
      this.search.start();
    }
  }

  private readonly buttons: JQueryUI.ButtonOptions[] = [
    this.searchButton,
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
  private readonly ruleTable: Table<WmRule>;

  constructor(private readonly search: WmSearch) {
    super();
    this.updateButtons();
    this.form = this.createForm();
    this.ruleTable = this.createRuleTable();
  }

  addHooks() {
    this.displayDialog();
  }

  private displayDialog() {

    const ruleTab = this.createRuleTab();
    const optionsDiv = L.DomUtil.create('div');

    optionsDiv.append(this.form.html());

    const tabs = [
      {
        title: 'Rules',
        content: ruleTab
      },
      {
        title: 'Options',
        content: optionsDiv
      }
    ];

    const html = L.DomUtil.create("div", "container");
    new Tabs(tabs).appendTo(html);

    this.createDialog({
      title: "Wasabee Marker Config",
      html: html,
      width: "350",
      dialogClass: "wm-config",
      buttons: this.buttons,
      id: 'wm-config'
    });
  }

  closeDialog() {
    this.search.config = WmConfigHolder.config.copy();
    super.closeDialog();
  }

  private createRuleTab() {
    const ruleTab = L.DomUtil.create('div');
    this.ruleTable.appendTo(ruleTab);

    const buttonPane = L.DomUtil.create('div', 'ui-dialog-buttonpane', ruleTab);
    const buttonSet = L.DomUtil.create('div', 'ui-dialog-buttonset', buttonPane);
    const button = L.DomUtil.create('button', 'ui-button', buttonSet);
    button.innerText = 'Add Rule';
    button.addEventListener('click', () => {
      this.ruleDialog();
    });

    return ruleTab;
  }

  private updateWindow() {
    this.ruleTable.update();
    this.updateButtons();
  }

  private createLink(c: HTMLDivElement, innerText: string, title: string, onClick: () => void) {
    const dlt = L.DomUtil.create('a', undefined, c);
    dlt.title = title;
    dlt.innerText = innerText;
    dlt.addEventListener('click', onClick);
  }

  private createForm() {
    const formConfig = [
      new BooleanCheckBoxField({name: 'keepScanning', label: 'Scan when map with portals loaded'}),
      new BooleanCheckBoxField({name: 'autoUpload', label: 'Upload operation when done'}),
      new BooleanCheckBoxField({name: 'showProgress', label: 'Show progress'}),
      new BooleanCheckBoxField({name: 'showResults', label: 'Show results'}),
      new NumberInputField({name: "portalDetailThreads", label: "Max simultaneous portal detail requests", min: 1}),
      new NumberInputField({name: "portalDetailRequestDelay", label: "Delay between portal detail requests (ms)", min: 0})
    ];
    return new Form(this.search.config, formConfig);
  }

  private updateButtons() {
    this.searchButton.disabled = !this.search.hasRules();
    if (this.enabled()) {
      this.setButtons(this.buttons);
    }
  }

  private ruleDialog(rule?: WmRule) {
    new RuleDialog(this.search.config, rule)
      .showDialog()
      ?.then(() => this.updateWindow());
  }

  private createRuleTable() {
    return new Table({
      rows: this.search.config.rules,
      columns: [
        {
          name: 'name',
          valueRenderer: (c, rule) => {
            this.createLink(c, rule.name, 'Edit', () => {
              this.ruleDialog(rule);
            });
          }
        },
        {
          name: 'markerType',
          valueRenderer: (c, rule) => {
            this.createLink(c, getMarkerTypeName(rule.markerType), 'Edit', () => {
              this.ruleDialog(rule);
            });
          }
        },
      ],
      emptyText: 'No rules defined',
      addDeleteColumn: true
    });
  }
}
