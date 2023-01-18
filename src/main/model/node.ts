import { Action, ActionData } from './action';
import { NamedSaveable } from './common';

interface ParameterizedAction {
  action: string;
  parameters: string;
}

export type InlineAction = string | ActionData | ParameterizedAction;

export interface MultiJumpNode {
  node: string;
  description: string;
  actions: string[];
}

export interface OpusNodeData {
  next: string | MultiJumpNode[];
  prompt: string;
  pdfPage?: number;
  pdfLocationOnPage?: number;
  lineNumber?: number;
  actions?: string[];
}

export class OpusNode implements NamedSaveable {
  name: string;
  data: OpusNodeData;
  _actionsLookup: { [key: string]: Action } = {};

  constructor(name: string, data: OpusNodeData) {
    this.name = name;
    this.data = data;
    this.data.actions = this.data.actions || [];
  }

  static parseRawData(
    data: { next: string | unknown[]; actions: InlineAction[] | undefined },
    actionCreator: (action: InlineAction) => string
  ): OpusNodeData {
    const result = { ...data };

    // Handle field next
    if (Array.isArray(data.next)) {
      result.next = data.next.map(
        (jumpNode: { actions: InlineAction[] | undefined }) => {
          return {
            ...jumpNode,
            actions: (jumpNode.actions || []).map(actionCreator),
          };
        }
      );
    }

    // Handle field actions
    result.actions = (data.actions || []).map(actionCreator);

    return result as OpusNodeData;
  }

  static getEmptyNodeData(): OpusNodeData {
    return { next: 'default', prompt: 'Default prompt' };
  }

  // eslint-disable-next-line class-methods-use-this
  canBeSaved(): boolean {
    return true;
  }

  setAllAvailableActions(actions: { [key: string]: Action }) {
    this._actionsLookup = actions;
  }

  /// Note: This assumes setAllAvailableActions have been called already
  toSaveData(): [key: string, data: unknown] {
    const result: { next: unknown; actions: unknown[] | undefined } = {
      ...this.data,
      actions: undefined,
    };

    const actionNameToData = (name: string) => {
      // Return only data if inline, return only name if not
      const action = this._actionsLookup[name];
      if (action === undefined) {
        console.log(`Warning: Unable to find an action with the name ${name}`);
      }
      return action.isInline ? action.toSaveData()[1] : name;
    };

    // Handle field next
    if (Array.isArray(this.data.next)) {
      result.next = this.data.next.map((jumpNode) => {
        return {
          ...jumpNode,
          actions:
            jumpNode.actions.length === 0
              ? undefined
              : jumpNode.actions.map(actionNameToData),
        };
      });
    }

    // Handle field actions
    if (this.data.actions !== undefined && this.data.actions.length > 0) {
      result.actions = this.data.actions.map(actionNameToData);
    }

    return [this.name, result];
  }
}
