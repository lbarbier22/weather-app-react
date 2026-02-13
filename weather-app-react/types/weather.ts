/**
 * Types partagés pour l'application météo.
 *
 * Utilisés par les écrans Home et Weather ainsi que par les hooks
 * de recherche de villes et de gestion des favoris.
 */

/** Ville renvoyée par l'API de géocodage Open-Meteo. */
export type City = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
};

/** Réponse de l'API de géocodage Open-Meteo. */
export type CitiesResponse = {
  results?: City[];
};

/** Ville sauvegardée en favori (sous-ensemble de City). */
export type FavoriteCity = {
  id: number;
  name: string;
  admin1?: string;
  latitude: number;
  longitude: number;
};

/** Réponse de l'API de prévisions Open-Meteo. */
export type ForecastResponse = {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
  };
  daily?: {
    time?: string[];
    weather_code?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
  };
};

/** Paramètres de route pour l'écran Weather. */
export type CityParams = {
  id?: string;
  name?: string;
  admin1?: string;
  lat?: string;
  lon?: string;
};
