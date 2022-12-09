/* eslint-disable class-methods-use-this */
import { BrowserWindow, dialog, ipcMain } from 'electron';
import {
  Channels,
  GET_ACTIONS,
  GET_ASSETS,
  GET_LOADING_TEXT,
  GET_NODES,
  LOADED_CHANGED,
  OPEN_OPUS,
} from './channels';
import { ActionTemplate } from './model/action';
import { Asset } from './model/asset';
import Model from './model/model';
import { OpusNode } from './model/node';

interface IApi {
  getLoadingText: () => string;
  listenToUpdates(listener: () => void): void;
  hasOpenedOpus: () => boolean;
  openOpus: (file: string | null) => Promise<boolean>;
  saveOpus: () => Promise<boolean>;
  saveOpusAs: (file: string | null) => Promise<boolean>;
  unloadOpus: () => Promise<boolean>;

  getNodes: () => OpusNode[];
  getActions: () => ActionTemplate[];
  getAssets: () => Asset[];
}

class Api implements IApi {
  constructor() {
    this.getLoadingText = this.getLoadingText.bind(this);
  }

  listenToUpdates(listener: () => void): void {
    Model.addListener('updated', listener);
  }

  getLoadingText(): string {
    const msgs = [
      'Preparing content...',
      'Calling some friends...',
      'Sending a message to mars...',
      'Doing the penguin dance...',
      'Downloading the last Kulturkrock recording...',
      'Working on it...',
      "You've figured out it's not loading, right?",
      'Having a great time',
      'Catching flies mid air...',
      'Making seagull sounds...',
    ];
    return msgs[Math.floor(Math.random() * msgs.length)];
  }

  hasOpenedOpus(): boolean {
    return Model.hasLoaded();
  }

  async openOpus(file: string | null): Promise<boolean> {
    let fileToOpen = file;
    if (fileToOpen === null) {
      fileToOpen = await dialog
        .showOpenDialog({
          properties: ['openFile'],
          title: 'Select opus file',
          filters: [{ name: 'Opus files', extensions: ['yaml'] }],
        })
        .then((result) => {
          return !result.canceled && result.filePaths.length > 0
            ? result.filePaths[0]
            : '';
        })
        .catch((err) => {
          console.log(`Failed to select file to open: ${err}`);
          return '';
        });
    }

    if (fileToOpen === '') {
      return false;
    }
    return Model.load(fileToOpen);
  }

  async unloadOpus(): Promise<boolean> {
    // TODO: Check for changes first
    return Model.unload();
  }

  async saveOpus(): Promise<boolean> {
    if (!Model.hasLoaded()) {
      return false;
    }
    return Model.save(Model.currentFile);
  }

  async saveOpusAs(file: string | null): Promise<boolean> {
    if (!Model.hasLoaded()) {
      return false;
    }

    let fileToSave = file;
    if (fileToSave === null) {
      fileToSave = await dialog
        .showSaveDialog({
          properties: ['showOverwriteConfirmation'],
          title: 'Select save location',
          filters: [{ name: 'Opus files', extensions: ['yaml'] }],
          defaultPath: Model.currentFile,
        })
        .then((result) => {
          return !result.canceled && result.filePath ? result.filePath : '';
        })
        .catch((err) => {
          console.log(`Failed to save file: ${err}`);
          return '';
        });
    }

    if (fileToSave === '') {
      return false;
    }
    return Model.save(fileToSave);
  }

  getNodes(): OpusNode[] {
    const opus = Model.getOpus();
    if (opus) return Object.values(opus.nodes);
    return [];
  }

  getActions(): ActionTemplate[] {
    const opus = Model.getOpus();
    if (opus) return Object.values(opus.actionTemplates);
    return [];
  }

  getAssets(): Asset[] {
    const opus = Model.getOpus();
    if (opus) return Object.values(opus.assets);
    return [];
  }
}

const CURRENT_API = new Api();
const getApi = (): IApi => {
  return CURRENT_API;
};

const addSimpleGetter = (channel: Channels, func: () => unknown): void => {
  ipcMain.on(channel, async (event) => {
    event.reply(channel, func());
  });
};

const initApiCommunication = (mainWindow: BrowserWindow): void => {
  addSimpleGetter(GET_LOADING_TEXT, CURRENT_API.getLoadingText);
  addSimpleGetter(GET_NODES, CURRENT_API.getNodes);
  addSimpleGetter(GET_ACTIONS, CURRENT_API.getActions);
  addSimpleGetter(GET_ASSETS, CURRENT_API.getAssets);

  ipcMain.on(OPEN_OPUS, async (event, args) => {
    const file = args.length > 0 ? args[0] : null;
    const success = await CURRENT_API.openOpus(file);
    event.reply(OPEN_OPUS, success);
  });

  Model.addListener('loaded', (...args: unknown[]) => {
    if (args.length === 1) {
      mainWindow.webContents.send(LOADED_CHANGED, args[0]);
    }
  });
};

export { getApi, initApiCommunication };
