import React from 'react';
import { IEmpty } from '../util/types';
import { OpusNode } from '../../main/model/node';

interface IProps {
  node: OpusNode | null;
}

class Preview extends React.PureComponent<IProps, IEmpty> {
  render(): JSX.Element {
    const { node } = this.props;
    if (node === null) {
      return (
        <div>
          <div className="CenteredInParent">
            Select a node to start the preview
          </div>
        </div>
      );
    }
    return (
      <div>
        <div className="CenteredInParent">Preview will be here when done</div>
      </div>
    );
  }
}

export default Preview;
