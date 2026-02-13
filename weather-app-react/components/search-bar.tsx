import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Search } from "lucide-react-native";

import { useCitySearch } from "@/hooks/use-city-search";
import { SearchDropdown } from "@/components/search-dropdown";
import type { City } from "@/types/weather";

type Props = {
  /** Texte saisi dans le champ de recherche. */
  query: string;
  /** Callback quand le texte change. */
  onChangeQuery: (text: string) => void;
  /** Callback quand l'utilisateur sélectionne une ville dans la dropdown. */
  onSelectCity: (city: City) => void;
  /** Placeholder affiché dans le champ (défaut : "Rechercher une ville"). */
  placeholder?: string;
};

/**
 * Barre de recherche réutilisable avec dropdown de résultats intégrée.
 *
 * Encapsule le hook `useCitySearch` et le composant `SearchDropdown`
 * pour offrir une expérience de recherche unifiée sur tous les écrans.
 *
 * Le composant gère en interne :
 * - l'appel à l'API de géocodage via `useCitySearch`
 * - l'affichage/masquage de la dropdown de résultats
 * - l'overlay pour fermer la dropdown au tap extérieur
 *
 * Le parent garde le contrôle sur :
 * - le texte saisi (`query` / `onChangeQuery`)
 * - la navigation après sélection d'une ville (`onSelectCity`)
 */
export function SearchBar({
  query,
  onChangeQuery,
  onSelectCity,
  placeholder = "Rechercher une ville",
}: Props) {
  const { cities, showResults, setShowResults, searchCities } = useCitySearch();

  /** Lance la recherche à partir du texte saisi. */
  const handleSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    searchCities(trimmed, true);
  };

  /** Sélectionne une ville et ferme la dropdown. */
  const handleSelect = (city: City) => {
    setShowResults(false);
    onSelectCity(city);
  };

  return (
    <>
      {/* Overlay invisible pour fermer la dropdown au tap extérieur */}
      {showResults && (
        <Pressable
          style={[StyleSheet.absoluteFill, { zIndex: 40 }]}
          onPress={() => setShowResults(false)}
        />
      )}

      <View style={showResults ? { zIndex: 50 } : undefined}>
        {/* Pill de recherche pleine largeur */}
        <View style={styles.pill}>
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={(text) => {
              onChangeQuery(text);
              setShowResults(false);
            }}
            placeholder={placeholder}
            placeholderTextColor="rgba(255,255,255,0.6)"
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          <Pressable hitSlop={10} onPress={handleSearch}>
            <Search color="white" size={20} />
          </Pressable>
        </View>

        {/* Dropdown de résultats, dans le flux sous la pill */}
        {showResults && (
          <SearchDropdown cities={cities} onSelect={handleSelect} />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.30)",
  },
  input: {
    flex: 1,
    color: "white",
    fontSize: 15,
  },
});
