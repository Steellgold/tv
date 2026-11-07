import { useWeather } from "../../../status/hooks/useWeather";
import { WeatherIcon } from "../../../status/WeatherIcon";
import type { HomeEnvironment } from "../../types";

import styles from "./HomeWeather.module.css";

export const HomeWeather = ({ env }: { env: HomeEnvironment }) => {
  const weather = useWeather(env.status.weather);
  return (
    <div class={styles.weather} data-home-weather hidden={!weather.visible}>
      <span class={styles.icon}>
        <WeatherIcon code={weather.code} />
      </span>
      <span class={styles.temperature}>{weather.text}</span>
      <span class={styles.city}>{weather.city}</span>
    </div>
  );
};
