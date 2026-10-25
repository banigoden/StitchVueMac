/**
 * OS wording on top of the shipped (Windows) dictionaries: Finder / file manager instead of
 * Explorer, Trash instead of the Windows Recycle Bin, "This Mac" instead of "This PC".
 */
import type { DesktopPlatform } from "../lib/platform.ts";

type Tree = { [key: string]: string | Tree };

const MACOS: Record<string, Tree> = {
  en: {
    places: { thisComputer: "This Mac" },
    sidebar: {
      trashHint:
        "Temporarily deleted images from the current folder. You can restore them or move them to the Trash.",
    },
    selection: { favoriteMissingOriginRecycleLabel: "Move copy to Trash" },
    folder: { openInExplorer: "Open in Finder" },
    trash: {
      recycleFolderTitle: "Move the Deleted folder to the Trash?",
      recycleFolderBody:
        "The Deleted folder and all of its contents will be moved to the Trash. You can restore them from the Trash until it is emptied.",
      recycleFolderConfirm: "Move to Trash",
      viewerDeleteToWindows: "Move to Trash",
      recycledToWindows: "Photo moved to the Trash",
    },
  },
  ru: {
    places: { thisComputer: "Этот Mac" },
    selection: { favoriteMissingOriginRecycleLabel: "Отправить копию в Корзину" },
    folder: { openInExplorer: "Открыть в Finder" },
    trash: {
      recycleFolderTitle: "Переместить папку «Удаленное» в Корзину?",
      recycleFolderBody:
        "Папка «Удаленное» и всё её содержимое будут перемещены в Корзину. Восстановить их можно будет из Корзины, пока она не очищена.",
      recycleFolderConfirm: "В Корзину",
      viewerDeleteToWindows: "Отправить в Корзину",
      recycledToWindows: "Фотография отправлена в Корзину",
    },
  },
  de: {
    places: { thisComputer: "Dieser Mac" },
    folder: { openInExplorer: "Im Finder öffnen" },
    trash: {
      recycleFolderTitle: "Ordner „Gelöscht“ in den Papierkorb verschieben?",
      recycleFolderBody:
        "Der Ordner „Gelöscht“ und sein gesamter Inhalt werden in den Papierkorb verschoben. Sie können sie von dort wiederherstellen, solange der Papierkorb nicht geleert wurde.",
      viewerDeleteToWindows: "In den Papierkorb verschieben",
      recycledToWindows: "Foto in den Papierkorb verschoben",
    },
  },
  "zh-Hans": {
    places: { thisComputer: "此 Mac" },
    sidebar: { trashHint: "当前文件夹中暂时删除的图像。可以恢复它们，或将其移到废纸篓。" },
    selection: { favoriteMissingOriginRecycleLabel: "将副本移到废纸篓" },
    folder: { openInExplorer: "在访达中打开" },
    trash: {
      recycleFolderTitle: "将“已删除”文件夹移到废纸篓？",
      recycleFolderBody: "“已删除”文件夹及其全部内容将移到废纸篓。在清倒废纸篓之前，你可以从中恢复这些内容。",
      recycleFolderConfirm: "移到废纸篓",
      viewerDeleteToWindows: "移到废纸篓",
      recycledToWindows: "照片已移到废纸篓",
    },
  },
};

const LINUX: Record<string, Tree> = {
  en: mergeTree(MACOS.en, {
    places: { thisComputer: "Computer" },
    folder: { openInExplorer: "Open in File Manager" },
  }),
  ru: mergeTree(MACOS.ru, {
    places: { thisComputer: "Компьютер" },
    folder: { openInExplorer: "Открыть в файловом менеджере" },
  }),
  de: mergeTree(MACOS.de, {
    places: { thisComputer: "Computer" },
    folder: { openInExplorer: "Im Dateimanager öffnen" },
  }),
  "zh-Hans": {
    places: { thisComputer: "计算机" },
    folder: { openInExplorer: "在文件管理器中打开" },
    trash: {
      recycleFolderTitle: "将“已删除”文件夹移至回收站？",
      recycleFolderBody: "“已删除”文件夹及其全部内容将移至回收站。在清空回收站之前，你可以从中恢复这些内容。",
      viewerDeleteToWindows: "移至回收站",
      recycledToWindows: "照片已移至回收站",
    },
  },
};

function mergeTree(base: Tree, extra: Tree): Tree {
  const out: Tree = { ...base };
  for (const [key, value] of Object.entries(extra)) {
    const current = out[key];
    out[key] =
      typeof value === "object" && typeof current === "object" ? mergeTree(current, value) : value;
  }
  return out;
}

/** Dictionaries with the platform's wording merged in; Windows keeps them as shipped. */
export function withPlatformStrings<T extends Record<string, Tree>>(
  dictionaries: T,
  platform: DesktopPlatform,
): T {
  const overrides = platform === "macos" ? MACOS : platform === "linux" ? LINUX : null;
  if (!overrides) {
    return dictionaries;
  }
  const out: Record<string, Tree> = {};
  for (const [locale, tree] of Object.entries(dictionaries)) {
    out[locale] = overrides[locale] ? mergeTree(tree, overrides[locale]) : tree;
  }
  return out as T;
}
