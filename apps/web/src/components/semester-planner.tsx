import { useMemo, useState } from "react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { SPRING_2028_COURSES, FALL_2028_COURSES, SEMESTER_LABELS } from "@/data/courses";
import { SBU_FALL_2028_COURSES, SBU_SPRING_2029_COURSES } from "@/data/sbu-courses";
import { SBU_SUMMER_2028_COURSES } from "@/data/summer-courses";
import type { Course } from "@/data/requirements";
import type { useSemesterPlan, SemesterKey } from "@/hooks/use-semester-plan";
import {
  getCourseSlots,
  findConflicts,
  getTimeBounds,
  formatTime,
  ALL_DAYS,
} from "@/lib/schedule";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Plus, X, AlertTriangle, Trash2 } from "lucide-react";

type SemesterPlanHook = ReturnType<typeof useSemesterPlan>;

interface SemesterPlannerProps {
  planHook: SemesterPlanHook;
  completedSBCs: string[];
  semester: SemesterKey;
  onSemesterChange: (s: SemesterKey) => void;
}

const COLORS = [
  "bg-blue-500/20 border-blue-500/40 text-blue-700 dark:text-blue-300",
  "bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300",
  "bg-purple-500/20 border-purple-500/40 text-purple-700 dark:text-purple-300",
  "bg-amber-500/20 border-amber-500/40 text-amber-700 dark:text-amber-300",
  "bg-rose-500/20 border-rose-500/40 text-rose-700 dark:text-rose-300",
  "bg-cyan-500/20 border-cyan-500/40 text-cyan-700 dark:text-cyan-300",
  "bg-orange-500/20 border-orange-500/40 text-orange-700 dark:text-orange-300",
  "bg-pink-500/20 border-pink-500/40 text-pink-700 dark:text-pink-300",
];

const PLANNER_SEMESTERS: SemesterKey[] = ["spring2028", "sbuSummer2028", "sbuFall2028", "sbuSpring2029"];

const SEMESTER_COURSES: Record<SemesterKey, Course[]> = {
  spring2028: SPRING_2028_COURSES,
  fall2028: FALL_2028_COURSES,
  sbuSummer2028: SBU_SUMMER_2028_COURSES,
  sbuFall2028: SBU_FALL_2028_COURSES,
  sbuSpring2029: SBU_SPRING_2029_COURSES,
};

