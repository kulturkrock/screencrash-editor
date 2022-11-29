interface IModel {
  currentFile: string;
  hasLoaded: () => boolean;
  load: (file: string) => boolean;
  unload: () => void;
}

class Model implements IModel {
  currentFile: string;

  constructor() {
    this.currentFile = '';
  }

  hasLoaded(): boolean {
    return this.currentFile !== '';
  }

  load(file: string): boolean {
    this.currentFile = file;
    // TODO: Actually load stuff
    console.log(`Loaded ${file}`);
    return true;
  }

  unload(): void {
    this.currentFile = '';
  }
}

const CURRENT_MODEL = new Model();

export default CURRENT_MODEL;
