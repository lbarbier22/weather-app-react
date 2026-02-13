import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { City } from "@/types/weather";

type Props = {
  /** Villes à afficher dans la dropdown. */
  cities: City[];
  /** Callback quand l'utilisateur sélectionne une ville. */
  onSelect: (city: City) => void;
};

export function SearchDropdown({ cities, onSelect }: Props) {
  if (cities.length === 0) return null;

  return (
    <View style={styles.dropdown}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {cities.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => onSelect(c)}
            style={styles.item}
          >
            <Text style={styles.title} numberOfLines={1}>
              {c.name}
              {c.admin1 ? ` - ${c.admin1}` : ""}
            </Text>
            <Text style={styles.meta} numberOfLines={1}>
              {c.country ?? ""}
              {c.country ? "  ·  " : ""}
              {c.latitude.toFixed(2)}, {c.longitude.toFixed(2)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    marginTop: 6,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    borderRadius: 14,
    overflow: "hidden",
    maxHeight: 300,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.15)",
  },
  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  meta: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    marginTop: 2,
  },
});