export function SemesterPlanner({ planHook, completedSBCs, semester, onSemesterChange }: SemesterPlannerProps) {
  const { getPlannedCourses, addToPlan, removeFromPlan, clearPlan } = planHook;
  const [search, setSearch] = useState("");
  const [filter2cr, setFilter2cr] = useState(false);
  const [filter4cr, setFilter4cr] = useState(false);

  const allCourses = SEMESTER_COURSES[semester];
  const planned = getPlannedCourses(semester);

  const totalCredits = planned.reduce((sum, c) => sum + c.credits, 0);

  // Color map for planned courses
  const colorMap = useMemo(() => {
    const map = new Map<string, string>();
    planned.forEach((c, i) => {
      map.set(c.classNbr, COLORS[i % COLORS.length]);
    });
    return map;
  }, [planned]);

  // Conflict detection for each available course
  const conflictsFor = (course: Course): Course[] => findConflicts(planned, course);

  // Deduplicated available courses not yet planned
  const availableCourses = useMemo(() => {
    const plannedNbrs = new Set(planned.map((c) => c.classNbr));
    const seen = new Set<string>();
    return allCourses.filter((c) => {
      if (plannedNbrs.has(c.classNbr)) return false;
      // don't dedup here so user can pick specific sections
      const key = c.classNbr;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [allCourses, planned]);

  const filteredAvailable = useMemo(() => {
    let list = availableCourses;
    if (filter2cr || filter4cr) {
      list = list.filter((c) => (filter2cr && c.credits === 2) || (filter4cr && c.credits === 4));
    }
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        `${c.subject} ${c.courseNum}`.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        c.sbc.some((s) => s.toLowerCase().includes(q)) ||
        (c.note && c.note.toLowerCase().includes(q))
    );
  }, [availableCourses, search, filter2cr, filter4cr]);

  // Schedule grid
  const { earliest, latest } = useMemo(() => getTimeBounds(planned), [planned]);
  const hours = [];
  for (let t = earliest; t < latest; t += 60) {
    hours.push(t);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      {/* Schedule Grid */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Schedule</CardTitle>
            <div className="flex items-center gap-2">
              {PLANNER_SEMESTERS.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={semester === s ? "default" : "outline"}
                  onClick={() => onSemesterChange(s)}
                  className="h-7 text-xs"
                >
                  {SEMESTER_LABELS[s]}
                </Button>
              ))}
            </div>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant="secondary">
              {planned.length} courses &middot; {totalCredits}cr
            </Badge>
            {planned.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px]"
                onClick={() => clearPlan(semester)}
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {planned.length === 0 ? (
            <div className="text-muted-foreground flex h-48 items-center justify-center text-sm">
              Add courses from the list to build your schedule.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="grid min-w-[600px]" style={{ gridTemplateColumns: "60px repeat(5, 1fr)" }}>
                {/* Header */}
                <div />
                {ALL_DAYS.map((day) => (
                  <div
                    key={day}
                    className="border-border text-muted-foreground border-b px-1 pb-1 text-center text-xs font-medium"
                  >
                    {day}
                  </div>
                ))}
                {/* Time rows */}
                {hours.map((hour) => (
                  <div key={hour} className="contents">
                    <div className="text-muted-foreground border-border relative border-r pr-1 text-right text-[10px]" style={{ height: 60 }}>
                      <span className="absolute -top-1.5 right-1">{formatTime(hour)}</span>
                    </div>
                    {ALL_DAYS.map((day) => (
                      <div key={`${day}-${hour}`} className="border-border relative border-b border-l" style={{ height: 60 }} />
                    ))}
                  </div>
                ))}
              </div>
              {/* Course blocks overlaid */}
              <div className="relative" style={{ marginTop: -(hours.length * 60) }}>
                <div className="grid min-w-[600px]" style={{ gridTemplateColumns: "60px repeat(5, 1fr)" }}>
                  <div style={{ height: hours.length * 60 }} />
                  {ALL_DAYS.map((day) => {
                    const dayIdx = ALL_DAYS.indexOf(day);
                    const dayCourses = planned.filter((c) =>
                      getCourseSlots(c).some((s) => s.day === day)
                    );
                    return (
                      <div
                        key={`overlay-${day}`}
                        className="relative"
                        style={{
                          height: hours.length * 60,
                          gridColumn: dayIdx + 2,
                        }}
                      >
                        {dayCourses.map((c) => {
                          const slots = getCourseSlots(c).filter((s) => s.day === day);
                          return slots.map((slot, slotIdx) => {
                            const top = ((slot.start - earliest) / 60) * 60;
                            const height = ((slot.end - slot.start) / 60) * 60;
                            const color = colorMap.get(c.classNbr) ?? COLORS[0];
                            return (
                              <div
                                key={`${c.classNbr}-${day}-${slotIdx}`}
                                className={`absolute inset-x-0.5 overflow-hidden rounded border px-1 py-0.5 ${color}`}
                                style={{ top, height }}
                              >
                                <div className="truncate text-[10px] font-semibold">
                                  {c.subject} {c.courseNum}
                                </div>
                                {height > 30 && (
                                  <div className="truncate text-[9px] opacity-80">
                                    {formatTime(slot.start)}-{formatTime(slot.end)}
                                  </div>
                                )}
                                {height > 45 && (
                                  <div className="truncate text-[9px] opacity-70">
                                    {c.room}
                                  </div>
                                )}
                              </div>
                            );
                          });
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Planned course list */}
          {planned.length > 0 && (
            <div className="mt-4 space-y-1">
              {planned.map((c) => (
                <div
                  key={c.classNbr}
                  className="hover:bg-muted/50 flex items-center gap-2 rounded-md px-2 py-1 transition-colors"
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-5 w-5 p-0"
                    onClick={() => removeFromPlan(semester, c.classNbr)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <div
                    className={`h-3 w-3 shrink-0 rounded-sm border ${colorMap.get(c.classNbr) ?? ""}`}
                  />
                  <Badge variant="outline" className="text-[10px]">
                    {c.subject} {c.courseNum}
                  </Badge>
                  <span className="min-w-0 flex-1 truncate text-xs">{c.title}</span>
                  <span className="text-muted-foreground shrink-0 text-[10px]">
                    {c.days} {c.startTime && `${c.startTime}`}
                  </span>
                  <span className="text-muted-foreground shrink-0 text-xs">{c.credits}cr</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course picker */}
      <Card className="max-h-[calc(100svh-120px)] overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Add Courses</CardTitle>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-7 min-w-0 flex-1 rounded-md border px-2 text-xs transition-colors focus-visible:ring-1 focus-visible:outline-none"
            />
            <label className="flex shrink-0 items-center gap-1 text-[10px]">
              <Checkbox checked={filter2cr} onCheckedChange={(v) => setFilter2cr(!!v)} className="h-3.5 w-3.5" />
              2cr
            </label>
            <label className="flex shrink-0 items-center gap-1 text-[10px]">
              <Checkbox checked={filter4cr} onCheckedChange={(v) => setFilter4cr(!!v)} className="h-3.5 w-3.5" />
              4cr
            </label>
          </div>
        </CardHeader>
        <CardContent className="overflow-y-auto" style={{ maxHeight: "calc(100svh - 240px)" }}>
          <div className="space-y-0.5">
            {filteredAvailable.map((course) => {
              const code = `${course.subject} ${course.courseNum}`;
              const conflicts = conflictsFor(course);
              const hasTimeConflict = conflicts.length > 0;
              const fulfillsUnmetSBC = course.sbc.some((s) => !completedSBCs.includes(s));

              return (
                <div
                  key={course.classNbr}
                  className={`hover:bg-muted/50 flex items-center gap-1.5 rounded-md px-1.5 py-1 transition-colors ${hasTimeConflict ? "opacity-50" : ""}`}
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-5 w-5 shrink-0 p-0"
                    onClick={() => {
                      if (!hasTimeConflict) {
                        addToPlan(semester, course.classNbr);
                      }
                    }}
                    disabled={hasTimeConflict}
                  >
                    {hasTimeConflict ? (
                      <AlertTriangle className="h-3 w-3 text-orange-500" />
                    ) : (
                      <Plus className="h-3 w-3" />
                    )}
                  </Button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="shrink-0 text-[10px] font-semibold">{code}</span>
                      <span className="min-w-0 truncate text-[10px]">{course.title}</span>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-1 text-[9px]">
                      <span>{course.credits}cr</span>
                      <span>&middot;</span>
                      <span>{course.days} {course.startTime}</span>
                      <span>&middot;</span>
                      <span>{course.instructor}</span>
                      {course.note && (
                        <>
                          <span>&middot;</span>
                          <span className="text-orange-500">{course.note}</span>
                        </>
                      )}
                    </div>
                    {hasTimeConflict && (
                      <div className="text-[9px] text-orange-500">
                        Conflicts: {conflicts.map((c) => `${c.subject} ${c.courseNum}`).join(", ")}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col gap-0.5">
                    {course.sbc.length > 0 && (
                      <div className="flex gap-0.5">
                        {course.sbc.map((s) => (
                          <Badge
                            key={s}
                            variant={completedSBCs.includes(s) ? "secondary" : "default"}
                            className="px-1 py-0 text-[8px]"
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {fulfillsUnmetSBC && !hasTimeConflict && (
                      <span className="text-[8px] text-emerald-600">fills SBC</span>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredAvailable.length === 0 && (
              <p className="text-muted-foreground py-4 text-center text-xs">
                No courses found.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
