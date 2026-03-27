/**
 * Parse iTunes Store RSS JSON (e.g. topalbums) into album-shaped objects
 * compatible with the rest of the app.
 */
function pickArtwork100(imImages) {
  if (!Array.isArray(imImages) || imImages.length === 0) {
    return '';
  }
  const url = imImages[imImages.length - 1]?.label || '';
  if (!url) {
    return '';
  }
  const sized = url.replace(/\/\d+x\d+bb\.(jpg|png)$/i, '/100x100bb.$1');
  return sized || url;
}

function parseEntry(entry) {
  const collectionId = Number(entry?.id?.attributes?.['im:id']);
  if (!Number.isFinite(collectionId)) {
    return null;
  }

  const collectionName = entry?.['im:name']?.label?.trim() || 'Album';
  const artistName = entry?.['im:artist']?.label?.trim() || 'Unknown artist';
  const artworkUrl100 = pickArtwork100(entry?.['im:image']);
  const primaryGenreName =
    entry?.category?.attributes?.label || entry?.['im:category']?.attributes?.label || '';
  const releaseDate = entry?.['im:releaseDate']?.label || '';

  return {
    collectionId,
    collectionName,
    artistName,
    artworkUrl100,
    primaryGenreName,
    releaseDate,
  };
}

export function parseItunesAlbumsRss(json) {
  const raw = json?.feed?.entry;
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map(parseEntry).filter(Boolean);
}

/** Chart order = RSS order. Fresh = sorted by release date (newest first), deduped. */
export function splitTrendingAndFresh(albums, { freshCount = 12 } = {}) {
  const trending = albums.slice(0, 12);
  const seen = new Set(trending.map((a) => a.collectionId));

  const byDate = [...albums]
    .filter((a) => a.releaseDate)
    .sort((a, b) => {
      const ta = new Date(a.releaseDate).getTime();
      const tb = new Date(b.releaseDate).getTime();
      return tb - ta;
    });

  const fresh = [];
  for (const a of byDate) {
    if (fresh.length >= freshCount) {
      break;
    }
    if (seen.has(a.collectionId)) {
      continue;
    }
    seen.add(a.collectionId);
    fresh.push(a);
  }

  return { trending, fresh };
}
