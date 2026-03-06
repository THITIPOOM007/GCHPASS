"use client";

import { AssessmentData } from "@/app/assessment/page";
import { calculateKPI, determineLevel } from "@/lib/scoring";
import { ClipboardList, Info, CheckSquare, Square, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
    data: AssessmentData;
    update: (patch: Partial<AssessmentData>) => void;
}

export default function Step3KPI({ data, update }: Props) {
    const kpi = calculateKPI(data.kpiA, data.kpiB);
    const level = determineLevel(kpi);

    const slaOptions = [
        { key: "sla10" as keyof AssessmentData, label: "เรื่องร้องเรียนทั่วไป", sublabel: "ดำเนินการภายใน 10 วันทำการ", days: "10 วัน", color: "emerald" },
        { key: "sla30" as keyof AssessmentData, label: "เรื่องที่ต้องตรวจสอบข้อเท็จจริง", sublabel: "ดำเนินการภายใน 30 วันทำการ", days: "30 วัน", color: "sky" },
        { key: "sla60" as keyof AssessmentData, label: "เรื่องที่ซับซ้อน / ต้องสืบสวนสอบสวน", sublabel: "ดำเนินการภายใน 60 วันทำการ", days: "60 วัน", color: "purple" },
    ];

    const verifyOptions = [
        { key: "verifyDoc" as keyof AssessmentData, label: "ตรวจสอบจากเอกสาร / แฟ้มข้อมูล", emoji: "📄" },
        { key: "verifySystem" as keyof AssessmentData, label: "ตรวจสอบจากระบบฐานข้อมูล", emoji: "💻" },
        { key: "verifyRandom" as keyof AssessmentData, label: "สุ่มตรวจสอบรายเรื่อง", emoji: "🔍" },
    ];

    const kpiBarColor = level.level >= 5 ? "from-emerald-400 to-emerald-600" :
        level.level === 4 ? "from-sky-400 to-sky-600" :
            level.level === 3 ? "from-blue-400 to-blue-600" :
                level.level === 2 ? "from-amber-400 to-amber-600" : "from-red-400 to-red-600";

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex items-center gap-3"
            >
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200">
                    <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">ส่วนที่ 3: ตัวชี้วัดผลการดำเนินงาน (KPI)</h2>
                    <p className="text-sm text-slate-500">คำนวณ KPI จากจำนวนเรื่องร้องเรียนที่ดำเนินการได้ตาม SLA</p>
                </div>
            </motion.div>

            {/* KPI Input */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-5"
            >
                {/* Card header gradient */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 px-6 py-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <h3 className="font-bold text-amber-800">ข้อมูลเรื่องร้องเรียน</h3>
                </div>

                <div className="p-6">
                    <div className="grid sm:grid-cols-2 gap-6 mb-6">
                        <NumberInput
                            label="จำนวนเรื่องร้องเรียนที่ดำเนินการได้ตาม SLA"
                            hint="เรื่องที่ดำเนินการแล้วเสร็จภายในเวลาที่กำหนด"
                            value={data.kpiA}
                            onChange={(v) => update({ kpiA: v })}
                            color="emerald"
                            letter="A"
                        />
                        <NumberInput
                            label="จำนวนเรื่องร้องเรียนทั้งหมดในรอบ 12 เดือน"
                            hint="ปีงบประมาณ 2568 (ต.ค. 67 – ก.ย. 68)"
                            value={data.kpiB}
                            onChange={(v) => update({ kpiB: v })}
                            color="sky"
                            letter="B"
                        />
                    </div>

                    {/* KPI Result */}
                    <AnimatePresence mode="wait">
                        {data.kpiB > 0 ? (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`rounded-2xl border-2 p-5 ${level.bgColor}`}
                            >
                                <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-600 mb-1">ผลการคำนวณ KPI</p>
                                        <p className="text-xs text-slate-500 font-mono">
                                            KPI = {data.kpiA} ÷ {data.kpiB} × 100
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <motion.p
                                            key={kpi}
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className={`text-5xl font-black ${level.color}`}
                                        >
                                            {kpi.toFixed(2)}%
                                        </motion.p>
                                        <p className={`text-sm font-bold mt-1 ${level.color}`}>{level.label}</p>
                                    </div>
                                </div>
                                {/* Animated progress bar */}
                                <div className="h-4 bg-white/60 rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full rounded-full bg-gradient-to-r ${kpiBarColor}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(kpi, 100)}%` }}
                                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                    />
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className="text-xs text-slate-400">0%</span>
                                    <span className="text-xs text-slate-400">100%</span>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="hint"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-start gap-2 bg-slate-50 rounded-xl p-4 border border-slate-200"
                            >
                                <Info className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-slate-500">กรอกจำนวนเรื่องร้องเรียนทั้งหมด (B) เพื่อคำนวณ KPI</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* SLA Compliance */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-5"
            >
                <h3 className="font-bold text-slate-700 mb-1 flex items-center gap-2">
                    <span className="text-base">⏱️</span>
                    ประเภท SLA ที่ปฏิบัติได้ตามเกณฑ์
                </h3>
                <p className="text-xs text-slate-400 mb-4">เลือกประเภทเรื่องร้องเรียนที่หน่วยงานสามารถดำเนินการได้ตาม SLA</p>
                <div className="space-y-3">
                    {slaOptions.map((opt) => {
                        const checked = data[opt.key] as boolean;
                        const colorMap: Record<string, { border: string; bg: string; text: string; badge: string; icon: string }> = {
                            emerald: { border: "border-emerald-400", bg: "bg-emerald-50", text: "text-emerald-800", badge: "bg-emerald-200 text-emerald-700", icon: "text-emerald-600" },
                            sky: { border: "border-sky-400", bg: "bg-sky-50", text: "text-sky-800", badge: "bg-sky-200 text-sky-700", icon: "text-sky-600" },
                            purple: { border: "border-purple-400", bg: "bg-purple-50", text: "text-purple-800", badge: "bg-purple-200 text-purple-700", icon: "text-purple-600" },
                        };
                        const c = colorMap[opt.color];
                        return (
                            <motion.button
                                key={opt.key}
                                onClick={() => update({ [opt.key]: !checked })}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${checked ? `${c.border} ${c.bg}` : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                                    }`}
                            >
                                <div className="flex-shrink-0">
                                    {checked
                                        ? <CheckSquare className={`w-5 h-5 ${c.icon}`} />
                                        : <Square className="w-5 h-5 text-slate-400" />
                                    }
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm font-semibold ${checked ? c.text : "text-slate-700"}`}>{opt.label}</p>
                                    <p className={`text-xs mt-0.5 ${checked ? c.text + "/70" : "text-slate-400"}`}>{opt.sublabel}</p>
                                </div>
                                <span className={`text-xs px-2.5 py-1 rounded-lg font-bold flex-shrink-0 ${checked ? c.badge : "bg-slate-200 text-slate-500"}`}>
                                    ≤ {opt.days}
                                </span>
                            </motion.button>
                        );
                    })}
                </div>
            </motion.div>

            {/* Verification Method */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-5"
            >
                <h3 className="font-bold text-slate-700 mb-1 flex items-center gap-2">
                    <span className="text-base">🔎</span>
                    วิธีการตรวจสอบ
                </h3>
                <p className="text-xs text-slate-400 mb-4">เลือกวิธีที่ใช้ในการตรวจสอบข้อมูล KPI</p>
                <div className="space-y-3">
                    {verifyOptions.map((opt) => {
                        const checked = data[opt.key] as boolean;
                        return (
                            <motion.button
                                key={opt.key}
                                onClick={() => update({ [opt.key]: !checked })}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${checked ? "border-sky-400 bg-sky-50" : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                                    }`}
                            >
                                <span className="text-lg">{opt.emoji}</span>
                                <div className="flex-shrink-0">
                                    {checked
                                        ? <CheckSquare className="w-5 h-5 text-sky-600" />
                                        : <Square className="w-5 h-5 text-slate-400" />
                                    }
                                </div>
                                <p className={`text-sm font-semibold ${checked ? "text-sky-800" : "text-slate-700"}`}>{opt.label}</p>
                            </motion.button>
                        );
                    })}
                </div>

                {data.verifyRandom && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 pl-2"
                    >
                        <label className="block text-sm font-medium text-slate-600 mb-2">
                            จำนวนเรื่องที่สุ่มตรวจสอบ
                        </label>
                        <input
                            type="number"
                            min={0}
                            value={data.randomCount}
                            onChange={(e) => update({ randomCount: e.target.value })}
                            placeholder="ระบุจำนวนเรื่อง"
                            className="w-48 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition text-sm"
                        />
                    </motion.div>
                )}
            </motion.div>

            {/* KPI Benchmarks */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
                <div className="bg-gradient-to-r from-slate-50 to-sky-50 border-b border-slate-100 px-5 py-3">
                    <h3 className="font-bold text-slate-700 text-sm">เกณฑ์ระดับคะแนนตัวชี้วัด KPI ปีงบประมาณ 2569</h3>
                </div>
                <div className="divide-y divide-slate-50">
                    {[
                        { level: 5, range: "100%", desc: "บรรลุเป้าหมายสูงสุด", color: "text-emerald-600", dot: "bg-emerald-500", bg: "bg-emerald-50" },
                        { level: 4, range: "95–99%", desc: "ดีมาก", color: "text-sky-600", dot: "bg-sky-500", bg: "bg-sky-50" },
                        { level: 3, range: "91–94%", desc: "ดี", color: "text-blue-600", dot: "bg-blue-500", bg: "bg-blue-50" },
                        { level: 2, range: "80–90%", desc: "พอใช้", color: "text-amber-600", dot: "bg-amber-500", bg: "bg-amber-50" },
                        { level: 1, range: "<80%", desc: "ต้องปรับปรุง", color: "text-red-600", dot: "bg-red-500", bg: "bg-red-50" },
                    ].map((row) => {
                        const isCurrentLevel = data.kpiB > 0 && level.level === row.level;
                        return (
                            <div key={row.level} className={`px-5 py-3 flex items-center gap-3 transition-colors ${isCurrentLevel ? row.bg : ""}`}>
                                <div className="flex items-center gap-2 w-24">
                                    <div className={`w-2.5 h-2.5 rounded-full ${row.dot}`} />
                                    <span className="font-bold text-slate-700 text-sm">ระดับ {row.level}</span>
                                </div>
                                <span className={`font-bold text-sm ${row.color} w-20`}>{row.range}</span>
                                <span className="text-slate-500 text-sm flex-1">{row.desc}</span>
                                {isCurrentLevel && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className={`text-xs font-bold px-2 py-1 rounded-lg ${row.bg} ${row.color} border border-current/20`}
                                    >
                                        ← ระดับปัจจุบัน
                                    </motion.span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}

function NumberInput({
    label, hint, value, onChange, color, letter,
}: {
    label: string; hint: string; value: number; onChange: (v: number) => void; color: string; letter: string;
}) {
    const colorMap: Record<string, { ring: string; badge: string; bcolor: string }> = {
        emerald: { ring: "focus:ring-emerald-400 focus:border-emerald-400", badge: "bg-emerald-100 text-emerald-700 border-emerald-200", bcolor: "border-emerald-400" },
        sky: { ring: "focus:ring-sky-400 focus:border-sky-400", badge: "bg-sky-100 text-sky-700 border-sky-200", bcolor: "border-sky-400" },
    };
    const c = colorMap[color];
    return (
        <div>
            <div className="flex items-center gap-2 mb-1">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-extrabold border ${c.badge}`}>{letter}</span>
                <label className="block text-sm font-semibold text-slate-700">{label}</label>
            </div>
            <p className="text-xs text-slate-400 mb-2 pl-8">{hint}</p>
            <input
                type="number"
                min={0}
                value={value === 0 ? "" : value}
                onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
                placeholder="0"
                className={`w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-2xl font-black focus:ring-2 outline-none transition ${c.ring} ${value > 0 ? c.bcolor : ""}`}
            />
        </div>
    );
}
