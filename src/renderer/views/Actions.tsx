import * as React from 'react';

import '../styles/Actions.css';
import { IEmpty } from '../util/types';
import { ChangeType, getApi } from '../util/backend';
import { Action } from '../../main/model/action';
import ActionEditor from './ActionEditor';

interface IState {
  selectedActionIndex: number;
  actions: Action[];
}

class Actions extends React.PureComponent<IEmpty, IState> {
  _unregisterUpdates: (() => void) | undefined;

  constructor(props: IEmpty) {
    super(props);
    this.state = { actions: [], selectedActionIndex: -1 };
    this.updateActions = this.updateActions.bind(this);
  }

  componentDidMount(): void {
    this.updateActions();
    this._unregisterUpdates = getApi().addChangeListener(
      ChangeType.Actions,
      this.updateActions
    );
  }

  componentWillUnmount(): void {
    if (this._unregisterUpdates) {
      this._unregisterUpdates();
    }
  }

  updateActions(): void {
    getApi()
      .getActions()
      .then((actions: Action[]) => {
        this.setState({ actions });
        return true;
      })
      .catch((err) => {
        console.log(`Failed to load actions: ${err}`);
      });
  }

  toggleSelect(index: number): void {
    const { selectedActionIndex } = this.state;
    const newSelection = selectedActionIndex === index ? -1 : index;
    this.setState({ selectedActionIndex: newSelection });
  }

  render(): JSX.Element {
    const { actions, selectedActionIndex } = this.state;
    const actionElements = actions.map((action, index) => {
      return (
        <div
          key={action.name}
          role="presentation"
          className={`Action ${index % 2 ? 'odd' : 'even'} ${
            index === selectedActionIndex ? 'selected' : ''
          }`}
          onClick={this.toggleSelect.bind(this, index)}
        >
          {action.name}
        </div>
      );
    });

    return (
      <div className="Actions">
        <div
          className={`ActionList ${
            selectedActionIndex >= 0 ? 'ActiveSelection' : ''
          }`}
        >
          {actionElements}
        </div>
        <div className="ActionsEditor">
          {selectedActionIndex >= 0 && selectedActionIndex < actions.length ? (
            <ActionEditor actionName={actions[selectedActionIndex].name} />
          ) : (
            <div />
          )}
        </div>
      </div>
    );
  }
}

export default Actions;
