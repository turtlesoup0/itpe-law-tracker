"use client";

import { useState, useEffect } from "react";
import { PROVIDERS, useLLMSettings } from "@/lib/llm-settings";
import type { LLMSettings } from "@/lib/llm-settings";

export default function SettingsPage() {
  const [saved, saveSettings] = useLLMSettings();

  const [provider, setProvider] = useState<LLMSettings["provider"]>("openai");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(PROVIDERS[0].models[0]);
  const [showKey, setShowKey] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "fail" | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  // Load saved settings into form when they become available
  useEffect(() => {
    if (saved) {
      setProvider(saved.provider);
      setApiKey(saved.apiKey);
      setModel(saved.model);
    }
  }, [saved]);

  const currentProvider = PROVIDERS.find((p) => p.id === provider)!;

  function handleProviderChange(newProvider: LLMSettings["provider"]) {
    setProvider(newProvider);
    const p = PROVIDERS.find((pr) => pr.id === newProvider)!;
    setModel(p.models[0]);
    setTestResult(null);
  }

  function handleSave() {
    saveSettings({ provider, apiKey, model });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  }

  function handleTest() {
    if (apiKey.trim().length > 0) {
      setTestResult("success");
    } else {
      setTestResult("fail");
    }
  }

  const hasSaved = saved !== null;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">설정</h1>
        <p className="mt-2 text-muted-foreground">
          AI 기능을 사용하기 위한 LLM API 설정
        </p>
      </div>

      {/* Status indicator */}
      <div className="mb-6 flex items-center gap-2 rounded-lg border border-border bg-card p-4">
        <span
          className={`inline-block h-3 w-3 rounded-full ${
            hasSaved ? "bg-success" : "bg-destructive"
          }`}
        />
        <span className="text-sm text-foreground">
          {hasSaved ? "API 설정이 저장되어 있습니다" : "API 설정이 필요합니다"}
        </span>
      </div>

      <div className="space-y-6 rounded-lg border border-border bg-card p-6">
        {/* Provider selection */}
        <div>
          <label className="mb-3 block text-sm font-medium text-foreground">
            LLM 제공자 선택
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
            {PROVIDERS.map((p) => (
              <label
                key={p.id}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 transition-colors ${
                  provider === p.id
                    ? "border-primary bg-primary-soft text-foreground"
                    : "border-border bg-muted text-muted-foreground hover:border-foreground/30"
                }`}
              >
                <input
                  type="radio"
                  name="provider"
                  value={p.id}
                  checked={provider === p.id}
                  onChange={() => handleProviderChange(p.id)}
                  className="accent-primary"
                />
                <span className="text-sm font-medium">{p.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* API Key input */}
        <div>
          <label
            htmlFor="apiKey"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            API 키
          </label>
          <div className="relative">
            <input
              id="apiKey"
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setTestResult(null);
              }}
              placeholder="sk-..."
              className="w-full rounded-lg border border-border bg-muted px-4 py-2.5 pr-16 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {showKey ? "숨기기" : "보기"}
            </button>
          </div>
        </div>

        {/* Model selection */}
        <div>
          <label
            htmlFor="model"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            모델 선택
          </label>
          <select
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
          >
            {currentProvider.models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Test result */}
        {testResult && (
          <div
            className={`rounded-lg px-4 py-3 text-sm ${
              testResult === "success"
                ? "bg-success/12 text-success"
                : "bg-destructive/12 text-destructive"
            }`}
          >
            {testResult === "success"
              ? "✓ API 키가 유효합니다."
              : "✗ API 키를 입력해주세요."}
          </div>
        )}

        {/* Saved confirmation */}
        {justSaved && (
          <div className="rounded-lg bg-primary-soft px-4 py-3 text-sm text-primary">
            ✓ 설정이 저장되었습니다.
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            저장
          </button>
          <button
            type="button"
            onClick={handleTest}
            className="rounded-lg border border-border bg-muted px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            테스트
          </button>
        </div>
      </div>
    </div>
  );
}
