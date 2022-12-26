import {FieldBasics} from "./field";

export class InputField extends FieldBasics {

  constructor(readonly name: string,
              readonly label: string) {
    super('input', name, label);
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
