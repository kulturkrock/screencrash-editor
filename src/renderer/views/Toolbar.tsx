import React from 'react';

import '../styles/Preview.css';
import {
  FaFolderOpen,
  FaSave,
  FaKeyboard,
  FaFilePdf,
  FaCog,
} from 'react-icons/fa';
import { getApi } from '../util/backend';
import { IEmpty } from '../util/types';

const ToolbarSeparator = (): JSX.Element => {
  return <div className="ToolbarSeparator" />;
};

interface IState {
  opusLoaded: boolean;
}

const open = (): void => {
  getApi().openOpus();
};

const save = (): void => {
  getApi()
    .saveOpus()
    .then((success) => {
      if (!success)
        getApi().showErrorMessage(
          'Failed to save',
          'Got an error while trying to save. Please try again'
        );
      return true;
    })
    .catch((err) => {
      console.log(`Failed to save: ${err}`);
    });
};

const unusedMenu = (name: string) => {
  getApi().showInfoMessage(
    'Menu not implemented',
    `${name[0].toUpperCase()}${name.substring(1)} menu will be added shortly`
  );
};

class Toolbar extends React.PureComponent<IEmpty, IState> {
  constructor(props: IEmpty) {
    super(props);
    this.state = { opusLoaded: false };
  }

  componentDidMount(): void {
    getApi().addLoadListener((loaded) => this.setState({ opusLoaded: loaded }));
  }

  render(): JSX.Element {
    const { opusLoaded } = this.state;
    return (
      <div className="MainToolbar">
        <button type="button" className="ToolbarButton" onClick={open}>
          <FaFolderOpen />
          <div>Open</div>
        </button>
        <button
          type="button"
          className="ToolbarButton"
          onClick={save}
          disabled={!opusLoaded}
        >
          <FaSave />
          <div>Save</div>
        </button>
        <ToolbarSeparator />
        <button
          type="button"
          className="ToolbarButton"
          onClick={() => unusedMenu('shortcuts')}
          disabled={!opusLoaded}
        >
          <FaKeyboard />
          <div>Shortcuts</div>
        </button>
        <button
          type="button"
          className="ToolbarButton"
          onClick={() => unusedMenu('script')}
          disabled={!opusLoaded}
        >
          <FaFilePdf />
          <div>Script</div>
        </button>
        <button
          type="button"
          className="ToolbarButton"
          onClick={() => unusedMenu('settings')}
          disabled={!opusLoaded}
        >
          <FaCog />
          <div>Settings</div>
        </button>
      </div>
    );
  }
}

export default Toolbar;
