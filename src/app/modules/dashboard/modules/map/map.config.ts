/**
 * Mapbox Configuration
 * Constantes y configuración para Mapbox GL
 * 
 * Token: Debe estar en environment.ts
 * Style: Streets, Satellite, Dark, Light, Outdoors
 */

export const MAPBOX_CONFIG = {
  // Obtener token de environment.ts
  // Token será inyectado desde HttpClient + interceptor

  DEFAULT_STYLE: 'mapbox://styles/mapbox/streets-v12',

  // Estilos disponibles
  STYLES: {
    streets: 'mapbox://styles/mapbox/streets-v12',
    satellite: 'mapbox://styles/mapbox/satellite-v9',
    dark: 'mapbox://styles/mapbox/dark-v11',
    light: 'mapbox://styles/mapbox/light-v11',
    outdoors: 'mapbox://styles/mapbox/outdoors-v12',
  },

  // Centro y zoom por defecto (CDMX)
  DEFAULT_CENTER: [-99.1332, 19.4326],
  DEFAULT_ZOOM: 12,

  // Limites de zoom
  MIN_ZOOM: 1,
  MAX_ZOOM: 20,

  // Configuración de animación
  ANIMATION: {
    DURATION: 1000, // ms
    FLY_TO_DURATION: 1500, // ms
  },

  // Configuración de marcadores
  MARKER: {
    ICON_SIZE: 32,
    ICON_ANCHOR: [16, 16],
  },

  // Colores por estado
  COLOR_BY_STATUS: {
    MOVING: '#10b981',
    OFFLINE: '#6b7280',
    IDLE: '#f59e0b',
  },
} as const;

// Alias de constantes comunes para compatibilidad
export const MAP_CONFIG = MAPBOX_CONFIG;
export const DEFAULT_CENTER = MAPBOX_CONFIG.DEFAULT_CENTER;
export const DEFAULT_ZOOM = MAPBOX_CONFIG.DEFAULT_ZOOM;
export const STYLE_URL = MAPBOX_CONFIG.DEFAULT_STYLE;
