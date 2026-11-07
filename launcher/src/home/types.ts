import type { RefObject } from "preact";

import type { HomeBridge, InputSource, InstalledApp } from "../contracts/launcher";
import type { SettingsStore } from "../contracts/preferences";
import type { StatusStores } from "../contracts/status";
import type { LauncherRuntime } from "../platform/tizen/launcherRuntime";
import type { MutableStore, Store } from "../shared/state/createStore";
export interface Inventory {
  readonly apps: readonly InstalledApp[];
  readonly inputs: readonly InputSource[];
  readonly ready: boolean;
}
export interface HomeState {
  readonly active: boolean;
  readonly selected: string;
}
export interface HomeEnvironment {
  activate(key: string): void;
  bridge: HomeBridge;
  inventory: Store<Inventory>;
  nodes: Map<string, HTMLElement>;
  rows: RefObject<HTMLElement>;
  runtime: LauncherRuntime;
  select(key: string): void;
  settings: SettingsStore;
  state: MutableStore<HomeState>;
  status: StatusStores;
}
