import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { SBC_REQUIREMENTS, GRADUATION_REQUIREMENTS } from "@/data/requirements";
import type { PlannerState } from "@/hooks/use-planner";
import { Minus, RotateCcw } from "lucide-react";

interface OverviewProps {
  state: PlannerState;
  onSetCredits: (credits: number) => void;
  onRemoveCourse: (code: string) => void;
  onReset: () => void;
}

export function Overview({ state, onSetCredits, onRemoveCourse, onReset }: OverviewProps) {
  const { completedCourses, completedSBCs, totalCredits } = state;
  const { totalCredits: reqCredits, upperDivisionCredits, minimumGPA } = GRADUATION_REQUIREMENTS;

  const deeperCompleted = SBC_REQUIREMENTS.filter(
    (r) => r.category === "deeper" && completedSBCs.includes(r.code)
  ).length;
  const sbcTotal =
    SBC_REQUIREMENTS.filter((r) => r.category !== "deeper").length + 3;
  const sbcDone =
    SBC_REQUIREMENTS.filter(
      (r) => r.category !== "deeper" && completedSBCs.includes(r.code)
    ).length + Math.min(deeperCompleted, 3);

  const creditPercent = Math.min((totalCredits / reqCredits) * 100, 100);
  const sbcPercent = Math.min((sbcDone / sbcTotal) * 100, 100);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Graduation Progress</CardTitle>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onReset}>
              <RotateCcw className="mr-1 h-3 w-3" />
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span>Total Credits</span>
              <span className="font-mono">
                {totalCredits}/{reqCredits}
              </span>
            </div>
            <Progress value={creditPercent} className="h-2" />
            <div className="mt-1.5 flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={200}
                value={totalCredits}
                onChange={(e) => onSetCredits(Number(e.target.value))}
                className="border-input bg-background h-7 w-20 rounded-md border px-2 text-xs"
              />
              <span className="text-muted-foreground text-[10px]">
                (manually adjust total)
              </span>
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span>SBC Requirements</span>
              <span className="font-mono">
                {sbcDone}/{sbcTotal}
              </span>
            </div>
            <Progress value={sbcPercent} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-muted-foreground text-xs">Upper Division</div>
              <div className="mt-1 font-mono text-lg">{upperDivisionCredits}cr required</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-muted-foreground text-xs">Min GPA</div>
              <div className="mt-1 font-mono text-lg">{minimumGPA.toFixed(1)}</div>
            </div>
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
              No courses added yet. Use the Course Browser or checklists to add courses.
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
                  <span className="text-muted-foreground text-xs">{c.credits}cr</span>
                  {c.sbcFulfilled && c.sbcFulfilled.length > 0 && (
                    <div className="flex gap-0.5">
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
