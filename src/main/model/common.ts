export interface NamedSaveable {
  canBeSaved(): boolean;
  toSaveData(): [key: string, data: unknown];
}

export interface UnnamedSaveable {
  canBeSaved(): boolean;
  toSaveData(): unknown;
}
