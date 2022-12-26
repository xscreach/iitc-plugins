import {FieldBasics} from "./field";

export interface SelectFieldDef {
  name: string,
  label: string,
  options: SelectFieldOptions[]
  valueExtractor?: (model: any) => string
  onChange?: (model: any, event: any) => void
  disabled?: boolean
}

export class SelectFieldOptions {
  constructor(public value: string, public text: string) {
  }
}

export class SelectField extends FieldBasics {

  private selectBox?: HTMLSelectElement;

  constructor(private readonly definition: SelectFieldDef) {
    super('select', definition.name, definition.label, definition.valueExtractor, definition.onChange, definition.disabled);
  }

  protected createFieldHTMLElement(): HTMLInputElement | HTMLSelectElement {
    this.selectBox = L.DomUtil.create('select');
    this.definition.options.forEach(value => this.selectBox?.add(this.createOptionElement(value)))
    return this.selectBox;
  }

  protected createOptionElement(option: SelectFieldOptions) {
    const optionElement = L.DomUtil.create('option');
    optionElement.value = option.value;
    optionElement.title = option.value;
    optionElement.innerText = option.text;
    return optionElement;
  }
}
