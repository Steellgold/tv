import type { LucideIcon } from "lucide-preact";

import type { InstalledApp } from "../../../contracts/launcher";
import { useImageSequence } from "../../../shared/hooks/useImageSequence";
import { AppLogoIcon } from "../../../shared/icons/AppLogoIcon";
import { Icon } from "../../../shared/icons/Icon/Icon";
import type { HomeEnvironment } from "../../types";
import { HomeControl } from "../HomeControl/HomeControl";

import styles from "./ShortcutTile.module.css";

// Real app artwork when the TV or catalogue provides it; otherwise a generic icon.
export const ShortcutTile = ({
  env,
  controlKey,
  label,
  icon,
  app,
}: {
  env: HomeEnvironment;
  controlKey: string;
  label: string;
  icon: LucideIcon;
  app?: InstalledApp;
}) => {
  const brand = app ? env.runtime.tiles.describe(app) : null;
  const installed = useImageSequence(app?.icon ? [app.icon] : [], true);
  const logo = brand?.logoPath ? (
    <AppLogoIcon
      class={styles.logo}
      path={brand.logoPath}
      colour={/^#(f{3}|f{6})$/i.test(brand.logoColour) ? "var(--home-fg)" : brand.logoColour}
    />
  ) : null;
  const image =
    !logo && installed.src ? (
      <img
        key={installed.src}
        class={styles.logo}
        alt=""
        src={installed.src}
        onLoad={installed.onLoad}
        onError={installed.onError}
        hidden={!installed.loaded}
      />
    ) : null;
  const generic = !logo && !installed.loaded;
  return (
    <HomeControl env={env} controlKey={controlKey} className={styles.tile} title={label}>
      {logo}
      {image}
      {generic ? <Icon icon={icon} /> : null}
      <span class={styles.label}>{label}</span>
    </HomeControl>
  );
};
