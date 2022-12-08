import { ActionData } from './action';
import { NamedSaveable } from './common';

interface ParameterizedAction {
  action: string;
  parameters: string;
}

type InlineAction = string | ActionData | ParameterizedAction;

interface MultiJumpNode {
  node: string;
  description: string;
  actions: InlineAction[];
}

export interface OpusNodeData {
  next: string | MultiJumpNode[];
  prompt: string;
  pdfPage?: number;
  pdfLocationOnPage?: number;
  lineNumber?: number;
  actions?: InlineAction[];
}

export class OpusNode implements NamedSaveable {
  name: string;
  data: OpusNodeData;

  constructor(name: string, data: OpusNodeData) {
    this.name = name;
    this.data = data;
    this.data.actions = this.data.actions || [];
  }

  toData(): [string, OpusNodeData] {
    return [this.name, this.data];
  }
}
