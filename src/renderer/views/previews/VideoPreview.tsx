import * as React from 'react';

import '../../styles/Preview.css';
import { VisualMediaPreview } from './VisualMediaPreview';
import { Asset } from '../../../main/model/asset';

class VideoPreview extends VisualMediaPreview {
  // eslint-disable-next-line class-methods-use-this
  getMediaType(): string {
    return 'Video';
  }

  // eslint-disable-next-line class-methods-use-this
  getMediaContent(asset: Asset): JSX.Element {
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video className="PreviewElement" controls>
        <source src={`screencrash:///${asset.data.path}`} />
      </video>
    );
  }
}

export default VideoPreview;
