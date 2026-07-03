import { useState, useEffect, useCallback } from "react";
import type { Course } from "@/data/requirements";
import { SPRING_2026_COURSES, FALL_2026_COURSES } from "@/data/courses";

export interface SemesterPlan {
  spring2026: string[]; // classNbr list
  fall2026: string[];
}

const STORAGE_KEY = "scc-semester-plan";

const defaultPlan: SemesterPlan = {
  spring2026: [],
  fall2026: [],
};

function loadPlan(): SemesterPlan {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return defaultPlan;
}

const ALL_COURSES_MAP = new Map<string, Course>();
for (const c of [...SPRING_2026_COURSES, ...FALL_2026_COURSES]) {
  ALL_COURSES_MAP.set(c.classNbr, c);
}

export function useSemesterPlan() {
  const [plan, setPlan] = useState<SemesterPlan>(loadPlan);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  }, [plan]);

  const getPlannedCourses = useCallback(
    (semester: "spring2026" | "fall2026"): Course[] => {
      return plan[semester]
        .map((nbr) => ALL_COURSES_MAP.get(nbr))
        .filter((c): c is Course => c !== undefined);
    },
    [plan]
  );

  const addToPlan = useCallback(
    (semester: "spring2026" | "fall2026", classNbr: string) => {
      setPlan((prev) => {
        if (prev[semester].includes(classNbr)) return prev;
        return { ...prev, [semester]: [...prev[semester], classNbr] };
      });
    },
    []
  );

  const removeFromPlan = useCallback(
    (semester: "spring2026" | "fall2026", classNbr: string) => {
      setPlan((prev) => ({
        ...prev,
        [semester]: prev[semester].filter((n) => n !== classNbr),
      }));
    },
    []
  );

  const clearPlan = useCallback((semester: "spring2026" | "fall2026") => {
    setPlan((prev) => ({ ...prev, [semester]: [] }));
  }, []);

  return { plan, getPlannedCourses, addToPlan, removeFromPlan, clearPlan };
}
