import type { WeatherLocation } from "../../contracts/preferences";

// Weather town used until a location is chosen in Settings (Kingersheim, 68260).
export const DEFAULT_WEATHER_LOCATION: WeatherLocation = {
  name: "Kingersheim",
  latitude: 47.79,
  longitude: 7.31,
  country_code: "FR",
};
