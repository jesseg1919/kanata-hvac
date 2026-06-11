// Kanata HVAC — returns live Google reviews via the Google Places API (New).
// Requires Vercel env var GOOGLE_PLACES_API_KEY. Optional: GOOGLE_PLACE_ID (recommended),
// else falls back to a Text Search using GOOGLE_PLACES_QUERY (default below).
module.exports = async function handler(req, res) {
  // Cache at the edge so we hit Google's API at most a few times an hour (keeps cost ~free).
  res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400');

  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) {
    return res.status(200).json({ ok: true, configured: false, reviews: [] });
  }

  try {
    let placeId = process.env.GOOGLE_PLACE_ID;

    if (!placeId) {
      const query = process.env.GOOGLE_PLACES_QUERY || 'Kanata HVAC, Hamilton, ON';
      const sr = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': key,
          'X-Goog-FieldMask': 'places.id,places.displayName'
        },
        body: JSON.stringify({ textQuery: query })
      });
      const sj = await sr.json();
      placeId = sj && sj.places && sj.places[0] && sj.places[0].id;
      if (!placeId) {
        return res.status(200).json({ ok: false, configured: true, error: 'place_not_found', reviews: [] });
      }
    }

    const dr = await fetch('https://places.googleapis.com/v1/places/' + encodeURIComponent(placeId), {
      headers: {
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'id,displayName,rating,userRatingCount,googleMapsUri,reviews'
      }
    });
    const dj = await dr.json();
    if (!dr.ok) {
      console.error('[reviews] details error', dr.status, JSON.stringify(dj).slice(0, 300));
      return res.status(200).json({ ok: false, configured: true, error: (dj.error && dj.error.message) || 'details_failed', reviews: [] });
    }

    const reviews = (dj.reviews || []).map(function (rv) {
      const text = (rv.text && rv.text.text) || (rv.originalText && rv.originalText.text) || '';
      const author = (rv.authorAttribution && rv.authorAttribution.displayName) || 'Google user';
      return {
        author: author,
        initial: ((author.trim()[0]) || 'G').toUpperCase(),
        rating: rv.rating || 5,
        text: text,
        when: rv.relativePublishTimeDescription || '',
        photo: (rv.authorAttribution && rv.authorAttribution.photoUri) || ''
      };
    });

    return res.status(200).json({
      ok: true,
      configured: true,
      rating: dj.rating || null,
      total: dj.userRatingCount || null,
      mapsUri: dj.googleMapsUri || '',
      reviews: reviews
    });
  } catch (e) {
    console.error('[reviews] exception', e);
    return res.status(200).json({ ok: false, configured: true, error: 'exception', reviews: [] });
  }
};
