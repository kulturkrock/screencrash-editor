import { parse, stringify } from 'yaml';
import * as fs from 'fs';
import { ActionData, ActionTemplate } from './action';
import { AssetData, Asset } from './asset';
import { UIConfigData, UIConfig } from './ui';
import { NamedSaveable, UnnamedSaveable } from './common';
import { OpusNode, OpusNodeData } from './node';

function toNamedData(data: { [key: string]: NamedSaveable }): unknown {
  return Object.fromEntries(Object.keys(data).map((key) => data[key].toData()));
}

/*
function toUnnamedData(data: UnnamedSaveable[]): unknown {
  return data.map((obj) => obj.toData());
}
*/

export default class Opus {
  nodes: { [key: string]: OpusNode } = {};
  startNode: string = '';
  actionTemplates: { [key: string]: ActionTemplate } = {};
  assets: { [key: string]: Asset } = {};
  ui: UIConfig | null = null;

  constructor(path: string) {
    const rawData = fs.readFileSync(path, 'utf-8');
    const data = parse(rawData);
    this.setNodes(data.nodes);
    this.setStartNode(data.startNode);
    this.setActionTemplates(data.action_templates);
    this.setAssets(data.assets);
    this.setUIProperties(data.ui);

    this.printReport();
  }

  printReport() {
    let report = 'Loaded opus with:\n';
    report += `  ${Object.keys(this.nodes).length} nodes\n`;
    report += `  ${
      Object.keys(this.actionTemplates).length
    } action templates\n`;
    report += `  ${Object.keys(this.assets).length} assets\n`;
    report += `  ${this.ui?.getShortcuts().length} shortcuts\n`;
    console.log(report);
  }

  setNodes(nodes: { [key: string]: OpusNodeData }) {
    Object.keys(nodes).forEach((key) => {
      this.nodes[key] = new OpusNode(key, nodes[key]);
    });
  }

  setStartNode(startNode: string) {
    this.startNode = startNode;
  }

  setActionTemplates(actionTemplates: { [key: string]: ActionData }) {
    Object.keys(actionTemplates).forEach((key) => {
      this.actionTemplates[key] = new ActionTemplate(key, actionTemplates[key]);
    });
  }

  setAssets(assets: { [key: string]: AssetData }) {
    Object.keys(assets).forEach((key) => {
      this.assets[key] = new Asset(key, assets[key]);
    });
  }

  setUIProperties(uiProperties: UIConfigData | null) {
    this.ui = new UIConfig(uiProperties);
  }

  save(path: string): void {
    const data = {
      startNode: this.startNode,
      nodes: toNamedData(this.nodes),
      action_templates: toNamedData(this.actionTemplates),
      assets: toNamedData(this.assets),
      ui: this.ui?.toData() || [],
    };
    fs.writeFileSync(path, stringify(data), { encoding: 'utf-8' });
  }
}
