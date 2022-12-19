import type {ControlOptions} from "leaflet";
import {ConfigWindow} from "./config/configWindow";
import type {ProgressWindow} from "./progress/progressWindow";
import type {SearchStatus, WmSearch} from "./progress/search";
import * as WM from "./types/globals";
import "./wmActionButton.scss"

export class ActionButton extends L.Control {
  options: ControlOptions = {position: 'bottomleft'};

  private readonly progress: HTMLDivElement;
  private readonly progressBar: HTMLDivElement;
  private readonly containerDiv: HTMLDivElement;

  private readonly statusListener = () => this.updateStatus(this.search.status);

  constructor(private search: WmSearch, private readonly progressWindow: ProgressWindow) {
    super();
    this.containerDiv = L.DomUtil.create('div', 'action-button');
    this.progressBar = L.DomUtil.create('div', 'progress-bar');
    this.progress = L.DomUtil.create('div', 'progress', this.progressBar);

    L.DomEvent.addListener(this.containerDiv, 'click', () => {
      if (this.search.config.conditions && this.search.config.conditions.length > 0) {
        this.searchTears();
      } else {
        this.showConfigWindow();
      }
    });
  }

  onAdd(): HTMLElement {
    const controlDiv = L.DomUtil.create('div', `leaflet-${WM.PLUGIN_CSS_BASE} ${WM.PLUGIN_CSS_BASE}`);
    controlDiv.append(this.containerDiv);

    this.search.addEventListener('wasabee_markers:progress', this.statusListener);
    return controlDiv;
  }

  onRemove() {
    this.search.removeEventListener('wasabee_markers:progress', this.statusListener);
  }

  private searchTears(): void {
    this.search.start();
    this.progressWindow.enable();
    this.updateStatus(this.search.status)
  }

  private visualizeStart() {
    if (!this.containerDiv.classList.contains('working')) {
      this.containerDiv.classList.add('working');
      this.containerDiv.after(this.progressBar);
    }
  }

  private finish() {
    if (this.containerDiv.classList.contains('working')) {
      this.containerDiv.classList.remove('working');
      L.DomUtil.remove(this.progressBar);
    }
  }

  private updateStatus(status: SearchStatus): void {
    const total = status.initialQueue;
    const value = status.done;
    this.progress.style.width = (value / total) * 100 + '%';

    if (status.running) {
      this.visualizeStart();
    } else {
      this.finish();
    }
  }

  private showConfigWindow() {
    new ConfigWindow(this.search, this.progressWindow).enable();
  }
}
