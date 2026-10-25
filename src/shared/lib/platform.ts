export type DesktopPlatform = "windows" | "macos" | "linux";

/** WebView user agent → OS. Without a navigator (node tests) this is Windows, the original target. */
export function detectPlatform(
  userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent,
): DesktopPlatform {
  if (/Mac/.test(userAgent)) {
    return "macos";
  }
  if (/Linux|X11/.test(userAgent) && !/Android/.test(userAgent)) {
    return "linux";
  }
  return "windows";
}

export const PLATFORM = detectPlatform();
