import type {Field} from "./field";
import "./forms.scss";

export class Form {
  constructor(public model: any, private fields: Field[] = []) {
  }

  public html(): HTMLElement {
    const form = L.DomUtil.create('div', 'form');
    this.fields.forEach(field => form.append(...field.html(this.model)))
    return form;
  }
}
