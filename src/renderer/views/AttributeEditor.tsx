import React from 'react';
import { IEmpty } from '../util/types';
import { OpusNode } from '../../main/model/node';
import NodeEditor from './NodeEditor';
import ActionEditor from './ActionEditor';

interface IProps {
  node: OpusNode | null;
  action: string | null;
}

class AttributeEditor extends React.PureComponent<IProps, IEmpty> {
  render(): JSX.Element {
    const { node, action } = this.props;
    if (node === null) {
      return (
        <div style={{ borderLeft: '1px solid', padding: '1em' }}>
          Select a node to start editing
        </div>
      );
    }

    return (
      <div className="AttributeEditor">
        {action !== null ? (
          <ActionEditor actionName={action} />
        ) : (
          <NodeEditor node={node} />
        )}
      </div>
    );
  }
}

export default AttributeEditor;
