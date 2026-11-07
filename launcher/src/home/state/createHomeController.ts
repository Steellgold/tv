import { focusControl } from "../../shared/navigation/focusControl";
import { createStore } from "../../shared/state/createStore";
import { isHdmi, resolveShortcutApp, resolveUsbApp, SHORTCUTS } from "../presentation/shortcuts";
import type { HomeEnvironment, HomeState, ThemeMode } from "../types";

const GEAR = "gear";
const THEME = "theme";
const THEME_STORAGE_KEY = "aerotizen.home.theme";
// One press cycles automatic, dark, light and back to automatic.
const NEXT_THEME: Record<ThemeMode, ThemeMode> = { auto: "dark", dark: "light", light: "auto" };

const readTheme = (): ThemeMode => {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved === "dark" || saved === "light" ? saved : "auto";
  } catch {
    return "auto";
  }
};
const saveTheme = (theme: ThemeMode) => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* the choice only lasts for this session */
  }
};

const USB_PREFIX = "usb:";
const sourceKey = (source: { type: string; number?: number }) => "input:" + source.type + ":" + source.number;

// Remote transactions publish state synchronously; Preact owns every rendered node.
// App and input commands stay in the existing runtime services.
export const createHomeController = (
  env: Omit<HomeEnvironment, "bridge" | "state" | "select" | "activate">,
  transaction: (action: () => void) => void,
) => {
  const { runtime, inventory, nodes, usb } = env;
  const state = createStore<HomeState>({ active: true, selected: "", theme: readTheme() });
  let enterDown = false;
  const update = (patch: Partial<HomeState>) =>
    transaction(() => {
      const before = state.getSnapshot();
      if (Object.keys(patch).some((key) => before[key as keyof HomeState] !== patch[key as keyof HomeState])) {
        state.set({ ...before, ...patch });
      }
    });
  // Row 0 holds the theme switch and the settings gear; row 1 holds the shortcuts followed by the HDMI inputs.
  const rows = (): readonly (readonly string[])[] => [
    [THEME, GEAR],
    [
      ...SHORTCUTS.map((shortcut) => "shortcut:" + shortcut.key),
      ...inventory.getSnapshot().inputs.filter(isHdmi).map(sourceKey),
      ...usb.getSnapshot().map((drive) => USB_PREFIX + drive.id),
    ],
  ];
  const focus = () => {
    if (document.hidden || runtime.settingsUi?.isOpen()) {
      update({ active: false });
      return;
    }
    const list = rows();
    const old = state.getSnapshot().selected;
    const selected = list.some((row) => row.includes(old)) ? old : list[1][0];
    update({ selected, active: true });
    const node = nodes.get(selected);
    if (node) {
      focusControl(node);
    }
  };
  const select = (selected: string) => {
    update({ selected });
    focus();
  };
  const activate = (key: string) => {
    if (key === THEME) {
      const theme = NEXT_THEME[state.getSnapshot().theme];
      saveTheme(theme);
      update({ theme });
    } else if (key === GEAR) {
      runtime.settingsUi?.open();
    } else if (key.startsWith("shortcut:")) {
      const shortcut = SHORTCUTS.find((item) => item.key === key.slice(9));
      if (shortcut) {
        runtime.apps.launch(resolveShortcutApp(shortcut, inventory.getSnapshot().apps));
      }
    } else if (key.startsWith(USB_PREFIX)) {
      const player = resolveUsbApp(inventory.getSnapshot().apps);
      if (player) {
        runtime.apps.launch(player);
      } else {
        runtime.toast(runtime.translate("apps.openFailed", { name: runtime.translate("home.usb") }));
      }
    } else {
      const source = inventory.getSnapshot().inputs.find((item) => sourceKey(item) === key);
      if (source) {
        runtime.inputs.show(source);
      }
    }
  };
  const K = runtime.config.KEY;
  const keydown = (code: number, event: Pick<KeyboardEvent, "preventDefault">) =>
    transaction(() => {
      if (![K.LEFT, K.RIGHT, K.UP, K.DOWN, K.BACK, K.ESC, K.ENTER].includes(code)) {
        return;
      }
      event.preventDefault();
      if (code === K.ENTER) {
        enterDown = true;
        return;
      }
      const all = rows();
      const current = state.getSnapshot().selected;
      const row = all.findIndex((items) => items.includes(current));
      if (row < 0) {
        focus();
        return;
      }
      if (code === K.UP || code === K.DOWN) {
        const target = row + (code === K.UP ? -1 : 1);
        if (target >= 0 && target < all.length) {
          select(all[target][0]);
        }
        return;
      }
      if (code === K.LEFT || code === K.RIGHT) {
        // Rows run right to left in RTL languages, so Left moves to the next item there.
        const rtl = window.document?.documentElement.dir === "rtl";
        const delta = (code === K.LEFT) !== rtl ? -1 : 1;
        const column = all[row].indexOf(current) + delta;
        select(all[row][Math.max(0, Math.min(all[row].length - 1, column))]);
      }
    });
  const keyup = (code: number) => {
    if (code !== K.ENTER || !enterDown) {
      return;
    }
    enterDown = false;
    activate(state.getSnapshot().selected);
  };
  const bridge = {
    render: focus,
    buildRows: focus,
    refreshApps: focus,
    focus,
    blur() {
      enterDown = false;
      update({ active: false });
    },
    keydown,
    keyup,
  };
  return { ...env, state, bridge, select, activate };
};
