import * as React from 'react';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import '../styles/Main.css';
import { IEmpty } from '../util/types';
import { getApi } from '../util/backend';
import Nodes from './Nodes';
import Actions from './Actions';
import Assets from './Assets';

interface IState {
  isLoaded: boolean;
}

class Main extends React.PureComponent<IEmpty, IState> {
  constructor(props: IEmpty) {
    super(props);
    this.state = { isLoaded: false };
  }

  componentDidMount(): void {
    getApi().addLoadListener((loaded: boolean) => {
      this.setState({ isLoaded: loaded });
    });
  }

  componentWillUnmount(): void {}

  render(): JSX.Element {
    const { isLoaded } = this.state;
    if (!isLoaded) {
      return <div className="MainNoOpus">Load or create an opus to start</div>;
    }

    return (
      <div className="Main">
        <div className="MainLeft">LEFT</div>
        <div className="MainMid">
          <Tabs
            selectedTabClassName="MainTab-Selected"
            selectedTabPanelClassName="MainTabPanel-Selected"
            focusTabOnClick={false}
          >
            <TabList className="MainTabList">
              <Tab className="MainTab">Nodes</Tab>
              <Tab className="MainTab">Actions</Tab>
              <Tab className="MainTab">Assets</Tab>
              <Tab className="MainTab">Live utility</Tab>
            </TabList>
            <TabPanel>
              <Nodes />
            </TabPanel>
            <TabPanel>
              <Actions />
            </TabPanel>
            <TabPanel>
              <Assets />
            </TabPanel>
            <TabPanel>
              <h2>Utilities here</h2>
            </TabPanel>
          </Tabs>
        </div>
      </div>
    );
  }
}

export default Main;
