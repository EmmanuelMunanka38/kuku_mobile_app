export const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
export const MAPBOX_STYLE = process.env.EXPO_PUBLIC_MAPBOX_STYLE || 'mapbox://styles/mapbox/streets-v12';

const styleName = MAPBOX_STYLE.replace('mapbox://styles/', '');
export const MAPBOX_TILE_URL = `https://api.mapbox.com/styles/v1/${styleName}/tiles/256/{z}/{x}/{y}@2x?access_token=${MAPBOX_ACCESS_TOKEN}`;
