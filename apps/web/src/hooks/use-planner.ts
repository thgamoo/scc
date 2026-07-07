import { useState, useEffect, useCallback, useMemo } from "react";
import type { MajorType } from "@/data/requirements";
import { ALL_COURSES } from "@/data/courses";

export interface CompletedCourse {
  code: string; // e.g. "AMS 151"
  title: string;
  credits: number;
  grade?: string;
  sbcFulfilled?: string[];
}

export interface PlannerState {
  completedCourses: CompletedCourse[];
  selectedMajor: MajorType;
}

// Grade -> GPA points
const GRADE_POINTS: Record<string, number> = {
  "A": 4.0, "A-": 3.67,
  "B+": 3.33, "B": 3.0, "B-": 2.67,
  "C+": 2.33, "C": 2.0, "C-": 1.67,
  "D+": 1.33, "D": 1.0, "D-": 0.67,
  "F": 0.0,
};

export function gradeToPoints(grade: string): number | null {
  return GRADE_POINTS[grade] ?? null;
}

// Build a lookup map: course code -> course info
const COURSE_LOOKUP = new Map<string, { title: string; credits: number; sbc: string[] }>();
for (const c of ALL_COURSES) {
  const code = `${c.subject} ${c.courseNum}`;
  if (!COURSE_LOOKUP.has(code)) {
    COURSE_LOOKUP.set(code, { title: c.title, credits: c.credits, sbc: c.sbc });
  }
}

// Special non-catalog entries
const SPECIAL_ENTRIES: Record<string, { title: string; credits: number }> = {
  "Placement Level 9+": { title: "Math Placement Test Level 9+", credits: 0 },
  "EST 104": { title: "Projects/Technology & Society", credits: 2 },
  "EST 326": { title: "Management for Engineers", credits: 3 },
};

function lookupCourse(code: string, grade?: string): CompletedCourse {
  const found = COURSE_LOOKUP.get(code);
  if (found) {
    return { code, title: found.title, credits: found.credits, grade, sbcFulfilled: found.sbc };
  }
  const special = SPECIAL_ENTRIES[code];
  if (special) {
    return { code, title: special.title, credits: special.credits, grade };
  }
  return { code, title: code, credits: 0, grade };
}

// Default state pre-populated from transcript
const TRANSCRIPT_COURSES: CompletedCourse[] = [
  // Fall 2018
  lookupCourse("AMS 210", "A"),
  lookupCourse("AMS 310", "A"),
  lookupCourse("CSE 101", "A"),
  lookupCourse("CSE 114", "A"),
  lookupCourse("EST 104", "A"),
  lookupCourse("EST 326", "A-"),
  // Spring 2022
  lookupCourse("AMS 301", "A"),
  lookupCourse("CSE 214", "A"),
  lookupCourse("CSE 215", "A"),
  lookupCourse("POL 101", "A"),
  lookupCourse("SOC 247", "A"),
  lookupCourse("WRT 101", "A-"),
  // Fall 2022
  lookupCourse("CHI 111", "A"),
  lookupCourse("CSE 216", "B+"),
  lookupCourse("CSE 220", "A"),
  lookupCourse("CSE 303", "A"),
  lookupCourse("CSE 475", "A"),
  lookupCourse("KOR 220", "A"),
  // Placement
  lookupCourse("Placement Level 9+"),
];

const defaultState: PlannerState = {
  completedCourses: TRANSCRIPT_COURSES,
  selectedMajor: "cs",
};

function encodeToURL(state: PlannerState): void {
  const params = new URLSearchParams(window.location.search);
  if (state.completedCourses.length > 0) {
    const encoded = state.completedCourses.map((c) =>
      c.grade ? `${c.code}:${c.grade}` : c.code
    ).join(",");
    params.set("c", encoded);
  } else {
    params.delete("c");
  }
  if (state.selectedMajor !== "ams") {
    params.set("m", state.selectedMajor);
  } else {
    params.delete("m");
  }
  const qs = params.toString();
  const newURL = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  window.history.replaceState(null, "", newURL);
}

function decodeFromURL(): PlannerState | null {
  const params = new URLSearchParams(window.location.search);
  const coursesStr = params.get("c");
  if (!coursesStr) return null;

  const entries = coursesStr.split(",").filter(Boolean);
  const completedCourses = entries.map((entry) => {
    const lastColon = entry.lastIndexOf(":");
    if (lastColon > 0) {
      const code = entry.slice(0, lastColon);
      const grade = entry.slice(lastColon + 1);
      // Check if it looks like a grade (not part of course code)
      if (GRADE_POINTS[grade] !== undefined) {
        return lookupCourse(code, grade);
      }
    }
    return lookupCourse(entry);
  });
  const major = (params.get("m") as MajorType) || "ams";

  return { completedCourses, selectedMajor: major };
}

const STORAGE_KEY = "scc-planner-state";

function loadState(): PlannerState {
  const fromURL = decodeFromURL();
  if (fromURL) return fromURL;

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

  const totalCredits = useMemo(
    () => state.completedCourses.reduce((sum, c) => sum + c.credits, 0),
    [state.completedCourses]
  );

  const gpa = useMemo(() => {
    let totalPoints = 0;
    let totalUnits = 0;
    for (const c of state.completedCourses) {
      if (!c.grade || c.credits === 0) continue;
      const pts = gradeToPoints(c.grade);
      if (pts === null) continue;
      totalPoints += pts * c.credits;
      totalUnits += c.credits;
    }
    return totalUnits > 0 ? totalPoints / totalUnits : 0;
  }, [state.completedCourses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    encodeToURL(state);
  }, [state]);

  const addCourse = useCallback((course: CompletedCourse) => {
    setState((prev) => {
      if (prev.completedCourses.some((c) => c.code === course.code)) return prev;
      return { ...prev, completedCourses: [...prev.completedCourses, course] };
    });
  }, []);

  const removeCourse = useCallback((code: string) => {
    setState((prev) => {
      if (!prev.completedCourses.some((c) => c.code === code)) return prev;
      return { ...prev, completedCourses: prev.completedCourses.filter((c) => c.code !== code) };
    });
  }, []);

  const setGrade = useCallback((code: string, grade: string) => {
    setState((prev) => ({
      ...prev,
      completedCourses: prev.completedCourses.map((c) =>
        c.code === code ? { ...c, grade: grade || undefined } : c
      ),
    }));
  }, []);

  const setSelectedMajor = useCallback((major: MajorType) => {
    setState((prev) => ({ ...prev, selectedMajor: major }));
  }, []);

  const resetAll = useCallback(() => {
    setState({ completedCourses: [], selectedMajor: "ams" });
  }, []);

  return {
    state,
    totalCredits,
    gpa,
    addCourse,
    removeCourse,
    setGrade,
    setSelectedMajor,
    resetAll,
  };
}
