// SUNY Korea AMS Major Graduation Requirements

export interface SBCRequirement {
  code: string;
  name: string;
  description: string;
  category: "versatility" | "interconnectedness" | "deeper" | "lifelong";
  minGrade?: string;
  pick?: number; // for "choose 3 of 4"
}

export interface MajorCourse {
  code: string;
  name: string;
  credits: number;
  type: "foundation" | "computing" | "required" | "elective" | "writing";
  alternatives?: string[]; // alternative courses that satisfy same requirement
  note?: string;
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
  semester: "spring2026" | "fall2026";
}

export const SBC_REQUIREMENTS: SBCRequirement[] = [
  // Demonstrate Versatility
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
  // Explore Interconnectedness
  { code: "STAS", name: "Science, Technology & Arts/Social Sciences", description: "Examine relationships between Science, Technology and Arts, Humanities, or Social Sciences", category: "interconnectedness" },
  // Pursue Deeper Understanding (choose 3 of 4)
  { code: "EXP+", name: "Experiential Learning", description: "Experiential learning", category: "deeper", pick: 3 },
  { code: "HFA+", name: "Humanities & Fine Arts", description: "Humanities and fine arts", category: "deeper", pick: 3 },
  { code: "SBS+", name: "Social & Behavioral Sciences+", description: "Social and behavioral sciences", category: "deeper", pick: 3 },
  { code: "STEM+", name: "STEM+", description: "Science, technology, engineering, and mathematics", category: "deeper", pick: 3 },
  // Prepare for Lifelong Learning
  { code: "CER", name: "Critical & Ethical Reasoning", description: "Practice and respect critical and ethical reasoning", category: "lifelong" },
  { code: "DIV", name: "Diversity", description: "Respect for Diversity and Inclusiveness", category: "lifelong" },
  { code: "ESI", name: "Research Information", description: "Evaluate and synthesize researched information", category: "lifelong" },
  { code: "SPK", name: "Speaking", description: "Speak effectively before an audience", category: "lifelong" },
  { code: "WRTD", name: "Disciplinary Writing", description: "Write effectively within one's discipline", category: "lifelong" },
];

export const AMS_MAJOR_COURSES: MajorCourse[] = [
  // Foundation Courses
  { code: "AMS 151", name: "Applied Calculus I", credits: 3, type: "foundation", alternatives: ["MAT 125", "MAT 131", "MAT 141"] },
  { code: "AMS 161", name: "Applied Calculus II", credits: 3, type: "foundation", alternatives: ["MAT 127", "MAT 132", "MAT 142"] },
  { code: "AMS 210", name: "Applied Linear Algebra", credits: 3, type: "foundation", alternatives: ["MAT 211"] },
  { code: "AMS 261", name: "Applied Calculus III", credits: 4, type: "foundation", alternatives: ["MAT 203"] },
  // Computing (select one)
  { code: "AMS 325", name: "Computing and Programming Fundamentals", credits: 3, type: "computing", alternatives: ["CSE 101", "CSE 114", "ESG 111"] },
  // Required Upper Division
  { code: "AMS 301", name: "Finite Mathematical Structures", credits: 3, type: "required" },
  { code: "AMS 310", name: "Survey of Probability and Statistics", credits: 3, type: "required", alternatives: ["AMS 311"] },
  { code: "AMS 315", name: "Data Analysis", credits: 3, type: "required", alternatives: ["AMS 361", "MAT 303"], note: "Choose one of AMS 315, AMS 361, or MAT 303" },
  // Writing
  { code: "AMS 300", name: "Writing in AMS", credits: 3, type: "writing", note: "Upper-division writing requirement. May be fulfilled by WRTD-tagged AMS course." },
];

// Upper division electives: 6 more AMS 300+ level courses (18 credits)
export const AMS_ELECTIVE_COURSES = [
  { code: "AMS 311", name: "Probability Theory", credits: 3 },
  { code: "AMS 315", name: "Data Analysis", credits: 3 },
  { code: "AMS 316", name: "Introduction to Time Series", credits: 3 },
  { code: "AMS 317", name: "Intro. Linear Regression Analysis", credits: 3 },
  { code: "AMS 318", name: "Financial Mathematics", credits: 3 },
  { code: "AMS 325", name: "Computing and Programming Fundamentals", credits: 3 },
  { code: "AMS 326", name: "Numerical Analysis", credits: 3 },
  { code: "AMS 345", name: "Computational Geometry", credits: 3 },
  { code: "AMS 351", name: "Applied Algebra", credits: 3 },
  { code: "AMS 361", name: "Applied Calculus IV: Differential Equations", credits: 3 },
  { code: "AMS 380", name: "Data Mining", credits: 3 },
  { code: "AMS 394", name: "Statistical Laboratory", credits: 3 },
  { code: "AMS 475", name: "Undergraduate Teaching Practicum", credits: 3 },
  { code: "AMS 476", name: "Undergraduate Teaching Practicum", credits: 3 },
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
];

export const GRADUATION_REQUIREMENTS = {
  totalCredits: 120,
  upperDivisionCredits: 39,
  minimumGPA: 2.0,
  residencyCredits: 36, // after 57th credit, at least 36 at Stony Brook
  majorElectiveCredits: 18, // 6 additional upper-division AMS courses
  maxSpecialElectives: 2, // max 2 from AMS 475, 476, 487, or non-AMS
};
