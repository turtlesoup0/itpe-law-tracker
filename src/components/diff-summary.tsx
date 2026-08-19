import type { CompareOldNewItem } from "@/types/law";

/**
 * 신구대조 항목의 AI 요약.
 *
 * 요약은 서버 cron(/api/cron/generate-summaries)이 ANTHROPIC_API_KEY 로 미리
 * 생성해 compare/*.json 의 item.summary 에 넣어 둔다. 예전에는 요약이 없는
 * 항목에 한해 사용자가 설정에 등록한 개인 API 키로 실시간 호출하는 버튼을
 * 뒀는데, cron 이 전체를 커버하게 되면서 남는 건 아직 cron 이 돌지 않은
 * 소수 항목뿐이었다. 키를 입력받을 이유가 없어져 버튼과 설정 화면을 걷어냈다.
 */
export function AISummarySection({ item }: { item: CompareOldNewItem }) {
  if (!item.summary) return null;

  return (
    <div className="mt-2 rounded border border-primary/25 bg-primary-soft p-2.5 text-xs leading-relaxed text-foreground">
      <span className="font-semibold">📋 요약:</span> {item.summary}
    </div>
  );
}
