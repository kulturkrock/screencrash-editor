import {
  Channels,
  GET_ACTIONS,
  GET_ASSETS,
  GET_LOADING_TEXT,
  GET_NODES,
  LOADED_CHANGED,
  OPEN_OPUS,
} from '../../main/channels';

interface IApi {
  getLoadingText: () => Promise<string>;
  addLoadListener(func: (loaded: boolean) => void): void;
  openOpus: () => Promise<boolean>;
  getNodes: () => Promise<unknown[]>;
  getActions: () => Promise<unknown[]>;
  getAssets: () => Promise<unknown[]>;
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
  getLoadingText(): Promise<string> {
    return callIpc(GET_LOADING_TEXT).then((args: unknown[]) => {
      return args[0] as string;
    });
  }

  // eslint-disable-next-line class-methods-use-this
  addLoadListener(func: (loaded: boolean) => void): void {
    window.electron.ipcRenderer.on(LOADED_CHANGED, (...args: unknown[]) => {
      if (args.length === 1) func(args[0] as boolean);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  openOpus(): Promise<boolean> {
    return callIpc(OPEN_OPUS, null).then((args) => {
      return args[0] as boolean;
    });
  }

  // eslint-disable-next-line class-methods-use-this
  getNodes(): Promise<unknown[]> {
    return callIpc(GET_NODES, null).then((args: unknown[]) => {
      return args[0] as unknown[];
    });
  }

  // eslint-disable-next-line class-methods-use-this
  getActions(): Promise<unknown[]> {
    return callIpc(GET_ACTIONS, null).then((args: unknown[]) => {
      return args[0] as unknown[];
    });
  }

  // eslint-disable-next-line class-methods-use-this
  getAssets(): Promise<unknown[]> {
    return callIpc(GET_ASSETS, null).then((args: unknown[]) => {
      return args[0] as unknown[];
    });
  }
}

const CURRENT_API = new Api();
function getApi(): IApi {
  return CURRENT_API;
}

export { IApi, getApi };
