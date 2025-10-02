"use client";

import { useEffect, useState } from "react";

interface Prefs {
  fontSize: number;
  lineHeight: number;
  font: "serif" | "sans";
  theme: "sepia" | "light" | "dark";
}

const DEFAULT: Prefs = { fontSize: 18, lineHeight: 1.8, font: "serif", theme: "sepia" };

export function useReadingPrefs() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT);

  useEffect(function load() {
    try {
      const raw = localStorage.getItem("reader:prefs");
      if (raw) setPrefs(JSON.parse(raw));
    } catch { }
  }, []);

  useEffect(function persist() {
    try { localStorage.setItem("reader:prefs", JSON.stringify(prefs)); } catch { }
  }, [prefs]);

  return { prefs, setPrefs } as const;
}

export type { Prefs };





