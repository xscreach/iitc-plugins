import "./tabs.scss"

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
    this.tabs = tabs.map(t => new Tab(t.title, t.content));

    const nav = L.DomUtil.create("ul", "ui-tabs-nav nav", this.container);

    this.tabs.forEach((tab, i) => {
      L.DomUtil
        .create("li", "ui-tabs-tab", nav)
        .appendChild(tab.header);
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
  public readonly header: HTMLAnchorElement;
  public readonly content: HTMLDivElement;

  constructor(title: string, content: HTMLDivElement) {
    this.header = L.DomUtil.create("a");
    this.header.innerText = title;
    this.header.title = title;
    this.header.classList.add("ui-tabs-anchor");

    this.content = L.DomUtil.create('div', "ui-tabs-panel");
    this.content.append(content);

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
