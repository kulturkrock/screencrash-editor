import * as React from 'react';

// import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import '../styles/Main.css';
import { IEmpty } from '../util/types';
import { getApi } from '../util/backend';
import { OpusNode } from '../../main/model/node';

import Nodes from './Nodes';
import Preview from './Preview';
import AttributeEditor from './AttributeEditor';

interface IState {
  isLoaded: boolean;
  currentNode: OpusNode | null;
  selectedAction: string | null;
}

class Main extends React.PureComponent<IEmpty, IState> {
  _unregisterLoadListener: (() => void) | undefined;

  constructor(props: IEmpty) {
    super(props);
    this.state = { isLoaded: false, currentNode: null, selectedAction: null };
  }

  componentDidMount(): void {
    this._unregisterLoadListener = getApi().addLoadListener(
      (loaded: boolean) => {
        this.setState({ isLoaded: loaded, currentNode: null });
      }
    );
  }

  componentWillUnmount(): void {
    if (this._unregisterLoadListener) {
      this._unregisterLoadListener();
    }
  }

  render(): JSX.Element {
    const { isLoaded, currentNode, selectedAction } = this.state;
    if (!isLoaded) {
      return <div className="MainNoOpus">Load or create an opus to start</div>;
    }

    return (
      <div className="Main">
        <Nodes onSelect={(node) => this.setState({ currentNode: node })} />
        <Preview
          node={currentNode}
          onSelectAction={(action) => this.setState({ selectedAction: action })}
          onSelectNode={(node) => this.setState({ currentNode: node })}
        />
        <AttributeEditor node={currentNode} action={selectedAction} />
      </div>
    );
  }
}

export default Main;
