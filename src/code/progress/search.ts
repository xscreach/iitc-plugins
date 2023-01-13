import type {IITC} from "../../types/iitc";
import type {WmCondition, WmConfig, WmHistory, WmRule} from "../config/config";
import {interpolate, sleep} from "../utils/helpers";
import {addMarker, getMarker, getPortalMarkers, removeMarker} from "../utils/wasabeeUtils";

export class SearchStatus {
  readonly initialQueue: number;
  readonly startTime: number;

  detailsRequested = 0;
  detailsCached = 0;
  detailsLoading = 0;
  detailsLoaded = 0;
  errorGuids: string[] = [];

  added = 0;
  removed = 0;

  constructor(private queue: IITC.Portal[], public running = false) {
    this.initialQueue = queue.length;
    this.startTime = new Date().getTime();
  }

  get errors(): number {
    return this.errorGuids.length;
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
    return this.detailsLoading - this.detailsLoaded - this.errors;
  }

  get waitingRequests(): number {
    return this.detailsRequested - this.detailsLoading - this.detailsCached;
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

  canRetry(): boolean {
    return this.errors > 0;
  }
}

export class WmSearch extends EventTarget {
  public status: SearchStatus = new SearchStatus([]);
  private lastRequest = 0;

  constructor(public config: WmConfig) {
    super();

    addHook("mapDataRefreshEnd", () => {
      if (window.getDataZoomTileParameters().hasPortals && this.config.keepScanning) {
        this.start();
      }
    });
  }

  start(retry?: boolean) {
    if (!this.status.running && this.hasRules()) {
      this.startSearch(retry);
    }
  }

  hasRules(): boolean {
    return this.config.rules && this.config.rules.length > 0 && !!this.config.rules.find(value => value.conditions && value.conditions.length > 0);
  }

  stop() {
    this.status.running = false;
    this.done();
  }

  private prepareQueue(): IITC.Portal[] {
    return Object.values(portals).filter((portal) => this.checkLocation(portal))
  }

  private done() {
    if (this.config.autoUpload && (this.status.added > 0 || this.status.removed > 0)) {
      plugin.wasabee?.buttons.options.buttons.get("uploadButton").button.click();
    }
    this.markProgress();
  }

  private startSearch(retry?: boolean): void {
    let retryQueue: IITC.Portal[] | undefined;
    if (retry) {
      retryQueue = this.status.errorGuids.map(guid => portals[guid]);
    }
    this.status = new SearchStatus([], true);
    this.markProgress();
    this.progressMarkingLoop();

    sleep(0)
      .then(() => this.search(retryQueue))
      .finally(() => this.stop());
  }

