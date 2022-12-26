import "./booleanCheckboxField.scss"
import type {Field} from "./field";

export interface FieldDefinition {
  fieldName: string,
  label: string,
  valueExtractor?: (model: any) => boolean,
  onChange?: (model: any, e: any) => void,
  extraFields?: Field[]
}

export class BooleanCheckBoxField implements Field {

  constructor(private readonly fieldDef: FieldDefinition) {
    const defaults = {
      valueExtractor: (m: any) => !!m[this.fieldDef.fieldName],
      onChange: (model: any, e: any) => {
        model[this.fieldDef.fieldName] = !!e.target.checked;
      }
    };
    this.fieldDef = Object.assign(defaults, fieldDef)
  }

  html(model: any): HTMLElement[] {
    const container = L.DomUtil.create('div', 'boolean-checkbox')
    const fieldElement = L.DomUtil.create('input', undefined, container)
    fieldElement.type = 'checkbox';
    if (this.fieldDef.valueExtractor) {
      fieldElement.checked = this.fieldDef.valueExtractor(model);
    }
    fieldElement.id = 'checkbox-' + this.fieldDef.fieldName;
    fieldElement.addEventListener('change', (e: any) => {
      if (this.fieldDef.onChange) {
        this.fieldDef.onChange(model, e);
      }
    });
    const labelElement = L.DomUtil.create('label', undefined, container);
    labelElement.htmlFor = 'checkbox-' + this.fieldDef.fieldName;
    labelElement.innerText = this.fieldDef.label;

    if (this.fieldDef.extraFields) {
      container.append(...this.fieldDef.extraFields.flatMap(f => f.html(model)));
    }
    return [container];
  }
}
