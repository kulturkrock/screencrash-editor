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
}

class Main extends React.PureComponent<IEmpty, IState> {
  _unregisterLoadListener: (() => void) | undefined;

  constructor(props: IEmpty) {
    super(props);
    this.state = { isLoaded: false, currentNode: null };
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
    const { isLoaded, currentNode } = this.state;
    if (!isLoaded) {
      return <div className="MainNoOpus">Load or create an opus to start</div>;
    }

    return (
      <div className="Main">
        <Nodes onSelect={(node) => this.setState({ currentNode: node })} />
        <Preview node={currentNode} />
        <AttributeEditor node={currentNode} />
      </div>
    );
  }
}

export default Main;
