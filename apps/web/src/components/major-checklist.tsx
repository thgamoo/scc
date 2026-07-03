import { Checkbox } from "@workspace/ui/components/checkbox";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { AMS_MAJOR_COURSES, AMS_ELECTIVE_COURSES, GRADUATION_REQUIREMENTS } from "@/data/requirements";
import type { CompletedCourse } from "@/hooks/use-planner";

interface MajorChecklistProps {
  completedCourses: CompletedCourse[];
  onToggleCourse: (code: string, title: string, credits: number) => void;
}

const TYPE_LABELS: Record<string, string> = {
  foundation: "Foundation Courses",
  computing: "Computing Course (select 1)",
  required: "Required Upper Division",
  writing: "Writing Requirement",
};

const SPECIAL_ELECTIVES = ["AMS 475", "AMS 476", "AMS 487"];

export function MajorChecklist({ completedCourses, onToggleCourse }: MajorChecklistProps) {
  const completedCodes = completedCourses.map((c) => c.code);
  const types = ["foundation", "computing", "required", "writing"] as const;

  const isCompleted = (code: string) => completedCodes.includes(code);

  const isRequirementMet = (code: string, alternatives?: string[]) => {
    if (isCompleted(code)) return true;
    return alternatives?.some((alt) => isCompleted(alt)) ?? false;
  };

  // Find which code in the group is the one that's checked
  const getCheckedInGroup = (primary: string, alternatives?: string[]): string | null => {
    if (isCompleted(primary)) return primary;
    if (!alternatives) return null;
    return alternatives.find((alt) => isCompleted(alt)) ?? null;
  };

  const totalReqs = AMS_MAJOR_COURSES.length;
  const totalDone = AMS_MAJOR_COURSES.filter((c) =>
    isRequirementMet(c.code, c.alternatives)
  ).length;

  // Elective tracking
  const electivesDone = AMS_ELECTIVE_COURSES.filter((c) => isCompleted(c.code));
  const specialCount = electivesDone.filter((c) => SPECIAL_ELECTIVES.includes(c.code)).length;
  const electiveCredits = electivesDone.reduce((sum, c) => sum + c.credits, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">AMS Major Requirements</CardTitle>
          <Badge variant={totalDone >= totalReqs ? "default" : "secondary"}>
            {totalDone}/{totalReqs} required
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {types.map((type) => {
          const courses = AMS_MAJOR_COURSES.filter((c) => c.type === type);
          if (courses.length === 0) return null;
          return (
            <div key={type}>
              <h3 className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wide">
                {TYPE_LABELS[type]}
              </h3>
              <div className="space-y-1">
                {courses.map((course) => {
                  const primaryDone = isCompleted(course.code);
                  const checkedCode = getCheckedInGroup(course.code, course.alternatives);
                  const groupHasSelection = checkedCode !== null;
                  // Primary is disabled if an alternative is checked (not itself)
                  const primaryDisabled = groupHasSelection && !primaryDone;

                  return (
                    <div key={course.code} className="space-y-0.5">
                      {/* Primary course */}
                      <label
                        className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors ${
                          primaryDisabled
                            ? "cursor-not-allowed opacity-40"
                            : "hover:bg-muted/50 cursor-pointer"
                        }`}
                      >
                        <Checkbox
                          checked={primaryDone}
                          disabled={primaryDisabled}
                          onCheckedChange={() =>
                            onToggleCourse(course.code, course.name, course.credits)
                          }
                        />
                        <span className="flex flex-1 items-center gap-2">
                          <Badge
                            variant={primaryDone ? "default" : "outline"}
                            className="min-w-[72px] justify-center text-[10px]"
                          >
                            {course.code}
                          </Badge>
                          <span
                            className={`text-sm ${
                              primaryDisabled
                                ? "text-muted-foreground line-through"
                                : primaryDone
                                  ? "text-muted-foreground line-through"
                                  : ""
                            }`}
                          >
                            {course.name}
                          </span>
                          <span className="text-muted-foreground ml-auto text-xs">
                            {course.credits}cr
                          </span>
                        </span>
                      </label>
                      {/* Alternative courses as indented checkboxes */}
                      {course.alternatives && course.alternatives.length > 0 && (
                        <div className="ml-8 space-y-0.5">
                          <span className="text-muted-foreground px-2 text-[10px]">or</span>
                          {course.alternatives.map((alt) => {
                            const altDone = isCompleted(alt);
                            // Disabled if another option in the group is checked (not this one)
                            const altDisabled = groupHasSelection && !altDone;
                            return (
                              <label
                                key={alt}
                                className={`flex items-center gap-2.5 rounded-md px-2 py-1 transition-colors ${
                                  altDisabled
                                    ? "cursor-not-allowed opacity-40"
                                    : "hover:bg-muted/50 cursor-pointer"
                                }`}
                              >
                                <Checkbox
                                  checked={altDone}
                                  disabled={altDisabled}
                                  onCheckedChange={() =>
                                    onToggleCourse(alt, alt, course.credits)
                                  }
                                />
                                <Badge
                                  variant={altDone ? "default" : "outline"}
                                  className="min-w-[72px] justify-center text-[10px]"
                                >
                                  {alt}
                                </Badge>
                                <span
                                  className={`text-sm ${
                                    altDisabled
                                      ? "text-muted-foreground line-through"
                                      : altDone
                                        ? "text-muted-foreground line-through"
                                        : ""
                                  }`}
                                >
                                  {alt}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                      {course.note && (
                        <div className="text-muted-foreground ml-10 text-[10px]">
                          {course.note}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Upper Division Electives */}
        <div>
          <h3 className="text-muted-foreground mb-1 text-xs font-semibold uppercase tracking-wide">
            Upper Division Electives (6 courses, 18cr)
          </h3>
          <div className="mb-2 flex items-center gap-3 px-2">
            <Badge variant={electiveCredits >= GRADUATION_REQUIREMENTS.majorElectiveCredits ? "default" : "secondary"}>
              {electivesDone.length}/6 courses &middot; {electiveCredits}/18cr
            </Badge>
            {specialCount > GRADUATION_REQUIREMENTS.maxSpecialElectives && (
              <Badge variant="destructive" className="text-[10px]">
                Max 2 from AMS 475/476/487/non-AMS ({specialCount} selected)
              </Badge>
            )}
          </div>
          <div className="text-muted-foreground mb-2 px-2 text-[10px]">
            6 additional AMS 300+ level courses. Max 2 from: AMS 475, 476, 487, or non-AMS.
          </div>
          <div className="space-y-0.5">
            {AMS_ELECTIVE_COURSES.map((course) => {
              const done = isCompleted(course.code);
              const isSpecial = SPECIAL_ELECTIVES.includes(course.code);
              return (
                <label
                  key={course.code}
                  className="hover:bg-muted/50 flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1 transition-colors"
                >
                  <Checkbox
                    checked={done}
                    onCheckedChange={() =>
                      onToggleCourse(course.code, course.name, course.credits)
                    }
                  />
                  <span className="flex flex-1 items-center gap-2">
                    <Badge
                      variant={done ? "default" : "outline"}
                      className="min-w-[72px] justify-center text-[10px]"
                    >
                      {course.code}
                    </Badge>
                    <span className={`text-sm ${done ? "text-muted-foreground line-through" : ""}`}>
                      {course.name}
                    </span>
                    {isSpecial && (
                      <Badge variant="outline" className="text-[8px] px-1 py-0 text-orange-500">
                        limited
                      </Badge>
                    )}
                    <span className="text-muted-foreground ml-auto text-xs">
                      {course.credits}cr
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
