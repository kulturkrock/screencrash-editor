import React from 'react';

import '../styles/Preview.css';
import { FaTrashAlt, FaPlay } from 'react-icons/fa';

import { OpusNode } from '../../main/model/node';
import { getApi } from '../util/backend';

interface IProps {
  onSelectAction: (action: string | null) => void;
  onSelectNode: (node: OpusNode | null) => void;
  node: OpusNode | null;
}

interface IState {
  selectedAction: string | null;
}

class Preview extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = { selectedAction: null };
  }

  componentDidUpdate(prevProps: Readonly<IProps>): void {
    const { node } = this.props;
    if (prevProps.node?.name !== node?.name) {
      this.selectAction(null);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  getActionPreview(actionName: string): JSX.Element {
    return <span>Action med ID {actionName}</span>;
  }

  gotoNode(nodeName: string): void {
    /*
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
      */
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
