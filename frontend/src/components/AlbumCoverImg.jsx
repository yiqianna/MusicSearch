import React, { useState } from 'react';

import { artworkFetchUrl } from '../utils/itunesApi';

/**
 * iTunes artwork often blocks hotlinking when a Referrer is sent; use no-referrer
 * and fall back to a text placeholder if the image fails.
 * In dev, src may be rewritten to /mzstatic… via Vite proxy.
 */
export default function AlbumCoverImg({
  src,
  alt,
  className = 'ex-album-art-img',
  placeholderClassName = 'ex-art-placeholder',
  placeholderMaxLen = 40,
  /** Album detail page uses .album-art + .album-art-inner for empty/failed art */
  variant = 'grid',
}) {
  const [failed, setFailed] = useState(false);
  const label = (alt || 'Album').slice(0, placeholderMaxLen);
  const resolvedSrc = src ? artworkFetchUrl(src) : '';

  if (failed || !resolvedSrc) {
    if (variant === 'detail') {
      return (
        <div className="album-art" aria-hidden>
          <div className="album-art-inner">{label}</div>
        </div>
      );
    }
    return (
      <div className={placeholderClassName}>
        {label}
      </div>
    );
  }
  return (
    <img
      className={className}
      src={resolvedSrc}
      alt={alt || 'Album cover'}
      referrerPolicy="no-referrer"
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
