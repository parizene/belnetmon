"use client";

import { MapProvider } from "@/components/MapProvider";
import SidePanel from "@/components/SidePanel";
import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import("@/components/Map"), {
  ssr: false,
});

export default function Home() {
  return (
    <main>
      <MapProvider>
        <div className="flex flex-col md:flex-row h-screen">
          <div className="w-full md:w-56 flex-shrink-0 p-4 bg-slate-100">
            <SidePanel />
          </div>
          <div className="flex-1 overflow-y-auto">
            <DynamicMap />
          </div>
        </div>
      </MapProvider>
    </main>
  );
}
