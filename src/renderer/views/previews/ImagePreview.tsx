import * as React from 'react';

import '../../styles/Preview.css';
import { VisualMediaPreview } from './VisualMediaPreview';
import { Asset } from '../../../main/model/asset';

class ImagePreview extends VisualMediaPreview {
  // eslint-disable-next-line class-methods-use-this
  getMediaType(): string {
    return 'Image';
  }

  // eslint-disable-next-line class-methods-use-this
  getMediaContent(asset: Asset): JSX.Element {
    const { action } = this.props;
    return (
      <img
        className="PreviewElement"
        alt={action.desc}
        src={`screencrash:///${asset.data.path}`}
      />
    );
  }
}

export default ImagePreview;
