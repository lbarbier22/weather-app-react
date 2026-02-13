import { useRef, useState } from "react";
import type { City, CitiesResponse } from "@/types/weather";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function useCitySearch() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  /**
   * Lance une recherche de villes par nom.
   * @param name        – Texte saisi par l'utilisateur.
   * @param openDropdown – Affiche la dropdown de résultats (défaut : true).
   */
  const searchCities = async (name: string, openDropdown = true) => {
    const url = `${GEOCODING_URL}?name=${encodeURIComponent(name)}&count=8&language=fr&format=json`;

    // Annule toute requête en cours pour éviter les doublons
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    if (openDropdown) setShowResults(true);
    setError(null);

    try {
      let response = await fetch(url, { signal: controller.signal });

      // Retry unique en cas de timeout 504
      if (!response.ok && response.status === 504) {
        await sleep(400);
        response = await fetch(url, { signal: controller.signal });
      }

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const json = (await response.json()) as CitiesResponse;
      setCities(json.results ?? []);
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      console.error(e);
      setCities([]);
      setShowResults(false);
      setError(e?.message ?? "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return {
    cities,
    loading,
    error,
    showResults,
    setShowResults,
    searchCities,
  };
}
