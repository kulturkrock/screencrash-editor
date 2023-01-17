import { Action, SingleAction } from './action';
import { Asset } from './asset';
import { getAvailableCommands } from './commands';

function prettyActionData(
  actionData: SingleAction,
  assets: { [name: string]: Asset }
): string {
  const availCommands = getAvailableCommands();
  const cmdDescriptions =
    actionData.target in availCommands
      ? availCommands[actionData.target].filter(
          (cmd) => cmd.command === actionData.cmd
        )
      : [];
  if (cmdDescriptions.length === 0) {
    return `${actionData.target}:${actionData.cmd}`;
  }

  const cmdDesc = cmdDescriptions[0];
  let result = cmdDesc.title;
  if (actionData.assets && actionData.assets.length > 0) {
    const assetDescs = actionData.assets.map((asset) => {
      const { path } = assets[asset].data;
      return path.substring(path.lastIndexOf('/') + 1);
    });
    result += ` (${assetDescs.join(', ')})`;
  }
  if (actionData.params && 'entityId' in actionData.params) {
    result += ` entityId=${actionData.params.entityId}`;
  }
  return result;
}

// eslint-disable-next-line import/prefer-default-export
export function getPrettyActionDescription(
  action: Action,
  assets: { [name: string]: Asset }
): string {
  if ('actions' in action.data) {
    return 'Unsupported parameter action. Edit manually if needed';
  }
  const actionList: SingleAction[] = Array.isArray(action.data)
    ? action.data
    : [action.data];
  return actionList.map((entry) => prettyActionData(entry, assets)).join(', ');
}
