import type {FieldConfig} from "./field";
import {InputField} from "./inputField";

export interface NumberInputFieldConfig extends FieldConfig {
  min?: number
  max?: number
}

export class NumberInputField extends InputField {
  constructor(private config: NumberInputFieldConfig) {
    super(Object.assign({
      onChange: (model: any, event: JQuery.ChangeEvent) => {
        model[config.name] = Number(event.target?.value)
      },
    }, config));
  }

  protected inputAttributes(valueInput: HTMLInputElement) {
    valueInput.type = "number";
    if (typeof this.config.min !== 'undefined') {
      valueInput.min = String(this.config.min);
    }
    if (typeof this.config.max !== 'undefined') {
      valueInput.max = String(this.config.max);
    }
  }
}
