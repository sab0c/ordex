"use client";

import { useEffect, useState } from "react";
import { isMockApiMode } from "@/lib/api";

export function MockServiceWorkerProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isReady, setIsReady] = useState(() => !isMockApiMode());

  useEffect(() => {
    if (!isMockApiMode()) {
      setIsReady(true);
      return;
    }

    let isMounted = true;

    async function startWorker() {
      const { worker } = await import("@/mocks/browser");

      await worker.start({
        onUnhandledRequest: "bypass",
        serviceWorker: {
          url: "/mockServiceWorker.js",
        },
      });

      if (isMounted) {
        setIsReady(true);
      }
    }

    void startWorker();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isReady) {
    return null;
  }

  return <>{children}</>;
}
