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
  'Ito En Transmuter (+)': [WmModRarity.VERY_RARE],
  'Ito En Transmuter (-)': [WmModRarity.VERY_RARE],
}

export const WmHistoryFields: { [key: string]: string } = {
  visited: 'Visited',
  captured: 'Captured',
  scoutControlled: 'Scout Controlled'
}

export type WmModConditions ={
  type: keyof typeof WmModTypes
  rarity: keyof typeof WmModRarity
}

export type WmHistory = {
  visited?: boolean
  captured?: boolean
  scoutControlled?: boolean
}

export const wmSlotDefaults = {
  mods: 2,
  r8: 1
}

export const wmSlotLabels = {
  mods: 'Mod slots available',
  r8: 'Possible deploy of L8 resonator(s)'
}

export type WmSlotConfig = {
  [key in keyof typeof wmSlotDefaults]?: number;
};

export type WmCondition = {
  level: number;
  levelComparator: keyof typeof WmComparatorTypes;
  mods: WmModConditions[];
  history?: WmHistory;
  slots?: WmSlotConfig;
  factions: number[];
}

export enum WasabeeMarker {
  "CapturePortalMarker",
  "LetDecayPortalAlert",
  "ExcludeMarker",
  "DestroyPortalAlert",
  "FarmPortalMarker",
  "GotoPortalMarker",
  "GetKeyPortalMarker",
  "CreateLinkAlert",
  "MeetAgentPortalMarker",
  "OtherPortalAlert",
  "RechargePortalAlert",
  "UpgradePortalAlert",
  "UseVirusPortalAlert"
}

export class WmRule {
  constructor(
    public markerType: string,
    public name = '',
    public conditions: WmCondition[] = []
  ) {
  }
}

export class WmConfig {
  public static readonly CONFIG_KEY = 'wasabee_markers-config';

  public rules: WmRule[] = []
  public markerType?: string;
  public conditions?: WmCondition[]
  public portalDetailRequestDelay = 250;
  public portalDetailThreads = 5;
  public showProgress = false;
  public showResults = true;
  public keepScanning = false;
  public autoUpload = true;
  public keepCompletedMarkers = false;

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
      const wmRule = Object.assign(new WmRule(''), {
        name: 'Migrated Rule',
        markerType: config.markerType,
        conditions: config.conditions,
      });

      config.rules.push(wmRule);
      delete config.markerType;
      delete config.conditions;
      config.save();
    }

    if (config.rules.some(r => r.conditions?.some(c => c.mods.some(m => m.type == 'ITO-' || m.type == 'ITO+')))) {
      config.rules = config.rules.map(r => {
        r.conditions = r.conditions.map(c => {
          c.mods = c.mods.map(m => {
            if (m.type == 'ITO-') {
              m.type = 'Ito En Transmuter (-)';
              m.rarity = WmModRarity.VERY_RARE;
            } else if (m.type == 'ITO+') {
              m.type = 'Ito En Transmuter (+)'
              m.rarity = WmModRarity.VERY_RARE;
            }
            return m;
          });
          return c;
        });
        return r;
      });
      config.save();
    }
  }
}
