// Checkbox color overrides for planned semesters
// These override the default primary color when the checkbox is checked
export const PLANNED_CHECKBOX_CLASSES: Record<string, string> = {
  spring2028: "data-checked:border-red-500 data-checked:bg-red-500",
  sbuSummer2028: "data-checked:border-amber-500 data-checked:bg-amber-500",
  sbuFall2028: "data-checked:border-blue-500 data-checked:bg-blue-500",
  sbuSpring2029: "data-checked:border-emerald-500 data-checked:bg-emerald-500",
};

// For the SBC checklist's custom check indicator (not using Checkbox component)
export const PLANNED_CHECK_BG: Record<string, string> = {
  spring2028: "border-red-500 bg-red-500 text-white",
  sbuSummer2028: "border-amber-500 bg-amber-500 text-white",
  sbuFall2028: "border-blue-500 bg-blue-500 text-white",
  sbuSpring2029: "border-emerald-500 bg-emerald-500 text-white",
};
