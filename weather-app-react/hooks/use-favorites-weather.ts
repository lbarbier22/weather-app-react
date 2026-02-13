/**
 * Hook qui charge la météo actuelle de chaque ville favorite.
 *
 * Lance toutes les requêtes en parallèle via `Promise.allSettled`
 * et expose un dictionnaire `weatherByCity` indexé par l'id de la ville.
 * Les résultats sont mis à jour à chaque changement de la liste de favoris.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { FavoriteCity } from "@/types/weather";
import { fetchCurrentWeather, type CurrentWeather } from "@/services/weather-api";

/** Dictionnaire : id de la ville → météo actuelle. */
export type WeatherMap = Record<number, CurrentWeather>;

export function useFavoritesWeather(favorites: FavoriteCity[]) {
  const [weatherMap, setWeatherMap] = useState<WeatherMap>({});
  const [loading, setLoading] = useState(false);

  // Permet d'annuler les requêtes si les favoris changent avant la fin
  const abortRef = useRef<AbortController | null>(null);

  /**
   * Charge la météo actuelle pour toutes les villes favorites en parallèle.
   * Seules les requêtes réussies alimentent le dictionnaire.
   */
  const loadWeather = useCallback(async (cities: FavoriteCity[]) => {
    if (cities.length === 0) {
      setWeatherMap({});
      return;
    }

    // Annule les requêtes précédentes encore en cours
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);

    try {
      const results = await Promise.allSettled(
        cities.map((city) =>
          fetchCurrentWeather(city.latitude, city.longitude, controller.signal).then(
            (weather) => ({ id: city.id, weather }),
          ),
        ),
      );

      // On ne met à jour que si le controller n'a pas été annulé entre-temps
      if (controller.signal.aborted) return;

      const map: WeatherMap = {};
      for (const result of results) {
        if (result.status === "fulfilled") {
          map[result.value.id] = result.value.weather;
        }
      }

      setWeatherMap(map);
    } catch {
      // Silencieux en cas d'abort global
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // Relance le chargement chaque fois que la liste de favoris change
  useEffect(() => {
    loadWeather(favorites);

    return () => {
      abortRef.current?.abort();
    };
  }, [favorites, loadWeather]);

  return { weatherMap, loading, refreshWeather: () => loadWeather(favorites) };
}
