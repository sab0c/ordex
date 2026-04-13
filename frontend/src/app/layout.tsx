import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MockServiceWorkerProvider } from "@/providers/mock-service-worker-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import {
  DEFAULT_THEME,
  buildThemeInitScript,
  getThemeIconHref,
} from "@/lib/theme";
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
const themeInitScript = buildThemeInitScript();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      data-theme={DEFAULT_THEME}
      suppressHydrationWarning
    >
      <head>
        <link
          data-ordex-theme-icon="icon"
          rel="icon"
          type="image/svg+xml"
          href={getThemeIconHref(DEFAULT_THEME)}
        />
        <link
          data-ordex-theme-icon="shortcut icon"
          rel="shortcut icon"
          type="image/svg+xml"
          href={getThemeIconHref(DEFAULT_THEME)}
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full bg-background text-foreground">
        <MockServiceWorkerProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </MockServiceWorkerProvider>
      </body>
    </html>
  );
}
