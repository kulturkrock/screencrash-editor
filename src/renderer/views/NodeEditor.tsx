import * as React from 'react';

import '../styles/NodeEditor.css';

import { getApi } from '../util/backend';

import {
  InlineAction,
  MultiJumpNode,
  OpusNode,
  OpusNodeData,
} from '../../main/model/node';

interface IProps {
  nodes: OpusNode[];
  node: OpusNode | null;
}

interface IState {
  next: string | MultiJumpNode[];
  prompt: string;
  pdfPage?: number;
  pdfLocationOnPage?: number;
  lineNumber?: number;
  actions: InlineAction[];
}

const getOptionalInt = (val: string): number | undefined => {
  return val === '' ? undefined : parseInt(val, 10);
};
const getOptionalFloat = (val: string): number | undefined => {
  return val === '' ? undefined : parseFloat(val);
};

class NodeEditor extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = this.getLoadState();
  }

  componentDidUpdate(
    prevProps: Readonly<IProps>,
    prevState: Readonly<IState>
  ): void {
    const { node } = this.props;
    if (prevProps.node?.name !== node?.name) {
      this.updateModel(prevProps, prevState);
      this.setState(this.getLoadState());
    }
  }

  // eslint-disable-next-line react/sort-comp, class-methods-use-this
  updateModel(prevProps: Readonly<IProps>, prevState: Readonly<IState>): void {
    if (prevProps.node !== null) {
      const nodeData: OpusNodeData = {
        ...prevProps.node.data,
        next: prevState.next,
        prompt: prevState.prompt,
        pdfPage: prevState.pdfPage,
        pdfLocationOnPage: prevState.pdfLocationOnPage,
        lineNumber: prevState.lineNumber,
        actions: prevState.actions,
      };
      const api = getApi();
      api
        .updateNode(prevProps.node.name, nodeData)
        .then(async (success) => {
          if (!success) {
            api.showErrorMessage(
              'Failed to update',
              'Failed to save your changes to the node. Please try again'
            );
          }
          return true;
        })
        .catch((reason) => {
          console.log(`Failed to notify user about error due to ${reason}`);
        });
    }
  }

  getLoadState(): IState {
    const { node } = this.props;
    if (node) {
      return {
        next: node.data.next,
        prompt: node.data.prompt,
        pdfPage: node.data.pdfPage,
        pdfLocationOnPage: node.data.pdfLocationOnPage,
        lineNumber: node.data.lineNumber,
        actions: node.data.actions || [],
      };
    }
    return { next: '', prompt: '', actions: [] };
  }

  setNextNodeType(event: React.ChangeEvent<HTMLSelectElement>): void {
    const isSimple = event.target.value === 'simple';
    const { node, nodes } = this.props;
    if (!node || nodes.length === 0) {
      console.log(`Failed to set next node. Empty nodes list or error on node`);
      return;
    }

    if (isSimple) {
      this.setState({ next: nodes[0].name });
    } else {
      this.setState({ next: [] });
    }
  }

  nextNodeFields(): JSX.Element {
    const { nodes } = this.props;
    const { next } = this.state;
    const isSimpleNext = typeof next === 'string';
    const elements: JSX.Element[] = [];
    elements.push(
      <select
        key="select-next-type"
        value={isSimpleNext ? 'simple' : 'conditional'}
        onChange={this.setNextNodeType.bind(this)}
      >
        <option value="simple">Single jump</option>
        <option value="conditional">Conditional jump</option>
      </select>
    );

    if (isSimpleNext) {
      elements.push(
        <select
          key="select-next-node"
          value={next}
          onChange={(event) => this.setState({ next: event.target.value })}
        >
          {nodes.map((nodeEl) => (
            <option key={`node_${nodeEl.name}`} value={nodeEl.name}>
              {nodeEl.data.prompt}
            </option>
          ))}
        </select>
      );
    } else {
      elements.push(
        <div key="select-next-info">Conditionals not supported yet</div>
      );
    }

    return <div>{elements}</div>;
  }

  render(): JSX.Element {
    const { node } = this.props;
    if (node === null) {
      return <div />;
    }

    const { prompt, lineNumber, pdfPage, pdfLocationOnPage, actions } =
      this.state;

    return (
      <div className="NodeEditor">
        <h3>Edit node</h3>
        <div className="EditField">
          <div className="FieldDescription">Prompt text</div>
          <input
            type="text"
            placeholder="E.g. Oh noes Jane, how could you do this?"
            size={70}
            value={prompt}
            onChange={(event) => this.setState({ prompt: event.target.value })}
          />
        </div>
        <div className="EditField">
          <div className="FieldDescription">Line number (optional)</div>
          <input
            type="number"
            min={0}
            max={10000}
            step={1}
            size={5}
            value={lineNumber !== undefined ? lineNumber : ''}
            onChange={(event) =>
              this.setState({ lineNumber: getOptionalInt(event.target.value) })
            }
          />
        </div>
        <div className="EditField">
          <div className="FieldDescription">PDF page (optional)</div>
          <input
            type="number"
            min={0}
            max={100}
            size={5}
            value={pdfPage !== undefined ? pdfPage : ''}
            onChange={(event) =>
              this.setState({ pdfPage: getOptionalInt(event.target.value) })
            }
          />
        </div>
        <div className="EditField">
          <div
            className="FieldDescription"
            title="If looking at the center of the text, how far down on the page (given as a number between 0 and 1) are we?"
          >
            PDF page location, 0-1 (optional)
          </div>
          <input
            type="number"
            min={0}
            max={1}
            step={0.1}
            size={5}
            value={pdfLocationOnPage !== undefined ? pdfLocationOnPage : ''}
            onChange={(event) =>
              this.setState({
                pdfLocationOnPage: getOptionalFloat(event.target.value),
              })
            }
          />
        </div>
        <div className="EditField">
          <div className="FieldDescription">Next node</div>
          {this.nextNodeFields()}
        </div>
        <div className="EditField">
          <div className="FieldDescription">Actions</div>
          {actions.length} actions
        </div>
      </div>
    );
  }
}

export default NodeEditor;
