export interface NamedSaveable {
  toData(): [key: string, data: unknown];
}

export interface UnnamedSaveable {
  toData(): unknown;
}
