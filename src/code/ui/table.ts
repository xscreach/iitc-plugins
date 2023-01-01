import "./table.scss"

export interface ColumnDef<T> {
  name: string,
  valueRenderer?: (element: HTMLDivElement, value: T, index: number) => void,
  width?: string // default 'auto'
}

export interface TableDef<T> {
  rows: T[];
  columns: ColumnDef<T>[]
  emptyText?: string
  parent?: HTMLElement
  addDeleteColumn?: boolean
}

export class Table<T> extends EventTarget {
  private readonly container: HTMLDivElement;

  constructor(private readonly options: TableDef<T>) {
    super();
    this.container = L.DomUtil.create('div', 'wm-table', this.options.parent);
    if (this.options.addDeleteColumn) {
      this.options.columns.push(
        {
          name: 'actions',
          width: '5%',
          valueRenderer: (element, _, index) => {
            const dlt = L.DomUtil.create('a', 'wm-condition-action-delete', element);
            dlt.title = 'Delete';
            dlt.innerText = 'x';
            dlt.addEventListener('click', () => {
              this.options.rows.splice(index, 1);
              this.update();
            });
          }
        }
      );
    }
    this.update();
  }

  public appendTo(elementTo: HTMLElement): void {
    elementTo.append(this.container);
  }

  public update(rows?: T[]) {
    if (rows) {
      this.options.rows = rows;
    }

    L.DomUtil.empty(this.container);
    if (this.options.rows.length == 0) {
      const captionColumn = L.DomUtil.create('div', 'wm-table-column', this.container);
      captionColumn.innerText = this.options.emptyText || 'Table is empty';
      this.container.style.gridTemplateColumns = 'auto';
    } else {
      this.container.style.gridTemplateColumns = this.options.columns.map(c => c.width || 'auto').join(" ");
      this.options.rows.forEach((r, i) => this.renderRow(r, i));
    }
    this.dispatchEvent(new CustomEvent('update', {detail: this.options.rows}));
  }

  private renderRow(value: T, index: number) {
    this.options.columns.forEach((c) => this.renderColumn(value, index, c, this.container));
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
