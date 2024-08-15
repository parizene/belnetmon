"use client";

import { MapProvider } from "@/components/MapProvider";
import SidePanel from "@/components/SidePanel";
import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import("@/components/Map"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="h-full bg-background">
      <MapProvider>
        <div className="flex h-full flex-col md:flex-row">
          <div className="flex-shrink-0 p-4 md:w-56">
            <SidePanel />
          </div>
          <div className="flex-1 overflow-y-auto">
            <DynamicMap className="h-full" />
          </div>
        </div>
      </MapProvider>
    </main>
  );
}
