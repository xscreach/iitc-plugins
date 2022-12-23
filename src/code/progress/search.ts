import type {IITC} from "../../types/iitc";
import type {WmCondition, WmConfig} from "../config/config";
import {sleep} from "../utils/helpers";
import {interpolate} from "../utils/stringUtils";
import * as WU from "../utils/wasabeeUtils";

export class SearchStatus {
  readonly initialQueue: number;
  readonly startTime: number;

  detailsRequested = 0;
  detailsLoaded = 0;
  detailsCached = 0;
  errors = 0;

  added = 0;
  removed = 0;

  constructor(private queue: IITC.Portal[], public running = false) {
    this.initialQueue = queue.length;
    this.startTime = new Date().getTime();
  }

  get remaining(): number {
    return this.queue.length;
  }

  get done(): number {
    return this.initialQueue - this.remaining;
  }

  get ok(): number {
    return this.done - this.errors;
  }

  get runningRequests(): number {
    return this.detailsRequested - this.detailsCached - this.detailsLoaded - this.errors;
  }

  get duration(): number {
    return (new Date().getTime() - this.startTime);
  }

  get durationText(): string {
    const dur = this.duration;
    const hours = Math.trunc(dur / 3600000) % 24;
    const minutes = String(Math.trunc(dur / 60000) % 60).padStart(2, '0');
    const seconds = String(Math.trunc(dur / 1000) % 60).padStart(2, '0');
    const millis = String(Math.trunc(dur) % 1000).padStart(3, '0');
    return `${hours}h ${minutes}m ${seconds}s ${millis}ms`;
  }

  get totalMarkers(): number {
    if (plugin.wasabee) {
      return plugin.wasabee._selectedOp.markers.length
    }
    return 0;
  }

  get status(): string {
    if (this.running) {
      if (this.initialQueue == 0) {
        return 'preparing';
      }
      return 'running';
    }
    return 'done';
  }

  hasNext(): boolean {
    return this.queue && this.queue.length > 0;
  }

  next(): IITC.Portal | undefined {
    if (this.hasNext()) {
      return this.queue.shift();
    }
    return undefined;
  }
}

export class WmSearch extends EventTarget {
  public status: SearchStatus = new SearchStatus([]);
  private lastRequest = 0;

  constructor(public config: WmConfig) {
    super();
  }

  start() {
    if (!this.status.running && this.hasConditions()) {
      this.startSearch();
    }
  }

  hasConditions(): boolean {
    return this.config.conditions && this.config.conditions.length > 0;
  }

  stop() {
    this.status.running = false;
    this.done();
  }

  private prepareQueue(): IITC.Portal[] {
    return Object.values(portals).filter((portal) => this.checkLocation(portal))
  }

  private done() {
    this.markProgress();
    this.markProgress('done');
  }

  private startSearch(): void {
    this.status = new SearchStatus([], true);
    this.progressMarkingLoop();

    sleep(0)
      .then(() => this.search())
      .finally(() => this.stop());
  }

  private search(): Promise<void[]> {
    this.status = new SearchStatus(this.prepareQueue(), true);

    this.lastRequest = 0;
    return Promise.all(Array(Number(this.config.portalDetailThreads))
      .fill(0)
      .map(() => sleep(0).then(() => this.checkingLoop()))
    );
  }

  private checkLocation(portalNode: IITC.Portal): boolean {
    return this.isVisible(portalNode) && (!this.hasZonePoints() || this.isInZone(portalNode));
  }

  private isInZone(portalNode: IITC.Portal): boolean {
    if (this.hasZonePoints()) {
      return this.getZone().contains(portalNode.getLatLng());
    }
    return false;
  }

  private getZone() {
    let zone;
    if (
      plugin.wasabee
      && plugin.wasabee._selectedOp
      && plugin.wasabee._selectedOp.zones
      && plugin.wasabee._selectedOp.zones.length > 0
    ) {
      zone = plugin.wasabee._selectedOp.zones[0];
    }
    return zone;
  }

  private hasZonePoints() {
    const zone = this.getZone();
    if (zone && zone.points) {
      return zone.points.length > 0
    }
    return false;
  }

  private isVisible(portalNode: IITC.Portal) {
    return window.map.getBounds().contains(portalNode.getLatLng());
  }

