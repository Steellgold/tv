import type { LucideIcon } from "lucide-preact";

import { Icon } from "../../../shared/icons/Icon/Icon";
import type { HomeEnvironment } from "../../types";
import { HomeControl } from "../HomeControl/HomeControl";

import styles from "./ShortcutTile.module.css";

export const ShortcutTile = ({
  env,
  controlKey,
  label,
  icon,
}: {
  env: HomeEnvironment;
  controlKey: string;
  label: string;
  icon: LucideIcon;
}) => (
  <HomeControl env={env} controlKey={controlKey} className={styles.tile} title={label}>
    <Icon icon={icon} />
    <span class={styles.label}>{label}</span>
  </HomeControl>
);
