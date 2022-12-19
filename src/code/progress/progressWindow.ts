import {Dialog} from "../ui/dialog";
import "./progressWindow.scss";
import type {SearchStatus, WmSearch} from "./search";

export class ProgressWindow extends Dialog {
  private static fields: { [key: string]: string} = {
    'status': 'Status',
    'initialQueue': 'Initial Queue Size',
    'remaining': 'Remaining',
    'done': 'Done',
    'ok': 'OK',
    'detailsRequested': 'Portal Details Requested',
    'detailsCached': 'Portal Details from cache',
    'detailsLoaded': 'Loaded Portal Details',
    'errors': 'Portal Detail Errors',
    'added': 'Markers Added',
    'removed': 'Markers Removed',
    'totalMarkers': 'Total Markers'
  };
  private static progressFields: (keyof SearchStatus)[] = ['ok', 'errors'];
  private static progressFields2: (keyof SearchStatus)[] = ['detailsCached', 'detailsLoaded', 'errors'];

  private fieldMap: { [key: string]: HTMLDivElement } = {};
  private lastStatus = false;

  private startButton = {
    text: "Start",
    click: () => {
      this.search.start();
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
      this.closeDialog();
    }
  };

  constructor(private search: WmSearch) {
    super();
    this.createDivs(Object.keys(ProgressWindow.fields));
    this.createDivs(ProgressWindow.progressFields, 'Progress');
    this.createDivs(ProgressWindow.progressFields2, 'Progress2');
  }

  enable(): this {
    if (
      this.search.config.showProgress && this.search.status.running
      || this.search.config.showResults && !this.search.status.running
    ) {
      super.enable();
    }
    return this;
  }

  addHooks() {
    this.displayDialog();
  }

  displayDialog() {
    const html = L.DomUtil.create("div", "container");
    const form = L.DomUtil.create("div", "form", html);

    Object.keys(ProgressWindow.fields).forEach(field => {
      L.DomUtil.create('label', undefined, form).innerText = ProgressWindow.fields[field];
      form.append(this.fieldMap[field]);
    });

    this.appendProgressBar(html, ProgressWindow.progressFields, 'Progress');
    this.appendProgressBar(html, ProgressWindow.progressFields2, 'Progress2');
    this.updateFields(this.search.status);

    this.lastStatus = this.search.status.running;
    this.createDialog({
      title: 'Search progress',
      html: html,
      width: "auto",
      dialogClass: 'wm-config-progress',
      buttons: [
        this.lastStatus ? this.stopButton : this.startButton,
        this.closeButton
      ],
      id: 'wm-config-progress'
    });
  }

  private createDivs(fields: string[], suffix = '') {
    fields.forEach(field => {
      this.fieldMap[field + suffix] = L.DomUtil.create('div', field);
    })
  }

  private appendProgressBar(html: HTMLDivElement, fields: (keyof SearchStatus)[], suffix: string) {
    const progressBar = L.DomUtil.create('div', 'progress-bar', html);
    fields.forEach(field => {
      progressBar.append(this.fieldMap[field + suffix])
    });
  }

  public updateStatus(status: SearchStatus): void {
    this.updateFields(status);

    if (!this.enabled()) {
      this.enable();
    }

    if (status.running != this.lastStatus) {
      this.lastStatus = status.running;
    }

    if (this.enabled()) {
      this.setButtons([status.running ? this.stopButton : this.startButton, this.closeButton]);
    }
  }

  private updateFields(status: any) {
    Object.keys(ProgressWindow.fields).forEach(field => {
      const element = this.fieldMap[field];
      const value = status[field];
      element.innerText = value;
      element.setAttribute('data-value', value);
    });

    this.updateProgressFields(ProgressWindow.progressFields, status, 'Progress', status.initialQueue);
    this.updateProgressFields(ProgressWindow.progressFields2, status, 'Progress2', status.detailsRequested);
  }

  private updateProgressFields(fields: (keyof SearchStatus)[], status: SearchStatus, mapSuffix: string, total: number) {
    fields.forEach(field => {
      this.updateProgressField(status, field, mapSuffix, total);
    });
  }

  private updateProgressField(status: SearchStatus, field: keyof SearchStatus, mapSuffix: string, total: number) {
    const value = Number(status[field]);
    const fieldElement = this.fieldMap[field + mapSuffix];
    fieldElement.title = `${field}: ${value}`
    const percentage = (value / total) * 100;
    fieldElement.style.width = percentage + '%';
  }
}
