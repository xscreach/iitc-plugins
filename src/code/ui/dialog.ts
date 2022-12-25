import "./dialog.scss"

export class Dialog extends L.Handler {
  options: DialogOptions = {};

  private _dialog: JQuery | undefined;
  private dialogResolver?: any;
  private dialogPromise?: Promise<void>;

  constructor() {
    super(window.map);
  }

  showDialog(): Promise<void> | undefined {
    this.enable();
    return this.dialogPromise;
  }

  addHooks() {
  }

  removeHooks() {
  }

  createDialog(options: DialogOptions): void {
    this.dialogPromise = new Promise<void>((resolve) => {
      if (!this._dialog) {
        this.dialogResolver = resolve;
        options.dialogClass = `wm-dialog wm-dialog-${options.dialogClass}`;

        L.setOptions(this, options);

        this._dialog = window.dialog(this.options);
      }
      this.setButtons(this.options.buttons);
    });
  }

  setButtons(buttons?:
    | JQueryUI.ButtonOptions[]
    | { [key: string]: () => void }) {
    if (this._dialog) {
      this._dialog.dialog("option", "buttons", buttons);
    }
  }

  setTitle(title: string) {
    this.options.title = title;
    if (this._dialog) {
      this._dialog.dialog("option", "title", title);
    }
  }

  setContent(content: string): void {
    if (this._dialog) {
      this._dialog.html(content);
    }
  }

  closeDialog(): void {
    if (this._dialog) {
      this._dialog.dialog("close");
      delete this._dialog;
      this.disable();
      this.dialogResolver();
      delete this.dialogResolver;
      delete this.dialogPromise;
    }
  }
}
