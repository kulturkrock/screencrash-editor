import {
  app,
  Menu,
  shell,
  BrowserWindow,
  MenuItemConstructorOptions,
} from 'electron';
import ActionHandler from './actions';

export default class MenuBuilder {
  mainWindow: BrowserWindow;
  // eslint-disable-next-line @typescript-eslint/lines-between-class-members
  actionHandler: ActionHandler;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.actionHandler = new ActionHandler(mainWindow);
  }

  buildMenu(): Menu {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      this.setupDevelopmentEnvironment();
    }

    const template =
      process.platform === 'darwin'
        ? this.buildDarwinTemplate()
        : this.buildDefaultTemplate();

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment(): void {
    this.mainWindow.webContents.on('context-menu', (_, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y);
          },
        },
      ]).popup({ window: this.mainWindow });
    });
  }

  buildDarwinTemplate(): MenuItemConstructorOptions[] {
    const template: MenuItemConstructorOptions[] = this.buildDefaultTemplate();
    template.forEach((menu: MenuItemConstructorOptions) => {
      this.patchDarwinAccelerators(menu);
    });
    return template;
  }

  patchDarwinAccelerators(menuItem: MenuItemConstructorOptions): void {
    if (menuItem.accelerator) {
      menuItem.accelerator = menuItem.accelerator.replaceAll('Ctrl', 'Command');
    }
    if (menuItem.submenu) {
      (menuItem.submenu as MenuItemConstructorOptions[]).forEach(
        (submenu: MenuItemConstructorOptions) => {
          this.patchDarwinAccelerators(submenu);
        }
      );
    }
  }

  buildDefaultTemplate(): MenuItemConstructorOptions[] {
    const templateDefault: MenuItemConstructorOptions[] = [
      {
        label: '&File',
        submenu: [
          {
            label: '&New',
            accelerator: 'Ctrl+N',
            click: () => {
              this.actionHandler.newFile();
            },
          },
          {
            label: '&Open',
            accelerator: 'Ctrl+O',
            click: () => {
              this.actionHandler.openFile();
            },
          },
          {
            label: '&Save',
            accelerator: 'Ctrl+S',
            click: () => {
              this.actionHandler.saveFile();
            },
          },
          {
            label: '&Save as',
            accelerator: 'Ctrl+Shift+S',
            click: () => {
              this.actionHandler.saveFileAs();
            },
          },
          { type: 'separator' },
          {
            label: '&Close',
            accelerator: 'Ctrl+W',
            click: () => {
              this.mainWindow.close();
            },
          },
        ],
      },
      {
        label: '&View',
        submenu:
          process.env.NODE_ENV === 'development' ||
          process.env.DEBUG_PROD === 'true'
            ? [
                {
                  label: '&Reload',
                  accelerator: 'Ctrl+R',
                  click: () => {
                    this.mainWindow.webContents.reload();
                  },
                },
                {
                  label: 'Toggle &Full Screen',
                  accelerator: 'F11',
                  click: () => {
                    this.mainWindow.setFullScreen(
                      !this.mainWindow.isFullScreen()
                    );
                  },
                },
                {
                  label: 'Toggle &Developer Tools',
                  accelerator: 'Alt+Ctrl+I',
                  click: () => {
                    this.mainWindow.webContents.toggleDevTools();
                  },
                },
              ]
            : [
                {
                  label: 'Toggle &Full Screen',
                  accelerator: 'F11',
                  click: () => {
                    this.mainWindow.setFullScreen(
                      !this.mainWindow.isFullScreen()
                    );
                  },
                },
              ],
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Github organization',
            click() {
              shell.openExternal('https://github.com/kulturkrock/');
            },
          },
        ],
      },
    ];

    return templateDefault;
  }
}
