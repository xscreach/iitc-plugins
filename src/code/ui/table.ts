import "./table.scss"

export interface ColumnDef<T> {
  name: string,
  valueRenderer?: (element: HTMLDivElement, value: T, index: number) => void,
  width?: string // default 'auto'
}

export class Table<T> {
  private readonly container: HTMLDivElement;

  constructor(private rows: T[], private columns: ColumnDef<T>[], public emptyText = 'Table is empty', parent?: HTMLElement) {
    this.container = L.DomUtil.create('div', 'wm-table', parent);
    this.update();
  }

  public appendTo(elementTo: HTMLElement): void {
    elementTo.append(this.container);
  }

  public update(rows?: T[]) {
    if (rows) {
      this.rows = rows;
    }

    L.DomUtil.empty(this.container);
    if (this.rows.length == 0) {
      const captionColumn = L.DomUtil.create('div', 'wm-table-column', this.container);
      captionColumn.innerText = this.emptyText;
      this.container.style.gridTemplateColumns = 'auto';
    } else {
      this.container.style.gridTemplateColumns = this.columns.map(c => c.width || 'auto').join(" ");
      this.rows.forEach((r, i) => this.renderRow(r, i));
    }
  }

  private renderRow(value: T, index: number) {
    this.columns.forEach((c) => this.renderColumn(value, index, c, this.container));
  }

  private renderColumn(value: T, rowIndex: number, columnDef: ColumnDef<T>, parent: HTMLDivElement) {
    const column = L.DomUtil.create('div', 'wm-table-column', parent);
    if (columnDef.valueRenderer) {
      columnDef.valueRenderer(column, value, rowIndex);
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      column.innerText = value[columnDef.name];
    }
  }
}
