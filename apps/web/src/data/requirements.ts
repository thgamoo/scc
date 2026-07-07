// SUNY Korea Graduation Requirements - AMS & CS Majors

export type MajorType = "ams" | "cs";

export const MAJOR_LABELS: Record<MajorType, string> = {
  ams: "AMS (Applied Math & Statistics)",
  cs: "CS (Computer Science)",
};

export interface SBCRequirement {
  code: string;
  name: string;
  description: string;
  category: "versatility" | "interconnectedness" | "deeper" | "lifelong";
  minGrade?: string;
  pick?: number;
}

export interface MajorCourse {
  code: string;
  name: string;
  credits: number;
  type: "foundation" | "computing" | "required" | "elective" | "math" | "science" | "professional" | "writing";
  alternatives?: string[];
  note?: string;
  sbuOnly?: boolean; // must be taken at SBU/SUNY Korea
}

export interface ElectiveCourse {
  code: string;
  name: string;
  credits: number;
}

export interface MajorConfig {
  label: string;
  courses: MajorCourse[];
  electives: ElectiveCourse[];
  electiveCount: number;
  electiveCredits: number;
  electiveLabel: string;
  electiveNote?: string;
  specialElectives?: string[];
  maxSpecialElectives?: number;
}

export interface Course {
  classNbr: string;
  subject: string;
  courseNum: string;
  title: string;
  sbc: string[];
  credits: number;
  days: string;
  startTime: string;
  endTime: string;
  room: string;
  instructor: string;
  semester: "spring2028" | "fall2028" | "sbuSummer2028" | "sbuFall2028" | "sbuSpring2029";
  note?: string; // recitation/lab info
}

// ============================================================
// SBC Requirements (shared across all majors)
// ============================================================

export const SBC_REQUIREMENTS: SBCRequirement[] = [
  { code: "ARTS", name: "Arts", description: "Explore and understand the fine and performing arts", category: "versatility" },
  { code: "GLO", name: "Global Issues", description: "Engage in global issues", category: "versatility" },
  { code: "HUM", name: "Humanities", description: "Address problems using critical analysis and the methods of the humanities", category: "versatility" },
  { code: "LANG", name: "Language", description: "Communicate in a human language other than English", category: "versatility", minGrade: "C" },
  { code: "QPS", name: "Quantitative Problem Solving", description: "Master quantitative problem solving", category: "versatility", minGrade: "C" },
  { code: "SBS", name: "Social & Behavioral Sciences", description: "Understand, observe, and analyze human behavior", category: "versatility" },
  { code: "SNW", name: "Natural World", description: "Study the natural world", category: "versatility" },
  { code: "TECH", name: "Technology", description: "Understand technology", category: "versatility" },
  { code: "USA", name: "United States", description: "Understand the political, economic, social, and cultural history of the US", category: "versatility" },
  { code: "WRT", name: "Writing", description: "Write effectively in English", category: "versatility", minGrade: "C" },
  { code: "STAS", name: "Science, Technology & Arts/Social Sciences", description: "Examine relationships between Science, Technology and Arts, Humanities, or Social Sciences", category: "interconnectedness" },
  { code: "EXP+", name: "Experiential Learning", description: "Experiential learning", category: "deeper", pick: 3 },
  { code: "HFA+", name: "Humanities & Fine Arts", description: "Humanities and fine arts", category: "deeper", pick: 3 },
  { code: "SBS+", name: "Social & Behavioral Sciences+", description: "Social and behavioral sciences", category: "deeper", pick: 3 },
  { code: "STEM+", name: "STEM+", description: "Science, technology, engineering, and mathematics", category: "deeper", pick: 3 },
  { code: "CER", name: "Critical & Ethical Reasoning", description: "Practice and respect critical and ethical reasoning", category: "lifelong" },
  { code: "DIV", name: "Diversity", description: "Respect for Diversity and Inclusiveness", category: "lifelong" },
  { code: "ESI", name: "Research Information", description: "Evaluate and synthesize researched information", category: "lifelong" },
  { code: "SPK", name: "Speaking", description: "Speak effectively before an audience", category: "lifelong" },
  { code: "WRTD", name: "Disciplinary Writing", description: "Write effectively within one's discipline", category: "lifelong" },
];

