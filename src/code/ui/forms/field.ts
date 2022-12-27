import type {InputField} from "./inputField";
import {LabelField} from "./labelField";
import type {SelectField} from "./selectField";

export interface Field {
  html(model: any): HTMLElement[]
}

export interface FieldTypeMap {
  'input': InputField,
  'select': SelectField
}

export type FieldConfig = {
  name: string,
  label: string,
  valueExtractor?: (model: any) => string,
  onChange?: (model: any, event: any) => void,
  disabled?: boolean
}

export abstract class FieldBasics implements Field {
  private valueInput: HTMLInputElement | HTMLSelectElement | undefined;

  protected constructor(protected readonly type: keyof FieldTypeMap,
                        protected readonly fieldConfig: FieldConfig) {

    this.fieldConfig = Object.assign({
      valueExtractor: (model: any) => model[fieldConfig.name],
      onChange: (model: any) => {
        model[this.fieldConfig.name] = this.valueInput?.value;
      },
      disabled: false
    }, fieldConfig)
  }

  id(): string {
    return `field-${this.type}-${this.fieldConfig.name}`;
  }

  html(model: any): HTMLElement[] {
    this.valueInput = this.createFieldHTMLElement();
    this.valueInput.id = this.id();
    if (this.fieldConfig.valueExtractor) {
      this.valueInput.value = this.fieldConfig.valueExtractor(model);
    }
    if (typeof this.fieldConfig.disabled !== 'undefined') {
      this.valueInput.disabled = this.fieldConfig.disabled;
    }
    this.valueInput.addEventListener("change", (ev) => {
      if (this.fieldConfig.onChange) {
        this.fieldConfig.onChange(model, ev);
      }
    });

    return [
      ...new LabelField(this.id(), this.fieldConfig.label).html(),
      this.valueInput
    ];
  }

  protected abstract createFieldHTMLElement(): HTMLInputElement | HTMLSelectElement;

  update(model: any) {
    if (this.valueInput && this.fieldConfig.valueExtractor) {
      this.valueInput.value = this.fieldConfig.valueExtractor(model);
    }
  }

  value(): string | undefined {
    return this.valueInput?.value;
  }

  disable() {
    if (this.valueInput && !this.fieldConfig.disabled) {
      this.valueInput.disabled = true;
      this.fieldConfig.disabled = true;
    }
  }

  enable() {
    if (this.valueInput && this.fieldConfig.disabled) {
      this.valueInput.disabled = false;
      this.fieldConfig.disabled = false;
    }
  }
}
