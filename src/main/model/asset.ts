import { NamedSaveable } from './common';

export interface AssetData {
  path: string;
}

export class Asset implements NamedSaveable {
  name: string = '';
  data: AssetData;

  constructor(name: string, data: AssetData) {
    this.name = name;
    this.data = data;
  }

  getPath(): string {
    return this.data.path;
  }

  toData(): [string, AssetData] {
    return [this.name, this.data];
  }
}
