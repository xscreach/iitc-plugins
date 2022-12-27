import {FieldBasics, FieldConfig} from "./field";

export class InputField extends FieldBasics {

  constructor(fieldConfig: FieldConfig) {
    super('input', fieldConfig);
  }

  protected createFieldHTMLElement(): HTMLInputElement | HTMLSelectElement {
    const valueInput: HTMLInputElement = L.DomUtil.create('input');
    this.inputAttributes(valueInput);
    return valueInput;
  }

  protected inputAttributes(valueInput: HTMLInputElement) {
    valueInput.type = "text";
  }
}
