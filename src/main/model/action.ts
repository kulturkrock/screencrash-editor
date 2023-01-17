import { Asset } from './asset';
import { NamedSaveable } from './common';

export interface SingleAction {
  target: string;
  desc: string;
  cmd?: string;
  params?: { [key: string]: unknown };
  assets?: string[];
}

export interface ParameterAction {
  parameters: { [parameter: string]: string[] }; // Parameter name -> JSON paths
  actions: (string | SingleAction)[];
}

export type ActionData = SingleAction | SingleAction[] | ParameterAction;

export class Action implements NamedSaveable {
  name: string;
  isInline: boolean;
  data: ActionData;
  _assetLookup: { [name: string]: Asset } = {};

  constructor(name: string, isInline: boolean, data: ActionData) {
    this.name = name;
    this.isInline = isInline;
    this.data = data;
  }

  static parseRawData(
    data: any,
    assetCreator: (asset: any) => string
  ): ActionData {
    let dataList: SingleAction[] = [];
    if (!Array.isArray(data) && data.target !== undefined) {
      // Convert SingleAction to SingleAction[] with one entry
      dataList = [data] as SingleAction[];
    } else if (Array.isArray(data)) {
      dataList = data as SingleAction[];
    } else {
      console.log('Parameter actions are not supported');
    }

    return dataList.map((singleAction: SingleAction) => {
      return {
        ...singleAction,
        assets: (singleAction.assets || []).map(assetCreator),
      };
    });
  }

  static getEmptyActionData(): ActionData {
    return { target: '', desc: '', cmd: '', params: {}, assets: [] };
  }

  canBeSaved(): boolean {
    return !this.isInline;
  }

  setAllAvailableAssets(assets: { [name: string]: Asset }) {
    this._assetLookup = assets;
  }

  toSaveData(): [string, unknown] {
    let data: SingleAction[] = [];
    if (Array.isArray(this.data)) {
      data = [...this.data];
    } else if ('target' in this.data) {
      data = [this.data as SingleAction];
    } else {
      console.log('Parameter actions are not supported');
    }

    const assetNameToData = (name: string) => {
      // Return only data if inline, return only name if not
      const asset = this._assetLookup[name];
      if (asset === undefined) {
        console.log(`Warning: Unable to find an asset with the name ${name}`);
      }
      return asset.isInline ? asset.toSaveData()[1] : name;
    };

    const outData = data.map((singleAction: SingleAction) => {
      return {
        ...singleAction,
        assets: (singleAction.assets || []).map(assetNameToData),
      };
    });
    if (outData.length === 1) {
      return [this.name, outData[0]];
    }
    return [this.name, outData];
  }
}
