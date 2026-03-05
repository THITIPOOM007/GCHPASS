import Link from "next/link";
import {
    ClipboardCheck, MapPin, BarChart3, Users, TrendingUp,
    ChevronRight, Star, CheckCircle2, Clock, AlertCircle, FileText,
} from "lucide-react";
import { SISAKET_DISTRICTS } from "@/lib/gchp-data";
import { getAssessmentsSummary } from "@/app/actions/assessment";

const LEVEL_META = [
    { label: "ยังไม่ประเมิน", color: "bg-slate-100 text-slate-500 border-slate-200" },
    { label: "ระดับ 1", color: "bg-red-100 text-red-700 border-red-200" },
    { label: "ระดับ 2", color: "bg-amber-100 text-amber-700 border-amber-200" },
    { label: "ระดับ 3", color: "bg-blue-100 text-blue-700 border-blue-200" },
    { label: "ระดับ 4", color: "bg-sky-100 text-sky-700 border-sky-200" },
    { label: "ระดับ 5 ⭐", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
];

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const result = await getAssessmentsSummary();
    const summaryMap: Record<string, { score: number; kpi: number; level: number }> = {};
    if (result.success) {
        for (const a of result.data) {
            summaryMap[a.district] = {
                score: a.totalScore,
                kpi: a.kpiPercentage,
                level: a.kpiLevel,
            };
        }
    }

    const completedCount = Object.keys(summaryMap).length;
    const avgScore = completedCount > 0
        ? Object.values(summaryMap).reduce((sum, s) => sum + s.score, 0) / completedCount
        : 0;

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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <StatCard icon={<MapPin className="w-5 h-5 text-sky-600" />} label="อำเภอเป้าหมาย" value="22" unit="อำเภอ" color="sky" />
                    <StatCard icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />} label="ประเมินแล้ว" value={completedCount.toString()} unit="อำเภอ" color="emerald" />
                    <StatCard icon={<Clock className="w-5 h-5 text-amber-600" />} label="รอดำเนินการ" value={(22 - completedCount).toString()} unit="อำเภอ" color="amber" />
                    <StatCard icon={<Star className="w-5 h-5 text-purple-600" />} label="คะแนนเฉลี่ย" value={completedCount > 0 ? avgScore.toFixed(1) : "—"} unit="คะแนน" color="purple" />
                </div>

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
                                {/* PDF Button row — only for completed */}
                                {completed && (
                                    <Link
                                        href={`/report/${encodeURIComponent(district)}`}
                                        target="_blank"
                                        className="mt-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100 px-3 py-2 rounded-xl w-full transition"
                                    >
                                        <FileText className="w-3.5 h-3.5" />
                                        ดูรายงาน / พิมพ์ PDF
                                    </Link>
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
