import { useState, useEffect, useCallback } from "react";
import type { Course } from "@/data/requirements";
import { SPRING_2028_COURSES, FALL_2028_COURSES } from "@/data/courses";
import { SBU_FALL_2028_COURSES, SBU_SPRING_2029_COURSES } from "@/data/sbu-courses";
import { SBU_SUMMER_2028_COURSES } from "@/data/summer-courses";

export type SemesterKey = "spring2028" | "fall2028" | "sbuSummer2028" | "sbuFall2028" | "sbuSpring2029";

export interface SemesterPlan {
  spring2028: string[]; // classNbr list
  fall2028: string[];
  sbuSummer2028: string[];
  sbuFall2028: string[];
  sbuSpring2029: string[];
}

const STORAGE_KEY = "scc-semester-plan";

// URL param keys per semester (short to keep URLs compact)
const PLAN_URL_KEYS: Record<SemesterKey, string> = {
  spring2028: "ps",
  fall2028: "pf",
  sbuSummer2028: "psu",
  sbuFall2028: "psf",
  sbuSpring2029: "pss",
};

const URL_KEY_TO_SEMESTER = Object.fromEntries(
  Object.entries(PLAN_URL_KEYS).map(([k, v]) => [v, k as SemesterKey])
);

const defaultPlan: SemesterPlan = {
  spring2028: [],
  fall2028: [],
  sbuSummer2028: [],
  sbuFall2028: [],
  sbuSpring2029: [],
};

function encodePlanToURL(plan: SemesterPlan): void {
  const params = new URLSearchParams(window.location.search);
  for (const [sem, urlKey] of Object.entries(PLAN_URL_KEYS)) {
    const nbrs = plan[sem as SemesterKey];
    if (nbrs.length > 0) {
      params.set(urlKey, nbrs.join(","));
    } else {
      params.delete(urlKey);
    }
  }
  const qs = params.toString();
  window.history.replaceState(null, "", `${window.location.pathname}?${qs}`);
}

function decodePlanFromURL(): SemesterPlan | null {
  const params = new URLSearchParams(window.location.search);
  let found = false;
  const plan = { ...defaultPlan };
  for (const [urlKey, sem] of Object.entries(URL_KEY_TO_SEMESTER)) {
    const val = params.get(urlKey);
    if (val) {
      plan[sem] = val.split(",").filter(Boolean);
      found = true;
    }
  }
  return found ? plan : null;
}

function loadPlan(): SemesterPlan {
  const fromURL = decodePlanFromURL();
  if (fromURL) return fromURL;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultPlan, ...parsed };
    }
  } catch {
    // ignore
  }
  return defaultPlan;
}

const ALL_COURSES_MAP = new Map<string, Course>();
for (const c of [...SPRING_2028_COURSES, ...FALL_2028_COURSES, ...SBU_SUMMER_2028_COURSES, ...SBU_FALL_2028_COURSES, ...SBU_SPRING_2029_COURSES]) {
  ALL_COURSES_MAP.set(c.classNbr, c);
}

export function useSemesterPlan() {
  const [plan, setPlan] = useState<SemesterPlan>(loadPlan);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    encodePlanToURL(plan);
  }, [plan]);

  const getPlannedCourses = useCallback(
    (semester: SemesterKey): Course[] => {
      return plan[semester]
        .map((nbr) => ALL_COURSES_MAP.get(nbr))
        .filter((c): c is Course => c !== undefined);
    },
    [plan]
  );

  const addToPlan = useCallback(
    (semester: SemesterKey, classNbr: string) => {
      setPlan((prev) => {
        if (prev[semester].includes(classNbr)) return prev;
        return { ...prev, [semester]: [...prev[semester], classNbr] };
      });
    },
    []
  );

  const removeFromPlan = useCallback(
    (semester: SemesterKey, classNbr: string) => {
      setPlan((prev) => ({
        ...prev,
        [semester]: prev[semester].filter((n) => n !== classNbr),
      }));
    },
    []
  );

  const clearPlan = useCallback((semester: SemesterKey) => {
    setPlan((prev) => ({ ...prev, [semester]: [] }));
  }, []);

  return { plan, getPlannedCourses, addToPlan, removeFromPlan, clearPlan };
}
