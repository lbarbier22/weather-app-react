import {Search, Star} from 'lucide-react-native';
import {Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from "react-native";
import {useEffect, useState} from "react";
import { useRouter } from "expo-router";

type City = {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    admin1: string;
};

type CitiesResponse = {
    results?: City[];
};

export default function HomeScreen() {
    const router = useRouter();

    const [cities, setCities] = useState<City[]>([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showResults, setShowResults] = useState(false);
    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const [searchBarY, setSearchBarY] = useState(0);
    const [searchBarH, setSearchBarH] = useState(0);

    const getCities = async (name: string, openDropdown = true) => {
        const url =
            "https://geocoding-api.open-meteo.com/v1/search?name=" +
            encodeURIComponent(name) +
            "&count=8&language=fr&format=json";

        setLoading(true);
        if (openDropdown) setShowResults(true);
        setError(null);

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const json = (await response.json()) as CitiesResponse;
            setCities(json.results ?? []);
        } catch (e: any) {
            console.error(e);
            setCities([]);
            setShowResults(false);
            setError(e?.message ?? "Erreur inconnue");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getCities("Abidjan", false);
    }, []);

    useEffect(() => {
        if (cities.length > 0 && !selectedCity) {
            setSelectedCity(cities[0]);
        }
    }, [cities]);

    return (
      <View style={{flex: 1, flexDirection: "column", padding: 16, position: "relative"}}>
          {showResults && (
              <Pressable
                  style={[StyleSheet.absoluteFill, {zIndex: 40}]}
                  onPress={() => setShowResults(false)}
              />
          )}
          <Text style={{
              flexDirection: "row",
              alignSelf: "center",
              fontSize: 48,
              fontWeight: "700",
              color: "white"
          }}>Météo</Text>
          <View
              onLayout={(e) => {
                  setSearchBarY(e.nativeEvent.layout.y);
                  setSearchBarH(e.nativeEvent.layout.height);
              }}
              style={{
                  borderWidth: 1,
                  borderColor: "white",
                  marginTop: 12,
                  borderRadius: 8,
                  padding: 12,
                  justifyContent: "space-between",
                  flexDirection: "row",
                  zIndex: 60,
              }}
          >
              <TextInput
                  style={{width: "80%", color: "white"}}
                  value={query}
                  onChangeText={(text) => {
                      setQuery(text);
                      setShowResults(false);
                  }}
                  placeholder="Rechercher une ville"
                  placeholderTextColor="#cbd5e1"
                  autoCorrect={false}
                  autoCapitalize="none"
              />
              <Pressable
                  onPress={() => {
                      const trimmed = query.trim();
                      if (trimmed.length === 0) return;
                      getCities(trimmed, true);
                  }}
                  hitSlop={10}
              >
                  <Search color={"white"} />
              </Pressable>
          </View>
          {showResults && cities.length > 0 && (
              <View
                  style={{
                      position: "absolute",
                      top: searchBarY + searchBarH + 8,
                      left: 0,
                      right: 0,
                      backgroundColor: "#0f1a33",
                      borderWidth: 1,
                      borderColor: "#2b3e6a",
                      borderRadius: 8,
                      zIndex: 70,
                      overflow: "hidden",
                      maxHeight: 320,
                  }}
              >
                  <ScrollView keyboardShouldPersistTaps="handled">
                      {cities.map((c) => (
                          <Pressable
                              key={c.id}
                              onPress={() => {
                                  setSelectedCity(c);
                                  setShowResults(false);

                                  router.push({
                                      pathname: "/weather",
                                      params: {
                                          id: String(c.id),
                                          name: c.name,
                                          admin1: c.admin1,
                                          lat: String(c.latitude),
                                          lon: String(c.longitude),
                                      },
                                  });
                              }}
                              style={{
                                  paddingVertical: 10,
                                  paddingHorizontal: 12,
                                  borderBottomWidth: 1,
                                  borderBottomColor: "#24345d",
                              }}
                          >
                              <Text style={{color: "white", fontSize: 16, fontWeight: "700"}}>
                                  {c.name} — {c.admin1}
                              </Text>
                              <Text style={{color: "#cbd5e1"}}>
                                  {c.latitude}, {c.longitude}
                              </Text>
                          </Pressable>
                      ))}
                  </ScrollView>
              </View>
          )}
          <View>
              <Text style={{
                  color: "white"
              }}>{loading
                  ? "Chargement..."
                  : error
                      ? `Erreur: ${error}`
                      : selectedCity
                          ? `${selectedCity.name} — ${selectedCity.admin1} (${selectedCity.latitude}/${selectedCity.longitude})`
                          : "Aucune ville sélectionnée"}</Text>
          </View>
          <View style={{marginTop: 12, flexDirection: "row", alignItems: "center", gap: 4}}>
              <Star color={'#f8f000'} fill={'#f8f000'}/>
              <Text style={{color: "white", fontSize: 28}}>Favoris</Text>
          </View>
          <View style={{flexWrap: "wrap", flexDirection: "row", marginTop: 12, gap: 10}}>
              <View style={{
                  width: "98%",
                  padding: 15,
                  height: 100,
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#1b2c52",
                  borderRadius: 8
              }}>
                  <Image source={require("./../../assets/meteo/snow.png")}
                         style={{width: 50, height: 50, marginRight: 12}} resizeMode="contain"/>
                  <View style={{flex: 1, justifyContent: "center"}}>
                      <Text style={{color: "white", fontSize: 20}}>-18°C</Text>
                      <Text style={{color: "white", fontSize: 24, fontWeight: "700"}}>Montréal</Text>
                  </View>
              </View>
              <View style={{
                  width: "98%",
                  padding: 15,
                  height: 100,
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#1b2c52",
                  borderRadius: 8
              }}>
                  <Image source={require("./../../assets/meteo/sun.png")}
                         style={{width: 50, height: 50, marginRight: 12}} resizeMode="contain"/>
                  <View style={{flex: 1, justifyContent: "center"}}>
                      <Text style={{color: "white", fontSize: 20}}>22°C</Text>
                      <Text style={{color: "white", fontSize: 24, fontWeight: "700"}}>Abidjan</Text>
                  </View>
              </View>
          </View>
      </View>
    );
}
