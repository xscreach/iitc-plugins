import {ArrayItemField} from "./arrayItemField";
import type {Field} from "./field";
import {LabelField} from "./labelField";

export class LabeledArrayField<T> implements Field {
  constructor(private readonly propertyName: string,
              private readonly label: string,
              private readonly values: T[],
              private readonly itemRenderer?: (index: number, item: T, container: HTMLElement) => void
  ) {
  }

  html(model: any): HTMLElement[] {
    const selectionContainer = L.DomUtil.create('div', 'labeled-array labeled-array-' + this.propertyName);

    this.values.forEach((value, index) => {
      const itemField = new ArrayItemField(value);
      if (this.itemRenderer) {
        itemField.itemRenderer = (container) => {
          if (this.itemRenderer) {
            this.itemRenderer(index, value, container);
          }
        }
      }
      selectionContainer.append(...itemField.html(model[this.propertyName]));
      return selectionContainer;
    });

    return [
      ...new LabelField('field-' + this.propertyName, this.label).html(),
      selectionContainer
    ];
  }
}
