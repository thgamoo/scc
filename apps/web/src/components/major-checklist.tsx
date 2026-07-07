import { Checkbox } from "@workspace/ui/components/checkbox";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Star } from "lucide-react";
import { MAJOR_CONFIGS, MAJOR_LABELS, TYPE_LABELS } from "@/data/requirements";
import type { MajorType, MajorConfig } from "@/data/requirements";
import type { CompletedCourse } from "@/hooks/use-planner";
import type { SemesterKey } from "@/hooks/use-semester-plan";
import { PLANNED_CHECKBOX_CLASSES } from "@/lib/semester-colors";

interface MajorChecklistProps {
  majorType: MajorType;
  completedCourses: CompletedCourse[];
  onToggleCourse: (code: string, title: string, credits: number) => void;
  onChangeMajor: (major: MajorType) => void;
  plannedCourseMap: Map<string, SemesterKey>;
}

export function MajorChecklist({ majorType, completedCourses, onToggleCourse, onChangeMajor, plannedCourseMap }: MajorChecklistProps) {
  const config: MajorConfig = MAJOR_CONFIGS[majorType];
  const completedCodes = completedCourses.map((c) => c.code);

  const isCompleted = (code: string) => completedCodes.includes(code);
  const isPlanned = (code: string) => plannedCourseMap.has(code);
  const isChecked = (code: string) => isCompleted(code) || isPlanned(code);

  const isRequirementMet = (code: string, alternatives?: string[]) => {
    if (isChecked(code)) return true;
    return alternatives?.some((alt) => isChecked(alt)) ?? false;
  };

  const getCheckedInGroup = (primary: string, alternatives?: string[]): string | null => {
    if (isChecked(primary)) return primary;
    if (!alternatives) return null;
    return alternatives.find((alt) => isChecked(alt)) ?? null;
  };

  const getCheckboxColor = (code: string) => {
    const sem = plannedCourseMap.get(code);
    return sem ? PLANNED_CHECKBOX_CLASSES[sem] : undefined;
  };

  // Get unique course types in order of appearance
  const types = [...new Set(config.courses.map((c) => c.type))];

  const totalReqs = config.courses.length;
  const totalDone = config.courses.filter((c) =>
    isRequirementMet(c.code, c.alternatives)
  ).length;

  // Elective tracking
  const electivesDone = config.electives.filter((c) => isCompleted(c.code));
  const specialElectives = config.specialElectives ?? [];
  const specialCount = electivesDone.filter((c) => specialElectives.includes(c.code)).length;
  const electiveCredits = electivesDone.reduce((sum, c) => sum + c.credits, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">Major</CardTitle>
            <select
              value={majorType}
              onChange={(e) => onChangeMajor(e.target.value as MajorType)}
              className="border-input bg-background h-8 rounded-md border px-2 text-sm"
            >
              {(Object.entries(MAJOR_LABELS) as [MajorType, string][]).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <Badge variant={totalDone >= totalReqs ? "default" : "secondary"}>
            {totalDone}/{totalReqs} required
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {types.map((type) => {
          const courses = config.courses.filter((c) => c.type === type);
          if (courses.length === 0) return null;
          return (
            <div key={type}>
              <h3 className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wide">
                {TYPE_LABELS[type] ?? type}
              </h3>
              <div className="space-y-1">
                {courses.map((course) => {
                  const primaryDone = isCompleted(course.code);
                  const primaryMarked = isChecked(course.code);
                  const checkedCode = getCheckedInGroup(course.code, course.alternatives);
                  const groupHasSelection = checkedCode !== null;
                  const primaryDisabled = (groupHasSelection && !primaryMarked) || isPlanned(course.code);

                  return (
                    <div key={course.code} className="space-y-0.5">
                      <label
                        className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors ${
                          primaryDisabled
                            ? "cursor-not-allowed opacity-40"
                            : "hover:bg-muted/50 cursor-pointer"
                        }`}
                      >
                        <Checkbox
                          checked={primaryMarked}
                          disabled={primaryDisabled}
                          className={getCheckboxColor(course.code)}
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
                          {course.sbuOnly && (
                            <Star className="h-3.5 w-3.5 shrink-0 fill-blue-500 text-blue-500" />
                          )}
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
                      {course.alternatives && course.alternatives.length > 0 && (
                        <div className="ml-8 space-y-0.5">
                          <span className="text-muted-foreground px-2 text-[10px]">or</span>
                          {course.alternatives.map((alt) => {
                            const altMarked = isChecked(alt);
                            const altDisabled = (groupHasSelection && !altMarked) || isPlanned(alt);
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
                                  checked={altMarked}
                                  disabled={altDisabled}
                                  className={getCheckboxColor(alt)}
                                  onCheckedChange={() =>
                                    onToggleCourse(alt, alt, course.credits)
                                  }
                                />
                                <Badge
                                  variant={altMarked ? "default" : "outline"}
                                  className="min-w-[72px] justify-center text-[10px]"
                                >
                                  {alt}
                                </Badge>
                                <span
                                  className={`text-sm ${
                                    altDisabled
                                      ? "text-muted-foreground line-through"
                                      : altMarked
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

        {/* Electives */}
        <div>
          <h3 className="text-muted-foreground mb-1 text-xs font-semibold uppercase tracking-wide">
            {config.electiveLabel}
          </h3>
          <div className="mb-2 flex items-center gap-3 px-2">
            <Badge variant={electiveCredits >= config.electiveCredits ? "default" : "secondary"}>
              {electivesDone.length}/{config.electiveCount} courses &middot; {electiveCredits}/{config.electiveCredits}cr
            </Badge>
            {config.maxSpecialElectives && specialCount > config.maxSpecialElectives && (
              <Badge variant="destructive" className="text-[10px]">
                Max {config.maxSpecialElectives} from special electives ({specialCount} selected)
              </Badge>
            )}
          </div>
          {config.electiveNote && (
            <div className="text-muted-foreground mb-2 px-2 text-[10px]">
              {config.electiveNote}
            </div>
          )}
          <div className="space-y-0.5">
            {config.electives.map((course) => {
              const done = isCompleted(course.code);
              const marked = isChecked(course.code);
              const planned = isPlanned(course.code);
              const isSpecial = specialElectives.includes(course.code);
              return (
                <label
                  key={course.code}
                  className={`flex items-center gap-2.5 rounded-md px-2 py-1 transition-colors ${planned ? "cursor-not-allowed opacity-40" : "hover:bg-muted/50 cursor-pointer"}`}
                >
                  <Checkbox
                    checked={marked}
                    disabled={planned}
                    className={getCheckboxColor(course.code)}
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
        {/* Legend */}
        <div className="border-t pt-3 mt-3">
          <div className="flex items-center gap-1.5 text-muted-foreground text-[10px]">
            <Star className="h-3 w-3 fill-blue-500 text-blue-500" />
            <span>Must be taken at SBU/SUNY Korea</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
