/* eslint-disable no-console */
import { dialog, BrowserWindow } from 'electron';

export default class ActionHandler {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  log(msg: string): void {
    this.mainWindow.webContents.send('log', msg);
  }

  newFile(): void {
    this.log('new file');
  }

  openFile(): void {
    dialog
      .showOpenDialog({
        properties: ['openFile', 'multiSelections'],
      })
      .then((result) => {
        if (!result.canceled) {
          this.log(result.filePaths.join(', '));
        }
        return 0;
      })
      .catch((err) => {
        this.log(`Error opening file: ${err}`);
      });
  }

  saveFile(): void {
    this.log('save');
  }

  saveFileAs(): void {
    this.log('save as');
  }
}
