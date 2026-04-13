export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "ordex-theme";
export const THEME_ICON_ATTRIBUTE = "data-ordex-theme-icon";
export const THEME_ICON_RELS = ["icon", "shortcut icon"] as const;
export const DEFAULT_THEME: Theme = "dark";

export function resolveThemePreference(value: string | null | undefined): Theme {
  return value === "light" ? "light" : DEFAULT_THEME;
}

export function getThemeIconHref(theme: Theme): string {
  return theme === "light" ? "/icons/icon-light.svg" : "/icons/icon-dark.svg";
}

export function buildThemeInitScript(): string {
  return `
    (() => {
      const storageKey = "${THEME_STORAGE_KEY}";
      const iconAttribute = "${THEME_ICON_ATTRIBUTE}";
      const defaultTheme = "${DEFAULT_THEME}";
      const iconRels = ${JSON.stringify(THEME_ICON_RELS)};
      const getThemeIconHref = (theme) =>
        theme === "light" ? "/icons/icon-light.svg" : "/icons/icon-dark.svg";
      const resolveThemePreference = (value) =>
        value === "light" ? "light" : defaultTheme;
      const syncThemeIcon = (theme) => {
        const href = getThemeIconHref(theme);

        iconRels.forEach((rel) => {
          let link = document.head.querySelector('link[' + iconAttribute + '="' + rel + '"]');

          if (!link) {
            link = document.createElement("link");
            link.setAttribute(iconAttribute, rel);
            link.setAttribute("rel", rel);
            link.setAttribute("type", "image/svg+xml");
            document.head.appendChild(link);
          }

          link.setAttribute("href", href);
        });
      };

      try {
        const storedTheme = window.localStorage.getItem(storageKey);
        const theme = resolveThemePreference(storedTheme);
        document.documentElement.dataset.theme = theme;
        syncThemeIcon(theme);
      } catch {
        document.documentElement.dataset.theme = defaultTheme;
        syncThemeIcon(defaultTheme);
      }
    })();
  `;
}

export function syncThemeIcon(theme: Theme): void {
  const href = getThemeIconHref(theme);

  THEME_ICON_RELS.forEach((rel) => {
    let link = document.head.querySelector<HTMLLinkElement>(
      `link[${THEME_ICON_ATTRIBUTE}="${rel}"]`,
    );

    if (!link) {
      link = document.createElement("link");
      link.setAttribute(THEME_ICON_ATTRIBUTE, rel);
      link.rel = rel;
      link.type = "image/svg+xml";
      document.head.appendChild(link);
    }

    link.href = href;
  });
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  syncThemeIcon(theme);
}
