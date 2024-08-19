"use client";

import AreaSelector from "@/components/AreaSelector";
import { MapProvider } from "@/components/MapProvider";
import OperatorSelector from "@/components/OperatorSelector";
import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import("@/components/Map"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="h-full bg-background">
      <MapProvider>
        <div className="flex h-full flex-col md:flex-row">
          <div className="flex flex-shrink-0 flex-col gap-4 p-4 md:w-56">
            <OperatorSelector />
            <AreaSelector />
          </div>
          <div className="flex-1 overflow-y-auto">
            <DynamicMap className="h-full" />
          </div>
        </div>
      </MapProvider>
    </main>
  );
}