// ============================================================
// AMS Major
// ============================================================

const AMS_MAJOR_COURSES: MajorCourse[] = [
  // Foundation
  { code: "AMS 151", name: "Applied Calculus I", credits: 3, type: "foundation", alternatives: ["MAT 125", "MAT 131", "MAT 141", "Placement Level 9+"], note: "Placement test level 9+ exempts this requirement" },
  { code: "AMS 161", name: "Applied Calculus II", credits: 3, type: "foundation", alternatives: ["MAT 127", "MAT 132", "MAT 142", "Placement Level 9+"], note: "Placement test level 9+ exempts this requirement" },
  { code: "AMS 210", name: "Applied Linear Algebra", credits: 3, type: "foundation", alternatives: ["MAT 211"] },
  { code: "AMS 261", name: "Applied Calculus III", credits: 4, type: "foundation", alternatives: ["MAT 203"] },
  // Computing (select one)
  { code: "AMS 325", name: "Computing and Programming Fundamentals", credits: 3, type: "computing", alternatives: ["CSE 101", "CSE 114", "ESG 111"] },
  // Required Upper Division
  { code: "AMS 301", name: "Finite Mathematical Structures", credits: 3, type: "required" },
  { code: "AMS 310", name: "Survey of Probability and Statistics", credits: 3, type: "required", alternatives: ["AMS 311"] },
  { code: "AMS 315", name: "Data Analysis", credits: 3, type: "required", alternatives: ["AMS 361", "MAT 303"], note: "Choose one of AMS 315, AMS 361, or MAT 303" },
  // Writing
  { code: "AMS 300", name: "Writing in AMS", credits: 3, type: "writing", alternatives: ["CSE 300"], note: "May be fulfilled by WRTD-tagged AMS course or CSE 300" },
];

const AMS_ELECTIVE_COURSES: ElectiveCourse[] = [
  { code: "AMS 311", name: "Probability Theory", credits: 3 },
  { code: "AMS 315", name: "Data Analysis", credits: 3 },
  { code: "AMS 316", name: "Introduction to Time Series", credits: 3 },
  { code: "AMS 317", name: "Intro. Linear Regression Analysis", credits: 3 },
  { code: "AMS 318", name: "Financial Mathematics", credits: 3 },
  { code: "AMS 325", name: "Computing and Programming Fundamentals", credits: 3 },
  { code: "AMS 326", name: "Numerical Analysis", credits: 3 },
  { code: "AMS 345", name: "Computational Geometry", credits: 3 },
  { code: "AMS 351", name: "Applied Algebra", credits: 3 },
  { code: "AMS 361", name: "Differential Equations", credits: 3 },
  { code: "AMS 380", name: "Data Mining", credits: 3 },
  { code: "AMS 394", name: "Statistical Laboratory", credits: 3 },
  { code: "AMS 475", name: "Undergraduate Teaching Practicum", credits: 3 },
  { code: "AMS 476", name: "Undergraduate Teaching Practicum II", credits: 3 },
  { code: "AMS 487", name: "Research in Applied Mathematics", credits: 3 },
  { code: "AMS 488", name: "Internship", credits: 3 },
  { code: "AMS 507", name: "Introduction to Probability", credits: 3 },
  { code: "AMS 510", name: "Analytical Methods for AMS", credits: 3 },
  { code: "AMS 540", name: "Linear Programming", credits: 3 },
  { code: "AMS 550", name: "Operations Research: Stochastic Models", credits: 3 },
  { code: "AMS 570", name: "Introduction to Mathematical Statistics", credits: 3 },
  { code: "AMS 572", name: "Data Analysis I", credits: 3 },
  { code: "AMS 578", name: "Regression Theory", credits: 3 },
  { code: "AMS 580", name: "Statistical Learning", credits: 3 },
  { code: "AMS 597", name: "Statistical Computing", credits: 3 },
  // Non-AMS math-related (max 2 combined with AMS 475/476/487)
  { code: "CSE 303", name: "Theory of Computation", credits: 3 },
  { code: "CSE 373", name: "Analysis of Algorithms", credits: 3 },
  { code: "MAT 303", name: "Calculus IV w/ Applications", credits: 3 },
  { code: "MAT 311", name: "Abstract Algebra", credits: 3 },
  { code: "MAT 312", name: "Applied Algebra", credits: 3 },
  { code: "MAT 341", name: "Applied Real Analysis", credits: 3 },
];

