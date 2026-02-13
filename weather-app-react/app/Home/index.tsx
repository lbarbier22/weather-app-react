import { useState, useCallback } from "react";
import { Star } from "lucide-react-native";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import { useFavorites } from "@/hooks/use-favorites";
import { useFavoritesWeather } from "@/hooks/use-favorites-weather";
import { SearchBar } from "@/components/search-bar";
import type { City } from "@/types/weather";
import { iconFromWeatherCode, roundTemp } from "@/utils/weather";

export default function HomeScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const { favorites, loadFavorites, removeFavorite } = useFavorites();

  // Charge la météo actuelle de chaque favori en parallèle
  const { weatherMap } = useFavoritesWeather(favorites);

  // Recharge les favoris à chaque focus de l'écran
  // (par ex. après un ajout depuis l'écran Weather)
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites]),
  );

  /** Navigue vers l'écran météo d'une ville. */
  const navigateToWeather = (city: City) => {
    router.push({
      pathname: "/Weather",
      params: {
        id: String(city.id),
        name: city.name,
        admin1: city.admin1,
        country: city.country,
        lat: String(city.latitude),
        lon: String(city.longitude),
      },
    });
  };

  return (
    <View style={styles.screen}>
      {/* ── En-tête : titre puis barre de recherche pleine largeur ── */}
      <View style={styles.headerBlock}>
        <Text style={styles.titleText}>Météo</Text>

        <SearchBar
          query={query}
          onChangeQuery={setQuery}
          onSelectCity={(city) => {
            setQuery(city.name);
            navigateToWeather(city);
          }}
        />
      </View>

      {/* ── Section favoris (scrollable) ── */}
      <View style={styles.sectionRow}>
        <Star color="#f8f000" fill="#f8f000" />
        <Text style={styles.sectionTitle}>Favoris</Text>
      </View>

      <ScrollView
        style={styles.favoritesScroll}
        contentContainerStyle={styles.favoritesContent}
        showsVerticalScrollIndicator={false}
      >
        {favorites.length === 0 ? (
          <Text style={styles.emptyFavText}>Aucun favori pour le moment</Text>
        ) : (
          favorites.map((f) => {
            const weather = weatherMap[f.id];
            const locationParts = [f.admin1, f.country].filter(Boolean).join(", ");

            return (
              <Pressable
                key={f.id}
                onPress={() =>
                  navigateToWeather({
                    ...f,
                    country: f.country ?? "",
                  } as City)
                }
                style={styles.card}
              >
                {/* Icône météo : vraie icône si chargée, spinner sinon */}
                {weather ? (
                  <Image
                    source={iconFromWeatherCode(weather.weatherCode)}
                    style={styles.cardIcon}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.cardIconPlaceholder}>
                    <ActivityIndicator color="white" size="small" />
                  </View>
                )}

                <View style={styles.cardTextWrap}>
                  <Text style={styles.cardCity} numberOfLines={1}>
                    {f.name}
                  </Text>
                  {!!locationParts && (
                    <Text style={styles.cardLocation} numberOfLines={1}>
                      {locationParts}
                    </Text>
                  )}
                  {weather && (
                    <Text style={styles.cardTemp}>
                      {roundTemp(weather.temperature)}°C
                    </Text>
                  )}
                </View>

                {/* Bouton pour retirer des favoris */}
                <Pressable
                  hitSlop={10}
                  onPress={(e: any) => {
                    e?.stopPropagation?.();
                    removeFavorite(f.id);
                  }}
                  style={styles.cardStarBtn}
                >
                  <Star color="#f8f000" fill="#f8f000" />
                </Pressable>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 18,
    backgroundColor: "#1aa7ff",
  },

  /* En-tête */
  headerBlock: {
    marginTop: 18,
    gap: 12,
  },
  titleText: {
    color: "white",
    fontSize: 54,
    fontWeight: "400",
    letterSpacing: 0.2,
  },

  /* Section favoris */
  sectionRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    color: "white",
    fontSize: 32,
    fontWeight: "300",
  },
  favoritesScroll: {
    flex: 1,
    marginTop: 12,
  },
  favoritesContent: {
    gap: 12,
    paddingBottom: 24,
  },
  emptyFavText: {
    color: "rgba(255,255,255,0.85)",
    marginTop: 6,
  },

  /* Carte favori */
  card: {
    width: "100%",
    padding: 16,
    minHeight: 90,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15,26,51,0.28)",
    borderRadius: 14,
  },
  cardIcon: {
    width: 48,
    height: 48,
    marginRight: 14,
    opacity: 0.95,
  },
  cardIconPlaceholder: {
    width: 48,
    height: 48,
    marginRight: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTextWrap: {
    flex: 1,
    justifyContent: "center",
  },
  cardCity: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
  },
  cardLocation: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 14,
    marginTop: 1,
  },
  cardTemp: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 18,
    fontWeight: "300",
    marginTop: 3,
  },
  cardStarBtn: {
    marginLeft: 12,
  },
});
