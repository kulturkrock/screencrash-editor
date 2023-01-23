import * as React from 'react';
import { ChangeType, getApi } from '../util/backend';

import '../styles/ActionEditor.css';
import { ActionData, SingleAction } from '../../main/model/action';
import { ICommand, ICommandParameter } from '../../main/model/commands';
import { Asset } from '../../main/model/asset';

interface IProps {
  actionName: string;
}

interface IState {
  actionData: ActionData | null;
  hasChanges: boolean;
  availableCommands: { [component: string]: ICommand[] };
  availableAssets: Asset[];
}

function getAssetPathName(asset: Asset): string {
  const { path } = asset.data;
  return path.substring(path.lastIndexOf('/') + 1);
}

class ActionEditor extends React.PureComponent<IProps, IState> {
  _unregisterUpdates: (() => void) | undefined;

  constructor(props: IProps) {
    super(props);
    this.state = {
      actionData: null,
      availableCommands: {},
      availableAssets: [],
      hasChanges: false,
    };
    this.updateAssets = this.updateAssets.bind(this);
    this.loadAction();
  }

  componentDidMount(): void {
    this.updateAssets();
    this._unregisterUpdates = getApi().addChangeListener(
      ChangeType.Assets,
      this.updateAssets
    );
  }

  componentDidUpdate(
    prevProps: Readonly<IProps>,
    prevState: Readonly<IState>
  ): void {
    const { actionName } = this.props;
    if (prevProps.actionName !== actionName) {
      this.applyChanges(prevProps, prevState);
      this.loadAction();
    }
  }

  componentWillUnmount(): void {
    if (this._unregisterUpdates) {
      this._unregisterUpdates();
    }
  }

  loadAction(): void {
    const { actionName } = this.props;
    const api = getApi();
    api
      .getAvailableCommands()
      .then((cmds) => this.setState({ availableCommands: cmds }))
      .catch((err) => console.log(`Failed to load available commands: ${err}`));
    api
      .getActions()
      .then((actions) => {
        const matchingActions = actions.filter(
          (action) => action.name === actionName
        );
        if (matchingActions.length === 1) {
          this.setState({
            actionData: matchingActions[0].data,
            hasChanges: false,
          });
          return true;
        }
        return false;
      })
      .catch((error) => {
        console.log(`Failed to load action: ${error}`);
      });
  }

  updateAssets(): void {
    getApi()
      .getAssets()
      .then((assets) => this.setState({ availableAssets: assets }))
      .catch((err) => `Failed to update assets: ${err}`);
  }

  // eslint-disable-next-line class-methods-use-this
  updateActionData(index: number, updatedAction: SingleAction) {
    const { actionData } = this.state;
    if (actionData === null) {
      return;
    }

    if (Array.isArray(actionData)) {
      this.setState({
        actionData: (actionData as SingleAction[]).map((val, i) =>
          index === i ? updatedAction : val
        ),
        hasChanges: true,
      });
    } else {
      this.setState({ actionData: updatedAction, hasChanges: true });
    }
  }

  // eslint-disable-next-line react/sort-comp, class-methods-use-this
  applyChanges(prevProps: Readonly<IProps>, prevState: Readonly<IState>): void {
    if (prevState.actionData) {
      const api = getApi();
      api
        .updateAction(prevProps.actionName, prevState.actionData, true)
        .then(async (usedName) => {
          if (usedName === '') {
            api.showErrorMessage(
              'Failed to update',
              'Failed to save your changes to the action. Please try again'
            );
          }
          return true;
        })
        .catch((reason) => {
          console.log(`Failed to notify user about error due to ${reason}`);
        });
    }
  }

  // eslint-disable-next-line class-methods-use-this
  renderParamForm(
    action: SingleAction,
    index: number,
    paramData: ICommandParameter
  ): JSX.Element {
    const key = `action_${index}_${paramData.name}`;
    const currentValue =
      paramData.name in (action.params || {})
        ? (action.params || {})[paramData.name]
        : paramData.default;

    const setParamValue = (value: unknown) => {
      const { dataPath } = paramData;
      try {
        const newAction = { ...action, params: { ...(action.params || {}) } };
        if (newAction.params === undefined) {
          newAction.params = {};
        }
        let currObj = newAction.params;
        while (dataPath.length > 1) {
          const entry = dataPath.shift() as string;
          if (!(entry in currObj)) {
            currObj[entry] = {};
          }
          currObj = currObj[entry] as { [key: string]: unknown };
        }
        currObj[dataPath[0]] = value;
        this.updateActionData(index, newAction);
      } catch (e) {
        console.log(`Failed to set param value: ${e}`);
      }
    };

    let form = <span>Unknown parameter {paramData.name}</span>;
    if (paramData.type === 'boolean' || paramData.type === 'enum') {
      form = (
        <select
          title={paramData.description}
          value={`${currentValue}`}
          onChange={(event) =>
            setParamValue(
              paramData.type === 'boolean'
                ? event.target.value === 'true'
                : event.target.value
            )
          }
        >
          {(paramData.enumValues || []).map((enumValue) => (
            <option key={`${key}_${enumValue}`} value={enumValue}>
              {enumValue}
            </option>
          ))}
        </select>
      );
    } else if (paramData.type === 'string' || paramData.type === 'number') {
      const inputType = paramData.type === 'string' ? 'text' : 'number';
      form = (
        <input
          type={inputType}
          placeholder={paramData.title}
          title={paramData.description}
          value={currentValue === undefined ? '' : `${currentValue}`}
          onChange={(event) =>
            setParamValue(
              paramData.type === 'number'
                ? parseInt(event.target.value, 10)
                : event.target.value
            )
          }
        />
      );
    }

    return (
      <div className="EditField">
        <div
          className={`FieldDescription ${paramData.required ? 'Required' : ''}`}
          title={paramData.description}
        >
          {paramData.name}
        </div>
        <div className="FieldInput">{form}</div>
      </div>
    );
  }

