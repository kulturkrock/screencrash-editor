import React from 'react';
import { IEmpty } from '../util/types';
import { OpusNode } from '../../main/model/node';
import NodeEditor from './NodeEditor';

interface IProps {
  node: OpusNode | null;
}

class AttributeEditor extends React.PureComponent<IProps, IEmpty> {
  render(): JSX.Element {
    const { node } = this.props;
    if (node !== null) {
      return <NodeEditor node={node} />;
    }
    return (
      <div style={{ borderLeft: '1px solid', padding: '1em' }}>
        Select a node to start editing
      </div>
    );
  }
}

export default AttributeEditor;
