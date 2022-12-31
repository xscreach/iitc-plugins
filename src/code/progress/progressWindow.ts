import {Dialog} from "../ui/dialog";
import {ProgressBar} from "../ui/progressBar";
import "./progressWindow.scss";
import type {SearchStatus, WmSearch} from "./search";

export class ProgressWindow extends Dialog {
  private static fields: { [key: string]: string} = {
    'status': 'Status:',
    'initialQueue': 'Initial Queue Size:',
    'remaining': 'Remaining:',
    'done': 'Done:',
    'ok': 'OK:',
    'detailsRequested': 'Portal Details Requested:',
    'waitingRequests': 'Requests waiting:',
    'runningRequests': 'Requests running:',
    'detailsCached': 'Portal Details from cache:',
    'detailsLoaded': 'Loaded Portal Details:',
    'errors': 'Portal Detail Errors:',
    'added': 'Markers Added:',
    'removed': 'Markers Removed:',
    'totalMarkers': 'Total Markers:',
    'durationText': 'Duration:'
  };

  private progressBarTotal: ProgressBar;
  private progressBarDetails: ProgressBar;

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
    this.progressBarTotal = new ProgressBar(['ok', 'errors'])
    this.progressBarDetails = new ProgressBar(['detailsCached', 'detailsLoaded', 'errors'])

    this.search.addEventListener('wasabee_markers:progress', () => {
      this.updateStatus(this.search.status);
    });
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

    this.progressBarTotal.appendTo(html);
    this.progressBarDetails.appendTo(html);

    this.updateFields(this.search.status);

    this.lastStatus = this.search.status.running;
    this.createDialog({
      title: 'Search progress',
      html: html,
      width: "350",
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

  public updateStatus(status: SearchStatus): void {
    this.updateFields(status);

    if (!this.enabled()) {
      this.enable();
    }

    if (status.running != this.lastStatus) {
      this.lastStatus = status.running;
      if (this.enabled()) {
        this.setButtons([status.running ? this.stopButton : this.startButton, this.closeButton]);
      }
    }
  }

  private updateFields(status: any) {
    Object.keys(ProgressWindow.fields).forEach(field => {
      const element = this.fieldMap[field];
      const value = status[field];
      element.innerText = value;
      element.setAttribute('data-value', value);
    });

    this.progressBarTotal.update(status, status.initialQueue);
    this.progressBarDetails.update(status, status.detailsRequested);
  }
}
