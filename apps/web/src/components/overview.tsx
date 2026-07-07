import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { SBC_REQUIREMENTS, GRADUATION_REQUIREMENTS } from "@/data/requirements";
import type { PlannerState } from "@/hooks/use-planner";
import { useState } from "react";
import { Minus, RotateCcw, Copy, Check } from "lucide-react";

const GRADES = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"];

const SEMESTER_BAR_SEGMENTS = [
  { key: "spring2028", color: "bg-red-400/60", label: "Spring 2028" },
  { key: "sbuSummer2028", color: "bg-amber-400/60", label: "Summer 2028 (SBU)" },
  { key: "sbuFall2028", color: "bg-blue-400/60", label: "Fall 2028 (SBU)" },
  { key: "sbuSpring2029", color: "bg-emerald-400/60", label: "Spring 2029 (SBU)" },
];

interface OverviewProps {
  state: PlannerState;
  totalCredits: number;
  plannedCreditsBySem: Record<string, number>;
  plannedSBCsBySem: Record<string, number>;
  gpa: number;
  completedSBCs: string[];
  onSetGrade: (code: string, grade: string) => void;
  onRemoveCourse: (code: string) => void;
  onReset: () => void;
}

function CopyURLButton() {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 text-xs"
      onClick={() => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
      {copied ? "Copied!" : "Share URL"}
    </Button>
  );
}

export function Overview({ state, totalCredits, plannedCreditsBySem, plannedSBCsBySem, gpa, completedSBCs, onSetGrade, onRemoveCourse, onReset }: OverviewProps) {
  const { completedCourses } = state;
  const { totalCredits: reqCredits } = GRADUATION_REQUIREMENTS;

  const deeperCompleted = SBC_REQUIREMENTS.filter(
    (r) => r.category === "deeper" && completedSBCs.includes(r.code)
  ).length;
  const sbcTotal =
    SBC_REQUIREMENTS.filter((r) => r.category !== "deeper").length + 3;
  const sbcDone =
    SBC_REQUIREMENTS.filter(
      (r) => r.category !== "deeper" && completedSBCs.includes(r.code)
    ).length + Math.min(deeperCompleted, 3);

  const completedPercent = Math.min((totalCredits / reqCredits) * 100, 100);
  const plannedCredits = SEMESTER_BAR_SEGMENTS.reduce((s, seg) => s + (plannedCreditsBySem[seg.key] ?? 0), 0);

  // Build stacked segment offsets
  let offset = completedPercent;
  const segments = SEMESTER_BAR_SEGMENTS.map((seg) => {
    const credits = plannedCreditsBySem[seg.key] ?? 0;
    const pct = Math.min((credits / reqCredits) * 100, 100 - offset);
    const left = offset;
    offset += pct;
    return { ...seg, credits, pct, left };
  }).filter((s) => s.credits > 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Graduation Progress</CardTitle>
            <div className="flex items-center gap-1">
              <CopyURLButton />
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onReset}>
                <RotateCcw className="mr-1 h-3 w-3" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Credits progress */}
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span>Credits</span>
              <div className="flex items-center gap-2">
                {plannedCredits > 0 && (
                  <span className="text-muted-foreground text-xs">+{plannedCredits} planned</span>
                )}
                <span className="font-mono">
                  {totalCredits}/{reqCredits}
                </span>
              </div>
            </div>
            <div className="bg-secondary relative h-2 w-full overflow-hidden rounded-full">
              <div
                className="bg-primary absolute left-0 top-0 h-full rounded-full transition-all"
                style={{ width: `${completedPercent}%` }}
              />
              {segments.map((seg) => (
                <div
                  key={seg.key}
                  className={`absolute top-0 h-full transition-all ${seg.color}`}
                  style={{ left: `${seg.left}%`, width: `${seg.pct}%` }}
                />
              ))}
            </div>
            {segments.length > 0 && (
              <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
                {segments.map((seg) => (
                  <span key={seg.key} className="flex items-center gap-1">
                    <span className={`inline-block h-2 w-2 rounded-full ${seg.color.replace('/60', '')}`} />
                    {seg.label} +{seg.credits}cr
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* SBC progress */}
          <div>
            {(() => {
              const plannedSBCTotal = SEMESTER_BAR_SEGMENTS.reduce((s, seg) => s + (plannedSBCsBySem[seg.key] ?? 0), 0);
              const sbcCompletedPct = Math.min((sbcDone / sbcTotal) * 100, 100);
              let sbcOffset = sbcCompletedPct;
              const sbcSegments = SEMESTER_BAR_SEGMENTS.map((seg) => {
                const count = plannedSBCsBySem[seg.key] ?? 0;
                const pct = Math.min((count / sbcTotal) * 100, 100 - sbcOffset);
                const left = sbcOffset;
                sbcOffset += pct;
                return { ...seg, count, pct, left };
              }).filter((s) => s.count > 0);
              return (
                <>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span>SBC Requirements</span>
                    <div className="flex items-center gap-2">
                      {plannedSBCTotal > 0 && (
                        <span className="text-muted-foreground text-xs">+{plannedSBCTotal} planned</span>
                      )}
                      <span className="font-mono">
                        {sbcDone}/{sbcTotal}
                      </span>
                    </div>
                  </div>
                  <div className="bg-secondary relative h-2 w-full overflow-hidden rounded-full">
                    <div
                      className="bg-primary absolute left-0 top-0 h-full rounded-full transition-all"
                      style={{ width: `${sbcCompletedPct}%` }}
                    />
                    {sbcSegments.map((seg) => (
                      <div
                        key={seg.key}
                        className={`absolute top-0 h-full transition-all ${seg.color}`}
                        style={{ left: `${seg.left}%`, width: `${seg.pct}%` }}
                      />
                    ))}
                  </div>
                  {sbcSegments.length > 0 && (
                    <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
                      {sbcSegments.map((seg) => (
                        <span key={seg.key} className="flex items-center gap-1">
                          <span className={`inline-block h-2 w-2 rounded-full ${seg.color.replace('/60', '')}`} />
                          {seg.label} +{seg.count}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* GPA */}
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-muted-foreground text-xs">Cumulative GPA</div>
            <div className="mt-1 font-mono text-2xl">{gpa > 0 ? gpa.toFixed(3) : "—"}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            My Courses ({completedCourses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completedCourses.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No courses added yet. Use the Checklist tab to add courses.
            </p>
          ) : (
            <div className="space-y-1">
              {completedCourses.map((c) => (
                <div
                  key={c.code}
                  className="hover:bg-muted/50 flex items-center gap-2 rounded-md px-2 py-1 transition-colors"
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-5 w-5 p-0"
                    onClick={() => onRemoveCourse(c.code)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Badge variant="outline" className="text-[10px]">
                    {c.code}
                  </Badge>
                  <span className="min-w-0 flex-1 truncate text-xs">{c.title}</span>
                  <span className="text-muted-foreground shrink-0 text-xs">{c.credits}cr</span>
                  {c.credits > 0 && (
                    <select
                      value={c.grade ?? ""}
                      onChange={(e) => onSetGrade(c.code, e.target.value)}
                      className="border-input bg-background h-6 w-14 shrink-0 rounded border px-1 text-xs"
                    >
                      <option value="">—</option>
                      {GRADES.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  )}
                  {c.sbcFulfilled && c.sbcFulfilled.length > 0 && (
                    <div className="flex shrink-0 gap-0.5">
                      {c.sbcFulfilled.map((s) => (
                        <Badge key={s} className="text-[8px] px-1 py-0">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
