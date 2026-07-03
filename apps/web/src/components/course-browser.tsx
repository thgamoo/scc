import { useState, useMemo } from "react";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { SPRING_2026_COURSES, FALL_2026_COURSES, SEMESTER_LABELS } from "@/data/courses";
import type { CompletedCourse } from "@/hooks/use-planner";
import type { Course } from "@/data/requirements";
import { Plus, Minus } from "lucide-react";

interface CourseBrowserProps {
  completedCourses: CompletedCourse[];
  completedSBCs: string[];
  onAddCourse: (course: CompletedCourse) => void;
  onRemoveCourse: (code: string) => void;
}

export function CourseBrowser({
  completedCourses,
  completedSBCs,
  onAddCourse,
  onRemoveCourse,
}: CourseBrowserProps) {
  const [semester, setSemester] = useState<"spring2026" | "fall2026">("fall2026");
  const [filter, setFilter] = useState<"all" | "major" | "sbc" | "recommended">("recommended");
  const [search, setSearch] = useState("");

  const completedCodes = completedCourses.map((c) => c.code);

  const courses = semester === "spring2026" ? SPRING_2026_COURSES : FALL_2026_COURSES;

  // Deduplicate courses by subject+courseNum (keep first section)
  const uniqueCourses = useMemo(() => {
    const seen = new Set<string>();
    return courses.filter((c) => {
      const key = `${c.subject} ${c.courseNum}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [courses]);

  const filteredCourses = useMemo(() => {
    let result = uniqueCourses;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          `${c.subject} ${c.courseNum}`.toLowerCase().includes(q) ||
          c.instructor.toLowerCase().includes(q)
      );
    }

    if (filter === "major") {
      result = result.filter((c) => c.subject === "AMS");
    } else if (filter === "sbc") {
      result = result.filter(
        (c) => c.sbc.length > 0 && c.sbc.some((s) => !completedSBCs.includes(s))
      );
    } else if (filter === "recommended") {
      result = result.filter((c) => {
        const code = `${c.subject} ${c.courseNum}`;
        if (completedCodes.includes(code)) return false;
        // Show if it fulfills unmet SBCs or is an AMS course
        const fulfillsUnmetSBC = c.sbc.some((s) => !completedSBCs.includes(s));
        const isMajor = c.subject === "AMS";
        return fulfillsUnmetSBC || isMajor;
      });
    }

    return result;
  }, [uniqueCourses, filter, search, completedSBCs, completedCodes]);

  const isCompleted = (c: Course) => completedCodes.includes(`${c.subject} ${c.courseNum}`);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Course Browser</CardTitle>
        <div className="mt-2 flex flex-wrap gap-2">
          <div className="flex gap-1">
            {(["spring2026", "fall2026"] as const).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={semester === s ? "default" : "outline"}
                onClick={() => setSemester(s)}
                className="h-7 text-xs"
              >
                {SEMESTER_LABELS[s]}
              </Button>
            ))}
          </div>
          <div className="flex gap-1">
            {(
              [
                ["all", "All"],
                ["major", "AMS"],
                ["sbc", "Unmet SBC"],
                ["recommended", "Recommended"],
              ] as const
            ).map(([key, label]) => (
              <Button
                key={key}
                size="sm"
                variant={filter === key ? "default" : "outline"}
                onClick={() => setFilter(key as typeof filter)}
                className="h-7 text-xs"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring mt-2 flex h-8 w-full rounded-md border px-3 py-1 text-sm transition-colors focus-visible:ring-1 focus-visible:outline-none"
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {filteredCourses.length === 0 && (
            <p className="text-muted-foreground py-4 text-center text-sm">
              No courses found.
            </p>
          )}
          {filteredCourses.map((course) => {
            const code = `${course.subject} ${course.courseNum}`;
            const done = isCompleted(course);
            return (
              <div
                key={course.classNbr}
                className={`hover:bg-muted/50 flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors ${done ? "opacity-50" : ""}`}
              >
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => {
                    if (done) {
                      onRemoveCourse(code);
                    } else {
                      onAddCourse({
                        code,
                        title: course.title,
                        credits: course.credits,
                        semester: course.semester,
                        sbcFulfilled: course.sbc,
                      });
                    }
                  }}
                >
                  {done ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                </Button>
                <Badge variant="outline" className="min-w-[72px] justify-center text-[10px]">
                  {code}
                </Badge>
                <span className="min-w-0 flex-1 truncate text-sm">{course.title}</span>
                <span className="text-muted-foreground shrink-0 text-xs">{course.credits}cr</span>
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
                <span className="text-muted-foreground hidden w-20 shrink-0 truncate text-right text-[10px] sm:block">
                  {course.days} {course.startTime}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
