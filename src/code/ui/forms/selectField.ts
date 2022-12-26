import {FieldBasics} from "./field";

export interface SelectFieldDef {
  name: string,
  label: string,
  options: SelectFieldOptions[]
  valueExtractor?: (model: any) => string
  onChange?: (model: any, event: any) => void
}

export class SelectFieldOptions {
  constructor(public value: string, public text: string) {
  }
}

export class SelectField extends FieldBasics {
  constructor(private readonly definition: SelectFieldDef) {
    super('select', definition.name, definition.label, definition.valueExtractor, definition.onChange);
  }

  protected createFieldHTMLElement() {
    const selectBox = L.DomUtil.create('select');
    this.definition.options.forEach(value => selectBox.add(this.createOptionElement(value)))
    return selectBox;
  }

  protected createOptionElement(option: SelectFieldOptions) {
    const optionElement = L.DomUtil.create('option');
    optionElement.value = option.value;
    optionElement.title = option.value;
    optionElement.innerText = option.text;
    return optionElement;
  }
}
