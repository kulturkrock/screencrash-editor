import { EventEmitter } from 'stream';
import Opus from './opus';

interface IModel extends EventEmitter {
  currentFile: string;
  hasLoaded: () => boolean;
  new: (file: string) => boolean;
  load: (file: string) => boolean;
  save: (file: string) => boolean;
  unload: () => boolean;
}

class Model extends EventEmitter implements IModel {
  currentFile: string;
  opus: Opus | null = null;

  constructor() {
    super();
    this.currentFile = '';
    this.onOpusChangeEvent = this.onOpusChangeEvent.bind(this);
  }

  emitLoadEvent(): void {
    this.emit('loaded', this.hasLoaded());
  }

  emitUpdatedEvent(): void {
    this.emit('updated');
  }

  onOpusChangeEvent(...args: unknown[]) {
    if (args.length === 1) {
      const changeType = args[0] as string;
      this.emit(`changed_${changeType}`);
    }
  }

  getOpus(): Opus | null {
    return this.opus;
  }

  hasLoaded(): boolean {
    return this.currentFile !== '';
  }

  new(file: string): boolean {
    const newOpus = new Opus(null);
    newOpus.addDefaultItems();
    newOpus.save(file);
    return this.load(file);
  }

  load(file: string): boolean {
    this.currentFile = file;
    try {
      this.opus = new Opus(file);
      this.opus.addListener('changed', this.onOpusChangeEvent);
      console.log(
        `Loaded ${file} with ${Object.keys(this.opus.nodes).length} nodes`
      );
      this.emitLoadEvent();
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

  unload(): boolean {
    this.currentFile = '';
    this.emitLoadEvent();
    this.emitUpdatedEvent();
    return true;
  }
}

const CURRENT_MODEL = new Model();

export default CURRENT_MODEL;
