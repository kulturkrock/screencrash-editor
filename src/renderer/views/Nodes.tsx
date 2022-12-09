import * as React from 'react';

import '../styles/Nodes.css';
import { IEmpty } from '../util/types';
import { getApi } from '../util/backend';

interface IState {
  nodes: unknown[];
}

class Nodes extends React.PureComponent<IEmpty, IState> {
  constructor(props: IEmpty) {
    super(props);
    this.state = { nodes: [] };
  }

  componentDidMount(): void {
    getApi()
      .getNodes()
      .then((nodes: unknown[]) => {
        this.setState({ nodes });
        return true;
      })
      .catch((err) => {
        console.log(`Failed to load nodes: ${err}`);
      });
  }

  componentWillUnmount(): void {}

  render(): JSX.Element {
    const { nodes } = this.state;
    return <div className="Nodes">{nodes.length} nodes</div>;
  }
}

export default Nodes;
