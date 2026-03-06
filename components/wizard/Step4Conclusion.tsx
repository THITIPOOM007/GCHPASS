"use client";

import { AssessmentData } from "@/app/assessment/page";
import { calculateKPI, determineLevel } from "@/lib/scoring";
import { GCHP_DIMENSIONS } from "@/lib/gchp-data";
import { calculateDimensionScore } from "@/lib/scoring";
import {
    ClipboardCheck, CheckCircle2, AlertCircle, FileText,
    PenLine, Star, BarChart3, MessageSquare, RotateCcw, Trophy,
} from "lucide-react";
import { useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface Props {
    data: AssessmentData;
    update: (patch: Partial<AssessmentData>) => void;
    totalScore: number;
}

export default function Step4Conclusion({ data, update, totalScore }: Props) {
    const kpi = calculateKPI(data.kpiA, data.kpiB);
    const level = determineLevel(kpi);
    const answeredCount = Object.keys(data.scores).length;
    const totalCriteria = GCHP_DIMENSIONS.reduce((s, d) => s + d.criteria.length, 0);
    const allAnswered = answeredCount === totalCriteria;

    const scoreGrade = totalScore >= 90 ? "A" : totalScore >= 80 ? "B" : totalScore >= 70 ? "C" : totalScore >= 60 ? "D" : "F";
    const scoreGradeColor = totalScore >= 80 ? "text-emerald-400" : totalScore >= 60 ? "text-amber-400" : "text-red-400";

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex items-center gap-3"
            >
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                    <ClipboardCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">ส่วนที่ 4: สรุปผลการตรวจประเมิน</h2>
                    <p className="text-sm text-slate-500">รวบรวมผลคะแนนและบันทึกลายเซ็นอิเล็กทรอนิกส์</p>
                </div>
            </motion.div>

            {/* ===== PREMIUM SUMMARY CARD ===== */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="relative overflow-hidden rounded-3xl shadow-xl mb-5"
            >
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-sky-900 to-emerald-900" />
                {/* Decorative orbs */}
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-sky-400/20 rounded-full blur-2xl" />
                <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-emerald-400/20 rounded-full blur-2xl" />

                <div className="relative px-6 py-6">
                    {/* Top row */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
                        <div>
                            <p className="text-sky-300 text-xs font-medium mb-1">{data.orgType || "สสอ."}</p>
                            <h3 className="text-2xl font-extrabold text-white">
                                {data.district ? `${data.orgType || "สสอ."}${data.district}` : "—"}
                            </h3>
                            <p className="text-sky-200/70 text-sm mt-1">วันที่ตรวจประเมิน: {data.date || "—"}</p>
                        </div>

                        {/* Score badges */}
                        <div className="flex gap-3">
                            {/* GCHP Score */}
                            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 text-center min-w-[110px]">
                                <p className="text-white/60 text-xs mb-1">คะแนน GCHP</p>
                                <motion.p
                                    key={totalScore}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-4xl font-black text-white"
                                >
                                    {totalScore.toFixed(1)}
                                </motion.p>
                                <p className="text-white/50 text-xs">/ 100</p>
                            </div>

                            {/* Grade */}
                            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 text-center min-w-[80px]">
                                <p className="text-white/60 text-xs mb-1">เกรด</p>
                                <motion.p
                                    key={scoreGrade}
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className={`text-4xl font-black ${scoreGradeColor}`}
                                >
                                    {scoreGrade}
                                </motion.p>
                            </div>

                            {/* KPI */}
                            {data.kpiB > 0 && (
                                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 text-center min-w-[90px]">
                                    <p className="text-white/60 text-xs mb-1">KPI</p>
                                    <motion.p
                                        key={kpi}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="text-4xl font-black text-white"
                                    >
                                        {kpi.toFixed(0)}
                                    </motion.p>
                                    <p className="text-white/50 text-xs">%</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* KPI Level badge */}
                    {data.kpiB > 0 && (
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-xl px-4 py-2 w-fit">
                            <Star className="w-4 h-4 text-amber-400" />
                            <span className="font-bold text-sm text-white">{level.label}</span>
                        </div>
                    )}

                    {/* Progress bar */}
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-white/50 mb-1">
                            <span>คะแนน GCHP</span>
                            <span>{totalScore.toFixed(1)} / 100</span>
                        </div>
                        <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className={`h-full rounded-full ${totalScore >= 80 ? "bg-emerald-400" : totalScore >= 60 ? "bg-amber-400" : "bg-red-400"}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${totalScore}%` }}
                                transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                            />
                        </div>
                    </div>

                    {/* All answered celebration */}
                    {allAnswered && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-4 flex items-center gap-2 bg-emerald-400/20 border border-emerald-400/30 rounded-xl px-4 py-2.5"
                        >
                            <Trophy className="w-4 h-4 text-amber-400" />
                            <span className="text-white text-sm font-semibold">ประเมินครบทั้ง {totalCriteria} ข้อเกณฑ์แล้ว 🎉</span>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* Score breakdown */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-5"
            >
                <div className="px-5 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-sky-50 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-sky-600" />
                    <h3 className="font-bold text-slate-700 text-sm">สรุปคะแนนรายมิติ</h3>
                    <span className={`ml-auto text-xs px-2 py-1 rounded-lg font-semibold ${allAnswered ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {answeredCount}/{totalCriteria} ข้อ
                    </span>
                </div>
                <div className="divide-y divide-slate-50">
                    {GCHP_DIMENSIONS.map((dim, idx) => {
                        const s = calculateDimensionScore(dim.id, data.scores);
                        const pct = (s / dim.totalWeight) * 100;
                        return (
                            <motion.div
                                key={dim.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.05 * idx }}
                                className="px-5 py-3 flex items-center gap-3"
                            >
                                <span className="w-6 text-xs font-bold text-slate-400 flex-shrink-0">{dim.id}</span>
                                <span className="flex-1 text-sm text-slate-700 truncate">{dim.title}</span>
                                <div className="w-28 h-2 bg-slate-100 rounded-full overflow-hidden hidden sm:block flex-shrink-0">
                                    <motion.div
                                        className={`h-full rounded-full ${pct >= 80 ? "bg-emerald-400" : pct >= 50 ? "bg-amber-400" : pct > 0 ? "bg-red-400" : "bg-slate-200"}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${pct}%` }}
                                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 + idx * 0.03 }}
                                    />
                                </div>
                                <span className={`text-sm font-bold w-16 text-right flex-shrink-0 ${pct >= 80 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : pct > 0 ? "text-red-500" : "text-slate-300"}`}>
                                    {s.toFixed(1)}/{dim.totalWeight}
                                </span>
                            </motion.div>
                        );
                    })}
                    <div className="px-5 py-4 flex items-center gap-3 bg-gradient-to-r from-sky-50 to-emerald-50 border-t border-sky-100">
                        <span className="w-6" />
                        <span className="flex-1 text-sm font-bold text-sky-800">รวมคะแนน GCHP</span>
                        <span className={`text-2xl font-extrabold ${totalScore >= 80 ? "text-emerald-600" : totalScore >= 60 ? "text-amber-600" : "text-red-600"}`}>
                            {totalScore.toFixed(1)} <span className="text-sm text-slate-400 font-normal">/ 100</span>
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Completeness check */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-5"
            >
                <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-sky-600" />
                    ความสมบูรณ์ของข้อมูล
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                    {[
                        { label: "ข้อมูลทั่วไป", ok: !!(data.district && data.date && data.assessorName1 && data.agencyHead), emoji: "📋" },
                        { label: "ประเมิน 10 มิติ", ok: allAnswered, emoji: "📊" },
                        { label: "ข้อมูล KPI", ok: data.kpiB > 0, emoji: "🎯" },
                        { label: "วิธีการตรวจสอบ", ok: data.verifyDoc || data.verifySystem || data.verifyRandom, emoji: "🔍" },
                    ].map((item, i) => (
                        <motion.div
                            key={item.label}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.25 + i * 0.05 }}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 ${item.ok ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}
                        >
                            <span className="text-lg">{item.emoji}</span>
                            {item.ok
                                ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                : <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            }
                            <span className={`text-sm font-semibold flex-1 ${item.ok ? "text-emerald-800" : "text-amber-800"}`}>
                                {item.label}
                            </span>
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${item.ok ? "bg-emerald-200 text-emerald-700" : "bg-amber-200 text-amber-700"}`}>
                                {item.ok ? "✓ ครบ" : "ไม่ครบ"}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Comments */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-5"
            >
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-sky-600" />
                    ข้อเสนอแนะ / ข้อสังเกต
                </label>
                <textarea
                    value={data.comments}
                    onChange={(e) => update({ comments: e.target.value })}
                    placeholder="บันทึกข้อเสนอแนะ จุดที่ควรปรับปรุง หรือข้อสังเกตจากการตรวจประเมิน..."
                    rows={5}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition resize-none text-sm bg-slate-50 focus:bg-white"
                />
            </motion.div>

            {/* E-Signature */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
            >
                <h3 className="font-bold text-slate-700 mb-1 flex items-center gap-2 text-sm">
                    <PenLine className="w-4 h-4 text-sky-600" />
                    ลายเซ็นอิเล็กทรอนิกส์ (E-Signature)
                </h3>
                <p className="text-xs text-slate-400 mb-4">ใช้นิ้วหรือปากกาวาดลายเซ็นบนพื้นที่ด้านล่างได้เลย</p>
                <div className="grid sm:grid-cols-2 gap-6">
                    <SignaturePad
                        title="ผู้ตรวจประเมิน"
                        name={data.assessorName1}
                        value={data.signAssessor}
                        onChange={(v) => update({ signAssessor: v })}
                        color="sky"
                    />
                    <SignaturePad
                        title="ผู้รับการตรวจประเมิน"
                        name={data.agencyHead}
                        value={data.signAssessee}
                        onChange={(v) => update({ signAssessee: v })}
                        color="emerald"
                    />
                </div>

                {/* Certification note */}
                <div className="mt-5 bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <p className="text-xs text-slate-500 leading-relaxed">
                        ข้าพเจ้าขอรับรองว่าข้อมูลที่กรอกในแบบฟอร์มนี้ถูกต้องตามความเป็นจริงทุกประการ
                        และยินยอมให้ใช้ข้อมูลดังกล่าวในการประเมินมาตรฐานการจัดการเรื่องร้องเรียน (GCHP)
                        ของสำนักงานสาธารณสุขจังหวัดศรีสะเกษ ประจำปีงบประมาณ 2569
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

/** Canvas-based E-Signature pad */
function SignaturePad({
    title, name, value, onChange, color,
}: {
    title: string; name: string; value: string; onChange: (v: string) => void; color: "sky" | "emerald";
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);
    const lastPos = useRef<{ x: number; y: number } | null>(null);
    const borderColor = color === "sky" ? "border-sky-300" : "border-emerald-300";
    const headerGrad = color === "sky" ? "from-sky-50 to-sky-100 border-sky-200" : "from-emerald-50 to-emerald-100 border-emerald-200";
    const dotColor = color === "sky" ? "bg-sky-500" : "bg-emerald-500";
    const strokeColor = color === "sky" ? "#0284c7" : "#059669";

    // Restore existing signature to canvas on mount
    useEffect(() => {
        if (!value) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const img = new Image();
        img.onload = () => {
            const ctx = canvas.getContext("2d");
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
            ctx?.drawImage(img, 0, 0);
        };
        img.src = value;
    }, []);

    const getPos = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        if ("touches" in e) {
            const touch = e.touches[0];
            return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY };
        }
        return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
    };

    const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        isDrawing.current = true;
        lastPos.current = getPos(e);
    };

    const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        if (!isDrawing.current) return;
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(lastPos.current!.x, lastPos.current!.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
        lastPos.current = pos;
    }, [strokeColor]);

    const endDraw = () => {
        if (!isDrawing.current) return;
        isDrawing.current = false;
        const canvas = canvasRef.current;
        if (canvas) {
            onChange(canvas.toDataURL("image/png"));
        }
    };

    const clear = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        onChange("");
    };

    return (
        <div className="rounded-2xl border border-slate-200 overflow-hidden">
            {/* Signature header */}
            <div className={`bg-gradient-to-r ${headerGrad} border-b px-4 py-3 flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${dotColor}`} />
                    <p className="text-sm font-bold text-slate-700">{title}</p>
                </div>
                {value && (
                    <button onClick={clear} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition">
                        <RotateCcw className="w-3 h-3" /> ล้าง
                    </button>
                )}
            </div>
            {name && (
                <div className="px-4 py-2 bg-white border-b border-slate-100">
                    <p className="text-xs text-slate-500">ชื่อ: <span className="font-semibold text-slate-700">{name}</span></p>
                </div>
            )}
            <div className={`border-2 ${borderColor} bg-white relative`} style={{ borderWidth: 0 }}>
                <canvas
                    ref={canvasRef}
                    width={600}
                    height={160}
                    className="w-full touch-none cursor-crosshair"
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={endDraw}
                    onMouseLeave={endDraw}
                    onTouchStart={startDraw}
                    onTouchMove={draw}
                    onTouchEnd={endDraw}
                />
                {!value && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p className="text-slate-300 text-sm">✍️ วาดลายเซ็นที่นี่</p>
                    </div>
                )}
            </div>
            <p className="text-center text-xs text-slate-400 py-1.5 bg-slate-50 border-t border-slate-100">E-Signature</p>
        </div>
    );
}
