import type { Course } from "@/data/requirements";

const DAY_MAP: Record<string, string[]> = {
  M: ["Mon"],
  TU: ["Tue"],
  W: ["Wed"],
  TH: ["Thu"],
  F: ["Fri"],
  MW: ["Mon", "Wed"],
  TUTH: ["Tue", "Thu"],
  WF: ["Wed", "Fri"],
  MWF: ["Mon", "Wed", "Fri"],
  APPT: [],
  HTBA: [],
};

export const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;

export function parseDays(days: string): string[] {
  if (DAY_MAP[days]) return DAY_MAP[days];
  // fallback: try splitting common patterns
  const result: string[] = [];
  let remaining = days;
  // order matters: check TU/TH before T
  for (const [key, vals] of Object.entries(DAY_MAP)) {
    if (remaining.includes(key)) {
      result.push(...vals);
      remaining = remaining.replace(key, "");
    }
  }
  return [...new Set(result)];
}

/** Parse "9:00 AM" -> minutes from midnight */
export function parseTime(time: string): number {
  if (!time || time === "1:00 AM") return -1; // APPT placeholder
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return -1;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

export interface TimeSlot {
  day: string;
  start: number; // minutes from midnight
  end: number;
}

export function getCourseSlots(course: Course): TimeSlot[] {
  const days = parseDays(course.days);
  const start = parseTime(course.startTime);
  const end = parseTime(course.endTime);
  if (start < 0 || end < 0 || days.length === 0) return [];
  return days.map((day) => ({ day, start, end }));
}

export function hasConflict(a: TimeSlot[], b: TimeSlot[]): boolean {
  for (const slotA of a) {
    for (const slotB of b) {
      if (slotA.day === slotB.day) {
        if (slotA.start < slotB.end && slotB.start < slotA.end) {
          return true;
        }
      }
    }
  }
  return false;
}

export function findConflicts(
  courses: Course[],
  newCourse: Course
): Course[] {
  const newSlots = getCourseSlots(newCourse);
  if (newSlots.length === 0) return [];
  return courses.filter((c) => {
    const existingSlots = getCourseSlots(c);
    return hasConflict(existingSlots, newSlots);
  });
}

/** Get the earliest and latest times across a list of courses for grid bounds */
export function getTimeBounds(courses: Course[]): { earliest: number; latest: number } {
  let earliest = 24 * 60;
  let latest = 0;
  for (const c of courses) {
    const start = parseTime(c.startTime);
    const end = parseTime(c.endTime);
    if (start >= 0 && start < earliest) earliest = start;
    if (end >= 0 && end > latest) latest = end;
  }
  // Default to 9am-6pm if no courses
  if (earliest >= latest) {
    earliest = 9 * 60;
    latest = 18 * 60;
  }
  // Round to hours
  earliest = Math.floor(earliest / 60) * 60;
  latest = Math.ceil(latest / 60) * 60;
  return { earliest, latest };
}

export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}
