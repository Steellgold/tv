import { Settings } from "lucide-preact";
import { useLayoutEffect } from "preact/hooks";

import { useStore } from "../../../shared/hooks/useStore";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { Icon } from "../../../shared/icons/Icon/Icon";
import type { HomeEnvironment } from "../../types";
import { HomeClock } from "../HomeClock/HomeClock";
import { HomeControl } from "../HomeControl/HomeControl";
import { ShortcutRow } from "../ShortcutRow/ShortcutRow";

import styles from "./Home.module.css";

export const Home = ({ env }: { env: HomeEnvironment }) => {
  const { t } = useTranslation();
  const { apps, inputs, ready } = useStore(env.inventory);
  const { active } = useStore(env.state);
  useLayoutEffect(() => {
    env.bridge.focus();
  }, [env, apps, inputs, ready]);
  return (
    <div class={styles.home} data-home data-home-content aria-hidden={!active}>
      <HomeControl env={env} controlKey="gear" id="gear" className={styles.gear} title={t("common.settings")}>
        <Icon icon={Settings} />
      </HomeControl>
      <HomeClock env={env} />
      <ShortcutRow env={env} />
    </div>
  );
};
