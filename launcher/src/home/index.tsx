import { createRef, render } from "preact";
import { flushSync } from "preact/compat";

import type { SettingsStore } from "../contracts/preferences";
import type { StatusStores } from "../contracts/status";
import type { LauncherRuntime } from "../platform/tizen/launcherRuntime";
import type { Translations } from "../shared/i18n/createTranslations";
import { TranslationContext } from "../shared/i18n/useTranslation";

import { Home } from "./components/Home/Home";
import { createHomeController } from "./state/createHomeController";
import { createHomeInventory } from "./state/createHomeInventory";

export const mountHome = (
  runtime: LauncherRuntime,
  settings: SettingsStore,
  mount: HTMLElement,
  status: StatusStores,
  translations: Translations,
) => {
  const inventory = createHomeInventory(runtime, settings, flushSync);
  const environment = createHomeController(
    { runtime, settings, inventory, status, rows: createRef<HTMLElement>(), nodes: new Map() },
    flushSync,
  );
  const refresh = () => {
    inventory.refresh();
    environment.bridge.focus();
  };
  const bridge = { ...environment.bridge, render: refresh, buildRows: refresh, refreshApps: refresh };
  const dispose = () => {
    environment.bridge.blur();
    render(null, mount);
    inventory.dispose();
  };
  try {
    render(
      <TranslationContext.Provider value={translations}>
        <Home env={environment} />
      </TranslationContext.Provider>,
      mount,
    );
    return { bridge, dispose };
  } catch (error) {
    dispose();
    throw error;
  }
};
