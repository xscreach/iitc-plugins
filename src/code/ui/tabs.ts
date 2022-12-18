export class Tabs {
  private tabs: Tab[];
  private selectedTab = 0;

  constructor(tabs: Tab[]) {
    this.tabs = tabs;
  }

  html() {
    const tabs = L.DomUtil.create("div", "ui-tabs tabs");
    const nav = L.DomUtil.create("ul", "ui-tabs-nav nav", tabs);

    this.tabs.forEach((tab, i) => {
      L.DomUtil
        .create("li", "ui-tabs-tab", nav)
        .appendChild(tab.header);
      L.DomEvent.on(tab.header, "click", () => {
        this.tabs[this.selectedTab].deactivate();
        this.tabs[i].activate();
        this.selectedTab = i;
      });
      tabs.appendChild(tab.content);
    });

    if (this.tabs.length > 0) {
      this.tabs[0].activate();
    }

    return tabs;
  }
}

export class Tab {
  get content(): HTMLDivElement {
    return this._content;
  }

  get header(): HTMLAnchorElement {
    return this._header;
  }

  private readonly _header: HTMLAnchorElement;
  private readonly _content: HTMLDivElement;

  constructor(title: string, content: HTMLDivElement) {
    this._header = L.DomUtil.create("a");
    this._header.textContent = title;
    this._header.title = title;
    this._header.classList.add("ui-tabs-anchor");

    this._content = L.DomUtil.create('div', "ui-tabs-panel");
    this._content.append(content);

    this.deactivate();
  }

  activate() {
    this._header.classList.add("ui-tabs-active");
    this._content.style.display = "block";
  }

  deactivate() {
    this._header.classList.remove("ui-tabs-active");
    this._content.style.display = "none";
  }
}