  renderAssetForm(
    action: SingleAction,
    index: number,
    assetName: string,
    assetIndex: number
  ): JSX.Element {
    const { availableAssets } = this.state;
    return (
      <div className="EditField">
        <div className="FieldDescription">Asset {assetIndex + 1}</div>
        <div className="FieldInput">
          <select
            key={`action${index}_asset${assetIndex}`}
            value={assetName}
            onChange={(event) => this.updateActionData(index, { ...action })}
          >
            <option value="">-- None --</option>
            {availableAssets
              .filter((asset) => !asset.isInline || asset.name === assetName)
              .map((asset) => (
                <option value={asset.name}>
                  {asset.isInline
                    ? `[Inline asset ${getAssetPathName(asset)}]`
                    : asset.name}
                </option>
              ))}
          </select>
        </div>
      </div>
    );
  }

  // eslint-disable-next-line class-methods-use-this
  renderSingleAction(
    name: string,
    action: SingleAction,
    index: number
  ): JSX.Element {
    const { availableCommands } = this.state;
    const cmdInfos =
      action.target in availableCommands
        ? availableCommands[action.target].filter(
            (cmd) => cmd.command === action.cmd
          )
        : [];
    const cmdInfo = cmdInfos.length !== 0 ? cmdInfos[0] : undefined;
    const subcommands =
      action.target in availableCommands
        ? availableCommands[action.target]
        : [];
    return (
      <div key={name}>
        <select
          value={action.target !== '' ? action.target : 'unknown'}
          onChange={(event) =>
            this.updateActionData(index, {
              ...action,
              target: event.target.value,
              cmd: 'unknown',
            })
          }
        >
          <option value="unknown" disabled>
            -- Component --
          </option>
          {Object.keys(availableCommands).map((component) => (
            <option key={component} value={component}>
              {component}
            </option>
          ))}
        </select>
        <select
          value={action.cmd}
          onChange={(event) =>
            this.updateActionData(index, { ...action, cmd: event.target.value })
          }
        >
          <option value="unknown" disabled>
            -- Select action --
          </option>
          {subcommands.map((command) => (
            <option
              key={command.command}
              value={command.command}
              title={command.description}
            >
              {command.command}
            </option>
          ))}
        </select>
        <div className="ActionAssets">
          {(action.assets || []).map(
            this.renderAssetForm.bind(this, action, index)
          )}
          {action.assets &&
          cmdInfo &&
          cmdInfo?.maxNofAssets > action.assets.length ? (
            <button type="button">Add more assets (TODO)</button>
          ) : (
            ''
          )}
        </div>
        <div className="ActionParameters">
          {(cmdInfo?.parameters || []).map(
            this.renderParamForm.bind(this, action, index)
          )}
        </div>
      </div>
    );
  }

  render(): JSX.Element {
    const { actionName } = this.props;
    const { actionData, hasChanges } = this.state;
    if (actionData === null) {
      return <div className="ActionEditor">Loading...</div>;
    }

    const header = (
      <div className="HeaderWithButtons">
        <h3>Properties</h3>
        <button
          type="button"
          className="Abort"
          disabled={!hasChanges}
          onClick={this.loadAction.bind(this)}
        >
          Reset
        </button>
        <button
          type="button"
          className="Apply"
          disabled={!hasChanges}
          onClick={() => {
            this.applyChanges(this.props, this.state);
            this.setState({ hasChanges: false });
          }}
        >
          Apply
        </button>
      </div>
    );

    if (Array.isArray(actionData)) {
      return (
        <div className="ActionEditor">
          {header}
          {(actionData as SingleAction[]).map(
            this.renderSingleAction.bind(this, actionName)
          )}
        </div>
      );
    }
    if ((actionData as SingleAction).target !== undefined) {
      return (
        <div className="ActionEditor">
          {header}
          {this.renderSingleAction(actionName, actionData as SingleAction, 0)}
        </div>
      );
    }
    return (
      <div className="ActionEditor">
        {header}
        No support for parameterized actions yet
      </div>
    );
  }
}

export default ActionEditor;
