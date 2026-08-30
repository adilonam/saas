"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const ApexHeroScene = dynamic(() => import("./ApexHeroScene"), {
  ssr: false,
});

export default function ApexHeroMedia() {
  const [sceneReady, setSceneReady] = useState(false);

  return (
    <div className="group relative flex h-80 w-full cursor-pointer items-center justify-center md:h-[420px] md:w-1/2">
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          sceneReady ? "opacity-90 group-hover:opacity-100" : "opacity-0"
        }`}
      >
        <ApexHeroScene onReady={() => setSceneReady(true)} />
      </div>
    </div>
  );
}
