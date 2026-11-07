import { useStore } from "../../../shared/hooks/useStore";
import { useClock } from "../../../status/hooks/useClock";
import type { HomeEnvironment } from "../../types";

import styles from "./HomeClock.module.css";

const pad = (value: number) => String(value).padStart(2, "0");

export const HomeClock = ({ env }: { env: HomeEnvironment }) => {
  const settings = useStore(env.settings);
  const { timestamp } = useClock(env.status.time, env.runtime.clock, settings);
  const now = new Date(timestamp);
  const time = pad(now.getHours()) + ":" + pad(now.getMinutes());
  const date = now.toLocaleDateString(document.documentElement.lang || undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return (
    <div class={styles.block} data-home-clock>
      <time class={styles.clock} aria-label={time}>
        {time}
      </time>
      <div class={styles.date}>{date}</div>
    </div>
  );
};