  private async checkingLoop(): Promise<void> {
    while (this.status.running && this.status.hasNext()) {
      await this.checkNode(this.status.next());
    }
  }

  private async checkNode(portalNode?: IITC.Portal): Promise<void> {
    if (this.status.running && portalNode) {
      if (!this.checkLocation(portalNode)) {
        return
      }

      const portalOptions = portalNode.options;
      const conditions = this.config.conditions.filter(condition => this.checkTeam(condition, portalOptions) && this.checkLevel(condition, portalOptions))

      if (conditions.length > 0) {
        if (conditions.find(c => !c.mods || c.mods.length === 0)) {
          // no mods in condition, can mark immediately - nothing more to check
          this.addMarker(portalNode);
        } else {
          try {
            const portalDetailData = await this.getPortalDetail(portalOptions);
            if (portalDetailData) {
              if (this.checkPortalDetails(conditions, portalDetailData, portalOptions)) {
                this.addMarker(portalNode);
              } else {
                this.removeMarker(portalNode);
              }
            }
          } catch (e) {
            console.log("Error");
            this.status.errors++;
          }
        }
      } else {
        this.removeMarker(portalNode);
      }
    }
  }

  private getPortalDetail(portalOptions: IITC.PortalOptions): Promise<IITC.PortalDataDetail | undefined> {
    this.status.detailsRequested++;
    return new Promise<IITC.PortalDataDetail | undefined>((resolve, reject) => {
      const portalGuid = portalOptions.guid;
      if (portalDetail.isFresh(portalGuid)) {
        const portalDetailData = portalDetail.get(portalGuid)
        this.status.detailsCached++;
        resolve(portalDetailData);
      } else {
        let timeout = 0;
        if (this.lastRequest == 0) {
          this.lastRequest = new Date().getTime() - this.config.portalDetailRequestDelay;
        }
        const timeDiff = new Date().getTime() - this.lastRequest;
        if (timeDiff < this.config.portalDetailRequestDelay) {
          timeout = this.config.portalDetailRequestDelay - timeDiff;
        }
        this.lastRequest = new Date().getTime() + timeout;
        sleep(timeout)
          .then(() => portalDetail.request(portalGuid))
          .then(portalDetailData => {
            this.status.detailsLoaded++;
            resolve(portalDetailData);
          })
          .catch(() => {
            reject();
          });
      }
    });
  }

  private checkTeam(condition: WmCondition, portalOptions: IITC.PortalOptions) {
    return condition.factions.indexOf(portalOptions.team) >= 0;
  }

  private markProgress(type = 'progress') {
    this.dispatchEvent(new CustomEvent('wasabee_markers:' + type, {detail: this.status}));
  }

  private checkLevel(condition: WmCondition, portalOptions: IITC.PortalOptions): boolean {
    const value = interpolate(`\${${portalOptions.level} ${condition.levelComparator} ${condition.level}}`);
    return value.toLowerCase() == 'true';
  }

  private addMarker(portalNode: IITC.Portal) {
    const marker = WU.getMarker(this.config.markerType, portalNode.options.guid)
    if (!marker) {
      WU.addMarker(this.config.markerType, portalNode.options.guid, portalNode.getLatLng(), portalNode.options.data.title)
      this.status.added++;
    }
  }

  private removeMarker(portalNode: IITC.Portal) {
    const marker = WU.getMarker(this.config.markerType, portalNode.options.guid)
    if (marker) {
      WU.removeMarker(marker);
      this.status.removed++;
    }
  }

  private checkPortalDetails(conditions: WmCondition[], portalDetailData: IITC.PortalDataDetail, portalNodeOptions: IITC.PortalOptions) {
    return conditions
      .find(condition =>
        this.checkTeam(condition, portalNodeOptions)
        && this.checkLevel(condition, portalNodeOptions)
        && this.checkMods(condition, portalDetailData)
      );
  }

  private checkMods(condition: WmCondition, portalDetailData: IITC.PortalDataDetail) {
    return portalDetailData.mods
      .find(portalMod =>
        condition.mods
          .find(conditionMod => portalMod?.rarity == conditionMod.rarity && portalMod.name == conditionMod.type));
  }

  private progressMarkingLoop() {
    setTimeout(() => {
      if (this.status.running) {
        this.markProgress();
        this.progressMarkingLoop();
      }
    }, 250);
  }
}