// ============================================================
// CS Major - From Fall 2025 (new curriculum)
// ============================================================
// CS Major (Before Fall 2025 curriculum)
// ============================================================

const CS_MAJOR_COURSES: MajorCourse[] = [
  // Math Foundation
  { code: "AMS 151", name: "Applied Calculus I", credits: 3, type: "math", alternatives: ["MAT 125", "MAT 131", "MAT 141", "Placement Level 9+"], note: "Placement test level 9+ exempts this" },
  { code: "AMS 161", name: "Applied Calculus II", credits: 3, type: "math", alternatives: ["MAT 127", "MAT 132", "MAT 142", "Placement Level 9+"], note: "Placement test level 9+ exempts this" },
  { code: "AMS 210", name: "Applied Linear Algebra", credits: 3, type: "math", alternatives: ["MAT 211", "AMS 326"] },
  { code: "AMS 301", name: "Finite Mathematical Structures", credits: 3, type: "math" },
  { code: "AMS 310", name: "Survey of Probability and Statistics", credits: 3, type: "math", alternatives: ["AMS 311", "AMS 312"] },
  // Required Intro CS
  { code: "CSE 101", name: "Computer Science Principles", credits: 3, type: "foundation" },
  { code: "CSE 114", name: "Intro to Object-Oriented Programming", credits: 4, type: "foundation" },
  { code: "CSE 214", name: "Data Structures", credits: 4, type: "foundation" },
  { code: "CSE 215", name: "Foundations of Computer Science", credits: 4, type: "foundation" },
  { code: "CSE 216", name: "Programming Abstractions", credits: 4, type: "foundation" },
  { code: "CSE 220", name: "System Fundamentals I", credits: 4, type: "foundation" },
  // Required Advanced CS
  { code: "CSE 303", name: "Theory of Computation", credits: 3, type: "required" },
  { code: "CSE 310", name: "Computer Networks", credits: 3, type: "required", sbuOnly: true },
  { code: "CSE 316", name: "Fundamentals of Software Development", credits: 3, type: "required", sbuOnly: true },
  { code: "CSE 320", name: "Systems Fundamentals II", credits: 3, type: "required", sbuOnly: true },
  { code: "CSE 373", name: "Analysis of Algorithms", credits: 3, type: "required", sbuOnly: true },
  { code: "CSE 416", name: "Software Engineering", credits: 3, type: "required" },
  // Professional
  { code: "CSE 300", name: "Technical Communications", credits: 3, type: "professional", note: "Prereq: WRT 102" },
  { code: "CSE 312", name: "Legal, Social, and Ethical Issues", credits: 3, type: "professional" },
  // Natural Science
  { code: "PHY 131", name: "Classical Physics I (lecture)", credits: 3, type: "science", alternatives: ["PHY 125", "PHY 141", "CHE 131"], note: "1 lecture/lab combination required (e.g. PHY 131+133)" },
  { code: "PHY 133", name: "Classical Physics Lab I", credits: 1, type: "science", alternatives: ["PHY 134", "CHE 133"], note: "Lab component" },
  { code: "BIO 201", name: "Organisms to Ecosystems", credits: 3, type: "science", alternatives: ["GEO 102"], note: "2 prescribed NS courses required" },
  { code: "GEO 102", name: "The Earth", credits: 3, type: "science", alternatives: ["PHY 132"], note: "2nd prescribed NS course" },
];

