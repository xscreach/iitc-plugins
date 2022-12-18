import type {LeafletEvent} from "leaflet";
import type {SearchStatus, WmSearch} from "../progress/search";
import {Dialog} from "../ui/dialog";
import "./progressWindow.scss";

export class ProgressWindow extends Dialog {
  private static fields: { [key: string]: string} = {
    'running': 'Running',
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
  private initialized = false;
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
      this.search.stop();
      this.closeDialog();
    }
  };

  constructor(private search: WmSearch) {
    super();
    this.createDivs(Object.keys(ProgressWindow.fields));
    this.createDivs(ProgressWindow.progressFields, 'Progress');
    this.createDivs(ProgressWindow.progressFields2, 'Progress2');
  }

  private createDivs(fields: string[], suffix = '') {
    fields.forEach(field => {
      this.fieldMap[field + suffix] = L.DomUtil.create('div', field);
    })
  }

  addHooks() {
    this.displayDialog();
    map.on('wasabee_markers:progress', this.updateStatus, this);
    this.initialized = true;
  }

  removeHooks() {
    map.off('wasabee_markers:progress', this.updateStatus, this);
  }

  private displayDialog() {
    const html = L.DomUtil.create("div", "container");
    const form = L.DomUtil.create("div", "form", html);

    Object.keys(ProgressWindow.fields).forEach(field => {
      L.DomUtil.create('label', undefined, form).innerText = ProgressWindow.fields[field];
      form.append(this.fieldMap[field]);
    });

    this.appendProgressBar(html, ProgressWindow.progressFields, 'Progress');
    this.appendProgressBar(html, ProgressWindow.progressFields2, 'Progress2');

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
      closeCallback: () => this.search.stop(),
      id: 'wm-config-progress'
    });
  }

  private appendProgressBar(html: HTMLDivElement, fields: (keyof SearchStatus)[], suffix: string) {
    const progressBar = L.DomUtil.create('div', 'progress-bar', html);
    fields.forEach(field => {
      progressBar.append(this.fieldMap[field + suffix])
    });
  }

  private updateStatus(ev: LeafletEvent | { status: SearchStatus }): void {
    Object.keys(ProgressWindow.fields).forEach(field => {
      const element = this.fieldMap[field];
      const value = String(ev.status[field]);
      element.innerText = value;
      element.setAttribute('data-value', value);
    });

    this.updateProgressFields(ProgressWindow.progressFields, ev.status, 'Progress', ev.status.initialQueue);
    this.updateProgressFields(ProgressWindow.progressFields2, ev.status, 'Progress2', ev.status.detailsRequested);

    if (this.initialized && ev.status.running != this.lastStatus) {
      this.lastStatus = ev.status.running;
      this.setButtons([ev.status.running ? this.stopButton : this.startButton, this.closeButton]);
    }
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
