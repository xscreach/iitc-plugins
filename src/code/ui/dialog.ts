import "./dialog.scss"

export class Dialog extends L.Handler {
  options: DialogOptions = {};

  private _dialog: JQuery | undefined;
  private onCloseCallback?: () => void;

  constructor() {
    super(window.map);
  }

  addHooks() {
  }

  removeHooks() {
  }

  createDialog(options: DialogOptions): void {
    if (!this._dialog) {
      options.dialogClass = `wm-dialog wm-dialog-${options.dialogClass}`;

      options.closeCallback = () => {
        if (this.onCloseCallback) {
          this.onCloseCallback();
        }
        this.closeDialog();
      }

      L.setOptions(this, options);

      this._dialog = window.dialog(this.options);
    }
    this.setButtons(this.options.buttons);
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
    }
  }

  onClose(callback: () => any): Dialog {
    this.onCloseCallback = callback;
    return this;
  }
}
