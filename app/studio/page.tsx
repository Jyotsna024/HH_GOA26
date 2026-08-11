"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StudioRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0F5C3F] flex items-center justify-center font-mono text-hh-yellow text-xs">
      REDIRECTING TO STUDIO...
    </div>
  );
}
