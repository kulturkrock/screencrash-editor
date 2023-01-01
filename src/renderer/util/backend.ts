import {
  Channels,
  GET_ACTIONS,
  GET_ASSETS,
  GET_LOADING_TEXT,
  GET_NODES,
  LOADED_CHANGED,
  NODES_CHANGED,
  OPEN_OPUS,
  SHOW_DIALOG,
  UPDATE_NODE,
} from '../../main/channels';

import { OpusNode, OpusNodeData } from '../../main/model/node';

export enum ChangeType {
  Nodes,
}
const changeTypeToChannel: { [change_type in ChangeType]: Channels } = {
  [ChangeType.Nodes]: NODES_CHANGED,
};

interface IApi {
  getLoadingText: () => Promise<string>;
  addLoadListener(func: (loaded: boolean) => void): void;
  addChangeListener(expected_type: ChangeType, func: () => void): void;

  openOpus: () => Promise<boolean>;
  getNodes: () => Promise<OpusNode[]>;
  getActions: () => Promise<unknown[]>;
  getAssets: () => Promise<unknown[]>;
  updateNode: (name: string, data: OpusNodeData) => Promise<boolean>;

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
  addLoadListener(func: (loaded: boolean) => void): void {
    window.electron.ipcRenderer.on(LOADED_CHANGED, (...args: unknown[]) => {
      if (args.length === 1) func(args[0] as boolean);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  addChangeListener(expected_type: ChangeType, func: () => void): void {
    const channel = changeTypeToChannel[expected_type];
    window.electron.ipcRenderer.on(channel, () => {
      func();
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async openOpus(): Promise<boolean> {
    const args = await callIpc(OPEN_OPUS, null);
    return args[0] as boolean;
  }

  // eslint-disable-next-line class-methods-use-this
  async getNodes(): Promise<OpusNode[]> {
    const args = await callIpc(GET_NODES, null);
    return args[0] as OpusNode[];
  }

  // eslint-disable-next-line class-methods-use-this
  async getActions(): Promise<unknown[]> {
    const args = await callIpc(GET_ACTIONS, null);
    return args[0] as unknown[];
  }

  // eslint-disable-next-line class-methods-use-this
  async getAssets(): Promise<unknown[]> {
    const args = await callIpc(GET_ASSETS, null);
    return args[0] as unknown[];
  }

  // eslint-disable-next-line class-methods-use-this
  async updateNode(name: string, data: OpusNodeData): Promise<boolean> {
    const args = await callIpc(UPDATE_NODE, name, data);
    return args[0] as boolean;
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
