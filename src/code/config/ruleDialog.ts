import {Dialog} from "../ui/dialog";
import {Form} from "../ui/forms/forms";
import {InputField} from "../ui/forms/inputField";
import {SelectField, SelectFieldOptions} from "../ui/forms/selectField";
import {Table} from "../ui/table";
import {copy} from "../utils/helpers";
import {getMarkerTypeName} from "../utils/wasabeeUtils";
import {ConditionDialog} from "./conditionDialog";
import {WasabeeMarker, WmCondition, WmConfig, WmHistoryFields, WmModRarityText, WmRule} from "./config";
import "./ruleDialog.scss";

export class RuleDialog extends Dialog {
  private readonly rule: WmRule;
  private readonly form: Form;
  private readonly table: Table<WmCondition>;

  constructor(private readonly config: WmConfig, markerType: string, private readonly originalRule?: WmRule) {
    super();
    if (originalRule) {
      this.rule = copy(originalRule);
    } else {
      this.rule = new WmRule(markerType);
    }

    this.form = this.createForm();
    this.table = new Table({
      rows: this.rule.conditions,
      columns: [
        {
          name: 'condition',
          valueRenderer: (element, condition) => {
            element.classList.add('wm-condition-condition')
            const conditionAnchor = L.DomUtil.create('a', undefined, element);
            conditionAnchor.addEventListener('click', () => this.conditionDialog(condition));
            const conditionText = this.getConditionString(condition);
            conditionAnchor.title = conditionText;
            conditionAnchor.innerText = conditionText;
          }
        },
      ],
      emptyText: 'No conditions defined.',
      addDeleteColumn: true
    });
    this.table.addEventListener('update', () => this.updateButtons());
  }

  private getConditionString(condition: WmCondition): string {
    const factions = condition.factions.map(value => TEAM_NAMES[value]).join(', ');
    let conditionText = `(${factions}) ${String(condition.levelComparator)} ${String(condition.level)}`;
    if (condition.mods && condition.mods.length > 0) {
      conditionText += ` + [${condition.mods.map(v => WmModRarityText[v.rarity] + " " + v.type).join(', ')}]`
    }

    if (condition.history && Object.keys(condition.history).length > 0) {
      conditionText += ` + [${Object.keys(condition.history).map(name => WmHistoryFields[name]).join(', ')}]`;
    }
    return conditionText;
  }

  private saveButtonDef: JQueryUI.ButtonOptions = {
    text: '',
    click: () => {
      this.save();
      this.closeDialog();
    }
  };

  private closeButtonDef: JQueryUI.ButtonOptions = {
    text: 'Close',
    click: () => {
      this.closeDialog();
    }
  };

  addHooks() {
    const html = L.DomUtil.create("div", "container");

    html.append(this.form.html());
    this.table.appendTo(html);

    const buttonPane = L.DomUtil.create('div', 'ui-dialog-buttonpane', html);
    const buttonSet = L.DomUtil.create('div', 'ui-dialog-buttonset', buttonPane);
    const button = L.DomUtil.create('button', 'ui-button', buttonSet);
    button.innerText = 'Add Condition';
    button.addEventListener('click', () => {
      this.conditionDialog();
    });

    let title = "New rule";
    let id = 'wm-config-rule';
    let okButtonText = 'Add';

    if (this.originalRule) {
      title = 'Editing rule ' + this.originalRule.name;
      id += '-' + this.originalRule?.name.replace(/\s+/g, '-');
      okButtonText = 'Save'
    }

    this.saveButtonDef.text = okButtonText;
    this.updateButtons();

    this.createDialog({
      id: id,
      title: title,
      html: html,
      width: "350",
      dialogClass: "wm-config-rule",
      buttons: [this.saveButtonDef, this.closeButtonDef],
    });
  }

  private updateButtons() {
    this.saveButtonDef.disabled = !this.rule.conditions || this.rule.conditions.length === 0;
    if (this.enabled()) {
      this.setButtons([this.saveButtonDef, this.closeButtonDef]);
    }
  }

  private save() {
    if (this.originalRule) {
      Object.assign(this.originalRule, this.rule);
    } else {
      this.config.rules.push(this.rule);
    }
  }

  private createForm() {

    const options = Array(Object.keys(WasabeeMarker).length / 2)
      .fill(0)
      .map((_, index) => WasabeeMarker[index])
      .filter(markerType => this.rule.markerType === markerType || !this.config.rules.find(r => r.markerType === markerType))
      .map(markerType => new SelectFieldOptions(markerType, getMarkerTypeName(markerType)))

    const formConfig = [
      new InputField({name: "name", label: "Rule name"}),
      new SelectField({name: "markerType", label: "Marker type", options: options}),
    ];
    return new Form(this.rule, formConfig);
  }

  private conditionDialog(condition ?: WmCondition) {
    new ConditionDialog(this.rule, condition)
      .showDialog()
      ?.then(() => this.updateTable());
  }

  private updateTable() {
    this.table.update();
  }
}
