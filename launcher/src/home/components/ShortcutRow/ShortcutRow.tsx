import { HdmiPort, Usb } from "lucide-preact";

import { useStore } from "../../../shared/hooks/useStore";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { isHdmi, resolveShortcutApp, SHORTCUTS } from "../../presentation/shortcuts";
import type { HomeEnvironment } from "../../types";
import { ShortcutTile } from "../ShortcutTile/ShortcutTile";

import styles from "./ShortcutRow.module.css";

export const ShortcutRow = ({ env }: { env: HomeEnvironment }) => {
  const { apps, inputs } = useStore(env.inventory);
  const drives = useStore(env.usb);
  const { t } = useTranslation();
  return (
    <div class={styles.row} data-shortcut-row role="group">
      {SHORTCUTS.map((shortcut) => (
        <ShortcutTile
          key={shortcut.key}
          env={env}
          controlKey={"shortcut:" + shortcut.key}
          label={shortcut.fallback.name}
          icon={shortcut.icon}
          image={shortcut.image}
          app={resolveShortcutApp(shortcut, apps)}
        />
      ))}
      {inputs.filter(isHdmi).map((source) => (
        <ShortcutTile
          key={env.runtime.inputs.portName(source)}
          env={env}
          controlKey={"input:" + source.type + ":" + source.number}
          label={env.runtime.inputs.label(source)}
          icon={HdmiPort}
        />
      ))}
      {drives.map((drive) => (
        <ShortcutTile
          key={"usb:" + drive.id}
          env={env}
          controlKey={"usb:" + drive.id}
          label={drive.label || t("home.usb")}
          icon={Usb}
        />
      ))}
    </div>
  );
};
