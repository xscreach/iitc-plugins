import {InputField} from "./inputField";

export class NumberInputField extends InputField {
  constructor(readonly name: string,
              readonly label: string,
              readonly min?: number,
              readonly max?: number) {
    super(name, label);
  }

  protected inputAttributes(valueInput: HTMLInputElement) {
    valueInput.type = "number";
    if (this.min || this.min == 0) {
      valueInput.min = String(this.min);
    }
    if (this.max || this.max == 0) {
      valueInput.max = String(this.max);
    }
  }
}
