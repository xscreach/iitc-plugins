import type {Field} from "./field";

export class LabelField implements Field {

  constructor(private readonly htmlFor: string,
              private readonly label: string) {
  }

  html(): HTMLElement[] {
    const labelElement = L.DomUtil.create('label');
    labelElement.htmlFor = this.htmlFor;
    labelElement.title = this.label;
    labelElement.textContent = this.label;
    return [labelElement];
  }

}
