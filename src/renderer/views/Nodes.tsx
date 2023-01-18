import * as React from 'react';

import '../styles/Nodes.css';

import { FaTrashAlt, FaGripVertical } from 'react-icons/fa';

import { ChangeType, getApi } from '../util/backend';
import { OpusNode } from '../../main/model/node';

interface IProps {
  onSelect: (node: OpusNode | null) => void;
}

interface IState {
  selectedNodeIndex: number;
  nodes: OpusNode[];
}

class Nodes extends React.PureComponent<IProps, IState> {
  _unregisterUpdates: (() => void) | undefined;
  _unregisterLoadListener: (() => void) | undefined;
  _elementAtEnd: HTMLElement | null = null;

  constructor(props: IProps) {
    super(props);
    this.state = { nodes: [], selectedNodeIndex: -1 };
    this.updateNodes = this.updateNodes.bind(this);
  }

  componentDidMount(): void {
    this.updateNodes();
    this._unregisterUpdates = getApi().addChangeListener(
      ChangeType.Nodes,
      this.updateNodes
    );
    this._unregisterLoadListener = getApi().addLoadListener(() =>
      this.setState({ selectedNodeIndex: -1 })
    );
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
    getApi()
      .getNodes()
      .then((nodes: OpusNode[]) => {
        this.setState({ nodes });
        return true;
      })
      .catch((err) => {
        console.log(`Failed to load nodes: ${err}`);
      });
  }

  addNode(): void {
    const api = getApi();
    api
      .createNode()
      .then(api.getNodes)
      .then((nodes: OpusNode[]) => {
        this.setState({ nodes, selectedNodeIndex: nodes.length - 1 });
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

  removeNode(name: string): void {
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
      .then((result) => {
        if (result === 0) {
          api.deleteNode(name);
          return true;
        }
        return false;
      })
      .catch((err) => {
        console.log(`Could not delete node: ${err}`);
      });
  }

  toggleSelect(index: number): void {
    const { onSelect } = this.props;
    const { nodes, selectedNodeIndex } = this.state;
    const newSelection = selectedNodeIndex === index ? -1 : index;
    onSelect(newSelection >= 0 ? nodes[newSelection] : null);
    this.setState({ selectedNodeIndex: newSelection });
  }

  render(): JSX.Element {
    const { nodes, selectedNodeIndex } = this.state;

    return (
      <div
        className={`NodesList ${
          selectedNodeIndex >= 0 ? 'ActiveSelection' : ''
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
              role="presentation"
              className={`NodesNode  ${index % 2 ? 'odd' : 'even'} ${
                index === selectedNodeIndex ? 'selected' : ''
              }`}
              onClick={this.toggleSelect.bind(this, index)}
            >
              <span className="NodeMoveHandle" role="presentation">
                <FaGripVertical />
              </span>
              <div>
                {node.data.lineNumber
                  ? `${node.data.lineNumber} ${node.data.prompt}`
                  : node.data.prompt}
              </div>
              <span
                className="NodeRemoveButton"
                role="presentation"
                onClick={(event) => {
                  event.stopPropagation();
                  this.removeNode(node.name);
                }}
              >
                <FaTrashAlt />
              </span>
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
