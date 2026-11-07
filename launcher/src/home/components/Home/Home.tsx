import { Moon, Settings, Sun, SunMoon } from "lucide-preact";
import { useLayoutEffect } from "preact/hooks";

import { useStore } from "../../../shared/hooks/useStore";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { Icon } from "../../../shared/icons/Icon/Icon";
import type { HomeEnvironment, ThemeMode } from "../../types";
import { HomeClock } from "../HomeClock/HomeClock";
import { HomeControl } from "../HomeControl/HomeControl";
import { HomeWeather } from "../HomeWeather/HomeWeather";
import { ShortcutRow } from "../ShortcutRow/ShortcutRow";

import styles from "./Home.module.css";

const THEME_ICONS = { auto: SunMoon, dark: Moon, light: Sun } as const;
const THEME_TITLES = { auto: "home.theme.auto", dark: "home.theme.dark", light: "home.theme.light" } as const;
// Automatic mode follows the time of day: light from 07:00 to 19:59.
const resolveTheme = (theme: ThemeMode, timestamp: number) => {
  if (theme !== "auto") {
    return theme;
  }
  const hour = new Date(timestamp).getHours();
  return hour >= 7 && hour < 20 ? "light" : "dark";
};

export const Home = ({ env }: { env: HomeEnvironment }) => {
  const { t } = useTranslation();
  const { apps, inputs, ready } = useStore(env.inventory);
  const { active, theme } = useStore(env.state);
  const timestamp = useStore(env.status.time);
  const resolved = resolveTheme(theme, timestamp);
  useLayoutEffect(() => {
    env.bridge.focus();
  }, [env, apps, inputs, ready]);
  return (
    <div class={styles.home} data-home data-home-content data-theme={resolved} aria-hidden={!active}>
      <div class={styles.corner}>
        <HomeControl env={env} controlKey="theme" id="theme" className={styles.button} title={t(THEME_TITLES[theme])}>
          <Icon icon={THEME_ICONS[theme]} />
        </HomeControl>
        <HomeControl env={env} controlKey="gear" id="gear" className={styles.button} title={t("common.settings")}>
          <Icon icon={Settings} />
        </HomeControl>
      </div>
      <div>
        <HomeClock env={env} />
        <HomeWeather env={env} />
      </div>
      <ShortcutRow env={env} />
    </div>
  );
};
