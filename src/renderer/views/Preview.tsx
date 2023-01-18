import React from 'react';
import { IEmpty } from '../util/types';
import { OpusNode } from '../../main/model/node';

interface IProps {
  node: OpusNode | null;
}

class Preview extends React.PureComponent<IProps, IEmpty> {
  render(): JSX.Element {
    const { node } = this.props;
    return <div>Preview {node ? 'Node is set' : 'No node'}</div>;
  }
}

export default Preview;
