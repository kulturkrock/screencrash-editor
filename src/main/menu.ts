import {
  Menu,
  shell,
  BrowserWindow,
  MenuItemConstructorOptions,
} from 'electron';

export default class MenuBuilder {
  Actions = {
    NEW: 'new',
    OPEN: 'open',
    SAVE: 'save',
    SAVE_AS: 'save_as',
    CLOSE: 'close',
  };

  actionHandlers: { [id: string]: () => Promise<void> } = {};

  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  registerActionHandler(action: string, func: () => Promise<void>): void {
    this.actionHandlers[action] = func;
  }

  async runAction(action: string): Promise<void> {
    if (action in this.actionHandlers) {
      await this.actionHandlers[action]();
    }
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
            click: this.runAction.bind(this, this.Actions.NEW),
          },
          {
            label: '&Open',
            accelerator: 'Ctrl+O',
            click: this.runAction.bind(this, this.Actions.OPEN),
          },
          {
            label: '&Save',
            accelerator: 'Ctrl+S',
            click: this.runAction.bind(this, this.Actions.SAVE),
          },
          {
            label: '&Save as',
            accelerator: 'Ctrl+Shift+S',
            click: this.runAction.bind(this, this.Actions.SAVE_AS),
          },
          { type: 'separator' },
          {
            label: '&Close',
            accelerator: 'Ctrl+W',
            click: this.runAction.bind(this, this.Actions.CLOSE),
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
