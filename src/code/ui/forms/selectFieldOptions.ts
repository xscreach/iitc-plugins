import {FieldBasics} from "./field";

export class SelectFieldOptions {
  constructor(public value: string, public text: string) {
  }
}

export class SelectField extends FieldBasics {
  constructor(readonly name: string,
              readonly label: string,
              readonly options: SelectFieldOptions[] = []) {
    super('select', name, label);
  }

  protected createFieldHTMLElement() {
    const selectBox: HTMLSelectElement = L.DomUtil.create('select');
    this.options.forEach(value => selectBox.add(this.createOptionElement(value)))
    return selectBox;
  }

  protected createOptionElement(option: SelectFieldOptions) {
    const optionElement = L.DomUtil.create('option');
    optionElement.value = option.value;
    optionElement.title = option.value;
    optionElement.textContent = option.text;
    return optionElement;
  }
}
