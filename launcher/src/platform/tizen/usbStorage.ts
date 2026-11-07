import type { Store } from "../../shared/state/createStore";
import { createStore } from "../../shared/state/createStore";

export interface UsbDrive {
  readonly id: string;
  readonly label: string;
}

interface TizenStorage {
  readonly label: string;
  readonly state: string;
  readonly type: string;
}

interface TizenFilesystem {
  addStorageStateChangeListener(success: (storage: TizenStorage) => void, error?: (error: unknown) => void): number;
  listStorages(success: (storages: TizenStorage[]) => void, error?: (error: unknown) => void): void;
  removeStorageStateChangeListener(id: number): void;
}

const NO_DRIVES: readonly UsbDrive[] = Object.freeze([]);
const DEMO_DRIVES: readonly UsbDrive[] = Object.freeze([Object.freeze({ id: "demo", label: "" })]);

const filesystem = (): TizenFilesystem | undefined =>
  (window as unknown as { tizen?: { filesystem?: TizenFilesystem } }).tizen?.filesystem;

const toDrives = (storages: readonly TizenStorage[]): readonly UsbDrive[] =>
  storages
    .filter((storage) => storage.type === "EXTERNAL" && storage.state === "MOUNTED")
    .map((storage) => ({ id: storage.label, label: storage.label.trim() }));

const signature = (drives: readonly UsbDrive[]) => drives.map((drive) => drive.id).join("\0");

// USB drives that are mounted right now. The list is read once, then again whenever
// the TV reports a storage change, so the tile appears and disappears with the drive.
export const createUsbStore = (transaction: (action: () => void) => void = (action) => action()) => {
  const store = createStore<readonly UsbDrive[]>(NO_DRIVES);
  const fs = filesystem();
  if (!fs) {
    // Desktop preview only: ?demo=1 shows one drive.
    if (new URLSearchParams(window.location.search).get("demo") === "1") {
      store.set(DEMO_DRIVES);
    }
    return { store: store as Store<readonly UsbDrive[]>, dispose() {} };
  }
  const refresh = () => {
    try {
      fs.listStorages(
        (storages) => {
          const next = toDrives(storages);
          if (signature(next) !== signature(store.getSnapshot())) {
            transaction(() => store.set(next.length ? Object.freeze(next) : NO_DRIVES));
          }
        },
        () => {
          /* firmware can refuse the listing; keep the last known state */
        },
      );
    } catch {
      /* the storage API is missing on this firmware */
    }
  };
  let listener: number | undefined;
  try {
    listener = fs.addStorageStateChangeListener(refresh);
  } catch {
    /* without the listener the drive list only refreshes at startup */
  }
  refresh();
  return {
    store: store as Store<readonly UsbDrive[]>,
    dispose() {
      if (listener !== undefined) {
        try {
          fs.removeStorageStateChangeListener(listener);
        } catch {
          /* already removed */
        }
      }
    },
  };
};
