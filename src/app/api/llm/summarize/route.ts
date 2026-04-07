import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { oldText, newText, articleNo, provider, apiKey, model } = await req.json();

  if (!apiKey) {
    return NextResponse.json({ error: "API key required" }, { status: 400 });
  }

  const prompt = `다음은 한국 법률의 개정 내용입니다. 비전문가가 이해할 수 있도록 변경 사항을 2-3문장으로 요약해주세요.

조문: ${articleNo}
개정 전: ${oldText || "(신설)"}
개정 후: ${newText || "(삭제)"}

변경 요약:`;

  try {
    let summary = "";

    if (provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 300,
          temperature: 0.3,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      summary = data.choices?.[0]?.message?.content || "요약 생성 실패";
    } else if (provider === "anthropic") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 300,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      summary = data.content?.[0]?.text || "요약 생성 실패";
    } else if (provider === "google") {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 300, temperature: 0.3 },
          }),
        }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      summary = data.candidates?.[0]?.content?.parts?.[0]?.text || "요약 생성 실패";
    }

    return NextResponse.json({ summary });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
