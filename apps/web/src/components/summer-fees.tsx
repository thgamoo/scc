import { useMemo } from "react";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import type { useSemesterPlan } from "@/hooks/use-semester-plan";

type SemesterPlanHook = ReturnType<typeof useSemesterPlan>;

// Summer 2026 rates (SBU)
const TUITION_PER_CREDIT = { resident: 295, outOfState: 1294 };
const COLLEGE_FEE_PER_CREDIT = 11.45;

// Per-session flat fees (undergrad)
const PER_SESSION_FEES: [string, number][] = [
  ["Activity", 35],
  ["Technology", 124],
  ["Academic Excellence", 47],
  ["Counseling & Health", 66],
  ["Transportation", 51.75],
  ["Recreation", 43.75],
  ["Career Development", 8.25],
];
const PER_SESSION_TOTAL = PER_SESSION_FEES.reduce((s, [, v]) => s + v, 0);

interface SummerFeesProps {
  planHook: SemesterPlanHook;
}

function fmt(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function SummerFees({ planHook }: SummerFeesProps) {
  const planned = planHook.getPlannedCourses("sbuSummer2028");

  const calc = useMemo(() => {
    if (planned.length === 0) return null;

    const totalCredits = planned.reduce((s, c) => s + c.credits, 0);

    // Determine which sessions are used
    const sessions = new Set<string>();
    for (const c of planned) {
      const note = c.note ?? "";
      if (note.includes("Session II")) sessions.add("II");
      else sessions.add("I");
    }
    const sessionCount = sessions.size;

    const tuitionRes = totalCredits * TUITION_PER_CREDIT.resident;
    const tuitionOOS = totalCredits * TUITION_PER_CREDIT.outOfState;
    const collegeFee = totalCredits * COLLEGE_FEE_PER_CREDIT;
    const sessionFees = PER_SESSION_TOTAL * sessionCount;
    const feesTotal = collegeFee + sessionFees;

    return {
      totalCredits,
      sessionCount,
      tuitionRes,
      tuitionOOS,
      collegeFee,
      sessionFees,
      feesTotal,
      totalRes: tuitionRes + feesTotal,
      totalOOS: tuitionOOS + feesTotal,
    };
  }, [planned]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Summer 2028 Fee Estimate</CardTitle>
        <p className="text-muted-foreground text-xs mt-1">
          Based on your Summer 2028 (SBU) planner. Rates from SBU Summer 2026.
        </p>
      </CardHeader>
      <CardContent>
        {!calc ? (
          <div className="text-muted-foreground flex h-32 items-center justify-center text-sm">
            Add courses to Summer 2028 (SBU) in the Planner tab to see fee estimates.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Course list */}
            <div className="space-y-0.5">
              {planned.map((c) => (
                <div key={c.classNbr} className="flex items-center gap-2 px-2 py-0.5 text-xs">
                  <Badge variant="outline" className="text-[10px] min-w-[64px] justify-center">
                    {c.subject} {c.courseNum}
                  </Badge>
                  <span className="min-w-0 flex-1 truncate">{c.title}</span>
                  <span className="text-muted-foreground shrink-0">{c.credits}cr</span>
                  <span className="text-muted-foreground shrink-0 text-[10px]">
                    {c.note?.match(/Session\s+\S+/)?.[0] ?? "Session I"}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="secondary">
                {planned.length} courses &middot; {calc.totalCredits}cr &middot; {calc.sessionCount === 2 ? "Session I & II" : "1 Session"}
              </Badge>
            </div>

            {/* Summary table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-left px-3 py-1.5 font-medium" />
                    <th className="text-right px-3 py-1.5 font-medium">NY Resident</th>
                    <th className="text-right px-3 py-1.5 font-medium">Out-of-State</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="px-3 py-1.5">
                      Tuition
                      <span className="text-muted-foreground ml-1">({calc.totalCredits}cr)</span>
                    </td>
                    <td className="text-right px-3 py-1.5 font-mono">${fmt(calc.tuitionRes)}</td>
                    <td className="text-right px-3 py-1.5 font-mono">${fmt(calc.tuitionOOS)}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-1.5">
                      Fees
                      <span className="text-muted-foreground ml-1">
                        (College ${COLLEGE_FEE_PER_CREDIT}/cr + ${fmt(PER_SESSION_TOTAL)}/session × {calc.sessionCount})
                      </span>
                    </td>
                    <td className="text-right px-3 py-1.5 font-mono" colSpan={2}>${fmt(calc.feesTotal)}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-muted/50 border-t font-semibold text-sm">
                    <td className="px-3 py-2">Total</td>
                    <td className="text-right px-3 py-2 font-mono">${fmt(calc.totalRes)}</td>
                    <td className="text-right px-3 py-2 font-mono">${fmt(calc.totalOOS)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Fee rate reference */}
            <details className="text-[10px] text-muted-foreground">
              <summary className="cursor-pointer hover:text-foreground">Fee Rates detail</summary>
              <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5 px-2">
                <span>College Fee</span><span className="text-right">${COLLEGE_FEE_PER_CREDIT}/cr</span>
                {PER_SESSION_FEES.map(([name, amt]) => (
                  <span key={name} className="contents">
                    <span>{name}</span><span className="text-right">${fmt(amt)}/session</span>
                  </span>
                ))}
              </div>
            </details>

            <p className="text-muted-foreground text-[10px] px-1">
              SBU Summer 2026 rates. International students may need additional health insurance. Actual charges may vary.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
