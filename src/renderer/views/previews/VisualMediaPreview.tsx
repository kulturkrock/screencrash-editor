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

class VisualMediaPreview extends React.PureComponent<IProps, IEmpty> {
  // eslint-disable-next-line class-methods-use-this
  getMediaType(): string {
    return 'Visual media';
  }

  getMediaContent(asset: Asset): JSX.Element {
    return (
      <span>
        {this.getMediaType()} with asset path {asset.data.path}
      </span>
    );
  }

  getEntityId(): string {
    const { action } = this.props;
    return action.params && 'entityId' in action.params
      ? (action.params.entityId as string)
      : '<not_found>';
  }

  render(): JSX.Element {
    const { action, assetLookup, entityToAsset } = this.props;
    if (action.cmd === 'destroy') {
      const assetName = entityToAsset(this.getEntityId());
      const removedAsset = assetName ? assetLookup(assetName) : null;
      return (
        <div className="PreviewWrapper">
          Removing {this.getMediaType().toLowerCase()} with entity ID&nbsp;
          <span className="HighlightedName">{this.getEntityId()}</span>
          <span className="FlexFiller">&nbsp;</span>
          <span className="SmallPreviewElement">
            {removedAsset ? this.getMediaContent(removedAsset) : '(No preview)'}
          </span>
        </div>
      );
    }

    if (action.cmd === 'fade') {
      const duration =
        action.params && 'time' in action.params
          ? (action.params.time as number)
          : 0;
      return (
        <span>
          Fading out {this.getMediaType().toLowerCase()} with entity ID{' '}
          <span className="HighlightedName">{this.getEntityId()}</span>,
          duration is{' '}
          <span className="HighlightedName">{duration} seconds</span>
        </span>
      );
    }

    if (!action.assets || action.assets.length === 0) {
      return <span>{this.getMediaType()} without any asset</span>;
    }

    const asset = assetLookup(action.assets[0]);
    if (asset === null) {
      return (
        <span>
          {this.getMediaType()} with a broken asset. Opus is misconfigured
        </span>
      );
    }

    return <div>{this.getMediaContent(asset)}</div>;
  }
}

export { VisualMediaPreview, IProps };
