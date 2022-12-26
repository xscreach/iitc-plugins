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

export abstract class FieldBasics implements Field {
  private readonly valueExtractor: (model: any) => string;
  private readonly onChange: (mode: any, event: any) => void;

  private valueInput: HTMLInputElement | HTMLSelectElement | undefined;

  protected constructor(protected readonly type: keyof FieldTypeMap,
                        protected readonly name: string,
                        protected readonly label: string,
                        valueExtractor?: (model: any) => string,
                        onChange?: (mode: any, event: any) => void) {
    if (!valueExtractor) {
      valueExtractor = model => model[this.name];
    }
    this.valueExtractor = valueExtractor;

    if (!onChange) {
      onChange = (model) => {
        model[this.name] = this.valueInput?.value;
      };
    }
    this.onChange = onChange;
  }

  id(): string {
    return `field-${this.type}-${this.name}`;
  }

  html(model: any): HTMLElement[] {
    this.valueInput = this.createFieldHTMLElement();
    this.valueInput.id = this.id();
    this.valueInput.value = this.valueExtractor(model);
    this.valueInput.addEventListener("change", (ev) => {
      this.onChange(model, ev);
    });

    return [
      ...new LabelField(this.id(), this.label).html(),
      this.valueInput
    ];
  }

  protected abstract createFieldHTMLElement(): HTMLInputElement | HTMLSelectElement;

  update(model: any) {
    if (this.valueInput) {
      this.valueInput.value = this.valueExtractor(model);
    }
  }

  value(): string | undefined {
    return this.valueInput?.value;
  }
}
