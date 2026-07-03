import { useState, useEffect, useCallback } from "react";

export interface CompletedCourse {
  code: string; // e.g. "AMS 151"
  title: string;
  credits: number;
  grade?: string;
  semester?: string;
  sbcFulfilled?: string[];
}

export interface PlannerState {
  completedCourses: CompletedCourse[];
  completedSBCs: string[];
  sbcCourseMap: Record<string, string>; // SBC code -> course name that fulfilled it
  totalCredits: number;
  currentSemester: string;
}

const STORAGE_KEY = "scc-planner-state";

const defaultState: PlannerState = {
  completedCourses: [],
  completedSBCs: [],
  sbcCourseMap: {},
  totalCredits: 0,
  currentSemester: "fall2026",
};

function loadState(): PlannerState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultState, ...parsed };
    }
  } catch {
    // ignore
  }
  return defaultState;
}

export function usePlanner() {
  const [state, setState] = useState<PlannerState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addCourse = useCallback((course: CompletedCourse) => {
    setState((prev) => {
      if (prev.completedCourses.some((c) => c.code === course.code)) return prev;
      const newCourses = [...prev.completedCourses, course];
      const newSBCs = [...new Set([...prev.completedSBCs, ...(course.sbcFulfilled ?? [])])];
      return {
        ...prev,
        completedCourses: newCourses,
        completedSBCs: newSBCs,
        totalCredits: prev.totalCredits + course.credits,
      };
    });
  }, []);

  const removeCourse = useCallback((code: string) => {
    setState((prev) => {
      const course = prev.completedCourses.find((c) => c.code === code);
      if (!course) return prev;
      const newCourses = prev.completedCourses.filter((c) => c.code !== code);
      const newSBCs = [...new Set(newCourses.flatMap((c) => c.sbcFulfilled ?? []))];
      return {
        ...prev,
        completedCourses: newCourses,
        completedSBCs: newSBCs,
        totalCredits: prev.totalCredits - course.credits,
      };
    });
  }, []);

  const toggleSBC = useCallback((sbc: string) => {
    setState((prev) => {
      if (prev.completedSBCs.includes(sbc)) {
        const newMap = { ...prev.sbcCourseMap };
        delete newMap[sbc];
        return {
          ...prev,
          completedSBCs: prev.completedSBCs.filter((s) => s !== sbc),
          sbcCourseMap: newMap,
        };
      }
      return {
        ...prev,
        completedSBCs: [...prev.completedSBCs, sbc],
      };
    });
  }, []);

  const setSBCCourse = useCallback((sbc: string, courseName: string) => {
    setState((prev) => ({
      ...prev,
      sbcCourseMap: { ...prev.sbcCourseMap, [sbc]: courseName },
    }));
  }, []);

  const setTotalCredits = useCallback((credits: number) => {
    setState((prev) => ({ ...prev, totalCredits: credits }));
  }, []);

  const resetAll = useCallback(() => {
    setState(defaultState);
  }, []);

  return {
    state,
    addCourse,
    removeCourse,
    toggleSBC,
    setSBCCourse,
    setTotalCredits,
    resetAll,
  };
}
