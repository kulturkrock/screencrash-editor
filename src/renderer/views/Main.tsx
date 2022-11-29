import * as React from 'react';

import logo from '../../../assets/icon.png';
import '../styles/Main.css';
import { IEmpty } from '../util/types';
import { getApi } from '../util/backend';

interface IState {
  loadingText: string;
}

class Main extends React.PureComponent<IEmpty, IState> {
  timerId: number = 0;

  constructor(props: IEmpty) {
    super(props);
    this.state = { loadingText: 'Content coming soon' };
    this.updateLoadingText = this.updateLoadingText.bind(this);
  }

  componentDidMount(): void {
    this.updateLoadingText();
    this.timerId = window.setInterval(this.updateLoadingText, 5000);
  }

  componentWillUnmount(): void {
    clearInterval(this.timerId);
  }

  updateLoadingText(): void {
    getApi()
      .getLoadingText()
      .then((text: string): void => this.setState({ loadingText: text }))
      .catch(console.log);
  }

  render(): JSX.Element {
    const { loadingText } = this.state;
    return (
      <div className="Main">
        <header className="Main-header">
          <img src={logo} className="Main-logo" alt="logo" />
          {loadingText}
        </header>
      </div>
    );
  }
}

export default Main;
