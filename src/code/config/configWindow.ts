import type {WmSearch} from "../progress/search";
import {Dialog} from "../ui/dialog";
import {BooleanCheckBoxField} from "../ui/forms/booleanCheckBoxField";
import {Form} from "../ui/forms/forms";
import {NumberInputField} from "../ui/forms/numberInputField";
import {Table} from "../ui/table";
import {Tabs} from "../ui/tabs";
import {getMarkerTypeName} from "../utils/wasabeeUtils";
import {WasabeeMarker, WmConfigHolder, WmRule} from "./config";
import "./configWindow.scss";
import {RuleDialog} from "./ruleDialog";

export class ConfigWindow extends Dialog {

  private form: Form;
  private readonly ruleTable: Table<WmRule>;
  private addRuleButton?: HTMLButtonElement;

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

  constructor(private readonly search: WmSearch) {
    super();
    this.updateDialogButtons();
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
    this.addRuleButton = L.DomUtil.create('button', 'ui-button', buttonSet);
    this.addRuleButton.innerText = 'Add Rule';
    this.addRuleButton.addEventListener('click', () => {
      this.ruleDialog();
    });
    this.updateTableButtons();

    return ruleTab;
  }

  private updateWindow() {
    this.ruleTable.update();
  }

  private updateButtons() {
    this.updateDialogButtons();
    this.updateTableButtons();
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

  private updateDialogButtons() {
    this.searchButton.disabled = !this.search.hasRules();
    if (this.enabled()) {
      this.setButtons(this.buttons);
    }
  }

  private ruleDialog(rule?: WmRule) {
    let ruleMarkerType = rule?.markerType;
    if (!ruleMarkerType) {
      ruleMarkerType = this.getNextUsableMarkerTypes()
    }

    if (ruleMarkerType) {
      new RuleDialog(this.search.config, ruleMarkerType, rule)
        .showDialog()
        ?.then(() => this.updateWindow());
    }
    else {
      alert('All marker types taken. Unable to create new rule')
    }
  }

  private getNextUsableMarkerTypes(): string | undefined {
    return Array(Object.keys(WasabeeMarker).length / 2).fill(0)
      .map((_, index) => WasabeeMarker[index])
      .filter(markerType => !this.search.config.rules.find(r => r.markerType === markerType))
      .shift();
  }

  private createRuleTable() {
    const table = new Table({
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
    table.addEventListener('update', () => this.updateButtons());
    return table;
  }

  private updateTableButtons() {
    if (this.addRuleButton) {
      this.addRuleButton.disabled = !this.getNextUsableMarkerTypes();
    }
  }
}
