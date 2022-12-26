import {Dialog} from "../ui/dialog";
import {BooleanCheckBoxField} from "../ui/forms/booleanCheckBoxField";
import type {Field} from "../ui/forms/field";
import {Form} from "../ui/forms/forms";
import {FormTabsElement} from "../ui/forms/formTabsElement";
import {LabeledArrayField} from "../ui/forms/labeledArrayField";
import {NumberInputField} from "../ui/forms/numberInputField";
import {SelectField, SelectFieldOptions} from "../ui/forms/selectField";

import "./conditionDialog.scss";
import {WmComparatorTypes, WmCondition, WmHistory, WmHistoryFields, WmModRarityText, WmModTypes, WmRule} from "./config";

export class ConditionDialog extends Dialog {
  private readonly isNew: boolean;
  private readonly condition: WmCondition;
  private form: Form;

  constructor(private rule: WmRule, condition: WmCondition | undefined = undefined) {
    super();
    if (!condition) {
      this.isNew = true;
      this.condition = {
        level: 7,
        levelComparator: ">=",
        mods: [],
        factions: [],
        history: {}
      };
    } else {
      this.isNew = false;
      this.condition = condition;
    }

    this.form = this.createForm();
  }

  private createForm() {
    const formModel = Object.assign({}, this.condition);

    const levelComparatorOptions = Object.keys(WmComparatorTypes).map((value) => new SelectFieldOptions(value, `${value} (${WmComparatorTypes[value]})`));
    const fields = [
      this.createFactionField(),
      new NumberInputField('level', "Level", 1, 8),
      new SelectField({name: 'levelComparator', label: "Level comparator", options: levelComparatorOptions}),
      new FormTabsElement([
        {
          name: 'Mods',
          fields: this.createModFields()
        },
        {
          name: 'History',
          fields: this.createHistoryFields(formModel.history),
          modelName: 'history',
        },
        {
          name: 'For Upgrade',
          fields: this.createSlotsFields()
        }
      ])
    ];
    return new Form(formModel, fields);
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
        element.innerText = WmModRarityText[item.rarity];
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
          this.rule.conditions.push(this.condition);
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
      id += '-' + this.rule.conditions.indexOf(this.condition);
    }
    this.createDialog({
      title: `${title} Condition`,
      html: html,
      width: "350",
      dialogClass: 'wm-config-condition',
      buttons: buttons,
      id: id
    });
  }

  private createFactionField() {
    const values = TEAM_CODES.map((_, index) => index);
    return new LabeledArrayField('factions', 'Factions', values, (_, item, container) => {
      const element = L.DomUtil.create('div', TEAM_TO_CSS[item], container);
      element.innerText = TEAM_NAMES[item];
    });
  }

  private createHistoryFields(formModel: WmHistory) {
    return Object.keys(WmHistoryFields).map((field) => {
      const selectField = new SelectField(
        {
          name: field,
          label: '',
          options: [true, false].map(v => new SelectFieldOptions(String(v), ((!v) ? 'Not ' : '') + WmHistoryFields[field])),
          valueExtractor: model => {
            let value = model[field];
            if (typeof value == 'undefined') {
              value = String(true);
            }
            return value;
          },
          onChange: (model, event) => {
            model[field] = event.target.value == "true";
          },
          disabled: typeof formModel[<keyof WmHistory>field] == 'undefined'
        }
      );

      return new BooleanCheckBoxField(
        {
          fieldName: field,
          label: WmHistoryFields[field],
          extraFields: [selectField],
          valueExtractor: model => typeof model[field] !== 'undefined',
          onChange: (model, e) => {
            if (!e.target.checked) {
              delete model[field];
              selectField.disable();
            } else {
              model[field] = selectField.value() == "true";
              selectField.enable();
            }
          }
        }
      );
    });
  }

  private createSlotsFields() {
    return [];
  }
}
