import type { LucideIcon } from "lucide-preact";
import { Globe, Play, Popcorn } from "lucide-preact";

import type { InputSource, InstalledApp } from "../../contracts/launcher";

export interface Shortcut {
  readonly fallback: InstalledApp;
  readonly icon: LucideIcon;
  // Optional picture shipped with the launcher; used before the TV's own app icon.
  readonly image?: string;
  readonly key: string;
  readonly match: RegExp;
}

// Fixed quick launchers. An installed app that matches wins; otherwise the stock
// Samsung app ID is launched directly.
export const SHORTCUTS: readonly Shortcut[] = [
  {
    key: "youtube",
    icon: Play,
    match: /^youtube$/i,
    fallback: { id: "9Ur5IzDKqV.TizenYouTube", name: "YouTube" },
  },
  {
    key: "prime-video",
    icon: Popcorn,
    match: /^(amazon )?prime video/i,
    fallback: { id: "org.tizen.primevideo", name: "Prime Video" },
  },
  {
    key: "internet",
    icon: Globe,
    image: "assets/shortcuts/internet.png",
    match: /^(samsung )?(internet|browser)$/i,
    fallback: { id: "org.tizen.browser", name: "Internet" },
  },
];

export const resolveShortcutApp = (shortcut: Shortcut, apps: readonly InstalledApp[]): InstalledApp =>
  apps.find((app) => shortcut.match.test(app.name.trim())) ?? shortcut.fallback;

// The row lists external inputs only; Live TV is not a quick access.
export const isHdmi = (source: InputSource) => source.type !== "TV";

// Samsung's file player opens the USB drive. It is found by name among the installed apps,
// because its ID differs between TV models.
const USB_PLAYER = /^(multim[eé]dia|media|lecteur|usb|my files|mes fichiers)/i;
export const resolveUsbApp = (apps: readonly InstalledApp[]): InstalledApp | undefined =>
  apps.find((app) => USB_PLAYER.test(app.name.trim()));
