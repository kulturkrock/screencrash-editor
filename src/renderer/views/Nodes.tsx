import * as React from 'react';

import '../styles/Nodes.css';
import { IEmpty } from '../util/types';
import { ChangeType, getApi } from '../util/backend';

import { OpusNode } from '../../main/model/node';
import NodeEditor from './NodeEditor';

interface IState {
  selectedNodeIndex: number;
  nodes: OpusNode[];
}

class Nodes extends React.PureComponent<IEmpty, IState> {
  constructor(props: IEmpty) {
    super(props);
    this.state = { nodes: [], selectedNodeIndex: -1 };
    this.updateNodes = this.updateNodes.bind(this);
  }

  componentDidMount(): void {
    this.updateNodes();
    getApi().addChangeListener(ChangeType.Nodes, this.updateNodes);
  }

  componentWillUnmount(): void {}

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

  toggleSelect(index: number): void {
    const { selectedNodeIndex } = this.state;
    const newSelection = selectedNodeIndex === index ? -1 : index;
    this.setState({ selectedNodeIndex: newSelection });
  }

  render(): JSX.Element {
    const { nodes, selectedNodeIndex } = this.state;
    const nodeElements = nodes.map((node, index) => {
      return (
        <div
          key={node.name}
          role="presentation"
          className={`NodesNode  ${index % 2 ? 'odd' : 'even'} ${
            index === selectedNodeIndex ? 'selected' : ''
          }`}
          onClick={this.toggleSelect.bind(this, index)}
        >
          {node.data.lineNumber
            ? `${node.data.lineNumber} ${node.data.prompt}`
            : node.data.prompt}
        </div>
      );
    });

    return (
      <div className="Nodes">
        <div
          className={`NodesList ${
            selectedNodeIndex >= 0 ? 'ActiveSelection' : ''
          }`}
        >
          {nodeElements}
        </div>
        <div className="NodesEditor">
          <NodeEditor
            nodes={nodes}
            node={
              selectedNodeIndex >= 0 && selectedNodeIndex < nodes.length
                ? nodes[selectedNodeIndex]
                : null
            }
          />
        </div>
      </div>
    );
  }
}

export default Nodes;
