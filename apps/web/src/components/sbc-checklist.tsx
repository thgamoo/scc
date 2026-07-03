import { Checkbox } from "@workspace/ui/components/checkbox";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { SBC_REQUIREMENTS } from "@/data/requirements";

interface SBCChecklistProps {
  completedSBCs: string[];
  sbcCourseMap: Record<string, string>;
  onToggle: (sbc: string) => void;
  onSetCourse: (sbc: string, course: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  versatility: "Demonstrate Versatility",
  interconnectedness: "Explore Interconnectedness",
  deeper: "Pursue Deeper Understanding (3 of 4)",
  lifelong: "Prepare for Lifelong Learning",
};

export function SBCChecklist({ completedSBCs, sbcCourseMap, onToggle, onSetCourse }: SBCChecklistProps) {
  const categories = ["versatility", "interconnectedness", "deeper", "lifelong"] as const;

  const totalRequired = SBC_REQUIREMENTS.filter((r) => r.category !== "deeper").length + 3;
  const deeperCompleted = SBC_REQUIREMENTS.filter(
    (r) => r.category === "deeper" && completedSBCs.includes(r.code)
  ).length;
  const totalCompleted =
    SBC_REQUIREMENTS.filter(
      (r) => r.category !== "deeper" && completedSBCs.includes(r.code)
    ).length + Math.min(deeperCompleted, 3);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">SBC Requirements</CardTitle>
          <Badge variant={totalCompleted >= totalRequired ? "default" : "secondary"}>
            {totalCompleted}/{totalRequired}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {categories.map((cat) => {
          const reqs = SBC_REQUIREMENTS.filter((r) => r.category === cat);
          return (
            <div key={cat}>
              <h3 className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wide">
                {CATEGORY_LABELS[cat]}
              </h3>
              <div className="space-y-1">
                {reqs.map((req) => {
                  const checked = completedSBCs.includes(req.code);
                  const courseName = sbcCourseMap[req.code] ?? "";
                  return (
                    <div key={req.code} className="space-y-0.5">
                      <label
                        className="hover:bg-muted/50 flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => onToggle(req.code)}
                        />
                        <span className="flex flex-1 items-center gap-2">
                          <Badge
                            variant={checked ? "default" : "outline"}
                            className="min-w-[52px] justify-center text-[10px]"
                          >
                            {req.code}
                          </Badge>
                          <span className={`text-sm ${checked ? "text-muted-foreground line-through" : ""}`}>
                            {req.name}
                          </span>
                        </span>
                        {req.minGrade && (
                          <span className="text-muted-foreground ml-auto text-[10px]">
                            min {req.minGrade}
                          </span>
                        )}
                      </label>
                      {checked && (
                        <div className="ml-10 flex items-center gap-1.5 px-2 pb-1">
                          <span className="text-muted-foreground shrink-0 text-[10px]">fulfilled by:</span>
                          <input
                            type="text"
                            placeholder="e.g. AMS 151, PHY 131..."
                            value={courseName}
                            onChange={(e) => onSetCourse(req.code, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="border-input bg-background h-6 flex-1 rounded border px-2 text-xs focus:outline-none focus:ring-1"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
