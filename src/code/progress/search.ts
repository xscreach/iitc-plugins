import type {IITC} from "../../types/iitc";
import type {WmCondition, WmConfig} from "../config";
import {interpolate} from "../utils/stringUtils";
import * as WU from "../utils/wasabeeUtils";
import {getMarker} from "../utils/wasabeeUtils";

export class SearchStatus {
  readonly initialQueue: number;

  detailsRequested = 0;
  detailsLoaded = 0;
  detailsCached = 0;
  errors = 0;

  added = 0;
  removed = 0;

  constructor(private queue: IITC.Portal[], public running = false) {
    this.initialQueue = queue.length;
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

  get totalMarkers(): number {
    if (plugin.wasabee) {
      return plugin.wasabee._selectedOp.markers.length
    }
    return 0;
  }
}

export class WmSearch {
  private queue: IITC.Portal[] = [];

  public status: SearchStatus = new SearchStatus([]);
  private lastRequest = 0;

  constructor(public config: WmConfig) {
  }

  private prepareQueue(): IITC.Portal[] {
    return Object.values(portals).filter((portal) => this.checkLocation(portal))
  }

  start() {
    if (!this.status.running) {
      this.search().finally(() => this.stop());
    }
  }

  stop() {
    this.status.running = false;
    this.markProgress();
  }

  private search(): Promise<void> {
    return new Promise<void>(resolve => {
      setTimeout(() => {
        this.queue = this.prepareQueue();
        this.status = new SearchStatus(this.queue, true);
        this.lastRequest = 0;
        this.markProgress();
        resolve(this.startCheckingLoop());
      }, 0);
    });
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

  private async startCheckingLoop(): Promise<void> {
    while (this.status.running && this.queue && this.queue.length > 0) {
      try {
        this.markProgress();
        await this.checkNode(this.queue.shift());
      } finally {
        this.markProgress();
      }
    }
  }

  private async checkNode(portalNode?: IITC.Portal) {
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
    return new Promise<IITC.PortalDataDetail | undefined>((resolve, reject) => {
      this.status.detailsRequested++;
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
          this.lastRequest = new Date().getTime() + timeout;
        }
        setTimeout(() => {
          this.lastRequest = new Date().getTime();
          portalDetail.request(portalGuid)
            .then(portalDetailData => {
              this.status.detailsLoaded++;
              resolve(portalDetailData);
            })
            .catch(() => {
              reject();
            });
        }, timeout);
      }
    });
  }

  private checkTeam(condition: WmCondition, portalOptions: IITC.PortalOptions) {
    return condition.factions.indexOf(portalOptions.team) >= 0;
  }

  private markProgress() {
    map.fire('wasabee_markers:progress', { status: this.status });
  }

  private checkLevel(condition: WmCondition, portalOptions: IITC.PortalOptions): boolean {
    const value = interpolate(`\${${portalOptions.level} ${condition.levelComparator} ${condition.level}}`);
    return value.toLowerCase() == 'true';
  }

  private addMarker(portalNode: IITC.Portal) {
    const marker = getMarker(this.config.markerType, portalNode.options.guid)
    if (!marker) {
      WU.addMarker(this.config.markerType, portalNode.options.guid, portalNode.getLatLng(), portalNode.options.data.title)
      this.status.added++;
    }
  }

  private removeMarker(portalNode: IITC.Portal) {
    if (portalNode.options.level == 0) {
      //skip portal marker placeholders
      return;
    }

    const marker = getMarker(this.config.markerType, portalNode.options.guid)
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
}
