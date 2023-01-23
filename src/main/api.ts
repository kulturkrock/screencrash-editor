/* eslint-disable class-methods-use-this */
import { BrowserWindow, dialog, ipcMain } from 'electron';
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
  RELOAD_COMMANDS,
  SHOW_ASK_DIALOG,
  SHOW_DIALOG,
  UPDATE_ACTION,
  UPDATE_NODE,
} from './channels';
import { Action, ActionData } from './model/action';
import { Asset } from './model/asset';
import { getAvailableCommands, reloadCommands } from './model/commands';
import Model from './model/model';
import { OpusNode, OpusNodeData } from './model/node';
import { getPrettyActionDescription } from './model/util';

interface IApi {
  getLoadingText: () => string;
  listenToUpdates(listener: () => void): void;
  hasOpenedOpus: () => boolean;
  newOpus: (file: string | null) => Promise<boolean>;
  openOpus: (file: string | null) => Promise<boolean>;
  saveOpus: () => Promise<boolean>;
  saveOpusAs: (file: string | null) => Promise<boolean>;
  unloadOpus: () => Promise<boolean>;

  getNodes: () => OpusNode[];
  getActions: () => Action[];
  getStartNode: () => string;
  getActionDescriptions: () => { [name: string]: string };
  getAssets: () => Asset[];
  nodeExists: (name: string) => boolean;

  reloadCommands: () => void;

  updateNode: (name: string | null, data: OpusNodeData) => string;
  updateAction: (
    name: string | null,
    data: ActionData,
    useInline: boolean
  ) => string;

  deleteNode: (name: string) => string;
  deleteAction: (name: string) => string;
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

