import {FieldBasics, FieldConfig} from "./field";

export interface SelectFieldConfig extends FieldConfig {
  options: SelectFieldOptions[],
  allowEmpty?: boolean
}

export class SelectFieldOptions {
  constructor(public value: string, public text: string) {
  }
}

export class SelectField extends FieldBasics {

  private selectBox?: HTMLSelectElement;

  constructor(private readonly config: SelectFieldConfig) {
    super('select', config);
  }

  protected createFieldHTMLElement(): HTMLInputElement | HTMLSelectElement {
    this.selectBox = L.DomUtil.create('select');
    this.config.options.forEach(value => this.selectBox?.add(this.createOptionElement(value)))
    return this.selectBox;
  }

  protected createOptionElement(option: SelectFieldOptions) {
    const optionElement = L.DomUtil.create('option');
    optionElement.value = option.value;
    optionElement.title = option.value;
    optionElement.innerText = option.text;
    return optionElement;
  }


  protected extractValue(model: any): string {
    let value = super.extractValue(model);
    if (typeof value === 'undefined' && this.config.options.length > 0) {
      value = this.config.options[0].value;
    }
    return value;
  }
}
