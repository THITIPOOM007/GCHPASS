import { GCHP_DIMENSIONS } from "./gchp-data";

export type ScoreMap = Record<string, number>; // criterionId -> 0,1,2

export function calculateDimensionScore(dimId: number, scores: ScoreMap): number {
    const dim = GCHP_DIMENSIONS.find((d) => d.id === dimId);
    if (!dim) return 0;
    return dim.criteria.reduce((sum, c) => {
        const score = scores[c.id] ?? -1;
        if (score < 0) return sum; // unanswered
        return sum + (c.weight * score) / 2;
    }, 0);
}

export function calculateTotalGCHP(scores: ScoreMap): number {
    return GCHP_DIMENSIONS.reduce((sum, dim) => {
        return sum + calculateDimensionScore(dim.id, scores);
    }, 0);
}

export function calculateMaxPossible(scores: ScoreMap): number {
    // Only count answered criteria
    return GCHP_DIMENSIONS.reduce((sum, dim) => {
        return (
            sum +
            dim.criteria.reduce((s, c) => {
                return scores[c.id] !== undefined ? s + c.weight : s;
            }, 0)
        );
    }, 0);
}

export function calculateKPI(A: number, B: number): number {
    if (B <= 0) return 0;
    return Math.min(100, (A / B) * 100);
}

export function determineLevel(kpi: number): {
    level: number;
    label: string;
    color: string;
    bgColor: string;
} {
    if (kpi >= 100)
        return { level: 5, label: "ระดับ 5 — บรรลุเป้าหมาย (100%)", color: "text-emerald-700", bgColor: "bg-emerald-50 border-emerald-400" };
    if (kpi >= 95)
        return { level: 4, label: "ระดับ 4 — ดีมาก (95–99%)", color: "text-sky-700", bgColor: "bg-sky-50 border-sky-400" };
    if (kpi >= 91)
        return { level: 3, label: "ระดับ 3 — ดี (91–94%)", color: "text-blue-700", bgColor: "bg-blue-50 border-blue-400" };
    if (kpi >= 80)
        return { level: 2, label: "ระดับ 2 — พอใช้ (80–90%)", color: "text-amber-700", bgColor: "bg-amber-50 border-amber-400" };
    return { level: 1, label: "ระดับ 1 — ต้องปรับปรุง (<80%)", color: "text-red-700", bgColor: "bg-red-50 border-red-400" };
}

export function getScoreColor(percent: number): string {
    if (percent >= 80) return "text-emerald-600";
    if (percent >= 60) return "text-amber-600";
    return "text-red-600";
}

export function getScoreBarColor(percent: number): string {
    if (percent >= 80) return "bg-emerald-500";
    if (percent >= 60) return "bg-amber-500";
    return "bg-red-500";
}
