import * as React from 'react';

import '../styles/Assets.css';
import { IEmpty } from '../util/types';
import { getApi } from '../util/backend';

interface IState {
  assets: unknown[];
}

class Assets extends React.PureComponent<IEmpty, IState> {
  constructor(props: IEmpty) {
    super(props);
    this.state = { assets: [] };
  }

  componentDidMount(): void {
    getApi()
      .getAssets()
      .then((assets: unknown[]) => {
        this.setState({ assets });
        return true;
      })
      .catch((err) => {
        console.log(`Failed to load assets: ${err}`);
      });
  }

  componentWillUnmount(): void {}

  render(): JSX.Element {
    const { assets } = this.state;
    return <div className="Assets">{assets.length} assets</div>;
  }
}

export default Assets;
