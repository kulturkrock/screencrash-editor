import React from 'react';

import '../styles/Preview.css';
import { FaTrashAlt, FaPlay } from 'react-icons/fa';

import { OpusNode } from '../../main/model/node';
import { ChangeType, getApi } from '../util/backend';
import { Action, SingleAction } from '../../main/model/action';
import { Asset } from '../../main/model/asset';
import AudioPreview from './previews/AudioPreview';
import ImagePreview from './previews/ImagePreview';
import VideoPreview from './previews/VideoPreview';

interface IProps {
  onSelectAction: (action: string | null) => void;
  onSelectNode: (node: OpusNode | null) => void;
  node: OpusNode | null;
}

interface IState {
  selectedAction: string | null;
  allActions: Action[];
  allAssets: Asset[];
}

class Preview extends React.PureComponent<IProps, IState> {
  _unregisterActionListener: (() => void) | undefined;
  _unregisterAssetListener: (() => void) | undefined;

  constructor(props: IProps) {
    super(props);
    this.state = {
      selectedAction: null,
      allActions: [],
      allAssets: [],
    };
    this.getAssetByName = this.getAssetByName.bind(this);
    this.getAssetNameFromEntity = this.getAssetNameFromEntity.bind(this);
  }

  componentDidMount(): void {
    const api = getApi();
    const updateActions = () => {
      api
        .getActions()
        .then((actions) => this.setState({ allActions: actions }))
        .catch((err) => console.log(`Failed to update actions: ${err}`));
    };
    updateActions();
    this._unregisterActionListener = api.addChangeListener(
      ChangeType.Actions,
      updateActions
    );

    const updateAssets = () => {
      api
        .getAssets()
        .then((assets) => this.setState({ allAssets: assets }))
        .catch((err) => console.log(`Failed to update assets: ${err}`));
    };
    updateAssets();
    this._unregisterAssetListener = api.addChangeListener(
      ChangeType.Assets,
      updateAssets
    );
  }

  componentDidUpdate(prevProps: Readonly<IProps>): void {
    const { node } = this.props;
    if (prevProps.node?.name !== node?.name) {
      this.selectAction(null);
    }
  }

  componentWillUnmount(): void {
    if (this._unregisterActionListener) {
      this._unregisterActionListener();
    }
    if (this._unregisterAssetListener) {
      this._unregisterAssetListener();
    }
  }

  getAssetByName(name: string): Asset | null {
    const { allAssets } = this.state;
    const candidates = allAssets.filter((asset) => asset.name === name);
    return candidates.length > 0 ? candidates[0] : null;
  }

  getAssetNameFromEntity(entityId: string): string | null {
    const { allActions } = this.state;
    // eslint-disable-next-line no-restricted-syntax
    for (const action of allActions) {
      if ('actions' in action) {
        // eslint-disable-next-line no-continue
        continue; // Parameterized action
      }

      const singleActions = Array.isArray(action.data)
        ? (action.data as SingleAction[])
        : [action.data as SingleAction];

      const match = singleActions.find(
        (singleAction) =>
          singleAction.cmd === 'create' &&
          singleAction.params &&
          'entityId' in singleAction.params &&
          singleAction.params.entityId === entityId
      );
      if (match && match.assets && match.assets.length > 0) {
        return match.assets[0];
      }
    }
    return null;
  }

  // eslint-disable-next-line class-methods-use-this
  getActionPreview(actionName: string): JSX.Element {
    const { allActions } = this.state;
    const candidates = allActions.filter((a) => a.name === actionName);
    if (candidates.length === 0) {
      return <span>Error: Could not find action</span>;
    }
    if (candidates.length > 1) {
      return <span>Error: Found more than 1 matching action. Weird.</span>;
    }

    const action = candidates[0];
    if (Array.isArray(action.data)) {
      return (
        <div>
          {(action.data as SingleAction[]).map((singleAction, index) =>
            this.getSingleActionPreview(action.name, index, singleAction)
          )}
        </div>
      );
    }
    if ('target' in action.data) {
      return (
        <div>
          {this.getSingleActionPreview(
            action.name,
            0,
            action.data as SingleAction
          )}
        </div>
      );
    }
    if ('parameters' in action) {
      return <span>Error: Parameterized actions not supported</span>;
    }
    return <span>Error: Unknown action type</span>;
  }

  // eslint-disable-next-line class-methods-use-this
  getSingleActionPreview(
    actionName: string,
    index: number,
    action: SingleAction
  ): JSX.Element {
    if (action.target === 'image') {
      return (
        <ImagePreview
          key={`action_${actionName}_${index}`}
          action={action}
          assetLookup={this.getAssetByName}
          entityToAsset={this.getAssetNameFromEntity}
        />
      );
    }
    if (action.target === 'audio') {
      return (
        <AudioPreview key={`action_${actionName}_${index}`} action={action} />
      );
    }
    if (action.target === 'video') {
      return (
        <VideoPreview
          key={`action_${actionName}_${index}`}
          action={action}
          assetLookup={this.getAssetByName}
          entityToAsset={this.getAssetNameFromEntity}
        />
      );
    }
    return (
      <span key={`action_${actionName}_${index}`}>
        Custom action ({action.target})
      </span>
    );
  }

