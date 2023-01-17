import { ActionData } from './action';
import { UnnamedSaveable } from './common';

type Modifier = 'ctrl' | 'alt' | 'shift';

interface HotKey {
  key: string;
  modifiers?: Modifier[];
}

interface Shortcut {
  title: string;
  hotkey?: HotKey;
  actions: (string | ActionData)[];
}

export interface UIConfigData {
  shortcuts?: Shortcut[];
}

export class UIConfig implements UnnamedSaveable {
  data: UIConfigData;

  constructor(data: UIConfigData | null) {
    this.data = data || {};
    this.data.shortcuts = this.data.shortcuts || [];
  }

  getShortcuts(): Shortcut[] {
    return this.data.shortcuts ? this.data.shortcuts : [];
  }

  static parseRawData(data: unknown): UIConfigData {
    return data as UIConfigData;
  }

  // eslint-disable-next-line class-methods-use-this
  canBeSaved(): boolean {
    return true;
  }

  toSaveData(): unknown {
    return this.data;
  }
}
