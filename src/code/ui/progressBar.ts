import "./progressBar.scss";

export class ProgressBar {
  private readonly progressBar: HTMLDivElement;
  private bars: { [key: string]: HTMLDivElement } = {};

  constructor(private fields: string[]) {
    this.progressBar = L.DomUtil.create('div', 'progress-bar');
    fields.forEach(field => {
      this.bars[field] = L.DomUtil.create('div', String(field), this.progressBar);
    })
  }

  update(model: any, total: number) {
    this.fields.forEach(field => {
      const value = Number(model[field]);
      const bar = this.bars[field];
      bar.title = `${field}: ${value}`;
      const percentage = (value / total) * 100;
      bar.style.width = percentage + '%';
    })
  }

  appendTo(html: HTMLDivElement) {
    html.append(this.progressBar);
  }
}
