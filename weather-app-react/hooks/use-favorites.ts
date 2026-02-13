/**
 * Hook de gestion des villes favorites.
 *
 * Persiste la liste dans AsyncStorage sous la clé `@favorites:cities`.
 * Expose des méthodes pour charger, ajouter, supprimer et vérifier
 * si une ville est en favori.
 */

import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { FavoriteCity } from "@/types/weather";

const FAVORITES_KEY = "@favorites:cities";

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteCity[]>([]);

  /** Charge la liste des favoris depuis AsyncStorage. */
  const loadFavorites = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(FAVORITES_KEY);
      const parsed = raw ? (JSON.parse(raw) as FavoriteCity[]) : [];
      const list = Array.isArray(parsed) ? parsed : [];
      setFavorites(list);
      return list;
    } catch (e) {
      console.error(e);
      setFavorites([]);
      return [];
    }
  }, []);

  /** Persiste un nouveau tableau de favoris. */
  const saveFavorites = useCallback(async (next: FavoriteCity[]) => {
    setFavorites(next);
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    } catch (e) {
      console.error(e);
    }
  }, []);

  /** Supprime une ville de la liste des favoris par son id. */
  const removeFavorite = useCallback(
    async (cityId: number) => {
      const next = favorites.filter((f) => f.id !== cityId);
      await saveFavorites(next);
    },
    [favorites, saveFavorites],
  );

  /**
   * Ajoute ou retire une ville des favoris (toggle).
   * Renvoie le nouvel état isFavorite.
   */
  const toggleFavorite = useCallback(
    async (city: FavoriteCity): Promise<boolean> => {
      const current = await loadFavorites();
      const exists = current.some((f) => f.id === city.id);
      const next = exists
        ? current.filter((f) => f.id !== city.id)
        : [city, ...current];
      await saveFavorites(next);
      return !exists;
    },
    [loadFavorites, saveFavorites],
  );

  /** Vérifie si une ville (par id) est dans les favoris. */
  const isFavorite = useCallback(
    (cityId: number) => favorites.some((f) => f.id === cityId),
    [favorites],
  );

  return {
    favorites,
    loadFavorites,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
}
