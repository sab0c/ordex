import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/providers/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ordex",
  description: "Painel de autenticação e gestão de ordens de serviço.",
};

const themeInitScript = `
  (() => {
    const ICON_ATTRIBUTE = "data-ordex-theme-icon";
    const syncThemeIcon = (theme) => {
      const href = theme === "light" ? "/icons/icon-light.svg" : "/icons/icon-dark.svg";
      ["icon", "shortcut icon"].forEach((rel) => {
        let link = document.head.querySelector('link[' + ICON_ATTRIBUTE + '="' + rel + '"]');

        if (!link) {
          link = document.createElement("link");
          link.setAttribute(ICON_ATTRIBUTE, rel);
          link.setAttribute("rel", rel);
          link.setAttribute("type", "image/svg+xml");
          document.head.appendChild(link);
        }

        link.setAttribute("href", href);
      });
    };

    try {
      const storedTheme = window.localStorage.getItem("ordex-theme");
      const theme = storedTheme === "light" ? "light" : "dark";
      document.documentElement.dataset.theme = theme;
      syncThemeIcon(theme);
    } catch {
      document.documentElement.dataset.theme = "dark";
      syncThemeIcon("dark");
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      data-theme="dark"
      suppressHydrationWarning
    >
      <head>
        <link data-ordex-theme-icon="icon" rel="icon" type="image/svg+xml" href="/icons/icon-dark.svg" />
        <link
          data-ordex-theme-icon="shortcut icon"
          rel="shortcut icon"
          type="image/svg+xml"
          href="/icons/icon-dark.svg"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full bg-background text-foreground">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
