"use client";

import { useState, useEffect } from "react";

export interface LLMSettings {
  provider: "openai" | "anthropic" | "google";
  apiKey: string;
  model: string;
}

export const PROVIDERS = [
  { id: "openai" as const, name: "OpenAI", models: ["gpt-4o", "gpt-4o-mini"] },
  { id: "anthropic" as const, name: "Anthropic (Claude)", models: ["claude-sonnet-4-20250514", "claude-haiku-4-5-20251001"] },
  { id: "google" as const, name: "Google (Gemini)", models: ["gemini-2.0-flash", "gemini-2.5-pro"] },
];

export function useLLMSettings(): [LLMSettings | null, (settings: LLMSettings) => void] {
  const [settings, setSettings] = useState<LLMSettings | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("llmSettings");
      if (stored) setSettings(JSON.parse(stored));
    } catch {}
  }, []);

  function saveSettings(newSettings: LLMSettings) {
    localStorage.setItem("llmSettings", JSON.stringify(newSettings));
    setSettings(newSettings);
  }

  return [settings, saveSettings];
}
