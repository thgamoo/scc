import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { usePlanner } from "@/hooks/use-planner";
import { useSemesterPlan } from "@/hooks/use-semester-plan";
import { SBCChecklist } from "@/components/sbc-checklist";
import { MajorChecklist } from "@/components/major-checklist";
import { CourseBrowser } from "@/components/course-browser";
import { Overview } from "@/components/overview";
import { SemesterPlanner } from "@/components/semester-planner";

export function App() {
  const { state, addCourse, removeCourse, toggleSBC, setSBCCourse, setTotalCredits, resetAll } =
    usePlanner();
  const semesterPlanHook = useSemesterPlan();

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
        <p className="text-muted-foreground text-sm">
          AMS Major &middot; Track your progress &middot; Plan your semesters
        </p>
      </header>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sbc">SBC</TabsTrigger>
          <TabsTrigger value="major">Major</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="planner">Planner</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Overview
            state={state}
            onSetCredits={setTotalCredits}
            onRemoveCourse={removeCourse}
            onReset={resetAll}
          />
        </TabsContent>

        <TabsContent value="sbc">
          <SBCChecklist
            completedSBCs={state.completedSBCs}
            sbcCourseMap={state.sbcCourseMap}
            onToggle={toggleSBC}
            onSetCourse={setSBCCourse}
          />
        </TabsContent>

        <TabsContent value="major">
          <MajorChecklist
            completedCourses={state.completedCourses}
            onToggleCourse={handleToggleMajorCourse}
          />
        </TabsContent>

        <TabsContent value="courses">
          <CourseBrowser
            completedCourses={state.completedCourses}
            completedSBCs={state.completedSBCs}
            onAddCourse={addCourse}
            onRemoveCourse={removeCourse}
          />
        </TabsContent>

        <TabsContent value="planner">
          <SemesterPlanner
            planHook={semesterPlanHook}
            completedSBCs={state.completedSBCs}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
