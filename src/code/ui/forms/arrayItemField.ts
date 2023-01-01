import type {Field} from "./field";
import "./arratItemField.scss"
import fdp from "fast-deep-equal";

export class ArrayItemField<T> implements Field {

  private selected = false;

  constructor(public item: T,
              public itemRenderer?: (container: HTMLElement) => void) {
  }

  html(model: T[]): HTMLElement[] {
    this.selected = typeof model.find(value => fdp(value, this.item)) != 'undefined';

    const itemElement = L.DomUtil.create('div', 'array-item')
    if (this.selected) {
      itemElement.classList.add('selected');
    }

    itemElement.addEventListener('click', () => {
      if (this.selected) {
        itemElement.classList.remove('selected')
        model.splice(model.indexOf(this.item), 1)
      } else {
        itemElement.classList.add('selected')
        model.push(this.item);
      }
      this.selected = !this.selected;
      itemElement.dispatchEvent(new Event('change', {bubbles: true}))
    });

    if (this.itemRenderer) {
      this.itemRenderer(itemElement)
    }
    return [itemElement];
  }

}
