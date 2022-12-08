import { EventEmitter } from 'stream';
import Opus from './opus';

interface IModel extends EventEmitter {
  currentFile: string;
  hasLoaded: () => boolean;
  load: (file: string) => boolean;
  save: (file: string) => boolean;
  unload: () => void;
}

class Model extends EventEmitter implements IModel {
  currentFile: string;
  opus: Opus | null = null;

  constructor() {
    super();
    this.currentFile = '';
  }

  emitUpdatedEvent(): void {
    this.emit('updated');
  }

  hasLoaded(): boolean {
    return this.currentFile !== '';
  }

  load(file: string): boolean {
    this.currentFile = file;
    try {
      this.opus = new Opus(file);
      console.log(
        `Loaded ${file} with ${Object.keys(this.opus.nodes).length} nodes`
      );
      this.emitUpdatedEvent();
      return true;
    } catch (e) {
      console.log(`Failed to load opus: ${e}`);
      this.emitUpdatedEvent();
      return false;
    }
  }

  save(file: string): boolean {
    try {
      this.opus?.save(file);
      console.log(`Saved opus to ${file}`);
      this.emitUpdatedEvent();
      return true;
    } catch (e) {
      console.log(`Failed to save file: ${e}`);
      this.emitUpdatedEvent();
      return false;
    }
  }

  unload(): void {
    this.currentFile = '';
    this.emitUpdatedEvent();
  }
}

const CURRENT_MODEL = new Model();

export default CURRENT_MODEL;
