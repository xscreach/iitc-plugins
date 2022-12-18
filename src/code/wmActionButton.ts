import type {ControlOptions} from "leaflet";
import * as WM from "./types/globals";
import "./wmActionButton.scss"

export class ActionButton extends L.Control {
  options: ControlOptions = { position: 'bottomleft' };

  private readonly progress: HTMLDivElement;
  private readonly progressBar: HTMLDivElement;
  private readonly containerDiv: HTMLDivElement;

  //TODO: hide into some search service
  private running = false;

  constructor() {
    super();
    this.containerDiv = L.DomUtil.create('div', 'action-button');
    this.progressBar = L.DomUtil.create('div', 'progress-bar');
    this.progress = L.DomUtil.create('div', 'progress', this.progressBar);

    L.DomEvent.addListener(this.containerDiv, 'click', () => this.searchTears());
  }

  onAdd(): HTMLElement {
    const controlDiv = L.DomUtil.create('div', `leaflet-${WM.PLUGIN_CSS_BASE} ${WM.PLUGIN_CSS_BASE}`);
    controlDiv.append(this.containerDiv);
    return controlDiv;
  }

  async searchTears(): Promise<void> {
    this.visualizeStart();
    try {
      if (!this.running) {
        this.running = true;
        await this.doSearchTears();
      }
    } finally {
      this.finish();
    }
  }

  private visualizeStart() {
    this.containerDiv.classList.add('working');
    this.progress.style.width = '0%';
    this.containerDiv.after(this.progressBar);
  }

  private finish() {
    this.running = false;
    this.containerDiv.classList.remove('working');
    // this.showResults();
    L.DomUtil.remove(this.progressBar);
  }

  // eslint-disable-next-line require-await
  private async doSearchTears() {
    Array(99999).fill(0).forEach((_value, index) => this.markProgress(index, 99999))
    // TODO: create "search service" and run it...
  }

  private markProgress(index: number, total: number) {
    this.progress.style.width = ((total - index) / total) * 100 + '%';
  }
}