  private search(retryQueue?: IITC.Portal[]): Promise<void[]> {
    this.status = new SearchStatus(retryQueue || this.prepareQueue(), true);

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
      await this.checkPortalDetails(this.config.rules, portalNode);
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
        sleep(this.calculateRequestTimeout())
          .then(() => {
            this.status.detailsLoading++;
            return portalDetail.request(portalGuid)
          })
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

  private calculateRequestTimeout() {
    let timeout = 0;
    if (this.lastRequest === 0) {
      this.lastRequest = new Date().getTime();
      return timeout;
    }

    const timeDiff = new Date().getTime() - this.lastRequest;
    if (timeDiff < this.config.portalDetailRequestDelay) {
      timeout = this.config.portalDetailRequestDelay - timeDiff;
    }
    this.lastRequest = new Date().getTime() + timeout;
    return timeout;
  }

  private checkTeam(condition: WmCondition, portalOptions: IITC.PortalOptions) {
    return condition.factions.indexOf(portalOptions.team) >= 0;
  }

  private markProgress() {
    this.dispatchEvent(new CustomEvent('wasabee_markers:progress', {detail: this.status}));
  }

  private checkLevel(condition: WmCondition, portalOptions: IITC.PortalOptions): boolean {
    const value = interpolate(`\${${portalOptions.level} ${condition.levelComparator} ${condition.level}}`);
    return value.toLowerCase() === 'true';
  }

  private addMarker(portalNode: IITC.Portal, markerType: string) {
    const marker = getMarker(markerType, portalNode.options.guid)
    if (!marker) {
      addMarker(markerType, portalNode.options.guid, portalNode.getLatLng(), portalNode.options.data.title)
      this.status.added++;
    }
  }

  private removeMarker(portalNode: IITC.Portal, markerType: string) {
    const marker = getMarker(markerType, portalNode.options.guid)
    this.removeWasabeeMarker(marker);
  }

  private removeWasabeeMarker(marker: any) {
    if (marker) {
      removeMarker(marker);
      this.status.removed++;
    }
  }

  private checkPortalDetailsConditions(conditions: WmCondition[], portalDetailData: IITC.PortalDataDetail, portalNodeOptions: IITC.PortalOptions): boolean {
    return !!conditions
      .find(condition =>
        this.checkSimpleConditions(condition, portalNodeOptions)
        && this.checkMods(condition, portalDetailData)
        && this.checkSlots(condition, portalDetailData)
      );
  }

  private checkMods(condition: WmCondition, portalDetailData: IITC.PortalDataDetail): boolean {
    return condition.mods.length === 0 || !!portalDetailData.mods
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

  private isCompleted(condition: WmCondition, portalOptions: IITC.PortalOptions): boolean {
    return (
        !condition.mods
        || condition.mods.length === 0
      )
      && (
        teamStringToId(PLAYER.team) !== portalOptions.team
        || !condition.slots
        || Object.keys(condition.slots).length === 0
      );
  }

  private async checkPortalDetails(originalRules: WmRule[], portalNode: IITC.Portal) {
    const portalOptions = portalNode.options;

    const rules: WmRule[] = [];

    originalRules.forEach(rule => {
      const conditions = rule.conditions.filter(condition => this.checkSimpleConditions(condition, portalOptions));
      if (conditions.length > 0) {
        rules.push({name: rule.name, markerType: rule.markerType, conditions: conditions})
      } else {
        this.removeMarker(portalNode, rule.markerType);
      }
    });

    if (rules.length > 0) {
      const complexRules: WmRule[] = []
      rules.forEach(rule => {
        if (rule.conditions.find(c => this.isCompleted(c, portalOptions))) {
          this.addMarker(portalNode, rule.markerType);
        } else {
          complexRules.push(rule);
        }
      });

      if (complexRules.length > 0) {
        try {
          const portalDetail = await this.getPortalDetail(portalOptions);
          if (portalDetail) {
            complexRules.forEach(rule => {
              if (this.checkPortalDetailsConditions(rule.conditions, portalDetail, portalOptions)) {
                this.addMarker(portalNode, rule.markerType);
              } else {
                this.removeMarker(portalNode, rule.markerType);
              }
            });
          }
        } catch (e) {
          console.log("Error");
          this.status.errorGuids.push(portalOptions.guid);
        }
      }
    } else {
      this.removeAllMakers(portalOptions);
    }
  }

  private removeAllMakers(portalOptions: IITC.PortalOptions) {
    getPortalMarkers(portalOptions.guid)?.forEach((marker: any) => this.removeWasabeeMarker(marker));
  }

  private checkSimpleConditions(condition: WmCondition, portalOptions: IITC.PortalOptions) {
    return this.checkTeam(condition, portalOptions)
      && this.checkLevel(condition, portalOptions)
      && this.checkHistory(condition, portalOptions);
  }

  private checkHistory(condition: WmCondition, portalOptions: IITC.PortalOptions) {
    if (condition.history && Object.keys(condition.history).length > 0) {
      const historyConditionNames = Object.keys(condition.history);
      const portalHistory = portalOptions.data.history;
      if (!portalHistory) {
        return !!historyConditionNames.find((name) => !condition.history?.[<keyof WmHistory>name]);
      }
      return historyConditionNames.find(name => condition.history?.[<keyof WmHistory>name] === portalHistory[<keyof IITC.PortalHistory>name]);
    }
    return true;
  }

  private checkSlots(condition: WmCondition, portalDetailData: IITC.PortalDataDetail): boolean {
    return this.checkModSlots(portalDetailData, condition.slots?.mods) && this.checkResoSlots(portalDetailData, condition.slots?.r8);
  }

  private checkModSlots(portalDetailData: IITC.PortalDataDetail, mods?: number): boolean {
    return !mods || this.theModSlotCheck(mods, portalDetailData.mods);
  }

  private checkResoSlots(portalDetailData: IITC.PortalDataDetail, r8?: number): boolean {
    return !r8 || portalDetailData.team != TEAM_CODES[teamStringToId(PLAYER.team)] || this.theResoSlotCheck(portalDetailData.resonators, r8);
  }

  private theModSlotCheck(conditionMods: number, portalMods: [(IITC.Mod | null), (IITC.Mod | null), (IITC.Mod | null), (IITC.Mod | null)]): boolean {
    const deployed = portalMods.filter(m => !!m);
    return deployed.length < 4 && deployed.filter(m => m?.owner === PLAYER.nickname).length < conditionMods;
  }

  private theResoSlotCheck(resonators: IITC.Resonator[], r8: number) {
    return resonators.filter(m => m?.owner === PLAYER.nickname && m.level === 8).length < r8;
  }
}
