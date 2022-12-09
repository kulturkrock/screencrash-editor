import * as React from 'react';

import '../styles/Actions.css';
import { IEmpty } from '../util/types';
import { getApi } from '../util/backend';

interface IState {
  actions: unknown[];
}

class Actions extends React.PureComponent<IEmpty, IState> {
  constructor(props: IEmpty) {
    super(props);
    this.state = { actions: [] };
  }

  componentDidMount(): void {
    getApi()
      .getActions()
      .then((actions: unknown[]) => {
        this.setState({ actions });
        return true;
      })
      .catch((err) => {
        console.log(`Failed to load actions: ${err}`);
      });
  }

  componentWillUnmount(): void {}

  render(): JSX.Element {
    const { actions } = this.state;
    return <div className="Actions">{actions.length} actions</div>;
  }
}

export default Actions;
