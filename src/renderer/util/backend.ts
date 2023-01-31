import {
  ACTIONS_CHANGED,
  ASSETS_CHANGED,
  Channels,
  CHECK_NODE_EXISTS,
  DELETE_ACTION,
  DELETE_NODE,
  GET_ACTIONS,
  GET_ACTION_DESCRIPTIONS,
  GET_ASSETS,
  GET_LOADING_TEXT,
  GET_NODES,
  GET_START_NODE,
  LIST_COMMANDS,
  LOADED_CHANGED,
  NODES_CHANGED,
  OPEN_OPUS,
  SAVE_OPUS,
  SHOW_ASK_DIALOG,
  SHOW_DIALOG,
  UPDATE_ACTION,
  UPDATE_NODE,
} from '../../main/channels';

import { Action, ActionData } from '../../main/model/action';
import { Asset } from '../../main/model/asset';
import { ICommand } from '../../main/model/commands';
import { OpusNode, OpusNodeData } from '../../main/model/node';

export enum ChangeType {
  Nodes,
  Assets,
  Actions,
}
const changeTypeToChannel: { [change_type in ChangeType]: Channels } = {
  [ChangeType.Nodes]: NODES_CHANGED,
  [ChangeType.Assets]: ASSETS_CHANGED,
  [ChangeType.Actions]: ACTIONS_CHANGED,
};

interface IApi {
  getLoadingText: () => Promise<string>;
  addLoadListener(func: (loaded: boolean) => void): () => void;
  addChangeListener(expected_type: ChangeType, func: () => void): () => void;

  openOpus: () => Promise<boolean>;
  saveOpus: () => Promise<boolean>;
  saveOpusAs: (file: string | null) => Promise<boolean>;

  getNodes: () => Promise<OpusNode[]>;
  getStartNode: () => Promise<string>;
  getActions: () => Promise<Action[]>;
  getActionDescriptions: () => Promise<{ [name: string]: string }>;
  getAssets: () => Promise<Asset[]>;

  createNode: () => Promise<string>;
  createAction: () => Promise<string>;

  nodeExists: (name: string) => Promise<boolean>;
  updateNode: (name: string | null, data: OpusNodeData) => Promise<string>;
  updateAction: (
    name: string | null,
    data: ActionData,
    useInline: boolean
  ) => Promise<string>;

  deleteNode: (name: string) => Promise<string>;
  deleteAction: (name: string) => Promise<string>;

  getAvailableCommands: () => Promise<{ [component: string]: ICommand[] }>;

  ask: (title: string, message: string, options: string[]) => Promise<number>;
  showInfoMessage: (title: string, message: string) => Promise<boolean>;
  showWarningMessage: (title: string, message: string) => Promise<boolean>;
  showErrorMessage: (title: string, message: string) => Promise<boolean>;
}

function callIpc(channel: Channels, ...args: unknown[]): Promise<unknown[]> {
  return new Promise((resolve, reject) => {
    try {
      window.electron.ipcRenderer.sendMessage(channel, args);
      window.electron.ipcRenderer.once(channel, (...resultArgs: unknown[]) =>
        resolve(resultArgs)
      );
    } catch (e) {
      reject(e);
    }
  });
}

class Api implements IApi {
  // eslint-disable-next-line class-methods-use-this
  async getLoadingText(): Promise<string> {
    const args = await callIpc(GET_LOADING_TEXT);
    return args[0] as string;
  }

  // eslint-disable-next-line class-methods-use-this
  addLoadListener(func: (loaded: boolean) => void): () => void {
    return (
      window.electron.ipcRenderer.on(LOADED_CHANGED, (...args: unknown[]) => {
        if (args.length === 1) func(args[0] as boolean);
      }) || (() => {})
    );
  }

  // eslint-disable-next-line class-methods-use-this
  addChangeListener(expected_type: ChangeType, func: () => void): () => void {
    const channel = changeTypeToChannel[expected_type];
    return window.electron.ipcRenderer.on(channel, func) || (() => {});
  }

  // eslint-disable-next-line class-methods-use-this
  async openOpus(): Promise<boolean> {
    const args = await callIpc(OPEN_OPUS, null);
    return args[0] as boolean;
  }

