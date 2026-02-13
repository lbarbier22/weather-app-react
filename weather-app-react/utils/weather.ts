/**
 * Fonctions utilitaires liées à la météo.
 *
 * - Conversion des codes météo WMO en labels français et icônes.
 * - Formatage de températures et de dates.
 */

import type { ImageSourcePropType } from "react-native";

const ICON_SUN = require("../assets/meteo/sun.png");
const ICON_CLOUDS = require("../assets/meteo/clouds.png");
const ICON_RAIN = require("../assets/meteo/rain.png");
const ICON_SNOW = require("../assets/meteo/snow.png");
const ICON_STORM = require("../assets/meteo/storm.png");

/**
 * Renvoie l'icône correspondant à un code météo WMO.
 * @see https://open-meteo.com/en/docs#weathervariables
 */
export function iconFromWeatherCode(code: number | undefined): ImageSourcePropType {
  if (typeof code !== "number") return ICON_SUN;

  if (code <= 2) return ICON_SUN;
  if (code === 3) return ICON_CLOUDS;
  if (code === 45 || code === 48) return ICON_CLOUDS;
  if ((code >= 51 && code <= 57) || (code >= 61 && code <= 67) || (code >= 80 && code <= 82))
    return ICON_RAIN;
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return ICON_SNOW;
  if (code >= 95) return ICON_STORM;

  return ICON_SUN;
}

/**
 * Renvoie un libellé en français pour un code météo WMO.
 */
export function weatherLabelFromCode(code: number | undefined): string {
  if (typeof code !== "number") return "Météo inconnue";
  if (code === 0) return "Ciel dégagé";
  if (code === 1) return "Plutôt dégagé";
  if (code === 2) return "Partiellement nuageux";
  if (code === 3) return "Couvert";
  if (code === 45 || code === 48) return "Brouillard";
  if (code >= 51 && code <= 57) return "Bruine";
  if (code >= 61 && code <= 67) return "Pluie";
  if (code >= 71 && code <= 77) return "Neige";
  if (code >= 80 && code <= 82) return "Averses";
  if (code >= 85 && code <= 86) return "Averses de neige";
  if (code >= 95) return "Orage";
  return "Conditions variables";
}

/** Arrondit une température et renvoie "--" si la valeur est absente. */
export function roundTemp(v: number | undefined): string {
  if (typeof v !== "number" || Number.isNaN(v)) return "--";
  return String(Math.round(v));
}

/** Formate une date ISO (YYYY-MM-DD) en DD/MM. */
export function formatDateFR(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!m || !d) return iso;
  return `${d}/${m}`;
}
