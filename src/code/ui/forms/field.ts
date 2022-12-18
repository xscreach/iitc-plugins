import type {InputField} from "./inputField";
import {LabelField} from "./labelField";
import type {SelectField} from "./selectFieldOptions";

export interface Field {
  html(model: any): HTMLElement[]
}

export interface FieldTypeMap {
  'input': InputField,
  'select': SelectField
}

export abstract class FieldBasics implements Field {
  protected constructor(protected readonly type: keyof FieldTypeMap,
                        protected readonly name: string,
                        protected readonly label: string) {
  }

  id(): string {
    return `field-${this.type}-${this.name}`;
  }

  html(model: any): HTMLElement[] {
    return [
      ...new LabelField(this.id(), this.label).html(),
      this.createFieldElement(model)
    ];
  }

  protected createFieldElement(model: any): HTMLElement {
    const valueInput = this.createFieldHTMLElement();
    valueInput.id = this.id()
    this.setFieldValue(valueInput, model);
    this.addValueListener(valueInput, model);
    return valueInput;
  }

  protected setFieldValue(inputElement: HTMLInputElement | HTMLSelectElement, model: any) {
    inputElement.value = model[this.name];
  }

  protected addValueListener(inputElement: HTMLInputElement | HTMLSelectElement, model: any) {
    inputElement.addEventListener("change", () => {
      model[this.name] = inputElement.value;
    });
  }

  protected abstract createFieldHTMLElement(): HTMLInputElement | HTMLSelectElement;
}
