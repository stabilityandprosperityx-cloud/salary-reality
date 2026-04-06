"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function RefreshLoop() {
  const router = useRouter();

  useEffect(() => {
    const interval = window.setInterval(() => {
      router.refresh();
    }, 30_000);

    return () => window.clearInterval(interval);
  }, [router]);

  return null;
}
