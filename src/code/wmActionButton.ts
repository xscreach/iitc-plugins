import {ConfigWindow} from "./config/configWindow";
import type {SearchStatus, WmSearch} from "./progress/search";
import "./wmActionButton.scss"
import {ActionButton} from "./ui/actionButton";

export class WasabeeActionButton extends ActionButton {

  constructor(private search: WmSearch) {
    super("wasabee-markers");
    this.search.addEventListener('wasabee_markers:progress', () => {
      this.updateSearchStatus(this.search.status);
    });
  }

  protected onClick() {
    if (this.search.hasRules()) {
      this.searchTears();
    } else {
      this.showConfigWindow();
    }
  }

  private searchTears(): void {
    this.search.start();
    this.updateSearchStatus(this.search.status);
  }

  public updateSearchStatus(status: SearchStatus): void {
    this.updateProgress(status.done, status.initialQueue, status.running);
  }

  private showConfigWindow() {
    new ConfigWindow(this.search).enable();
  }
}
