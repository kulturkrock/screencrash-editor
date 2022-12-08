import { NamedSaveable } from './common';

export interface ActionData {
  target: string;
  desc: string;
  cmd?: string;
}

export class ActionTemplate implements NamedSaveable {
  name: string;
  data: ActionData;

  constructor(name: string, data: ActionData) {
    this.name = name;
    this.data = data;
  }

  toData(): [string, ActionData] {
    return [this.name, this.data];
  }
}
