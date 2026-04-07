import type { ThreeTierRow } from "@/types/law";

export function ThreeTierView({ rows }: { rows: ThreeTierRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800 px-4 py-3 text-left font-semibold">
              법률
            </th>
            <th className="w-8 border-y border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/50" aria-hidden="true" />
            <th className="bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 px-4 py-3 text-left font-semibold">
              시행령
            </th>
            <th className="w-8 border-y border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/50" aria-hidden="true" />
            <th className="bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 px-4 py-3 text-left font-semibold">
              시행규칙
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800">
              <td className="border border-slate-200 dark:border-slate-700 px-4 py-3 align-top">
                <div className="font-medium text-blue-700 dark:text-blue-300 mb-1">
                  {row.lawJo}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">{row.lawContent}</div>
              </td>
              <td className="border-y border-slate-200 dark:border-slate-700 text-center text-slate-400 dark:text-slate-500 text-xs select-none" aria-hidden="true">
                →
              </td>
              <td className="border border-slate-200 dark:border-slate-700 px-4 py-3 align-top">
                {row.decreeJo ? (
                  <>
                    <div className="font-medium text-emerald-700 dark:text-emerald-300 mb-1">
                      {row.decreeJo}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {row.decreeContent}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-slate-400 dark:text-slate-500 italic">
                    해당 없음
                  </div>
                )}
              </td>
              <td className="border-y border-slate-200 dark:border-slate-700 text-center text-slate-400 dark:text-slate-500 text-xs select-none" aria-hidden="true">
                →
              </td>
              <td className="border border-slate-200 dark:border-slate-700 px-4 py-3 align-top">
                {row.ruleJo ? (
                  <>
                    <div className="font-medium text-amber-700 dark:text-amber-300 mb-1">
                      {row.ruleJo}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {row.ruleContent}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-slate-400 dark:text-slate-500 italic">
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