  async newOpus(file: string | null): Promise<boolean> {
    let fileToCreate = file;
    if (fileToCreate === null) {
      fileToCreate = await dialog
        .showSaveDialog({
          properties: ['showOverwriteConfirmation'],
          title: 'Select save location',
          filters: [{ name: 'Opus files', extensions: ['yaml'] }],
        })
        .then((result) => {
          return !result.canceled && result.filePath ? result.filePath : '';
        })
        .catch((err) => {
          console.log(`Failed to select file to open: ${err}`);
          return '';
        });
    }

    if (fileToCreate === '') {
      return false;
    }
    return Model.new(fileToCreate);
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

  getStartNode(): string {
    const opus = Model.getOpus();
    if (opus) return opus.startNode;
    return '';
  }

  getActions(): Action[] {
    const opus = Model.getOpus();
    if (opus) return Object.values(opus.actions);
    return [];
  }

  getActionDescriptions(): { [name: string]: string } {
    const opus = Model.getOpus();
    if (opus)
      return Object.keys(opus.actions).reduce((result, key) => {
        result[key] = getPrettyActionDescription(
          opus.actions[key],
          opus.assets
        );
        return result;
      }, {});
    return {};
  }

  getAssets(): Asset[] {
    const opus = Model.getOpus();
    if (opus) return Object.values(opus.assets);
    return [];
  }

  nodeExists(name: string): boolean {
    const opus = Model.getOpus();
    if (opus) return name in opus.nodes;
    return false;
  }

  reloadCommands(): void {
    // Call on function in commands.ts
    // (that happens to be called the same)
    reloadCommands();
  }

  updateNode(name: string | null, data: OpusNodeData): string {
    const opus = Model.getOpus();
    if (opus) return opus.updateNode(name, data);
    return '';
  }

  updateAction(
    name: string | null,
    data: ActionData,
    useInline: boolean
  ): string {
    const opus = Model.getOpus();
    if (opus) return opus.updateAction(name, useInline, data);
    return '';
  }

  deleteNode(name: string): string {
    const opus = Model.getOpus();
    if (opus && opus.deleteNode(name)) return name;
    return '';
  }

  deleteAction(name: string): string {
    const opus = Model.getOpus();
    if (opus && opus.deleteAction(name)) return name;
    return '';
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

const showAskDialog = (
  win: BrowserWindow,
  title: string,
  message: string,
  buttons: string[]
): number => {
  return dialog.showMessageBoxSync(win, { title, message, buttons });
};

const showOKDialog = (
  win: BrowserWindow,
  type: string,
  title: string,
  message: string
): void => {
  let actualType = type;
  if (!['none', 'info', 'error', 'question', 'warning'].includes(type)) {
    // Default to info for unknown types
    actualType = 'info';
  }
  dialog.showMessageBoxSync(win, { type: actualType, title, message });
};

const initApiCommunication = (mainWindow: BrowserWindow): void => {
  addSimpleGetter(GET_LOADING_TEXT, CURRENT_API.getLoadingText);
  addSimpleGetter(GET_NODES, CURRENT_API.getNodes);
  addSimpleGetter(GET_START_NODE, CURRENT_API.getStartNode);
  addSimpleGetter(GET_ACTIONS, CURRENT_API.getActions);
  addSimpleGetter(GET_ACTION_DESCRIPTIONS, CURRENT_API.getActionDescriptions);
  addSimpleGetter(GET_ASSETS, CURRENT_API.getAssets);

  ipcMain.on(OPEN_OPUS, async (event, args) => {
    const file = args.length > 0 ? args[0] : null;
    const success = await CURRENT_API.openOpus(file);
    event.reply(OPEN_OPUS, success);
  });

  ipcMain.on(CHECK_NODE_EXISTS, (event, args) => {
    const name = args[0] as string;
    const result = CURRENT_API.nodeExists(name);
    event.reply(CHECK_NODE_EXISTS, result);
  });

  ipcMain.on(UPDATE_NODE, (event, args) => {
    if (args.length !== 2) {
      console.log(`Got ${args.length} arguments, expected 2`);
      event.reply(UPDATE_NODE, '');
      return;
    }
    const name = args[0] as string | null;
    const data = args[1] as OpusNodeData;
    const result = CURRENT_API.updateNode(name, data);
    event.reply(UPDATE_NODE, result);
  });

  ipcMain.on(UPDATE_ACTION, (event, args) => {
    if (args.length < 2) {
      console.log(`Got ${args.length} arguments, expected at least 2`);
      event.reply(UPDATE_ACTION, '');
      return;
    }
    const name = args[0] as string | null;
    const data = args[1] as ActionData;
    const useInline = args.length > 2 ? (args[2] as boolean) : false;
    const result = CURRENT_API.updateAction(name, data, useInline);
    event.reply(UPDATE_ACTION, result);
  });

  ipcMain.on(DELETE_NODE, (event, args) => {
    const name = args[0] as string;
    const result = CURRENT_API.deleteNode(name);
    event.reply(DELETE_NODE, result);
  });

  ipcMain.on(DELETE_ACTION, (event, args) => {
    const name = args[0] as string;
    const result = CURRENT_API.deleteAction(name);
    event.reply(DELETE_ACTION, result);
  });

  ipcMain.on(LIST_COMMANDS, (event) => {
    const cmds = getAvailableCommands();
    event.reply(LIST_COMMANDS, cmds);
  });

  ipcMain.on(RELOAD_COMMANDS, () => {
    reloadCommands();
  });

  ipcMain.on(SHOW_ASK_DIALOG, async (event, args) => {
    if (args.length !== 3) {
      event.reply(SHOW_ASK_DIALOG, -1);
      return;
    }
    const title = args[0] as string;
    const message = args[1] as string;
    const buttons = args[2] as string[];
    const result = showAskDialog(mainWindow, title, message, buttons);
    event.reply(SHOW_ASK_DIALOG, result);
  });

  ipcMain.on(SHOW_DIALOG, async (event, args) => {
    if (args.length !== 3) {
      event.reply(SHOW_DIALOG, false);
      return;
    }
    const type = args[0] as string;
    const title = args[1] as string;
    const message = args[2] as string;
    showOKDialog(mainWindow, type, title, message);
    event.reply(SHOW_DIALOG, true);
  });

  Model.addListener('loaded', (...args: unknown[]) => {
    if (args.length === 1) {
      mainWindow.webContents.send(LOADED_CHANGED, args[0]);
    }
  });
  Model.addListener('changed_nodes', () => {
    mainWindow.webContents.send(NODES_CHANGED);
  });
  Model.addListener('changed_assets', () => {
    mainWindow.webContents.send(ASSETS_CHANGED);
  });
  Model.addListener('changed_actions', () => {
    mainWindow.webContents.send(ACTIONS_CHANGED);
  });
};

const initApi = (mainWindow: BrowserWindow): void => {
  initApiCommunication(mainWindow);
  reloadCommands();
};

export { getApi, initApi };
