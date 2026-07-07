import { useState, useMemo } from "react";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { ALL_COURSES } from "@/data/courses";
import type { CompletedCourse } from "@/hooks/use-planner";
import type { SemesterKey } from "@/hooks/use-semester-plan";
import { PLANNED_CHECKBOX_CLASSES } from "@/lib/semester-colors";

interface CourseBrowserProps {
  completedCourses: CompletedCourse[];
  completedSBCs: string[];
  onAddCourse: (course: CompletedCourse) => void;
  onRemoveCourse: (code: string) => void;
  plannedCourseMap: Map<string, SemesterKey>;
}

// Deduplicate by subject+courseNum across all semesters
const UNIQUE_COURSES = (() => {
  const seen = new Set<string>();
  return ALL_COURSES.filter((c) => {
    const key = `${c.subject} ${c.courseNum}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
})();

export function CourseBrowser({
  completedCourses,
  completedSBCs,
  onAddCourse,
  onRemoveCourse,
  plannedCourseMap,
}: CourseBrowserProps) {
  const [search, setSearch] = useState("");

  const completedCodes = completedCourses.map((c) => c.code);

  const filteredCourses = useMemo(() => {
    if (!search) return UNIQUE_COURSES;
    const q = search.toLowerCase();
    return UNIQUE_COURSES.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        `${c.subject} ${c.courseNum}`.toLowerCase().includes(q) ||
        c.sbc.some((s) => s.toLowerCase().includes(q))
    );
  }, [search]);

  const completedCount = UNIQUE_COURSES.filter((c) =>
    completedCodes.includes(`${c.subject} ${c.courseNum}`)
  ).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">My Courses</CardTitle>
          <Badge variant="secondary">
            {completedCount} completed
          </Badge>
        </div>
        <input
          type="text"
          placeholder="Search by course name, code, or SBC..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring mt-2 flex h-8 w-full rounded-md border px-3 py-1 text-sm transition-colors focus-visible:ring-1 focus-visible:outline-none"
        />
      </CardHeader>
      <CardContent>
        {/* Placement & Exemptions */}
        <div className="mb-3 border-b pb-3">
          <h3 className="text-muted-foreground mb-1.5 text-xs font-semibold uppercase tracking-wide">
            Placement & Exemptions
          </h3>
          <label className="hover:bg-muted/50 flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors">
            <Checkbox
              checked={completedCodes.includes("Placement Level 9+")}
              onCheckedChange={(checked) => {
                if (checked) {
                  onAddCourse({ code: "Placement Level 9+", title: "Math Placement Test Level 9+", credits: 0 });
                } else {
                  onRemoveCourse("Placement Level 9+");
                }
              }}
            />
            <span className="text-sm">Math Placement Test Level 9+</span>
            <span className="text-muted-foreground ml-auto text-xs">Exempts AMS 151, AMS 161</span>
          </label>
        </div>

        <div className="space-y-0.5">
          {filteredCourses.length === 0 && (
            <p className="text-muted-foreground py-4 text-center text-sm">
              No courses found.
            </p>
          )}
          {filteredCourses.map((course) => {
            const code = `${course.subject} ${course.courseNum}`;
            const done = completedCodes.includes(code);
            const plannedSem = plannedCourseMap.get(code);
            const isPlanned = !!plannedSem;
            const checkboxColor = plannedSem ? PLANNED_CHECKBOX_CLASSES[plannedSem] : undefined;
            return (
              <label
                key={code}
                className="hover:bg-muted/50 flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors"
              >
                <Checkbox
                  checked={done || isPlanned}
                  className={checkboxColor}
                  onCheckedChange={() => {
                    if (done) {
                      onRemoveCourse(code);
                    } else if (!isPlanned) {
                      onAddCourse({
                        code,
                        title: course.title,
                        credits: course.credits,
                        sbcFulfilled: course.sbc,
                      });
                    }
                  }}
                />
                <Badge
                  variant={done ? "default" : "outline"}
                  className="min-w-[72px] justify-center text-[10px]"
                >
                  {code}
                </Badge>
                <span
                  className={`min-w-0 flex-1 truncate text-sm ${done ? "text-muted-foreground line-through" : ""}`}
                >
                  {course.title}
                </span>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {course.credits}cr
                </span>
                {course.sbc.length > 0 && (
                  <div className="flex shrink-0 gap-0.5">
                    {course.sbc.map((s) => (
                      <Badge
                        key={s}
                        variant={completedSBCs.includes(s) ? "secondary" : "default"}
                        className="text-[9px] px-1 py-0"
                      >
                        {s}
                      </Badge>
                    ))}
                  </div>
                )}
              </label>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
