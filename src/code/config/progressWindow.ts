import type {SearchStatus, WmSearch} from "../progress/search";
import {Dialog} from "../ui/dialog";
import "./progressWindow.scss";

export class ProgressWindow extends Dialog {
  private static fields: (keyof SearchStatus)[] = [
    'running',
    'initialQueue',
    'remaining',
    'done',
    'ok',
    'detailsRequested',
    'detailsCached',
    'detailsLoaded',
    'errors',
    'added',
    'removed',
    'totalMarkers'
  ];
  private static progressFields: (keyof SearchStatus)[] = ['ok', 'errors'];
  private static progressFields2: (keyof SearchStatus)[] = ['detailsCached', 'detailsLoaded', 'errors'];

  private fieldMap: { [key: string]: HTMLDivElement } = {};
  private initialized = false;

  private startButton = {
    text: "Start",
    click: () => {
      this.startSearch();
    }
  };

  private stopButton = {
    text: "Stop",
    click: () => {
      this.search.stop();
    }
  };

  private closeButton = {
    text: "Close",
    click: () => {
      this.search.stop();
      this.closeDialog();
    }
  };

  constructor(private search: WmSearch) {
    super();
    ProgressWindow.fields.forEach(field => {
      this.fieldMap[field] = L.DomUtil.create('div');
    });
    ProgressWindow.progressFields.forEach(field => {
      this.fieldMap[field + 'Progress'] = L.DomUtil.create('div', field);
    })
    ProgressWindow.progressFields2.forEach(field => {
      this.fieldMap[field + 'Progress2'] = L.DomUtil.create('div', field);
    })
  }

  addHooks() {
    this.displayDialog();

    this.search
      .progress(() => {
        this.updateStatus();
      });
    this.startSearch();
    this.initialized = true;
  }

  private startSearch() {
    this.search.start();
  }

  private displayDialog() {
    const html = L.DomUtil.create("div", "container");
    const form = L.DomUtil.create("div", "form", html);

    ProgressWindow.fields.forEach(field => {
      L.DomUtil.create('label', undefined, form).innerText = field;
      form.append(this.fieldMap[field]);
    });

    const progressBar = L.DomUtil.create('div', 'progress-bar', html);
    ProgressWindow.progressFields.forEach(field => {
      progressBar.append(this.fieldMap[field + 'Progress'])
    });
    const progressBar2 = L.DomUtil.create('div', 'progress-bar', html);
    ProgressWindow.progressFields2.forEach(field => {
      progressBar2.append(this.fieldMap[field + 'Progress2'])
    });

    this.createDialog({
      title: 'Search progress',
      html: html,
      width: "300",
      dialogClass: 'wm-config-progress',
      buttons: [
        this.search.status.running ? this.stopButton : this.startButton,
        this.closeButton
      ],
      closeCallback: () => this.search.stop(),
      id: 'wm-config-progress'
    });
  }

  private updateStatus() {
    ProgressWindow.fields.forEach(field => {
      const element = this.fieldMap[field];
      const value = String(this.search.status[field]);
      element.innerText = value;
      element.setAttribute('data-value', value);
    });
    ProgressWindow.progressFields.forEach(field => {
      this.updateProgressField(field, 'Progress', this.search.status.initialQueue);
    });
    ProgressWindow.progressFields2.forEach(field => {
      this.updateProgressField(field, 'Progress2', this.search.status.detailsRequested);
    });
    if (this.initialized) {
      this.setButtons([this.search.status.running ? this.stopButton : this.startButton, this.closeButton]);
    }
  }

  private updateProgressField(field: keyof SearchStatus, mapSuffix: string, total: number) {
    const value = Number(this.search.status[field]);
    const fieldElement = this.fieldMap[field + mapSuffix];
    fieldElement.title = `${field}: ${value}`
    const percentage = (value / total) * 100;
    fieldElement.style.width = percentage + '%';
  }
}
