import { useMemo, useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { usePlanner } from "@/hooks/use-planner";
import { useSemesterPlan, type SemesterKey } from "@/hooks/use-semester-plan";
import { ALL_COURSES } from "@/data/courses";
import { SBU_SUMMER_2028_COURSES } from "@/data/summer-courses";
import { SBU_FALL_2028_COURSES, SBU_SPRING_2029_COURSES } from "@/data/sbu-courses";
import { SBCChecklist } from "@/components/sbc-checklist";
import { MajorChecklist } from "@/components/major-checklist";
import { CourseBrowser } from "@/components/course-browser";
import { Overview } from "@/components/overview";
import { SemesterPlanner } from "@/components/semester-planner";
import { SummerFees } from "@/components/summer-fees";

function getInitialTab(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get("tab") ?? "overview";
}

function getInitialSubTab(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get("sub") ?? "courses";
}

function getInitialSemester(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get("sem") ?? "spring2028";
}

function syncTabToURL(tab: string, subTab?: string, sem?: string) {
  const params = new URLSearchParams(window.location.search);
  params.set("tab", tab);
  if (subTab) {
    params.set("sub", subTab);
  } else {
    params.delete("sub");
  }
  if (sem) {
    params.set("sem", sem);
  } else {
    params.delete("sem");
  }
  const qs = params.toString();
  window.history.replaceState(null, "", `${window.location.pathname}?${qs}`);
}

export function App() {
  const { state, totalCredits, gpa, addCourse, removeCourse, setGrade, setSelectedMajor, resetAll } =
    usePlanner();
  const semesterPlanHook = useSemesterPlan();

  const [tab, setTab] = useState(getInitialTab);
  const [subTab, setSubTab] = useState(getInitialSubTab);
  const [plannerSem, setPlannerSem] = useState<SemesterKey>(getInitialSemester() as SemesterKey);

  const handleTabChange = useCallback((value: string) => {
    setTab(value);
    syncTabToURL(value, value === "checklist" ? subTab : undefined, value === "planner" ? plannerSem : undefined);
  }, [subTab, plannerSem]);

  const handleSubTabChange = useCallback((value: string) => {
    setSubTab(value);
    syncTabToURL("checklist", value);
  }, []);

  const handleSemesterChange = useCallback((value: SemesterKey) => {
    setPlannerSem(value);
    syncTabToURL("planner", undefined, value);
  }, []);

  // Sync tab to URL on mount
  useEffect(() => {
    syncTabToURL(tab, tab === "checklist" ? subTab : undefined, tab === "planner" ? plannerSem : undefined);
  }, []);

  // Derive completedSBCs from courses
  const completedSBCs = useMemo(
    () => [...new Set(state.completedCourses.flatMap((c) => c.sbcFulfilled ?? []))],
    [state.completedCourses]
  );

  // Map of course code -> planned semester
  const plannedCourseMap = useMemo(() => {
    const map = new Map<string, SemesterKey>();
    const semesters: SemesterKey[] = ["spring2028", "sbuSummer2028", "sbuFall2028", "sbuSpring2029"];
    for (const sem of semesters) {
      for (const c of semesterPlanHook.getPlannedCourses(sem)) {
        const code = `${c.subject} ${c.courseNum}`;
        if (!map.has(code)) map.set(code, sem);
      }
    }
    return map;
  }, [semesterPlanHook]);

  // Planned credits per semester
  const plannedCreditsBySem = useMemo(() => {
    const completedCodes = new Set(state.completedCourses.map((c) => c.code));
    const result: Record<string, number> = { spring2028: 0, sbuSummer2028: 0, sbuFall2028: 0, sbuSpring2029: 0 };
    for (const [code, sem] of plannedCourseMap) {
      if (completedCodes.has(code)) continue;
      const course = semesterPlanHook.getPlannedCourses(sem).find(
        (c) => `${c.subject} ${c.courseNum}` === code
      );
      if (course) result[sem] = (result[sem] ?? 0) + course.credits;
    }
    return result;
  }, [state.completedCourses, plannedCourseMap, semesterPlanHook]);

  // Planned SBCs per semester (for overview progress bar)
  const plannedSBCsBySem = useMemo(() => {
    const codeToSbc = new Map<string, string[]>();
    for (const c of [...ALL_COURSES, ...SBU_SUMMER_2028_COURSES, ...SBU_FALL_2028_COURSES, ...SBU_SPRING_2029_COURSES]) {
      const code = `${c.subject} ${c.courseNum}`;
      if (!codeToSbc.has(code) && c.sbc.length > 0) codeToSbc.set(code, c.sbc);
    }
    const completedCodes = new Set(state.completedCourses.map((c) => c.code));
    const result: Record<string, Set<string>> = {};
    for (const [code, sem] of plannedCourseMap) {
      if (completedCodes.has(code)) continue;
      const sbcs = codeToSbc.get(code) ?? [];
      for (const sbc of sbcs) {
        if (completedSBCs.includes(sbc)) continue;
        if (!result[sem]) result[sem] = new Set();
        result[sem].add(sbc);
      }
    }
    // Convert to counts, removing duplicates across semesters (earlier semester wins)
    const seen = new Set<string>();
    const counts: Record<string, number> = {};
    const order: SemesterKey[] = ["spring2028", "sbuSummer2028", "sbuFall2028", "sbuSpring2029"];
    for (const sem of order) {
      let count = 0;
      for (const sbc of result[sem] ?? []) {
        if (!seen.has(sbc)) { seen.add(sbc); count++; }
      }
      if (count > 0) counts[sem] = count;
    }
    return counts;
  }, [state.completedCourses, plannedCourseMap, completedSBCs]);

  const handleToggleMajorCourse = (code: string, title: string, credits: number) => {
    if (state.completedCourses.some((c) => c.code === code)) {
      removeCourse(code);
    } else {
      addCourse({ code, title, credits });
    }
  };

  return (
    <div className="mx-auto min-h-svh max-w-6xl p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">SUNY Korea Graduation Planner</h1>
      </header>

      <Tabs value={tab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="planner">Planner</TabsTrigger>
          <TabsTrigger value="fees">Summer Fees</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Overview
            state={state}
            totalCredits={totalCredits}
            plannedCreditsBySem={plannedCreditsBySem}
            plannedSBCsBySem={plannedSBCsBySem}
            gpa={gpa}
            completedSBCs={completedSBCs}
            onSetGrade={setGrade}
            onRemoveCourse={removeCourse}
            onReset={resetAll}
          />
        </TabsContent>

        <TabsContent value="checklist">
          <Tabs value={subTab} onValueChange={handleSubTabChange} className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="courses">My Courses</TabsTrigger>
                <TabsTrigger value="major">Major</TabsTrigger>
                <TabsTrigger value="sbc">SBC</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary" />
                  Completed
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-500" />
                  Spring 2028
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-500" />
                  Summer 2028
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm bg-blue-500" />
                  Fall 2028
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                  Spring 2029
                </span>
              </div>
            </div>

            <TabsContent value="courses">
              <CourseBrowser
                completedCourses={state.completedCourses}
                completedSBCs={completedSBCs}
                onAddCourse={addCourse}
                onRemoveCourse={removeCourse}
                plannedCourseMap={plannedCourseMap}
              />
            </TabsContent>

            <TabsContent value="major">
              <MajorChecklist
                majorType={state.selectedMajor}
                completedCourses={state.completedCourses}
                onToggleCourse={handleToggleMajorCourse}
                onChangeMajor={setSelectedMajor}
                plannedCourseMap={plannedCourseMap}
              />
            </TabsContent>

            <TabsContent value="sbc">
              <SBCChecklist
                completedCourses={state.completedCourses}
                plannedCourseMap={plannedCourseMap}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="planner">
          <SemesterPlanner
            planHook={semesterPlanHook}
            completedSBCs={completedSBCs}
            semester={plannerSem}
            onSemesterChange={handleSemesterChange}
          />
        </TabsContent>

        <TabsContent value="fees">
          <SummerFees planHook={semesterPlanHook} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
