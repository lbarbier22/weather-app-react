/**
 * Service d'accès aux API Open-Meteo.
 *
 * Centralise tous les appels réseau liés à la météo et au géocodage
 * pour éviter la duplication d'URL et de logique de parsing.
 */

import type { ForecastResponse } from "@/types/weather";

const FORECAST_BASE = "https://api.open-meteo.com/v1/forecast";

/** Résultat simplifié de la météo actuelle d'une ville. */
export type CurrentWeather = {
  temperature: number;
  weatherCode: number;
};

/**
 * Récupère les prévisions complètes (actuelle + 10 jours) pour des coordonnées.
 */
export async function fetchForecast(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<ForecastResponse> {
  const url =
    `${FORECAST_BASE}` +
    `?latitude=${encodeURIComponent(String(latitude))}` +
    `&longitude=${encodeURIComponent(String(longitude))}` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
    `&current=temperature_2m,weather_code`;

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as ForecastResponse;
}

/**
 * Récupère uniquement la météo actuelle (température + code) pour des coordonnées.
 * Appel plus léger que fetchForecast (pas de données daily).
 */
export async function fetchCurrentWeather(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<CurrentWeather> {
  const url =
    `${FORECAST_BASE}` +
    `?latitude=${encodeURIComponent(String(latitude))}` +
    `&longitude=${encodeURIComponent(String(longitude))}` +
    `&current=temperature_2m,weather_code`;

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const json = (await res.json()) as ForecastResponse;

  return {
    temperature: json.current?.temperature_2m ?? 0,
    weatherCode: json.current?.weather_code ?? 0,
  };
}
