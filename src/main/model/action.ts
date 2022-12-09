import { NamedSaveable } from './common';

interface SingleAction {
  target: string;
  desc: string;
  cmd?: string;
}

interface ParameterAction {
  parameters: { [parameter: string]: string[] }; // Parameter name -> JSON paths
  actions: (string | SingleAction)[];
}

export type ActionData = SingleAction | SingleAction[] | ParameterAction;

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
