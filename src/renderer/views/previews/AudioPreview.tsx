import * as React from 'react';

import '../../styles/Preview.css';
import { IEmpty } from '../../util/types';
import { SingleAction } from '../../../main/model/action';

interface IProps {
  action: SingleAction;
}

class AudioPreview extends React.PureComponent<IProps, IEmpty> {
  render(): JSX.Element {
    return <span>Audio</span>;
  }
}

export default AudioPreview;
