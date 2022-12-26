import type {TabConfig} from "../tabs";
import {Tabs} from "../tabs";
import type {Field} from "./field";
import "./formTabsElement.scss"

export interface FormTabDef {
  name: string
  fields: Field[]
  modelName?: string,
  defaultValue?: any
}

export class FormTabsElement implements Field {
  constructor(private readonly tabDefinitions: FormTabDef[]) {
  }

  html(model: any): HTMLElement[] {
    const tabs: TabConfig[] = this.tabDefinitions.map(definition => {
      let m = model;
      if (definition.modelName) {
        if (!model[definition.modelName]) {
          model[definition.modelName] = definition.defaultValue || {};
        }
        m = model[definition.modelName];
      }
      const tabContent = L.DomUtil.create('div', 'form');
      if (definition.modelName) {
        tabContent.classList.add('form-' + definition.modelName);
      }
      tabContent.append(...definition.fields.flatMap(f => f.html(m)));
      return {
        title: definition.name,
        content: tabContent
      }
    });
    const container = L.DomUtil.create('div', 'form-tabs');
    new Tabs(tabs).appendTo(container);
    return [container];
  }
}
