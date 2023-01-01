import {Dialog} from "../ui/dialog";
import {BooleanCheckBoxField} from "../ui/forms/booleanCheckBoxField";
import type {Field} from "../ui/forms/field";
import {Form} from "../ui/forms/forms";
import {FormTabsElement} from "../ui/forms/formTabsElement";
import {LabeledArrayField} from "../ui/forms/labeledArrayField";
import {NumberInputField} from "../ui/forms/numberInputField";
import {SelectField, SelectFieldOptions} from "../ui/forms/selectField";

import "./conditionDialog.scss";
import {WmComparatorTypes, WmCondition, WmHistory, WmHistoryFields, WmModRarityText, WmModTypes, WmRule, WmSlotConfig, wmSlotDefaults, wmSlotLabels} from "./config";

export class ConditionDialog extends Dialog {
  private readonly isNew: boolean;
  private readonly condition: WmCondition;
  private form: Form;

  private readonly saveButtonDef: JQueryUI.ButtonOptions = {
    text: '',
    click: () => {
      Object.assign(this.condition, this.form.model);
      if (this.isNew) {
        this.rule.conditions.push(this.condition);
      }
      this.closeDialog();
    }
  }

  private readonly buttons: JQueryUI.ButtonOptions[] = [
    this.saveButtonDef,
    {
      text: "Cancel",
      click: () => {
        this.closeDialog();
      }
    }
  ];

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
      new NumberInputField({name: 'level', label: "Level", min: 1, max: 8}),
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
          name: 'For Deploy',
          fields: this.createSlotsFields(formModel.slots),
          modelName: 'slots'
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
    const formElement = this.form.html();
    formElement.addEventListener('change', () => this.updateButtons())
    html.append(formElement)

    this.saveButtonDef.text = this.isNew ? "Add" : "Save";

    const title = this.isNew ? 'New' : 'Edit';
    let id = 'wm-config-condition';
    if (!this.isNew) {
      id += '-' + this.rule.conditions.indexOf(this.condition);
    }
    this.updateButtons();
    this.createDialog({
      title: `${title} Condition`,
      html: html,
      width: "350",
      dialogClass: 'wm-config-condition',
      buttons: this.buttons,
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

  private createHistoryFields(formModel?: WmHistory) {
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
          disabled: !formModel || typeof formModel[<keyof WmHistory>field] == 'undefined'
        }
      );

      return new BooleanCheckBoxField(
        {
          name: field,
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

  private createSlotsFields(slotConfig?: WmSlotConfig) {
    return Object.keys(wmSlotDefaults).map((field) => {
      const fieldName = <keyof WmSlotConfig>field;
      const inputField = new NumberInputField({
          name: field,
          label: 'Max',
          min: 1,
          max: (field === 'mods' ? 4 : 8),
          valueExtractor: model => {
            let value = model[field];
            if (typeof value === 'undefined') {
              value = wmSlotDefaults[<keyof WmSlotConfig>field];
            }
            return value;
          },
          disabled: !slotConfig || typeof slotConfig[fieldName] == 'undefined'
        }
      );
      return new BooleanCheckBoxField({
        name: field,
        label: wmSlotLabels[fieldName],
        extraFields: [inputField],
        valueExtractor: model => typeof model[field] !== 'undefined',
        onChange: (model, e) => {
          if (!e.target.checked) {
            delete model[field];
            inputField.disable();
          } else {
            model[field] = Number(inputField.value());
            inputField.enable();
          }
        }
      })
    });
  }

  private updateButtons() {
    const formModel: WmCondition = this.form.model
    this.saveButtonDef.disabled = formModel.factions.length === 0;
    if (this.enabled()) {
      this.setButtons(this.buttons);
    }
  }
}