  // eslint-disable-next-line class-methods-use-this
  async saveOpus(): Promise<boolean> {
    const args = await callIpc(SAVE_OPUS);
    return args[0] as boolean;
  }

  // eslint-disable-next-line class-methods-use-this
  async saveOpusAs(file: string | null = null): Promise<boolean> {
    const args = await callIpc(SAVE_OPUS, file);
    return args[0] as boolean;
  }

  // eslint-disable-next-line class-methods-use-this
  async getNodes(): Promise<OpusNode[]> {
    const args = await callIpc(GET_NODES, null);
    return args[0] as OpusNode[];
  }

  // eslint-disable-next-line class-methods-use-this
  async getStartNode(): Promise<string> {
    const args = await callIpc(GET_START_NODE, null);
    return args[0] as string;
  }

  // eslint-disable-next-line class-methods-use-this
  async getActions(): Promise<Action[]> {
    const args = await callIpc(GET_ACTIONS, null);
    return args[0] as Action[];
  }

  // eslint-disable-next-line class-methods-use-this
  async getActionDescriptions(): Promise<{ [name: string]: string }> {
    const args = await callIpc(GET_ACTION_DESCRIPTIONS);
    return args[0] as { [name: string]: string };
  }

  // eslint-disable-next-line class-methods-use-this
  async getAssets(): Promise<Asset[]> {
    const args = await callIpc(GET_ASSETS, null);
    return args[0] as Asset[];
  }

  // eslint-disable-next-line class-methods-use-this
  async createNode(): Promise<string> {
    const nodeData = OpusNode.getEmptyNodeData();
    return this.updateNode(null, nodeData);
  }

  // eslint-disable-next-line class-methods-use-this
  async createAction(): Promise<string> {
    const actionData = Action.getEmptyActionData();
    return this.updateAction(null, actionData, false);
  }

  // eslint-disable-next-line class-methods-use-this
  async nodeExists(name: string): Promise<boolean> {
    const args = await callIpc(CHECK_NODE_EXISTS, name);
    return args[0] as boolean;
  }

  // eslint-disable-next-line class-methods-use-this
  async updateNode(name: string | null, data: OpusNodeData): Promise<string> {
    const args = await callIpc(UPDATE_NODE, name, data);
    return args[0] as string;
  }

  // eslint-disable-next-line class-methods-use-this
  async updateAction(
    name: string | null,
    data: ActionData,
    useInline: boolean
  ): Promise<string> {
    const args = await callIpc(UPDATE_ACTION, name, data, useInline);
    return args[0] as string;
  }

  // eslint-disable-next-line class-methods-use-this
  async deleteNode(name: string): Promise<string> {
    const args = await callIpc(DELETE_NODE, name);
    return args[0] as string;
  }

  // eslint-disable-next-line class-methods-use-this
  async deleteAction(name: string): Promise<string> {
    const args = await callIpc(DELETE_ACTION, name);
    return args[0] as string;
  }

  // eslint-disable-next-line class-methods-use-this
  async getAvailableCommands(): Promise<{ [component: string]: ICommand[] }> {
    const args = await callIpc(LIST_COMMANDS);
    return args[0] as { [component: string]: ICommand[] };
  }

  // eslint-disable-next-line class-methods-use-this
  async ask(
    title: string,
    message: string,
    options: string[]
  ): Promise<number> {
    const args = await callIpc(SHOW_ASK_DIALOG, title, message, options);
    return args[0] as number;
  }

  // eslint-disable-next-line class-methods-use-this
  async showInfoMessage(title: string, message: string): Promise<boolean> {
    const args = await callIpc(SHOW_DIALOG, 'info', title, message);
    return args[0] as boolean;
  }

  // eslint-disable-next-line class-methods-use-this
  async showWarningMessage(title: string, message: string): Promise<boolean> {
    const args = await callIpc(SHOW_DIALOG, 'warning', title, message);
    return args[0] as boolean;
  }

  // eslint-disable-next-line class-methods-use-this
  async showErrorMessage(title: string, message: string): Promise<boolean> {
    const args = await callIpc(SHOW_DIALOG, 'error', title, message);
    return args[0] as boolean;
  }
}

const CURRENT_API = new Api();
function getApi(): IApi {
  return CURRENT_API;
}

export { IApi, getApi };
