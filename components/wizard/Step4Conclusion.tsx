"use client";

import { AssessmentData } from "@/app/assessment/page";
import { calculateKPI, determineLevel } from "@/lib/scoring";
import { GCHP_DIMENSIONS } from "@/lib/gchp-data";
import { calculateDimensionScore } from "@/lib/scoring";
import {
    ClipboardCheck, CheckCircle2, AlertCircle, FileText,
    PenLine, Star, BarChart3, MessageSquare, Trash2, RotateCcw,
} from "lucide-react";
import { useRef, useEffect, useCallback } from "react";

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

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
                    <ClipboardCheck className="w-6 h-6 text-sky-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">ส่วนที่ 4: สรุปผลการตรวจประเมิน</h2>
                    <p className="text-sm text-slate-500">รวบรวมผลคะแนนและบันทึกลายเซ็นอิเล็กทรอนิกส์</p>
                </div>
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-br from-sky-600 to-emerald-600 rounded-2xl p-6 mb-5 text-white shadow-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-sky-200 text-sm font-medium mb-1">{data.orgType || "สสอ."}</p>
                        <h3 className="text-2xl font-extrabold">
                            {data.district ? `${data.orgType || "สสอ."}${data.district}` : "—"}
                        </h3>
                        <p className="text-sky-200 text-sm mt-1">วันที่ตรวจประเมิน: {data.date || "—"}</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white/20 backdrop-blur rounded-2xl p-4 text-center min-w-[100px]">
                            <p className="text-xs text-white/70 mb-1">คะแนน GCHP</p>
                            <p className="text-4xl font-black">{totalScore.toFixed(1)}</p>
                            <p className="text-xs text-white/70">/ 100</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur rounded-2xl p-4 text-center min-w-[100px]">
                            <p className="text-xs text-white/70 mb-1">KPI</p>
                            <p className="text-4xl font-black">{data.kpiB > 0 ? kpi.toFixed(0) : "—"}</p>
                            <p className="text-xs text-white/70">%</p>
                        </div>
                    </div>
                </div>
                {data.kpiB > 0 && (
                    <div className="mt-4 flex items-center gap-2 bg-white/20 backdrop-blur rounded-xl px-4 py-2 w-fit">
                        <Star className="w-4 h-4" />
                        <span className="font-bold text-sm">{level.label}</span>
                    </div>
                )}
            </div>

            {/* Score breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-5">
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-sky-600" />
                    <h3 className="font-bold text-slate-700 text-sm">สรุปคะแนนรายมิติ</h3>
                    <span className={`ml-auto text-xs px-2 py-1 rounded-lg font-semibold ${allAnswered ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {answeredCount}/{totalCriteria} ข้อ
                    </span>
                </div>
                <div className="divide-y divide-slate-50">
                    {GCHP_DIMENSIONS.map((dim) => {
                        const s = calculateDimensionScore(dim.id, data.scores);
                        const pct = (s / dim.totalWeight) * 100;
                        return (
                            <div key={dim.id} className="px-5 py-3 flex items-center gap-3">
                                <span className="w-6 text-xs font-bold text-slate-400 flex-shrink-0">{dim.id}</span>
                                <span className="flex-1 text-sm text-slate-700 truncate">{dim.title}</span>
                                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block flex-shrink-0">
                                    <div
                                        className={`h-full rounded-full ${pct >= 80 ? "bg-emerald-400" : pct >= 50 ? "bg-amber-400" : pct > 0 ? "bg-red-400" : "bg-slate-200"}`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                <span className={`text-sm font-bold w-16 text-right flex-shrink-0 ${pct >= 80 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : pct > 0 ? "text-red-500" : "text-slate-300"}`}>
                                    {s.toFixed(1)}/{dim.totalWeight}
                                </span>
                            </div>
                        );
                    })}
                    <div className="px-5 py-3 flex items-center gap-3 bg-sky-50">
                        <span className="w-6" />
                        <span className="flex-1 text-sm font-bold text-sky-800">รวมคะแนน GCHP</span>
                        <span className={`text-xl font-extrabold ${totalScore >= 80 ? "text-emerald-600" : totalScore >= 60 ? "text-amber-600" : "text-red-600"}`}>
                            {totalScore.toFixed(1)} / 100
                        </span>
                    </div>
                </div>
            </div>

            {/* Completeness check */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-5">
                <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-sky-600" />
                    ความสมบูรณ์ของข้อมูล
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                    {[
                        { label: "ข้อมูลทั่วไป", ok: !!(data.district && data.date && data.assessorName1 && data.agencyHead) },
                        { label: "ประเมิน 10 มิติ", ok: allAnswered },
                        { label: "ข้อมูล KPI", ok: data.kpiB > 0 },
                        { label: "วิธีการตรวจสอบ", ok: data.verifyDoc || data.verifySystem || data.verifyRandom },
                    ].map((item) => (
                        <div
                            key={item.label}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${item.ok ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}
                        >
                            {item.ok
                                ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                : <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            }
                            <span className={`text-sm font-semibold ${item.ok ? "text-emerald-800" : "text-amber-800"}`}>
                                {item.label}
                            </span>
                            <span className={`ml-auto text-xs font-medium ${item.ok ? "text-emerald-600" : "text-amber-600"}`}>
                                {item.ok ? "ครบถ้วน" : "ไม่ครบ"}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Comments */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-5">
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-sky-600" />
                    ข้อเสนอแนะ / ข้อสังเกต
                </label>
                <textarea
                    value={data.comments}
                    onChange={(e) => update({ comments: e.target.value })}
                    placeholder="บันทึกข้อเสนอแนะ จุดที่ควรปรับปรุง หรือข้อสังเกตจากการตรวจประเมิน..."
                    rows={5}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition resize-none text-sm"
                />
            </div>

            {/* E-Signature */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
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
            </div>
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
        <div>
            <div className="flex items-center justify-between mb-2">
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
                <p className="text-xs text-slate-500 mb-2">ชื่อ: <span className="font-semibold text-slate-700">{name}</span></p>
            )}
            <div className={`border-2 ${borderColor} rounded-xl overflow-hidden bg-white relative`}>
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
                        <p className="text-slate-300 text-xs font-medium">✍️ วาดลายเซ็นที่นี่</p>
                    </div>
                )}
            </div>
            <p className="text-center text-xs text-slate-400 mt-1">E-Signature</p>
        </div>
    );
}
