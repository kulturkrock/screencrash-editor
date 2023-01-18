import crypto from 'crypto';
import * as fs from 'fs';
import { EventEmitter } from 'stream';
import { parse, stringify } from 'yaml';
import { ActionData, Action } from './action';
import { AssetData, Asset } from './asset';
import { UIConfigData, UIConfig } from './ui';
import { NamedSaveable } from './common';
import { OpusNode, OpusNodeData } from './node';

function toNamedData(data: { [key: string]: NamedSaveable }): unknown {
  return Object.fromEntries(
    Object.keys(data)
      .filter((key) => data[key].canBeSaved())
      .map((key) => data[key].toSaveData())
  );
}

function generateUniqueName(type: string, usedNames: string[]): string {
  let result = '';
  const prefix = `${type}_`;
  do {
    result = prefix + crypto.randomBytes(6).toString('hex');
  } while (usedNames.includes(result));

  return result;
}

export default class Opus extends EventEmitter {
  inhibitEmits: boolean = false;
  nodes: { [key: string]: OpusNode } = {};
  startNode: string = '';
  actions: { [key: string]: Action } = {};
  assets: { [key: string]: Asset } = {};
  ui: UIConfig | null = null;

  constructor(path: string | null) {
    super();
    if (path) {
      this.inhibitEmits = true;
      this._loadFromFile(path);
      this.inhibitEmits = false;
    }

    this.printReport();
  }

  _loadFromFile(path: string): void {
    const rawData = fs.readFileSync(path, 'utf-8');
    const data = parse(rawData);

    const assetCreator = (asset: any): string => {
      if (typeof asset === 'string') {
        return asset;
      }
      const name = generateUniqueName('asset', Object.keys(this.assets));
      this.updateAsset(name, true, Asset.parseRawData(asset));
      return name;
    };

    const actionCreator = (action: any): string => {
      if (typeof action === 'string') {
        return action;
      }
      const name = generateUniqueName('action', Object.keys(this.actions));
      this.updateAction(name, true, Action.parseRawData(action, assetCreator));
      return name;
    };

    // Nodes
    Object.keys(data.nodes).forEach((key) => {
      this.updateNode(
        key,
        OpusNode.parseRawData(data.nodes[key], actionCreator)
      );
    });

    // Start node
    this.startNode = data.startNode;

    // Actions
    Object.keys(data.action_templates).forEach((key) => {
      this.updateAction(
        key,
        false,
        Action.parseRawData(data.action_templates[key], assetCreator)
      );
    });

    // Assets
    Object.keys(data.assets).forEach((key) => {
      this.assets[key] = new Asset(
        key,
        false,
        Asset.parseRawData(data.assets[key])
      );
    });

    // UI properties
    this.ui = new UIConfig(UIConfig.parseRawData(data.ui));

    // Do sanity check
    if (stringify(data) !== stringify(this._getSaveData())) {
      // TODO: Notify end user
      console.warn('WARNING: Opening opus did NOT pass sanity check');
    } else {
      console.log('Opus passed sanity check');
    }
  }

  emitChangeEvent(type: string) {
    if (!this.inhibitEmits) {
      this.emit('changed', type);
    }
  }

  printReport() {
    let report = 'Loaded opus with:\n';
    report += `  ${Object.keys(this.nodes).length} nodes\n`;
    report += `  ${Object.keys(this.actions).length} actions\n`;
    report += `  ${Object.keys(this.assets).length} assets\n`;
    report += `  ${this.ui?.getShortcuts().length} shortcuts\n`;
    console.log(report);
  }

  findPathByAsset(name: string): string | null {
    if (name in this.assets) {
      return this.assets[name].getPath();
    }
    return null;
  }

  addDefaultItems(): void {
    this.updateNode('default', {
      ...OpusNode.getEmptyNodeData(),
      prompt: 'Initial node',
    });
    this.startNode = 'default';
  }

  updateAsset(name: string | null, isInline: boolean, data: AssetData): string {
    this.emitChangeEvent('assets');
    const nameToUse =
      name || generateUniqueName('asset', Object.keys(this.assets));
    this.assets[nameToUse] = new Asset(nameToUse, isInline, data);
    return nameToUse;
  }

  updateAction(
    name: string | null,
    isInline: boolean,
    data: ActionData
  ): string {
    this.emitChangeEvent('actions');
    const nameToUse =
      name || generateUniqueName('action', Object.keys(this.actions));
    this.actions[nameToUse] = new Action(nameToUse, isInline, data);
    return nameToUse;
  }

  updateNode(name: string | null, data: OpusNodeData): string {
    this.emitChangeEvent('nodes');
    const nameToUse =
      name || generateUniqueName('node', Object.keys(this.nodes));
    this.nodes[nameToUse] = new OpusNode(nameToUse, data);
    return nameToUse;
  }

  deleteNode(name: string): boolean {
    if (name in this.nodes && name !== this.startNode) {
      delete this.nodes[name];
      this.emitChangeEvent('nodes');
      return true;
    }
    return false;
  }

  _getSaveData(): unknown {
    // Make sure all nodes knows about the available actions/assets
    Object.keys(this.nodes).forEach((key) =>
      this.nodes[key].setAllAvailableActions(this.actions)
    );
    Object.keys(this.actions).forEach((key) => {
      this.actions[key].setAllAvailableAssets(this.assets);
    });

    return {
      startNode: this.startNode,
      nodes: toNamedData(this.nodes),
      action_templates: toNamedData(this.actions),
      assets: toNamedData(this.assets),
      ui: this.ui?.toSaveData() || {},
    };
  }

  save(path: string): void {
    const saveData = this._getSaveData();
    fs.writeFileSync(path, stringify(saveData), { encoding: 'utf-8' });
  }
}
