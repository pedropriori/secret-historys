"use client";

import { useReadingPrefs } from "@/hooks/useReadingPrefs";

export function ReaderControls() {
  const { prefs, setPrefs } = useReadingPrefs();

  function handleFontSize(delta: number) {
    setPrefs({ ...prefs, fontSize: Math.max(14, Math.min(28, prefs.fontSize + delta)) });
  }

  function handleLineHeight(delta: number) {
    const next = Math.max(1.4, Math.min(2.2, Number((prefs.lineHeight + delta).toFixed(1))));
    setPrefs({ ...prefs, lineHeight: next });
  }

  function handleFontFamily(next: "serif" | "sans") {
    setPrefs({ ...prefs, font: next });
  }

  return (
    <div className="fixed top-2 right-2 z-40 bg-white/90 backdrop-blur border rounded-md px-3 py-2 flex items-center gap-2 text-sm">
      <button onClick={() => handleFontSize(-1)} aria-label="Disminuir tamaño" className="px-2 py-1 border rounded">A-</button>
      <span>{prefs.fontSize}px</span>
      <button onClick={() => handleFontSize(1)} aria-label="Aumentar tamaño" className="px-2 py-1 border rounded">A+</button>
      <div className="w-px h-4 bg-neutral-300 mx-2" />
      <button onClick={() => handleLineHeight(-0.1)} aria-label="Reducir interlineado" className="px-2 py-1 border rounded">−lh</button>
      <span>{prefs.lineHeight}</span>
      <button onClick={() => handleLineHeight(0.1)} aria-label="Aumentar interlineado" className="px-2 py-1 border rounded">+lh</button>
      <div className="w-px h-4 bg-neutral-300 mx-2" />
      <button onClick={() => handleFontFamily("serif")} aria-label="Serif" className={`px-2 py-1 border rounded ${prefs.font === "serif" ? "bg-neutral-200" : ""}`}>Serif</button>
      <button onClick={() => handleFontFamily("sans")} aria-label="Sans" className={`px-2 py-1 border rounded ${prefs.font === "sans" ? "bg-neutral-200" : ""}`}>Sans</button>
    </div>
  );
}

export default ReaderControls;




