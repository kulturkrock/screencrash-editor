/* eslint-disable class-methods-use-this */
import { dialog, ipcMain } from 'electron';
import { GET_LOADING_TEXT, OPEN_OPUS } from './channels';
import Model from './model/model';

interface IApi {
  getLoadingText: () => string;
  openOpus: (file: string | null) => Promise<boolean>;
}

class Api implements IApi {
  constructor() {
    this.getLoadingText = this.getLoadingText.bind(this);
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

  async openOpus(file: string | null): Promise<boolean> {
    let fileToOpen = file;
    if (fileToOpen === null) {
      fileToOpen = await dialog
        .showOpenDialog({ properties: ['openFile'], title: 'Select opus file' })
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
}

const CURRENT_API = new Api();
const getApi = (): IApi => {
  return CURRENT_API;
};

const initApiCommunication = (): void => {
  ipcMain.on(GET_LOADING_TEXT, async (event) => {
    const msg = CURRENT_API.getLoadingText();
    event.reply(GET_LOADING_TEXT, msg);
  });

  ipcMain.on(OPEN_OPUS, async (event, args) => {
    const file = args.length > 0 ? args[0] : null;
    const success = await CURRENT_API.openOpus(file);
    event.reply(OPEN_OPUS, success);
  });
};

export { getApi, initApiCommunication };
