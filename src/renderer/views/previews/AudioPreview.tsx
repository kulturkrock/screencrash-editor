import * as React from 'react';

import '../../styles/Preview.css';
import { IEmpty } from '../../util/types';
import { SingleAction } from '../../../main/model/action';
import { Asset } from '../../../main/model/asset';

interface IProps {
  action: SingleAction;
  assetLookup: (name: string) => Asset | null;
  entityToAsset: (entityId: string) => string | null;
}

class AudioPreview extends React.PureComponent<IProps, IEmpty> {
  getEntityId(): string {
    const { action } = this.props;
    return action.params && 'entityId' in action.params
      ? (action.params.entityId as string)
      : '<not_found>';
  }

  // eslint-disable-next-line class-methods-use-this
  getMediaContent(asset: Asset): JSX.Element {
    // eslint-disable-next-line jsx-a11y/media-has-caption
    return <audio src={`screencrash:///${asset.data.path}`} controls />;
  }

  render(): JSX.Element {
    const { action, assetLookup, entityToAsset } = this.props;
    if (action.cmd === 'destroy') {
      const assetName = entityToAsset(this.getEntityId());
      const removedAsset = assetName ? assetLookup(assetName) : null;
      return (
        <div className="PreviewWrapper">
          Removing audio with entity ID&nbsp;
          <span className="HighlightedName">{this.getEntityId()}</span>
          <span className="FlexFiller">&nbsp;</span>
          <span className="SmallPreviewElement">
            {removedAsset ? this.getMediaContent(removedAsset) : '(No preview)'}
          </span>
        </div>
      );
    }

    if (!action.assets || action.assets.length === 0) {
      return <span>Audio without any asset</span>;
    }

    const asset = assetLookup(action.assets[0]);
    if (asset === null) {
      return <span>Audio with a broken asset. Opus is misconfigured</span>;
    }

    if (action.cmd === 'create') {
      return (
        <div>
          {this.getMediaContent(asset)}
          <div className="CreateAudioText">
            Creating audio with entityId{' '}
            <span className="HighlightedName">{this.getEntityId()}</span>
          </div>
        </div>
      );
    }

    return <div>{this.getMediaContent(asset)}</div>;
  }
}

export default AudioPreview;
