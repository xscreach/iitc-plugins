import type {ControlOptions} from "leaflet";
import * as WM from "../wm-globals";
import "./actionButton.scss"

export abstract class ActionButton extends L.Control {
    options: ControlOptions = {position: 'bottomleft'};

    protected readonly progress: HTMLDivElement;
    protected readonly progressBar: HTMLDivElement;
    protected readonly containerDiv: HTMLDivElement;

    protected constructor(className?: string) {
      super();
      this.containerDiv = L.DomUtil.create('div', 'action-button ' + (className || ""));
      this.progressBar = L.DomUtil.create('div', 'progress-bar');
      this.progress = L.DomUtil.create('div', 'progress', this.progressBar);

      L.DomEvent.addListener(this.containerDiv, 'click', () => {
        this.onClick();
      });
    }

    protected abstract onClick(): void;

    onAdd(): HTMLElement {
        const controlDiv = L.DomUtil.create('div', `leaflet-${WM.PLUGIN_CSS_BASE} ${WM.PLUGIN_CSS_BASE} action-button-container`);
        controlDiv.append(this.containerDiv);

        return controlDiv;
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

    public updateProgress(value: number, total: number, running: boolean) {
        this.progress.style.width = (value / total) * 100 + '%';

        if (running) {
            this.visualizeStart();
        } else {
            this.finish();
        }
    }
}
