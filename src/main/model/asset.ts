import { NamedSaveable } from './common';

export interface AssetData {
  path: string;
}

export class Asset implements NamedSaveable {
  name: string = '';
  isInline: boolean;
  data: AssetData;

  constructor(name: string, isInline: boolean, data: AssetData) {
    this.name = name;
    this.isInline = isInline;
    this.data = data;
  }

  getPath(): string {
    return this.data.path;
  }

  static parseRawData(data: unknown): AssetData {
    return data as AssetData;
  }

  canBeSaved(): boolean {
    return !this.isInline;
  }

  toSaveData(): [string, AssetData] {
    return [this.name, this.data];
  }
}
