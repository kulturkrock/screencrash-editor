import * as fs from 'fs';

interface IRawCommandParamData {
  title?: string;
  description?: string;
  type?: string;
  minimum?: number;
  maximum?: number;
  default?: string | number;
  properties?: IRawCommandParamData;
  required?: string[];
}

interface IRawCommandProperties {
  target: { const: string };
  cmd: { const: string };
  params?: IRawCommandParamData;
  assets?: { minLength: number; maxLength: number };
}

interface IRawCommand {
  title: string;
  description: string;
  properties: IRawCommandProperties;
}

interface ISchema {
  title: string;
  description: string;
  oneOf: IRawCommand[];
}

type CommandParameterType =
  | 'string'
  | 'number'
  | 'list'
  | 'enum'
  | 'boolean'
  | 'option'
  | 'unknown';

export interface ICommandParameter {
  name: string;
  type: CommandParameterType;
  dataPath: string[];
  title: string;
  description: string;
  required: boolean;
  enumValues?: string[];
  options?: ICommandParameter[];
  minValue?: number;
  maxValue?: number;
  default?: number | string;
}

export interface ICommand {
  component: string;
  command: string;
  title: string;
  description: string;
  minNofAssets: number;
  maxNofAssets: number;
  parameters: ICommandParameter[];
}

let commands: { [component: string]: ICommand[] } = {};

function addParamToCommand(
  cmd: ICommand,
  propName: string,
  propData: IRawCommandParamData,
  requiredProps: string[],
  dataPath: string[] = [],
  parentIsRequired = true
) {
  if (propData.type === 'object') {
    const thisObjIsRequired = requiredProps.includes(propName);
    Object.entries(propData.properties || {}).forEach(
      ([subProp, subPropData]) => {
        addParamToCommand(
          cmd,
          subProp,
          subPropData,
          propData.required || [],
          [...dataPath, propName],
          thisObjIsRequired
        );
      }
    );
    return;
  }

  const newParam: ICommandParameter = {
    name: [...dataPath, propName].join(' -> '),
    dataPath: [...dataPath, propName],
    required: parentIsRequired && requiredProps.includes(propName),
    title: propData.title || propName,
    description: propData.description || propName,
    type: 'unknown',
  };
  switch (propData.type) {
    case 'string':
      newParam.type = 'string';
      break;
    case 'number':
      newParam.type = 'number';
      newParam.minValue = propData.minimum;
      newParam.maxValue = propData.maximum;
      newParam.default = propData.default;
      break;
    case 'boolean':
      newParam.type = 'boolean';
      newParam.enumValues = ['true', 'false'];
      break;
    default:
      break;
  }
  cmd.parameters.push(newParam);
}

function addCommandsFrom(data: ISchema) {
  data.oneOf.forEach((cmd) => {
    const component = cmd.properties.target.const;
    if (!(component in commands)) {
      commands[component] = [];
    }
    const newCommand: ICommand = {
      component: cmd.properties.target.const,
      command: cmd.properties.cmd.const,
      title: cmd.title || cmd.description || '[No title]',
      description: cmd.description,
      minNofAssets: cmd.properties.assets?.minLength || 0,
      maxNofAssets: cmd.properties.assets?.maxLength || 0,
      parameters: [],
    };
    Object.entries(cmd.properties.params?.properties || []).forEach(
      ([prop, propData]) =>
        addParamToCommand(
          newCommand,
          prop,
          propData,
          cmd.properties.params?.required || []
        )
    );
    commands[component].push(newCommand);
  });
}

export function reloadCommands() {
  const folder = 'src/schemas/commands';
  commands = {};
  fs.readdirSync(folder).forEach((file) => {
    const rawData = fs.readFileSync(`${folder}/${file}`);
    const data = JSON.parse(rawData.toString('utf8'));
    addCommandsFrom(data);
  });
  console.log(JSON.stringify(commands.audio, null, 4));
}

export function getAvailableCommands() {
  return commands;
}
