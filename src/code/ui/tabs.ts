export interface TabConfig {
  title: string,
  content: HTMLDivElement
}

export class Tabs {

  private readonly container: HTMLDivElement ;
  private tabs: Tab[];
  private selectedTab = 0;

  constructor(tabs: TabConfig[], parent?: HTMLElement) {

    this.container = L.DomUtil.create('div', 'ui-tabs tabs wm-tabs', parent)
    this.tabs = tabs.map(t => new Tab(t));

    const nav = L.DomUtil.create("ul", "ui-tabs-nav nav", this.container);

    this.tabs.forEach((tab, i) => {
      nav.appendChild(tab.header);
      L.DomEvent.on(tab.header, "click", () => {
        this.tabs[this.selectedTab].deactivate();
        this.tabs[i].activate();
        this.selectedTab = i;
      });
      this.container.appendChild(tab.content);
    });

    if (this.tabs.length > 0) {
      this.tabs[0].activate();
    }
  }

  public appendTo(elementTo: HTMLElement) {
    elementTo.append(this.container);
  }
}

class Tab {
  public readonly header: HTMLElement;
  public readonly content: HTMLElement;

  constructor(tabConfig: TabConfig) {
    this.header = L.DomUtil.create("li", "ui-tabs-tab");
    const headerLink = L.DomUtil.create('a', 'ui-tabs-anchor', this.header);
    headerLink.innerText = tabConfig.title;
    headerLink.title = tabConfig.title;

    this.content = L.DomUtil.create('div', "ui-tabs-panel");
    this.content.append(tabConfig.content);
    this.deactivate();
  }

  activate() {
    this.header.classList.add("ui-tabs-active");
    this.content.style.display = "block";
  }

  deactivate() {
    this.header.classList.remove("ui-tabs-active");
    this.content.style.display = "none";
  }
}
