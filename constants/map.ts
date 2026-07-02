import Mapbox from '@rnmapbox/maps';

export const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
export const MAPBOX_STYLE = process.env.EXPO_PUBLIC_MAPBOX_STYLE || 'mapbox://styles/mapbox/streets-v12';

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);
