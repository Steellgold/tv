import { useStore } from "../../../shared/hooks/useStore";
import { useClock } from "../../../status/hooks/useClock";
import type { HomeEnvironment } from "../../types";

import styles from "./HomeClock.module.css";

export const HomeClock = ({ env }: { env: HomeEnvironment }) => {
  const settings = useStore(env.settings);
  const clock = useClock(env.status.time, env.runtime.clock, settings);
  const now = new Date(clock.timestamp);
  const pad = (value: number) => String(value).padStart(2, "0");
  const text = pad(now.getHours()) + ":" + pad(now.getMinutes());
  return (
    <time class={styles.clock} data-home-clock aria-label={text}>
      {text}
    </time>
  );
};
