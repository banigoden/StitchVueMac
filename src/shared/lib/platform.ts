export type DesktopPlatform = "windows" | "macos" | "linux";

/** WebView user agent → OS. Without a navigator (node tests) this is Windows, the original target. */
export function detectPlatform(
  userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent,
): DesktopPlatform {
  // Linux first: WebKitGTK user agents mimic Safari and may mention "Mac".
  if (/Linux|X11/.test(userAgent) && !/Android/.test(userAgent)) {
    return "linux";
  }
  if (/Mac/.test(userAgent)) {
    return "macos";
  }
  return "windows";
}

export const PLATFORM = detectPlatform();

/** Path-key case folding: NTFS / APFS ignore case, Linux file systems do not. */
export function caseFold(text: string, platform: DesktopPlatform = PLATFORM): string {
  return platform === "linux" ? text : text.toLowerCase();
}
