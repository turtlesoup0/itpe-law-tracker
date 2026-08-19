import type { ThreeTierRow } from "@/types/law";

export function ThreeTierView({ rows }: { rows: ThreeTierRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border bg-muted px-4 py-3 text-left text-[13px] font-semibold">
              법률
            </th>
            <th className="w-8 border-y bg-muted/50" aria-hidden="true" />
            <th className="border bg-muted px-4 py-3 text-left text-[13px] font-semibold">
              시행령
            </th>
            <th className="w-8 border-y bg-muted/50" aria-hidden="true" />
            <th className="border bg-muted px-4 py-3 text-left text-[13px] font-semibold">
              시행규칙
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-muted/60">
              <td className="border px-4 py-3 align-top">
                <div className="mb-1 font-medium text-cat-infosec">
                  {row.lawJo}
                </div>
                <div className="text-[13px] text-muted-foreground">{row.lawContent}</div>
              </td>
              <td className="border-y text-center text-xs text-faint select-none" aria-hidden="true">
                →
              </td>
              <td className="border px-4 py-3 align-top">
                {row.decreeJo ? (
                  <>
                    <div className="mb-1 font-medium text-cat-software">
                      {row.decreeJo}
                    </div>
                    <div className="text-[13px] text-muted-foreground">
                      {row.decreeContent}
                    </div>
                  </>
                ) : (
                  <div className="text-[13px] text-faint italic">
                    해당 없음
                  </div>
                )}
              </td>
              <td className="border-y text-center text-xs text-faint select-none" aria-hidden="true">
                →
              </td>
              <td className="border px-4 py-3 align-top">
                {row.ruleJo ? (
                  <>
                    <div className="mb-1 font-medium text-cat-finance">
                      {row.ruleJo}
                    </div>
                    <div className="text-[13px] text-muted-foreground">
                      {row.ruleContent}
                    </div>
                  </>
                ) : (
                  <div className="text-[13px] text-faint italic">
                    해당 없음
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
