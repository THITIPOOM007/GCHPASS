"use client";

import { AssessmentData } from "@/app/assessment/page";
import { calculateKPI, determineLevel } from "@/lib/scoring";
import { ClipboardList, Info, CheckSquare, Square } from "lucide-react";

interface Props {
    data: AssessmentData;
    update: (patch: Partial<AssessmentData>) => void;
}

export default function Step3KPI({ data, update }: Props) {
    const kpi = calculateKPI(data.kpiA, data.kpiB);
    const level = determineLevel(kpi);

    const slaOptions = [
        { key: "sla10" as keyof AssessmentData, label: "เรื่องร้องเรียนทั่วไป (ดำเนินการภายใน 10 วันทำการ)", days: "10 วัน" },
        { key: "sla30" as keyof AssessmentData, label: "เรื่องที่ต้องตรวจสอบข้อเท็จจริง (ดำเนินการภายใน 30 วันทำการ)", days: "30 วัน" },
        { key: "sla60" as keyof AssessmentData, label: "เรื่องที่ซับซ้อน/ต้องสืบสวนสอบสวน (ดำเนินการภายใน 60 วันทำการ)", days: "60 วัน" },
    ];

    const verifyOptions = [
        { key: "verifyDoc" as keyof AssessmentData, label: "ตรวจสอบจากเอกสาร / แฟ้มข้อมูล" },
        { key: "verifySystem" as keyof AssessmentData, label: "ตรวจสอบจากระบบฐานข้อมูล" },
        { key: "verifyRandom" as keyof AssessmentData, label: "สุ่มตรวจสอบรายเรื่อง" },
    ];

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
                    <ClipboardList className="w-6 h-6 text-sky-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">ส่วนที่ 3: ตัวชี้วัดผลการดำเนินงาน (KPI)</h2>
                    <p className="text-sm text-slate-500">คำนวณ KPI จากจำนวนเรื่องร้องเรียนที่ดำเนินการได้ตาม SLA</p>
                </div>
            </div>

            {/* KPI Input */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-5">
                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-sky-100 text-sky-700 rounded-lg flex items-center justify-center text-xs font-extrabold">A</span>
                    ข้อมูลเรื่องร้องเรียน
                </h3>

                <div className="grid sm:grid-cols-2 gap-6">
                    <NumberInput
                        label="จำนวนเรื่องร้องเรียนที่ดำเนินการได้ตาม SLA (A)"
                        hint="เรื่องที่ดำเนินการแล้วเสร็จภายในเวลาที่กำหนด"
                        value={data.kpiA}
                        onChange={(v) => update({ kpiA: v })}
                        color="emerald"
                    />
                    <NumberInput
                        label="จำนวนเรื่องร้องเรียนทั้งหมดในรอบ 12 เดือน (B)"
                        hint="ปีงบประมาณ 2568 (ต.ค. 67 – ก.ย. 68)"
                        value={data.kpiB}
                        onChange={(v) => update({ kpiB: v })}
                        color="sky"
                    />
                </div>

                {/* KPI Result */}
                {data.kpiB > 0 && (
                    <div className={`mt-6 rounded-2xl border-2 p-5 ${level.bgColor}`}>
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-600 mb-1">ผลการคำนวณ KPI</p>
                                <p className="text-xs text-slate-500">
                                    KPI = A ÷ B × 100 = {data.kpiA} ÷ {data.kpiB} × 100
                                </p>
                            </div>
                            <div className="text-right">
                                <p className={`text-4xl font-extrabold ${level.color}`}>{kpi.toFixed(2)}%</p>
                                <p className={`text-sm font-bold mt-1 ${level.color}`}>{level.label}</p>
                            </div>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-4 h-3 bg-white/60 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ${level.level >= 5 ? "bg-emerald-500" :
                                        level.level === 4 ? "bg-sky-500" :
                                            level.level === 3 ? "bg-blue-500" :
                                                level.level === 2 ? "bg-amber-500" : "bg-red-500"
                                    }`}
                                style={{ width: `${Math.min(kpi, 100)}%` }}
                            />
                        </div>
                    </div>
                )}

                {data.kpiB <= 0 && (
                    <div className="mt-4 flex items-start gap-2 bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <Info className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-slate-500">กรอกจำนวนเรื่องร้องเรียนทั้งหมด (B) เพื่อคำนวณ KPI</p>
                    </div>
                )}
            </div>

            {/* SLA Compliance */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-5">
                <h3 className="font-bold text-slate-700 mb-1">ประเภท SLA ที่ปฏิบัติได้ตามเกณฑ์</h3>
                <p className="text-xs text-slate-400 mb-4">เลือกประเภทเรื่องร้องเรียนที่หน่วยงานสามารถดำเนินการได้ตาม SLA</p>
                <div className="space-y-3">
                    {slaOptions.map((opt) => {
                        const checked = data[opt.key] as boolean;
                        return (
                            <button
                                key={opt.key}
                                onClick={() => update({ [opt.key]: !checked })}
                                className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${checked
                                        ? "border-emerald-400 bg-emerald-50"
                                        : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                                    }`}
                            >
                                <div className="mt-0.5 flex-shrink-0">
                                    {checked ? (
                                        <CheckSquare className="w-5 h-5 text-emerald-600" />
                                    ) : (
                                        <Square className="w-5 h-5 text-slate-400" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm font-semibold ${checked ? "text-emerald-800" : "text-slate-700"}`}>
                                        {opt.label}
                                    </p>
                                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-lg font-medium ${checked ? "bg-emerald-200 text-emerald-700" : "bg-slate-200 text-slate-600"
                                        }`}>
                                        ≤ {opt.days}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Verification Method */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-5">
                <h3 className="font-bold text-slate-700 mb-1">วิธีการตรวจสอบ</h3>
                <p className="text-xs text-slate-400 mb-4">เลือกวิธีที่ใช้ในการตรวจสอบข้อมูล KPI</p>
                <div className="space-y-3">
                    {verifyOptions.map((opt) => {
                        const checked = data[opt.key] as boolean;
                        return (
                            <button
                                key={opt.key}
                                onClick={() => update({ [opt.key]: !checked })}
                                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${checked
                                        ? "border-sky-400 bg-sky-50"
                                        : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                                    }`}
                            >
                                <div className="flex-shrink-0">
                                    {checked ? (
                                        <CheckSquare className="w-5 h-5 text-sky-600" />
                                    ) : (
                                        <Square className="w-5 h-5 text-slate-400" />
                                    )}
                                </div>
                                <p className={`text-sm font-semibold ${checked ? "text-sky-800" : "text-slate-700"}`}>
                                    {opt.label}
                                </p>
                            </button>
                        );
                    })}
                </div>

                {/* Random count if verifyRandom */}
                {data.verifyRandom && (
                    <div className="mt-4 pl-2">
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
                    </div>
                )}
            </div>

            {/* KPI Benchmarks */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-bold text-slate-700 mb-3 text-sm">เกณฑ์ระดับคะแนนตัวชี้วัด KPI ปีงบประมาณ 2569</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="text-left px-3 py-2 text-xs font-bold text-slate-500 rounded-tl-lg">ระดับ</th>
                                <th className="text-left px-3 py-2 text-xs font-bold text-slate-500">เป้าหมาย KPI</th>
                                <th className="text-left px-3 py-2 text-xs font-bold text-slate-500 rounded-tr-lg">คำอธิบาย</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {[
                                { level: 5, range: "100%", desc: "บรรลุเป้าหมายสูงสุด", color: "text-emerald-600", dot: "bg-emerald-500" },
                                { level: 4, range: "95–99%", desc: "ดีมาก", color: "text-sky-600", dot: "bg-sky-500" },
                                { level: 3, range: "91–94%", desc: "ดี", color: "text-blue-600", dot: "bg-blue-500" },
                                { level: 2, range: "80–90%", desc: "พอใช้", color: "text-amber-600", dot: "bg-amber-500" },
                                { level: 1, range: "<80%", desc: "ต้องปรับปรุง", color: "text-red-600", dot: "bg-red-500" },
                            ].map((row) => (
                                <tr key={row.level} className={kpi >= 0 && level.level === row.level ? "bg-sky-50" : ""}>
                                    <td className="px-3 py-2.5 font-bold text-slate-700">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2.5 h-2.5 rounded-full ${row.dot}`} />
                                            ระดับ {row.level}
                                        </div>
                                    </td>
                                    <td className={`px-3 py-2.5 font-bold ${row.color}`}>{row.range}</td>
                                    <td className="px-3 py-2.5 text-slate-600">{row.desc}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function NumberInput({
    label, hint, value, onChange, color,
}: {
    label: string; hint: string; value: number; onChange: (v: number) => void; color: string;
}) {
    const ring = color === "emerald" ? "focus:ring-emerald-400 focus:border-emerald-400" : "focus:ring-sky-400 focus:border-sky-400";
    return (
        <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
            <p className="text-xs text-slate-400 mb-2">{hint}</p>
            <input
                type="number"
                min={0}
                value={value === 0 ? "" : value}
                onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
                placeholder="0"
                className={`w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 text-lg font-bold focus:ring-2 outline-none transition ${ring}`}
            />
        </div>
    );
}
