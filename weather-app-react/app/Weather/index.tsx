import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Star } from "lucide-react-native";

import { useFavorites } from "@/hooks/use-favorites";
import { fetchForecast } from "@/services/weather-api";
import { SearchBar } from "@/components/search-bar";
import type { CityParams, City, FavoriteCity, ForecastResponse } from "@/types/weather";
import {
  formatDateFR,
  iconFromWeatherCode,
  roundTemp,
  weatherLabelFromCode,
} from "@/utils/weather";

export default function WeatherScreen() {
  const router = useRouter();
  const { id, name, admin1, country, lat, lon } =
    useLocalSearchParams<CityParams>();

  /* ── Coordonnées parsées ── */
  const latitude = useMemo(() => {
    const n = Number(lat);
    return Number.isFinite(n) ? n : null;
  }, [lat]);

  const longitude = useMemo(() => {
    const n = Number(lon);
    return Number.isFinite(n) ? n : null;
  }, [lon]);

  /* ── État local ── */
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  /* ── Hooks partagés ── */
  const { loadFavorites, toggleFavorite, isFavorite } = useFavorites();

  const cityId = id ? Number(id) : null;

  /* ── Chargement des prévisions via le service centralisé ── */
  useEffect(() => {
    if (latitude == null || longitude == null) {
      setError("Latitude/longitude manquantes");
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchForecast(latitude, longitude, controller.signal)
      .then(setForecast)
      .catch((e: any) => {
        if (e?.name === "AbortError") return;
        console.error(e);
        setForecast(null);
        setError(e?.message ?? "Erreur inconnue");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [latitude, longitude]);

  // Charge les favoris pour afficher l'état de l'étoile
  useEffect(() => {
    loadFavorites();
  }, [id, loadFavorites]);

  /* ── Données dérivées ── */
  const currentTemp = forecast?.current?.temperature_2m;
  const currentCode = forecast?.current?.weather_code;
  const titleCity = name ? String(name) : "Ville";
  const mainIcon = iconFromWeatherCode(currentCode);
  const mainLabel = weatherLabelFromCode(currentCode);

  /** Sous-titre : région + pays. */
  const subtitle = [admin1, country].filter(Boolean).join(", ");

  /** Tableau des jours de prévision. */
  const days = useMemo(() => {
    const d = forecast?.daily;
    const times = d?.time ?? [];
    const codes = d?.weather_code ?? [];
    const tmax = d?.temperature_2m_max ?? [];
    const tmin = d?.temperature_2m_min ?? [];

    return times.map((t, idx) => ({
      date: t,
      code: codes[idx],
      tmax: tmax[idx],
      tmin: tmin[idx],
    }));
  }, [forecast?.daily]);

  /** Bascule le favori pour la ville affichée. */
  const handleToggleFavorite = async () => {
    if (cityId == null || latitude == null || longitude == null) return;

    const city: FavoriteCity = {
      id: cityId,
      name: String(name ?? "Ville"),
      admin1: admin1 ? String(admin1) : undefined,
      country: country ? String(country) : undefined,
      latitude,
      longitude,
    };

    await toggleFavorite(city);
  };

  /** Navigue vers une nouvelle ville depuis la dropdown. */
  const handleSelectCity = (c: City) => {
    setQuery(c.name);
    // Replace pour éviter d'empiler les écrans Weather
    router.replace({
      pathname: "/Weather",
      params: {
        id: String(c.id),
        name: c.name,
        admin1: c.admin1,
        country: c.country,
        lat: String(c.latitude),
        lon: String(c.longitude),
      },
    });
  };

  return (
    <View style={styles.screen}>
      {/* ── En-tête ── */}
      <View style={styles.header}>
        {/* Ligne 1 : nom de la ville + étoile favori */}
        <View style={styles.cityRow}>
          <View style={styles.cityBlock}>
            <Text style={styles.cityText} numberOfLines={1}>
              {titleCity}
            </Text>
            {!!subtitle && (
              <Text style={styles.citySub} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>

          <Pressable
            hitSlop={10}
            onPress={handleToggleFavorite}
            style={styles.favoriteBtn}
          >
            <Star
              color="#f8f000"
              size={22}
              fill={
                cityId != null && isFavorite(cityId) ? "#f8f000" : "transparent"
              }
            />
          </Pressable>
        </View>

        {/* Ligne 2 : barre de recherche partagée (pleine largeur) */}
        <SearchBar
          query={query}
          onChangeQuery={setQuery}
          onSelectCity={handleSelectCity}
        />
      </View>

      {/* ── Météo actuelle ── */}
      <View style={styles.centerCard}>
        <Image source={mainIcon} style={styles.mainIcon} resizeMode="contain" />
        <Text style={styles.tempText}>
          {loading ? "--" : `${roundTemp(currentTemp)}°C`}
        </Text>
        <Text style={styles.conditionText}>
          {error ? `Erreur: ${error}` : loading ? "Chargement…" : mainLabel}
        </Text>
      </View>

      {/* ── Prévisions ── */}
      <View style={styles.tableCard}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colDate]}>Date</Text>
          <Text style={[styles.tableHeaderText, styles.colTemp]}>Temp.</Text>
          <Text style={[styles.tableHeaderText, styles.colIcon]}>Météo</Text>
        </View>

        <ScrollView
          style={styles.tableScroll}
          contentContainerStyle={styles.tableScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {days.map((d) => (
            <View key={d.date} style={styles.row}>
              <Text style={[styles.rowText, styles.colDate]}>
                {formatDateFR(d.date)}
              </Text>
              <Text style={[styles.rowText, styles.colTemp]}>
                {`${roundTemp(d.tmax)}° / ${roundTemp(d.tmin)}°`}
              </Text>
              <View style={[styles.colIcon, styles.iconCell]}>
                <Image
                  source={iconFromWeatherCode(d.code)}
                  style={styles.rowIcon}
                  resizeMode="contain"
                />
              </View>
            </View>
          ))}

          {!loading && !error && days.length === 0 && (
            <Text style={styles.emptyText}>Aucune prévision disponible</Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 14,
    backgroundColor: "#1aa7ff",
  },

  /* ── En-tête ── */
  header: {
    marginTop: 14,
    gap: 12,
  },
  cityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cityBlock: {
    flex: 1,
    minWidth: 0,
  },
  cityText: {
    color: "white",
    fontSize: 36,
    fontWeight: "400",
    letterSpacing: 0.2,
  },
  citySub: {
    color: "rgba(255,255,255,0.80)",
    fontSize: 15,
    marginTop: 2,
  },
  favoriteBtn: {
    padding: 4,
  },

  /* ── Météo actuelle ── */
  centerCard: {
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  mainIcon: {
    width: 56,
    height: 56,
    marginBottom: 6,
    opacity: 0.95,
  },
  tempText: {
    color: "white",
    fontSize: 72,
    fontWeight: "200",
    lineHeight: 80,
  },
  conditionText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 20,
    marginTop: 2,
  },

  /* ── Tableau de prévisions ── */
  tableCard: {
    marginTop: 20,
    flex: 1,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    marginBottom: 8,
  },
  tableHeaderText: {
    color: "rgba(255,255,255,0.90)",
    fontSize: 16,
    fontWeight: "600",
  },
  tableScroll: {
    flex: 1,
    minHeight: 1,
  },
  tableScrollContent: {
    paddingHorizontal: 6,
    paddingBottom: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
  },
  rowText: {
    color: "white",
    fontSize: 22,
    fontWeight: "300",
  },
  colDate: {
    width: 70,
  },
  colTemp: {
    flex: 1,
    textAlign: "center",
  },
  colIcon: {
    width: 60,
    alignItems: "flex-end",
  },
  iconCell: {
    justifyContent: "center",
  },
  rowIcon: {
    width: 32,
    height: 32,
  },
  emptyText: {
    color: "rgba(255,255,255,0.9)",
    marginTop: 10,
  },
});
