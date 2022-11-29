import { Channels, GET_LOADING_TEXT, OPEN_OPUS } from '../../main/channels';

interface IApi {
  getLoadingText: () => Promise<string>;
  openOpus: () => Promise<boolean>;
}

function callIpc(channel: Channels, ...args: unknown[]): Promise<unknown> {
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
    return callIpc(GET_LOADING_TEXT) as Promise<string>;
  }

  // eslint-disable-next-line class-methods-use-this
  openOpus(): Promise<boolean> {
    return callIpc(OPEN_OPUS, null) as Promise<boolean>;
  }
}

const CURRENT_API = new Api();
function getApi(): IApi {
  return CURRENT_API;
}

export { IApi, getApi };
