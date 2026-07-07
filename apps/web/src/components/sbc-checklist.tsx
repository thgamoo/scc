import { useMemo } from "react";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Check } from "lucide-react";
import { SBC_REQUIREMENTS } from "@/data/requirements";
import { ALL_COURSES } from "@/data/courses";
import { SBU_FALL_2028_COURSES, SBU_SPRING_2029_COURSES } from "@/data/sbu-courses";
import { SBU_SUMMER_2028_COURSES } from "@/data/summer-courses";
import type { CompletedCourse } from "@/hooks/use-planner";
import type { SemesterKey } from "@/hooks/use-semester-plan";
import { PLANNED_CHECK_BG } from "@/lib/semester-colors";

// Build code -> sbc lookup from all course catalogs
const CODE_TO_SBC = new Map<string, string[]>();
for (const c of [...ALL_COURSES, ...SBU_SUMMER_2028_COURSES, ...SBU_FALL_2028_COURSES, ...SBU_SPRING_2029_COURSES]) {
  const code = `${c.subject} ${c.courseNum}`;
  if (!CODE_TO_SBC.has(code) && c.sbc.length > 0) {
    CODE_TO_SBC.set(code, c.sbc);
  }
}

interface SBCChecklistProps {
  completedCourses: CompletedCourse[];
  plannedCourseMap: Map<string, SemesterKey>;
}

const CATEGORY_LABELS: Record<string, string> = {
  versatility: "Demonstrate Versatility",
  interconnectedness: "Explore Interconnectedness",
  deeper: "Pursue Deeper Understanding (3 of 4)",
  lifelong: "Prepare for Lifelong Learning",
};

export function SBCChecklist({ completedCourses, plannedCourseMap }: SBCChecklistProps) {
  const categories = ["versatility", "interconnectedness", "deeper", "lifelong"] as const;

  // Build SBC -> { courses, plannedSem } mapping
  const sbcInfo = useMemo(() => {
    const map: Record<string, { courses: string[]; plannedSem?: string }> = {};

    // From completed courses
    for (const course of completedCourses) {
      if (!course.sbcFulfilled) continue;
      for (const sbc of course.sbcFulfilled) {
        if (!map[sbc]) map[sbc] = { courses: [] };
        map[sbc].courses.push(course.code);
      }
    }

    // From planned courses (not already completed)
    const completedCodes = new Set(completedCourses.map((c) => c.code));
    for (const [code, sem] of plannedCourseMap) {
      if (completedCodes.has(code)) continue;
      const sbcs = CODE_TO_SBC.get(code) ?? [];
      for (const sbc of sbcs) {
        if (!map[sbc]) map[sbc] = { courses: [] };
        map[sbc].courses.push(code);
        if (!map[sbc].plannedSem) map[sbc].plannedSem = sem;
      }
    }

    return map;
  }, [completedCourses, plannedCourseMap]);

  const isFulfilled = (code: string) => (sbcInfo[code]?.courses.length ?? 0) > 0;

  const totalRequired = SBC_REQUIREMENTS.filter((r) => r.category !== "deeper").length + 3;
  const deeperCompleted = SBC_REQUIREMENTS.filter(
    (r) => r.category === "deeper" && isFulfilled(r.code)
  ).length;
  const totalCompleted =
    SBC_REQUIREMENTS.filter(
      (r) => r.category !== "deeper" && isFulfilled(r.code)
    ).length + Math.min(deeperCompleted, 3);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">SBC Requirements</CardTitle>
          <Badge variant={totalCompleted >= totalRequired ? "default" : "secondary"}>
            {totalCompleted}/{totalRequired}
          </Badge>
        </div>
        <p className="text-muted-foreground text-xs mt-1">
          Automatically tracked from your completed and planned courses.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {categories.map((cat) => {
          const reqs = SBC_REQUIREMENTS.filter((r) => r.category === cat);
          return (
            <div key={cat}>
              <h3 className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wide">
                {CATEGORY_LABELS[cat]}
              </h3>
              <div className="space-y-1">
                {reqs.map((req) => {
                  const info = sbcInfo[req.code];
                  const courses = info?.courses ?? [];
                  const fulfilled = courses.length > 0;
                  const sem = info?.plannedSem;
                  const checkBg = sem
                    ? PLANNED_CHECK_BG[sem]
                    : fulfilled
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30";
                  return (
                    <div key={req.code} className="space-y-0.5">
                      <div
                        className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 ${fulfilled ? "" : "opacity-50"}`}
                      >
                        <div
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${checkBg}`}
                        >
                          {fulfilled && <Check className="h-3 w-3" />}
                        </div>
                        <span className="flex flex-1 items-center gap-2">
                          <Badge
                            variant={fulfilled ? "default" : "outline"}
                            className="min-w-[52px] justify-center text-[10px]"
                          >
                            {req.code}
                          </Badge>
                          <span className={`text-sm ${fulfilled ? "text-muted-foreground line-through" : ""}`}>
                            {req.name}
                          </span>
                        </span>
                        {req.minGrade && (
                          <span className="text-muted-foreground ml-auto text-[10px]">
                            min {req.minGrade}
                          </span>
                        )}
                      </div>
                      {fulfilled && (
                        <div className="ml-10 flex items-center gap-1.5 px-2 pb-1">
                          <span className="text-muted-foreground shrink-0 text-[10px]">fulfilled by:</span>
                          <div className="flex flex-wrap gap-1">
                            {courses.map((code) => (
                              <Badge key={code} variant="secondary" className="text-[10px] px-1.5 py-0">
                                {code}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
