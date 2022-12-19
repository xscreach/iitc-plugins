import type {Field} from "./field";

export class BooleanCheckBoxField implements Field {

  constructor(private readonly fieldName: string, private readonly label: string) {
  }

  html(model: any): HTMLElement[] {
    const container = L.DomUtil.create('div', 'boolean-checkbox')
    const fieldElement = L.DomUtil.create('input', undefined, container)
    fieldElement.type = 'checkbox';
    fieldElement.checked = !!model[this.fieldName];
    fieldElement.id = 'checkbox-' + this.fieldName;
    fieldElement.addEventListener('change', (e: any) => {
      model[this.fieldName] = !!e.target.checked;
    })
    const labelElement = L.DomUtil.create('label', undefined, container);
    labelElement.htmlFor = 'checkbox-' + this.fieldName;
    labelElement.innerText = this.label;
    return [container];
  }
}