  gotoNode(nodeName: string): void {
    const { onSelectNode } = this.props;
    getApi()
      .getNodes()
      .then((nodes) => {
        const candidates = nodes.filter((node) => node.name === nodeName);
        if (candidates.length > 0) {
          onSelectNode(candidates[0]);
          return true;
        }
        throw new Error('Could not find node');
      })
      .catch((error) => {
        console.log(`Failed to go to node ${nodeName}: ${error}`);
      });
  }

  // eslint-disable-next-line class-methods-use-this
  addAction(): void {
    const { node } = this.props;
    if (node === null) {
      return;
    }

    const api = getApi();
    api
      .createAction()
      .then((actionName) => {
        if (actionName !== '') {
          api.updateNode(node?.name, {
            ...node.data,
            actions: [...(node.data.actions || []), actionName],
          });
          this.selectAction(actionName);
          return true;
        }
        throw new Error('Unknown error');
      })
      .catch((error) => {
        console.log(`Error on creating action: ${error}`);
      });
  }

  // eslint-disable-next-line class-methods-use-this
  removeAction(actionName: string): void {
    const { selectedAction } = this.state;
    const { node } = this.props;
    if (node === null) {
      return;
    }

    getApi()
      .updateNode(node.name, {
        ...node.data,
        actions: (node.data.actions || []).filter((a) => a !== actionName),
      })
      .then(() => getApi().deleteAction(actionName))
      .then((name) => {
        if (name === '') {
          throw new Error('Unknown error');
        }
        if (actionName === selectedAction) {
          this.selectAction(null);
        }
        return true;
      })
      .catch((error) => {
        console.log(`Could not remove action: ${error}`);
      });
  }

  // eslint-disable-next-line class-methods-use-this
  playAction(action: string): void {
    console.log(`Play action ${action}`);
  }

  selectAction(action: string | null): void {
    const { selectedAction } = this.state;
    const { onSelectAction } = this.props;
    if (selectedAction !== action) {
      onSelectAction(action);
      this.setState({ selectedAction: action });
    }
  }

  render(): JSX.Element {
    const { selectedAction } = this.state;
    const { node } = this.props;
    if (node === null) {
      return (
        <div>
          <div className="CenteredInParent">
            Select a node to start the preview
          </div>
        </div>
      );
    }

    const listOfNextNodes = Array.isArray(node.data.next)
      ? node.data.next.map((next) => next.node)
      : [node.data.next];
    return (
      <div className="Preview">
        <div
          className={`PropertiesElement ${
            selectedAction === null ? 'Selected' : ''
          }`}
          role="presentation"
          onClick={(e) => {
            if (!e.defaultPrevented) this.selectAction(null);
          }}
        >
          <div className="PropertiesElementHeader">Node properties</div>
          <div className="PropertiesElementBody NodeProperties">
            <div className="NodePropertiesPrompt">{node.data.prompt}</div>
            <div>
              Next:{' '}
              {listOfNextNodes.map((nodeName) => (
                <button
                  key={`next_button_${nodeName}`}
                  className="NodePropertiesNextBtn"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    this.gotoNode(nodeName);
                  }}
                >
                  {nodeName}
                </button>
              ))}
            </div>
          </div>
        </div>
        {(node.data.actions || []).map((actionName) => (
          <div
            key={`preview_action_${actionName}`}
            className={`PropertiesElement ${
              selectedAction === actionName ? 'Selected' : ''
            }`}
            role="presentation"
            onClick={(e) => {
              if (!e.defaultPrevented) this.selectAction(actionName);
            }}
          >
            <div className="PropertiesElementHeader WithActions">
              <div>Action element</div>
              <div
                className="PlayActionButton"
                role="presentation"
                onClick={(e) => {
                  e.preventDefault();
                  this.playAction(actionName);
                }}
              >
                <FaPlay />
              </div>
              <div
                className="RemoveActionButton"
                role="presentation"
                onClick={(e) => {
                  e.preventDefault();
                  this.removeAction(actionName);
                }}
              >
                <FaTrashAlt />
              </div>
            </div>
            <div className="PropertiesElementBody">
              <div>{this.getActionPreview(actionName)}</div>
            </div>
          </div>
        ))}
        <div
          className="PropertiesElement NewItem"
          role="presentation"
          onClick={this.addAction.bind(this)}
        >
          <div className="PropertiesElementHeader">Action element</div>
          <div className="PropertiesElementBody">
            Click to add another action...
          </div>
        </div>
      </div>
    );
  }
}

export default Preview;
