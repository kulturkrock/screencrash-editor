import * as React from 'react';

import '../styles/NodeEditor.css';

import { FaPlus } from 'react-icons/fa';
import { ChangeType, getApi } from '../util/backend';

import { MultiJumpNode, OpusNode, OpusNodeData } from '../../main/model/node';
import Collapsible from './Collapsible';

interface IProps {
  node: OpusNode | null;
}

interface IState {
  next: string | MultiJumpNode[];
  prompt: string;
  pdfPage?: number;
  pdfLocationOnPage?: number;
  lineNumber?: number;
  hasChanges: boolean;

  availableNodes?: OpusNode[];
}

const getOptionalInt = (val: string): number | undefined => {
  return val === '' ? undefined : parseInt(val, 10);
};
const getOptionalFloat = (val: string): number | undefined => {
  return val === '' ? undefined : parseFloat(val);
};

class NodeEditor extends React.PureComponent<IProps, IState> {
  _unregisterNodeUpdates: (() => void) | undefined;

  constructor(props: IProps) {
    super(props);
    this.state = this.getLoadState();
    this.updateAvailableNodes = this.updateAvailableNodes.bind(this);
  }

  componentDidMount(): void {
    this.updateAvailableNodes();
    this._unregisterNodeUpdates = getApi().addChangeListener(
      ChangeType.Nodes,
      this.updateAvailableNodes
    );
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

  componentWillUnmount(): void {
    if (this._unregisterNodeUpdates) {
      this._unregisterNodeUpdates();
    }
  }

  // eslint-disable-next-line react/sort-comp, class-methods-use-this
  updateModel(prevProps: Readonly<IProps>, prevState: Readonly<IState>): void {
    if (prevProps.node) {
      const nodeData: OpusNodeData = {
        ...prevProps.node.data,
        next: prevState.next,
        prompt: prevState.prompt,
        pdfPage: prevState.pdfPage,
        pdfLocationOnPage: prevState.pdfLocationOnPage,
        lineNumber: prevState.lineNumber,
      };
      const api = getApi();
      api
        .updateNode(prevProps.node.name, nodeData)
        .then(async (usedName) => {
          if (usedName === '') {
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
        hasChanges: false,
      };
    }
    return {
      next: '',
      prompt: '',
      hasChanges: false,
    };
  }

  setNextNodeType(event: React.ChangeEvent<HTMLSelectElement>): void {
    const isSimple = event.target.value === 'simple';
    const { availableNodes } = this.state;
    const { node } = this.props;
    if (!node || !availableNodes || availableNodes.length === 0) {
      console.log(`Failed to set next node. Empty nodes list or error on node`);
      return;
    }

    if (isSimple) {
      this.setState({ next: availableNodes[0].name, hasChanges: true });
    } else {
      this.setState({ next: [], hasChanges: true });
    }
  }

  nextNodeFields(): JSX.Element {
    const { next, availableNodes } = this.state;
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
          onChange={(event) =>
            this.setState({ next: event.target.value, hasChanges: true })
          }
        >
          {(availableNodes || []).map((nodeEl) => (
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

  updateAvailableNodes(): void {
    const api = getApi();
    api
      .getNodes()
      .then((nodes) => this.setState({ availableNodes: nodes }))
      .catch((err) => `Failed to update available nodes: ${err}`);
  }

  render(): JSX.Element {
    const { node } = this.props;
    if (node === null) {
      return <div />;
    }

    const { prompt, lineNumber, pdfPage, pdfLocationOnPage, hasChanges } =
      this.state;

    return (
      <div className="NodeEditor">
        <div className="HeaderWithButtons">
          <h3>Properties</h3>
          <button
            type="button"
            className="Abort"
            disabled={!hasChanges}
            onClick={() => this.setState(this.getLoadState())}
          >
            Reset
          </button>
          <button
            type="button"
            className="Apply"
            disabled={!hasChanges}
            onClick={() => {
              this.updateModel(this.props, this.state);
              this.setState({ hasChanges: false });
            }}
          >
            Apply
          </button>
        </div>
        <div className="EditField">
          <div className="FieldDescription">Prompt text</div>
          <div className="FieldInput">
            <input
              type="text"
              placeholder="E.g. Oh noes Jane, how could you do this?"
              value={prompt}
              onChange={(event) =>
                this.setState({ prompt: event.target.value, hasChanges: true })
              }
            />
          </div>
        </div>
        <div className="EditField">
          <div className="FieldDescription">Next node</div>
          {this.nextNodeFields()}
        </div>

        <Collapsible header="Optional parameters" defaultOpen>
          <div className="EditField">
            <div className="FieldDescription">Line number</div>
            <div className="FieldInput">
              <input
                type="number"
                min={0}
                max={10000}
                step={1}
                size={5}
                value={lineNumber !== undefined ? lineNumber : ''}
                onChange={(event) =>
                  this.setState({
                    lineNumber: getOptionalInt(event.target.value),
                    hasChanges: true,
                  })
                }
              />
            </div>
          </div>
          <div className="EditField">
            <div className="FieldDescription">PDF page</div>
            <div className="FieldInput">
              <input
                type="number"
                min={0}
                max={100}
                size={5}
                value={pdfPage !== undefined ? pdfPage : ''}
                onChange={(event) =>
                  this.setState({
                    pdfPage: getOptionalInt(event.target.value),
                    hasChanges: true,
                  })
                }
              />
            </div>
          </div>
          <div className="EditField">
            <div
              className="FieldDescription"
              title="If looking at the center of the text, how far down on the page (given as a number between 0 and 1) are we?"
            >
              PDF page location, value between 0.0 and 1.0
            </div>
            <div className="FieldInput">
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
                    hasChanges: true,
                  })
                }
              />
            </div>
          </div>
        </Collapsible>
      </div>
    );
  }
}

export default NodeEditor;
