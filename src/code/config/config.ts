import {WasabeeMarker} from "../globals";
import {copy} from "../utils/helpers";

export const WmComparatorTypes: { [key: string]: string } = {
  '>': 'Greater than',
  '>=': 'Greater or equal',
  '==': 'Equal',
  '<=': 'Smaller or equal',
  '<': 'Smaller than'
}

export const WmModRarity: { [key: string]: string } = {
  VERY_RARE: "VERY_RARE",
  RARE: "RARE",
  COMMON: "COMMON"
}

export const WmModRarityText: { [key: string]: string } = {
  VERY_RARE: "Very Rare",
  RARE: "Rare",
  COMMON: "Common"
}

export const WmModTypes: { [key: string]: string[] } = {
  'Portal Shield': [WmModRarity.COMMON, WmModRarity.RARE, WmModRarity.VERY_RARE],
  'Aegis Shield': [WmModRarity.VERY_RARE],
  'Heat Sink': [WmModRarity.COMMON, WmModRarity.RARE, WmModRarity.VERY_RARE],
  'Multi-hack': [WmModRarity.COMMON, WmModRarity.RARE, WmModRarity.VERY_RARE],
  'Link Amp': [WmModRarity.RARE, WmModRarity.VERY_RARE],
  'SoftBank Ultra Link': [WmModRarity.VERY_RARE],
  'Turret': [WmModRarity.RARE],
  'Force Amp': [WmModRarity.RARE],
  'ITO-': [WmModRarity.RARE],
  'ITO+': [WmModRarity.RARE],
}



export interface WmModConditions {
  type: keyof typeof WmModTypes
  rarity: keyof typeof WmModRarity
}

export interface WmHistory {
  visited?: boolean,
  captured?: boolean,
  scoutControlled?: boolean
}

export interface WmCondition {
  level: number;
  levelComparator: keyof typeof WmComparatorTypes;
  mods: WmModConditions[];
  history: WmHistory;
  factions: number[];
}

export class WmRule {
  public name = '';
  public markerType = WasabeeMarker[WasabeeMarker.DestroyPortalAlert];
  public conditions: WmCondition[] = []
}

export class WmConfig {
  public static readonly CONFIG_KEY = 'wasabee_markers-config';

  public rules: WmRule[] = []
  public markerType?: string = WasabeeMarker[WasabeeMarker.DestroyPortalAlert]
  public conditions?: WmCondition[]
  public portalDetailRequestDelay = 250;
  public portalDetailThreads = 5;
  public showProgress = false;
  public showResults = true;
  public keepScanning = false;
  public autoUpload = true;

  public save(): void {
    localStorage.setItem(WmConfig.CONFIG_KEY, JSON.stringify(this));
    WmConfigHolder.config = this;
  }

  public copy(): WmConfig {
    return Object.assign(new WmConfig(), copy(this));
  }
}

export class WmConfigHolder {
  public static config: WmConfig = WmConfigHolder.load()

  public static load(): WmConfig {
    const localConfig = localStorage.getItem(WmConfig.CONFIG_KEY);
    const config = new WmConfig();
    if (localConfig) {
      Object.assign(config, JSON.parse(localConfig));
      this.migrate(config);
    }
    return config;
  }

  private static migrate(config: WmConfig) {
    if (config.conditions && config.conditions.length > 0) {
      const wmRule = Object.assign(new WmRule(), {
        conditions: config.conditions,
        markerType: config.markerType,
        name: 'Migrated Rule'
      });

      config.rules.push(wmRule);
      delete config.markerType;
      delete config.conditions;
      config.save();
    }
  }
}
