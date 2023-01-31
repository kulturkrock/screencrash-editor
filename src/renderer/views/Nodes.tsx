import * as React from 'react';

import '../styles/Nodes.css';

import { FaTrashAlt, FaGripVertical } from 'react-icons/fa';

import { ChangeType, getApi } from '../util/backend';
import { OpusNode } from '../../main/model/node';

interface IProps {
  selectedNode: string;
  onSelect: (node: OpusNode | null) => void;
}

interface IState {
  nodes: OpusNode[];
  startNode: string;
  dragEnabled: boolean;
  currentDragItem: number;
  currentDropTarget: number;
}

class Nodes extends React.PureComponent<IProps, IState> {
  _unregisterUpdates: (() => void) | undefined;
  _unregisterLoadListener: (() => void) | undefined;
  _elementAtEnd: HTMLElement | null = null;

  constructor(props: IProps) {
    super(props);
    this.state = {
      nodes: [],
      startNode: '',
      currentDragItem: -1,
      currentDropTarget: -1,
      dragEnabled: false,
    };
    this.updateNodes = this.updateNodes.bind(this);
  }

  componentDidMount(): void {
    this.updateNodes();
    this._unregisterUpdates = getApi().addChangeListener(
      ChangeType.Nodes,
      this.updateNodes
    );
    this._unregisterLoadListener = getApi().addLoadListener(() => {
      const { onSelect } = this.props;
      onSelect(null);
    });
  }

  componentWillUnmount(): void {
    if (this._unregisterUpdates) {
      this._unregisterUpdates();
    }
    if (this._unregisterLoadListener) {
      this._unregisterLoadListener();
    }
  }

  updateNodes(): void {
    const { onSelect, selectedNode } = this.props;
    getApi()
      .getNodes()
      .then((nodes: OpusNode[]) => {
        const candidates = nodes.filter((node) => node.name === selectedNode);
        if (selectedNode !== '' && candidates.length > 0) {
          onSelect(candidates[0]);
        }
        this.setState({ nodes });
        return true;
      })
      .then(getApi().getStartNode)
      .then((startNode) => this.setState({ startNode }))
      .catch((err) => {
        console.log(`Failed to load nodes: ${err}`);
      });
  }

  addNode(): void {
    const { onSelect } = this.props;
    const api = getApi();
    api
      .createNode()
      .then(api.getNodes)
      .then((nodes: OpusNode[]) => {
        this.setState({ nodes });
        onSelect(nodes[nodes.length - 1]);
        return true;
      })
      .then(() => {
        // Ugly hack
        setTimeout(() => {
          if (this._elementAtEnd) {
            this._elementAtEnd.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
        return true;
      })
      .catch((err) => {
        console.log(`Error when creating a new node: ${err}`);
      });
  }

  removeNode(name: string, index: number): void {
    const { selectedNode } = this.props;
    const { nodes } = this.state;
    const nodeCandidates = nodes.filter((node) => node.name === name);
    if (nodeCandidates.length === 0) {
      console.log(
        `Could not find any nodes to delete with that name, aborting...`
      );
      return;
    }
    const node = nodeCandidates[0];
    const api = getApi();
    api
      .ask(
        'Continue?',
        `${node.data.prompt}\nDo you want to delete this node?`,
        ['Yes', 'No']
      )
      .then((result) => (result === 0 ? Promise.resolve() : Promise.reject()))
      .then(() => api.deleteNode(name))
      .then((result) => {
        if (result === '') {
          throw new Error('Unknown error when deleting node');
        }
        return true;
      })
      .then(api.getNodes)
      .then((updatedNodes) => {
        if (name === selectedNode)
          this.toggleSelect(
            updatedNodes[Math.min(index, updatedNodes.length - 1)].name,
            true
          );
        return true;
      })
      .catch((err) => {
        console.log(`Could not delete node: ${err}`);
        api.showErrorMessage(
          'Failed to remove',
          'Unable to remove item. Please try again'
        );
      });
  }

  endDragEvent(): void {
    const { nodes, currentDragItem, currentDropTarget } = this.state;
    const newNodes = [...nodes];
    const elementToMove = nodes[currentDragItem];
    newNodes.splice(currentDragItem, 1);
    newNodes.splice(currentDropTarget, 0, elementToMove);

    this.setState({
      currentDragItem: -1,
      currentDropTarget: -1,
      nodes: [...newNodes],
    });
  }

  toggleSelect(name: string, forceSelect = false): void {
    const { onSelect, selectedNode } = this.props;
    const { nodes } = this.state;
    const newSelection = selectedNode === name && !forceSelect ? '' : name;
    const nodeCandidates = nodes.filter((n) => n.name === newSelection);
    onSelect(nodeCandidates.length > 0 ? nodeCandidates[0] : null);
  }

  render(): JSX.Element {
    const { selectedNode } = this.props;
    const {
      nodes,
      startNode,
      dragEnabled,
      currentDropTarget,
      currentDragItem,
    } = this.state;

    return (
      <div
        className={`NodesList ${selectedNode !== '' ? 'ActiveSelection' : ''} ${
          dragEnabled ? 'Dragging' : ''
        }`}
      >
        <button
          className="NodeAddButton"
          type="button"
          onClick={this.addNode.bind(this)}
        >
          Add another one
        </button>

        {nodes.map((node, index) => {
          return (
            <div
              key={node.name}
              className={`NodesNode  ${index % 2 ? 'odd' : 'even'} ${
                node.name === selectedNode ? 'selected' : ''
              } ${
                index === currentDropTarget &&
                currentDropTarget < currentDragItem
                  ? 'DropTargetBefore'
                  : ''
              }
              ${
                index === currentDropTarget &&
                currentDropTarget > currentDragItem
                  ? 'DropTargetAfter'
                  : ''
              }`}
              onDragStart={() => {
                console.log('drag start');
                this.setState({ currentDragItem: index });
              }}
              onDragEnter={() => this.setState({ currentDropTarget: index })}
              onDragEnd={this.endDragEvent.bind(this)}
              draggable={dragEnabled}
            >
              <span
                className="NodeMoveHandle"
                role="presentation"
                onMouseDown={() => this.setState({ dragEnabled: true })}
                onMouseUp={() => this.setState({ dragEnabled: false })}
              >
                <FaGripVertical />
              </span>
              <div
                role="presentation"
                onMouseDown={() => this.setState({ dragEnabled: false })}
                onClick={this.toggleSelect.bind(this, node.name, false)}
              >
                {node.data.lineNumber
                  ? `${node.data.lineNumber} ${node.data.prompt}`
                  : node.data.prompt}
              </div>
              {node.name !== startNode ? (
                <span
                  className="NodeRemoveButton"
                  role="presentation"
                  onMouseDown={() => this.setState({ dragEnabled: false })}
                  onClick={(event) => {
                    event.stopPropagation();
                    this.removeNode(node.name, index);
                  }}
                >
                  <FaTrashAlt />
                </span>
              ) : (
                ''
              )}
            </div>
          );
        })}

        <button
          className="NodeAddButton"
          type="button"
          onClick={this.addNode.bind(this)}
          ref={(el) => {
            this._elementAtEnd = el;
          }}
        >
          Add another one
        </button>
      </div>
    );
  }
}

export default Nodes;
