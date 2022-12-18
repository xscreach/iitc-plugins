import {WasabeeMarker} from "./types/globals";

export const WmComparatorTypes: { [key: string]: string } = {
  '>': 'Greater than',
  '>=': 'Greater or equal',
  '==': 'Equal',
  '=<': 'Less or equal',
  '<': 'Less than'
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

export interface WmCondition {
  level: number;
  levelComparator: keyof typeof WmComparatorTypes;
  mods: WmModConditions[];
  factions: number[];
}

export class WmConfig {
  public static readonly CONFIG_KEY = 'wasabee_markers-config';

  public markerType: string = WasabeeMarker[WasabeeMarker.DestroyPortalAlert]
  public conditions: WmCondition[] = []
  public portalDetailRequestDelay = 250;
  public portalDetailThreads = 5;


  public save(): void {
    localStorage.setItem(WmConfig.CONFIG_KEY, JSON.stringify(this));
    WmConfigHolder.config = this;
  }

  public copy(): WmConfig {
    return Object.assign(new WmConfig(), JSON.parse(JSON.stringify(this)));
  }
}

export class WmConfigHolder {
  public static config: WmConfig = WmConfigHolder.load()

  public static load(): WmConfig {
    const localConfig = localStorage.getItem(WmConfig.CONFIG_KEY);
    const config = new WmConfig();
    if (localConfig) {
      Object.assign(config, JSON.parse(localConfig))
    }
    return config;
  }
}
