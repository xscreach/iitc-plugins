import type {Field} from "./field";

export class FieldSet implements Field {
  constructor(private fieldName: string, private legend: string, private fields: Field[]) {
  }
  html(model: any): HTMLElement[] {
    const fieldset = L.DomUtil.create('fieldset')
    const legendElement = L.DomUtil.create('legend', undefined, fieldset)
    legendElement.innerText = this.legend

    const fieldSetModel = model[this.fieldName];
    fieldset.append(...this.fields.flatMap(f => f.html(fieldSetModel)));

    return [fieldset];
  }
}
