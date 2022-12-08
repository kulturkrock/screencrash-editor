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
  enabledHandlers: { [id: string]: () => boolean } = {};
  mainWindow: BrowserWindow;
  currentMenu: Electron.Menu | null;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.currentMenu = null;
    this.updateMenuStates = this.updateMenuStates.bind(this);
  }

  setActionHandler(action: string, func: () => Promise<void>): void {
    this.actionHandlers[action] = func;
  }

  setEnabledHandler(action: string, func: () => boolean): void {
    this.enabledHandlers[action] = func;
  }

  updateMenuStates(): void {
    Object.keys(this.enabledHandlers).forEach((action) => {
      const validator = this.enabledHandlers[action];
      const menuItem = this.currentMenu?.getMenuItemById(action);
      if (menuItem) {
        menuItem.enabled = validator();
      }
    });
  }

  async runAction(action: string): Promise<void> {
    if (action in this.actionHandlers) {
      await this.actionHandlers[action]();
    }
  }

  buildMenu(): Menu {
    if (this.currentMenu === null) {
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

      this.currentMenu = Menu.buildFromTemplate(template);
      Menu.setApplicationMenu(this.currentMenu);
      this.updateMenuStates();
    }

    return this.currentMenu;
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
            id: this.Actions.NEW,
            label: '&New',
            accelerator: 'Ctrl+N',
            click: this.runAction.bind(this, this.Actions.NEW),
          },
          {
            id: this.Actions.OPEN,
            label: '&Open',
            accelerator: 'Ctrl+O',
            click: this.runAction.bind(this, this.Actions.OPEN),
          },
          {
            id: this.Actions.SAVE,
            label: '&Save',
            accelerator: 'Ctrl+S',
            click: this.runAction.bind(this, this.Actions.SAVE),
          },
          {
            id: this.Actions.SAVE_AS,
            label: '&Save as',
            accelerator: 'Ctrl+Shift+S',
            click: this.runAction.bind(this, this.Actions.SAVE_AS),
          },
          { type: 'separator' },
          {
            id: this.Actions.CLOSE,
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
