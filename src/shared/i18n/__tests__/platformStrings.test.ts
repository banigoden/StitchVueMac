import test from "node:test";
import assert from "node:assert/strict";
import de from "../locales/de.json" with { type: "json" };
import en from "../locales/en.json" with { type: "json" };
import ru from "../locales/ru.json" with { type: "json" };
import zhHans from "../locales/zh-Hans.json" with { type: "json" };
import { caseFold, detectPlatform } from "../../lib/platform.ts";
import { withPlatformStrings } from "../platformStrings.ts";

const shipped = { ru, en, de, "zh-Hans": zhHans };

function keys(tree: object, prefix = ""): string[] {
  return Object.entries(tree).flatMap(([key, value]) =>
    typeof value === "object" ? keys(value, `${prefix}${key}.`) : [`${prefix}${key}`],
  );
}

test("platform wording only replaces keys that exist in every dictionary", () => {
  for (const platform of ["macos", "linux"] as const) {
    const merged = withPlatformStrings(shipped, platform);
    for (const locale of Object.keys(shipped) as (keyof typeof shipped)[]) {
      assert.deepEqual(keys(merged[locale]).sort(), keys(shipped[locale]).sort(), `${platform}/${locale}`);
    }
  }
  assert.equal(withPlatformStrings(shipped, "windows"), shipped);
});

test("macOS and Linux get Finder / file manager and Trash wording", () => {
  const mac = withPlatformStrings(shipped, "macos");
  assert.equal(mac.en.folder.openInExplorer, "Open in Finder");
  assert.equal(mac.en.trash.viewerDeleteToWindows, "Move to Trash");
  assert.equal(mac.ru.places.thisComputer, "Этот Mac");
  const linux = withPlatformStrings(shipped, "linux");
  assert.equal(linux.en.folder.openInExplorer, "Open in File Manager");
  assert.equal(linux.en.trash.viewerDeleteToWindows, "Move to Trash");
  assert.equal(shipped.en.folder.openInExplorer, "Open in Explorer");
});

test("detectPlatform reads the WebView user agent", () => {
  assert.equal(detectPlatform("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15"), "macos");
  assert.equal(detectPlatform("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/605.1.15"), "linux");
  assert.equal(detectPlatform("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edg/130.0"), "windows");
  assert.equal(detectPlatform(""), "windows");
  // A WebKitGTK agent that also mentions Mac is still Linux.
  assert.equal(detectPlatform("Mozilla/5.0 (Macintosh; X11; Linux x86_64) AppleWebKit/605.1.15"), "linux");
});

test("path keys keep case only on Linux", () => {
  assert.equal(caseFold("/home/me/Trip", "linux"), "/home/me/Trip");
  assert.equal(caseFold("/Users/me/Trip", "macos"), "/users/me/trip");
  assert.equal(caseFold("C:\\Photos\\Trip", "windows"), "c:\\photos\\trip");
});