const CS_ELECTIVE_COURSES: ElectiveCourse[] = [
  { code: "CSE 304", name: "Compiler Design", credits: 3 },
  { code: "CSE 305", name: "Principles of Database Systems", credits: 3 },
  { code: "CSE 306", name: "Operating Systems", credits: 3 },
  { code: "CSE 307", name: "Principles of Programming Languages", credits: 3 },
  { code: "CSE 327", name: "Fundamentals of Computer Vision", credits: 3 },
  { code: "CSE 331", name: "Fundamentals of Computer Security", credits: 3 },
  { code: "CSE 332", name: "Introduction to Visualization", credits: 3 },
  { code: "CSE 337", name: "Scripting Languages", credits: 3 },
  { code: "CSE 351", name: "Introduction to Data Science", credits: 3 },
  { code: "CSE 352", name: "Artificial Intelligence", credits: 3 },
  { code: "CSE 353", name: "Machine Learning", credits: 3 },
  { code: "CSE 356", name: "Cloud Computing", credits: 3 },
  { code: "CSE 364", name: "Advanced Multimedia Techniques", credits: 3 },
  { code: "CSE 377", name: "Introduction to Medical Imaging", credits: 3 },
  { code: "CSE 380", name: "Computer Game Programming", credits: 3 },
  { code: "CSE 390", name: "Special Topics in CS", credits: 3 },
  { code: "CSE 487", name: "Research in Computer Science", credits: 3 },
  { code: "CSE 488", name: "Internship in Computer Science", credits: 3 },
  { code: "CSE 512", name: "Machine Learning", credits: 3 },
  { code: "CSE 506", name: "Operating Systems", credits: 3 },
  { code: "CSE 534", name: "Fundamentals of Computer Networks", credits: 3 },
];

// ============================================================
// Major Configs
// ============================================================

export const MAJOR_CONFIGS: Record<MajorType, MajorConfig> = {
  ams: {
    label: "AMS Major Requirements",
    courses: AMS_MAJOR_COURSES,
    electives: AMS_ELECTIVE_COURSES,
    electiveCount: 6,
    electiveCredits: 18,
    electiveLabel: "Upper Division Electives (6 courses, 18cr)",
    electiveNote: "6 additional AMS 300+ level courses. Max 2 from: AMS 475, 476, 487, or non-AMS math-related.",
    specialElectives: ["AMS 475", "AMS 476", "AMS 487", "CSE 303", "CSE 373", "MAT 303", "MAT 311", "MAT 312", "MAT 341"],
    maxSpecialElectives: 2,
  },
  cs: {
    label: "CS Major Requirements",
    courses: CS_MAJOR_COURSES,
    electives: CS_ELECTIVE_COURSES,
    electiveCount: 4,
    electiveCredits: 12,
    electiveLabel: "CSE Technical Electives (4 courses)",
    electiveNote: "4 upper-division CSE electives (3XX or 4XX). Excludes teaching practica and non-technical courses.",
  },
};

export const GRADUATION_REQUIREMENTS = {
  totalCredits: 120,
  upperDivisionCredits: 39,
  minimumGPA: 2.0,
  residencyCredits: 36,
};

// Type labels for display
export const TYPE_LABELS: Record<string, string> = {
  foundation: "Required Introductory Courses",
  computing: "Computing Course (select 1)",
  required: "Required Advanced Courses",
  math: "Mathematics Requirements",
  science: "Natural Science Requirements",
  professional: "Professional Requirements",
  writing: "Writing Requirement",
  elective: "Electives",
};
