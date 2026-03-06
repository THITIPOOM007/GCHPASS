import Link from "next/link";
import {
    ClipboardCheck, MapPin, Users, TrendingUp,
    ChevronRight, Star, CheckCircle2, Clock, AlertCircle, FileText,
    Award, Target,
} from "lucide-react";
import { SISAKET_DISTRICTS } from "@/lib/gchp-data";
import { getAssessmentsSummary } from "@/app/actions/assessment";
import ResetButton from "@/components/ResetButton";

const LEVEL_META = [
    { label: "ยังไม่ประเมิน", color: "bg-slate-100 text-slate-500 border-slate-200" },
    { label: "ระดับ 1", color: "bg-red-100 text-red-700 border-red-200" },
    { label: "ระดับ 2", color: "bg-amber-100 text-amber-700 border-amber-200" },
    { label: "ระดับ 3", color: "bg-blue-100 text-blue-700 border-blue-200" },
    { label: "ระดับ 4", color: "bg-sky-100 text-sky-700 border-sky-200" },
    { label: "ระดับ 5 ⭐", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
];

const LEVEL_BAR = [
    { level: 5, label: "ระดับ 5", color: "bg-emerald-500", textColor: "text-emerald-700" },
    { level: 4, label: "ระดับ 4", color: "bg-sky-500", textColor: "text-sky-700" },
    { level: 3, label: "ระดับ 3", color: "bg-blue-500", textColor: "text-blue-700" },
    { level: 2, label: "ระดับ 2", color: "bg-amber-500", textColor: "text-amber-700" },
    { level: 1, label: "ระดับ 1", color: "bg-red-500", textColor: "text-red-700" },
];

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const result = await getAssessmentsSummary();
    const summaryMap: Record<string, { score: number; kpi: number; level: number; orgType: string }> = {};
    if (result.success) {
        for (const a of result.data) {
            summaryMap[a.district] = {
                score: a.totalScore,
                kpi: a.kpiPercentage,
                level: a.kpiLevel,
                orgType: a.orgType,
            };
        }
    }

    const completedCount = Object.keys(summaryMap).length;
    const completed = Object.values(summaryMap);

    const avgScore = completedCount > 0
        ? completed.reduce((sum, s) => sum + s.score, 0) / completedCount
        : 0;

    const avgKPI = completedCount > 0
        ? completed.reduce((sum, s) => sum + s.kpi, 0) / completedCount
        : 0;

    // Level distribution
    const levelDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    completed.forEach((s) => { levelDist[s.level] = (levelDist[s.level] ?? 0) + 1; });

    // Provincial KPI level (aggregate)
    const provinceKPILevel = avgKPI >= 100 ? 5 : avgKPI >= 95 ? 4 : avgKPI >= 91 ? 3 : avgKPI >= 80 ? 2 : avgKPI > 0 ? 1 : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-emerald-50">
            {/* Hero Header */}
            <header className="relative overflow-hidden bg-gradient-to-r from-sky-700 via-sky-600 to-emerald-600 text-white">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24" />
                </div>
                <div className="relative max-w-6xl mx-auto px-4 py-8">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm">
                            <ClipboardCheck className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <p className="text-sky-200 text-sm font-medium mb-1">สำนักงานสาธารณสุขจังหวัดศรีสะเกษ</p>
                            <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
                                ระบบตรวจประเมินมาตรฐาน GCHP
                            </h1>
                            <p className="text-sky-100 mt-1 text-sm">
                                Good Complaint Handling Practice — ปีงบประมาณ 2569
                            </p>
                            <p className="text-sky-200 text-xs mt-1">
                                กำหนดการ: 23–30 มีนาคม 2569 | เป้าหมาย 22 อำเภอ
                            </p>
                        </div>
                        <div className="ml-auto hidden sm:block">
                            <Link
                                href="/assessment"
                                className="flex items-center gap-2 bg-white text-sky-700 font-bold px-5 py-3 rounded-xl hover:bg-sky-50 transition-colors shadow-lg"
                            >
                                <ClipboardCheck className="w-5 h-5" />
                                เริ่มตรวจประเมิน
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <StatCard icon={<MapPin className="w-5 h-5 text-sky-600" />} label="อำเภอเป้าหมาย" value="22" unit="อำเภอ" color="sky" />
                    <StatCard icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />} label="ประเมินแล้ว" value={completedCount.toString()} unit="อำเภอ" color="emerald" />
                    <StatCard icon={<Clock className="w-5 h-5 text-amber-600" />} label="รอดำเนินการ" value={(22 - completedCount).toString()} unit="อำเภอ" color="amber" />
                    <StatCard icon={<Star className="w-5 h-5 text-purple-600" />} label="คะแนนเฉลี่ย" value={completedCount > 0 ? avgScore.toFixed(1) : "—"} unit="คะแนน" color="purple" />
                </div>

                {/* ===== PROVINCIAL KPI SUMMARY ===== */}
                {completedCount > 0 && (
                    <div className="mb-6 rounded-3xl overflow-hidden shadow-lg border border-slate-200/50">
                        {/* Header gradient */}
                        <div className="bg-gradient-to-r from-indigo-700 via-sky-700 to-emerald-700 px-6 py-5 text-white">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    <Award className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold">KPI รวมภาพจังหวัดศรีสะเกษ</h2>
                                    <p className="text-sky-200 text-xs">ภาพรวมผลการประเมินทุกอำเภอที่ดำเนินการแล้ว ({completedCount} อำเภอ)</p>
                                </div>
                            </div>

                            {/* Big KPI numbers */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <div className="bg-white/15 backdrop-blur rounded-2xl p-4 text-center">
                                    <p className="text-white/70 text-xs mb-1">KPI เฉลี่ยจังหวัด</p>
                                    <p className="text-4xl font-black">{avgKPI.toFixed(1)}<span className="text-xl font-bold text-white/70">%</span></p>
                                    <p className="text-white/60 text-xs mt-1">
                                        {provinceKPILevel >= 5 ? "🏆 บรรลุเป้าหมาย" : provinceKPILevel >= 4 ? "⭐ ดีมาก" : provinceKPILevel >= 3 ? "✅ ดี" : provinceKPILevel >= 2 ? "⚠️ พอใช้" : "❗ ต้องปรับปรุง"}
                                    </p>
                                </div>
                                <div className="bg-white/15 backdrop-blur rounded-2xl p-4 text-center">
                                    <p className="text-white/70 text-xs mb-1">คะแนน GCHP เฉลี่ย</p>
                                    <p className="text-4xl font-black">{avgScore.toFixed(1)}<span className="text-xl font-bold text-white/70">/100</span></p>
                                    <p className="text-white/60 text-xs mt-1">เฉลี่ยทุกอำเภอที่ตรวจแล้ว</p>
                                </div>
                                <div className="bg-white/15 backdrop-blur rounded-2xl p-4 text-center col-span-2 sm:col-span-1">
                                    <p className="text-white/70 text-xs mb-1">ความคืบหน้า</p>
                                    <p className="text-4xl font-black">{Math.round((completedCount / 22) * 100)}<span className="text-xl font-bold text-white/70">%</span></p>
                                    <p className="text-white/60 text-xs mt-1">{completedCount} จาก 22 อำเภอ</p>
                                </div>
                            </div>
                        </div>

                        {/* Level distribution */}
                        <div className="bg-white px-6 py-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Target className="w-4 h-4 text-slate-500" />
                                <h3 className="font-bold text-slate-700 text-sm">การกระจายระดับ KPI รายอำเภอ</h3>
                                <span className="ml-auto text-xs text-slate-400">{completedCount} อำเภอที่ประเมินแล้ว</span>
                            </div>
                            <div className="space-y-2.5">
                                {LEVEL_BAR.map((lb) => {
                                    const count = levelDist[lb.level] ?? 0;
                                    const pct = completedCount > 0 ? (count / completedCount) * 100 : 0;
                                    const kpiLabel = lb.level === 5 ? "100%" : lb.level === 4 ? "95–99%" : lb.level === 3 ? "91–94%" : lb.level === 2 ? "80–90%" : "<80%";
                                    return (
                                        <div key={lb.level} className="flex items-center gap-3">
                                            <div className="w-16 text-xs font-bold text-slate-600 flex-shrink-0">{lb.label}</div>
                                            <div className="flex-1 relative">
                                                <div className="h-7 bg-slate-100 rounded-lg overflow-hidden">
                                                    <div
                                                        className={`h-full ${lb.color} rounded-lg transition-all duration-700 flex items-center`}
                                                        style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%` }}
                                                    >
                                                        {count > 0 && (
                                                            <span className="text-white text-xs font-bold px-2">{count} อำเภอ</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-16 text-right flex-shrink-0">
                                                <span className={`text-xs font-semibold ${lb.textColor}`}>{kpiLabel}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                                {/* Not yet assessed */}
                                {(22 - completedCount) > 0 && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-16 text-xs font-bold text-slate-400 flex-shrink-0">ยังไม่ประเมิน</div>
                                        <div className="flex-1 relative">
                                            <div className="h-7 bg-slate-100 rounded-lg overflow-hidden">
                                                <div
                                                    className="h-full bg-slate-300 rounded-lg transition-all duration-700 flex items-center"
                                                    style={{ width: `${((22 - completedCount) / 22) * 100}%` }}
                                                >
                                                    <span className="text-white text-xs font-bold px-2">{22 - completedCount} อำเภอ</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-16 text-right flex-shrink-0">
                                            <span className="text-xs font-semibold text-slate-400">รอประเมิน</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Level 5 highlight */}
                            {(levelDist[5] ?? 0) > 0 && (
                                <div className="mt-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
                                    <span className="text-xl">🏆</span>
                                    <p className="text-sm font-semibold text-emerald-800">
                                        มี <span className="text-emerald-600 font-extrabold">{levelDist[5]} อำเภอ</span> ที่บรรลุ KPI 100% (ระดับ 5)
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Section title */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Users className="w-5 h-5 text-sky-600" />
                        รายชื่อ 22 อำเภอในจังหวัดศรีสะเกษ
                    </h2>
                    <Link
                        href="/assessment"
                        className="sm:hidden flex items-center gap-1 bg-sky-500 text-white text-sm font-semibold px-4 py-2 rounded-xl"
                    >
                        ตรวจประเมิน
                    </Link>
                </div>

                {/* District Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {SISAKET_DISTRICTS.map((district, idx) => {
                        const status = summaryMap[district];
                        const levelMeta = LEVEL_META[status?.level ?? 0];
                        const completed = !!status;
                        return (
                            <div key={district}>
                                <Link href={`/assessment?district=${encodeURIComponent(district)}`}>
                                    <div className="district-card bg-white rounded-2xl border border-slate-200 p-5 cursor-pointer hover:shadow-md hover:border-sky-300 transition-all group">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${completed ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-500"}`}>
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm group-hover:text-sky-700 transition-colors">
                                                        {district}
                                                    </p>
                                                    <p className="text-xs text-slate-500">อำเภอ{district}</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-sky-500 transition-colors mt-1" />
                                        </div>

                                        {completed ? (
                                            <>
                                                <div className="flex gap-2 mb-3">
                                                    <div className={`text-xs font-semibold px-2 py-1 rounded-lg border ${levelMeta.color}`}>
                                                        {levelMeta.label}
                                                    </div>
                                                    <div className="text-xs bg-slate-50 text-slate-600 px-2 py-1 rounded-lg border border-slate-200">
                                                        KPI: {status.kpi.toFixed(1)}%
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                                                        <span>คะแนน GCHP</span>
                                                        <span className="font-semibold text-slate-700">{status.score.toFixed(1)}/100</span>
                                                    </div>
                                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${status.score >= 80 ? "bg-emerald-500" : status.score >= 60 ? "bg-amber-400" : "bg-red-400"}`}
                                                            style={{ width: `${status.score}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-2 py-2">
                                                <AlertCircle className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm text-slate-400">ยังไม่ได้รับการตรวจประเมิน</span>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                                {/* Action buttons row — only for completed */}
                                {completed && (
                                    <div className="flex gap-2 mt-1">
                                        <Link
                                            href={`/report/${encodeURIComponent(district)}`}
                                            target="_blank"
                                            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100 px-3 py-2 rounded-xl transition"
                                        >
                                            <FileText className="w-3.5 h-3.5" />
                                            ดูรายงาน / PDF
                                        </Link>
                                        <ResetButton district={district} orgType={summaryMap[district]?.orgType ?? "สสอ."} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* KPI Legend */}
                <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-5">
                    <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-sky-600" />
                        เกณฑ์ระดับคะแนนตัวชี้วัด KPI ปี 2569
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                            { level: 5, label: "100%", color: "bg-emerald-500" },
                            { level: 4, label: "95–99%", color: "bg-sky-500" },
                            { level: 3, label: "91–94%", color: "bg-blue-500" },
                            { level: 2, label: "80–90%", color: "bg-amber-500" },
                            { level: 1, label: "<80%", color: "bg-red-500" },
                        ].map((l) => (
                            <div key={l.level} className="flex items-center gap-2 bg-slate-50 rounded-xl p-3">
                                <div className={`w-3 h-3 rounded-full ${l.color}`} />
                                <div>
                                    <p className="text-xs font-bold text-slate-700">ระดับ {l.level}</p>
                                    <p className="text-xs text-slate-500">{l.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ icon, label, value, unit, color }: { icon: React.ReactNode; label: string; value: string; unit: string; color: string }) {
    const colors: Record<string, string> = {
        sky: "bg-sky-50 border-sky-200",
        emerald: "bg-emerald-50 border-emerald-200",
        amber: "bg-amber-50 border-amber-200",
        purple: "bg-purple-50 border-purple-200",
    };
    return (
        <div className={`${colors[color]} border rounded-2xl p-4`}>
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-xs text-slate-500 font-medium">{label}</span>
            </div>
            <div className="flex items-end gap-1">
                <span className="text-3xl font-extrabold text-slate-800">{value}</span>
                <span className="text-sm text-slate-500 mb-1">{unit}</span>
            </div>
        </div>
    );
}
