import {WmComparatorTypes, WmCondition, WmConfig, WmModRarityText, WmModTypes} from "./config";
import {Dialog} from "../ui/dialog";
import type {Field} from "../ui/forms/field";
import {Form} from "../ui/forms/forms";
import {LabeledArrayField} from "../ui/forms/labeledArrayField";
import {NumberInputField} from "../ui/forms/numberInputField";
import {SelectField, SelectFieldOptions} from "../ui/forms/selectFieldOptions";

export class ConditionDialog extends Dialog {
  private readonly isNew: boolean;
  private readonly condition: WmCondition;
  private form: Form;

  constructor(private config: WmConfig, condition: WmCondition | undefined = undefined) {
    super();
    if (!condition) {
      this.isNew = true;
      this.condition = {
        level: 7,
        levelComparator: ">=",
        mods: [],
        factions: []
      };
    } else {
      this.isNew = false;
      this.condition = condition;
    }

    this.form = this.createForm();
  }

  private createForm() {
    const levelComparatorOptions = Object.keys(WmComparatorTypes).map((value) => new SelectFieldOptions(value, `${value} (${WmComparatorTypes[value]})`));
    const fields = [
      this.createFactionField(),
      new NumberInputField('level', "Level", 1, 8),
      new SelectField('levelComparator', "Level comparator", levelComparatorOptions),
      ...this.createModFields()
    ];
    return new Form(Object.assign({}, this.condition), fields);
  }

  private createModFields() {
    const fieldRows: Field[] = [];
    Object.keys(WmModTypes).forEach((modType) => {
      const modValues = WmModTypes[modType].map((rarity) => {
        return {type: modType, rarity: rarity};
      });
      fieldRows.push(new LabeledArrayField('mods', modType, modValues, (_, item, parent) => {
        const element = L.DomUtil.create('div', `${modType.replace(/\s/, '_')}`, parent);
        element.classList.add(item.rarity.replace(/\s/, '_'))
        element.textContent = WmModRarityText[item.rarity];
      }))
    });
    return fieldRows;
  }

  addHooks() {
    this._displayDialog();
  }

  private _displayDialog() {
    const html = L.DomUtil.create("div", "container");
    html.append(this.form.html())

    const okButtonName = this.isNew ? "Add" : "Save";

    const buttons = {
      [okButtonName]: () => {
        Object.assign(this.condition, this.form.model);
        if (this.isNew) {
          this.config.conditions.push(this.condition);
        }
        this.closeDialog();
      },
      "Cancel": () => {
        this.closeDialog();
      }
    };

    const title = this.isNew ? 'New' : 'Edit';
    let id = 'wm-config-condition';
    if (!this.isNew) {
      id += '-' + this.config.conditions.indexOf(this.condition);
    }
    this.createDialog({
      title: `${title} Condition`,
      html: html,
      width: "auto",
      dialogClass: 'wm-config-condition',
      buttons: buttons,
      id: id
    });
  }

  private createFactionField() {
    const values = TEAM_CODES.map((_, index) => index);
    return new LabeledArrayField('factions', 'Factions', values, (_, item, container) => {
      const element = L.DomUtil.create('div', TEAM_TO_CSS[item], container);
      element.textContent = TEAM_NAMES[item];
    });
  }
}
