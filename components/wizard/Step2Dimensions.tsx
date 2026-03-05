"use client";

import { AssessmentData } from "@/app/assessment/page";
import { GCHP_DIMENSIONS } from "@/lib/gchp-data";
import { calculateDimensionScore, getScoreBarColor } from "@/lib/scoring";
import { BarChart3, ChevronDown, ChevronUp, Camera, ImageIcon, Trash2 } from "lucide-react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
    data: AssessmentData;
    update: (patch: Partial<AssessmentData>) => void;
    totalScore: number;
}

const SCORE_OPTIONS = [
    { value: 2, label: "2", sublabel: "ครบถ้วน", color: "bg-emerald-500 text-white border-emerald-500", hover: "hover:bg-emerald-50 hover:border-emerald-400" },
    { value: 1, label: "1", sublabel: "บกพร่อง", color: "bg-amber-500 text-white border-amber-500", hover: "hover:bg-amber-50 hover:border-amber-400" },
    { value: 0, label: "0", sublabel: "ไม่มีระบบ", color: "bg-red-500 text-white border-red-500", hover: "hover:bg-red-50 hover:border-red-400" },
];

export default function Step2Dimensions({ data, update, totalScore }: Props) {
    const [expanded, setExpanded] = useState<number[]>([1]);

    const setScore = (criterionId: string, score: number) => {
        update({ scores: { ...data.scores, [criterionId]: score } });
    };

    const setEvidence = (criterionId: string, text: string) => {
        update({ evidence: { ...data.evidence, [criterionId]: text } });
    };

    const toggle = (id: number) => {
        setExpanded((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handleImageUpload = (criterionId: string, file: File) => {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx?.drawImage(img, 0, 0, width, height);

                // Compress high quality JPEG to Base64
                const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
                update({ images: { ...data.images, [criterionId]: dataUrl } });
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const removeImage = (criterionId: string) => {
        const newImages = { ...data.images };
        delete newImages[criterionId];
        update({ images: newImages });
    };

    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    const totalPercent = totalScore; // already out of 100

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-sky-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">ส่วนที่ 2: ประเมินองค์ประกอบมาตรฐาน GCHP 10 มิติ</h2>
                    <p className="text-sm text-slate-500">คะแนนเต็ม 100 คะแนน — ให้คะแนน 2, 1, หรือ 0 ต่อแต่ละเกณฑ์</p>
                </div>
            </div>

            {/* Sticky score bar */}
            <div className="sticky top-[120px] z-20 bg-white/95 backdrop-blur border border-slate-200 rounded-2xl shadow-md px-5 py-3 mb-5 flex items-center gap-4">
                <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-slate-700">คะแนนรวม GCHP</span>
                        <span className={`font-extrabold text-lg ${totalScore >= 80 ? "text-emerald-600" : totalScore >= 60 ? "text-amber-600" : "text-red-500"}`}>
                            {totalScore.toFixed(1)} / 100
                        </span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full progress-fill ${getScoreBarColor(totalPercent)}`}
                            style={{ width: `${totalPercent}%` }}
                        />
                    </div>
                </div>
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-extrabold text-xl ${totalScore >= 80 ? "bg-emerald-100 text-emerald-700" : totalScore >= 60 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                    {Math.round(totalPercent)}%
                </div>
            </div>

            {/* Dimensions */}
            <div className="space-y-3">
                {GCHP_DIMENSIONS.map((dim) => {
                    const dimScore = calculateDimensionScore(dim.id, data.scores);
                    const dimPercent = (dimScore / dim.totalWeight) * 100;
                    const isOpen = expanded.includes(dim.id);
                    const answered = dim.criteria.filter((c) => data.scores[c.id] !== undefined).length;

                    return (
                        <div key={dim.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            {/* Dimension header */}
                            <button
                                onClick={() => toggle(dim.id)}
                                className="w-full px-5 py-4 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors"
                            >
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${answered === dim.criteria.length ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"}`}>
                                    {dim.id}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-800 text-sm leading-tight">มิติที่ {dim.id}: {dim.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex-1 max-w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${dimPercent >= 80 ? "bg-emerald-400" : dimPercent >= 50 ? "bg-amber-400" : dimPercent > 0 ? "bg-red-400" : "bg-slate-200"}`}
                                                style={{ width: `${dimPercent}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-slate-500">{dimScore.toFixed(1)}/{dim.totalWeight} ({answered}/{dim.criteria.length} ข้อ)</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-bold ${dimPercent >= 80 ? "text-emerald-600" : dimPercent >= 50 ? "text-amber-600" : "text-red-500"}`}>
                                        {dimScore.toFixed(1)}
                                    </span>
                                    <span className="text-xs text-slate-400">/{dim.totalWeight}</span>
                                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                </div>
                            </button>

                            {/* Criteria list */}
                            <AnimatePresence initial={false}>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.25, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <div className="border-t border-slate-100 divide-y divide-slate-50">
                                            {dim.criteria.map((criterion) => {
                                                const currentScore = data.scores[criterion.id];
                                                const hasScore = currentScore !== undefined;

                                                return (
                                                    <div key={criterion.id} className={`px-5 py-4 ${hasScore ? "" : "bg-slate-50/50"}`}>
                                                        <div className="flex items-start gap-3">
                                                            {/* Criterion number */}
                                                            <span className="mt-0.5 text-xs font-bold text-slate-400 w-8 flex-shrink-0">{criterion.id}</span>
                                                            <div className="flex-1">
                                                                <p className="text-sm text-slate-700 leading-relaxed mb-3">
                                                                    {criterion.label}
                                                                    <span className="ml-2 inline-flex items-center bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-medium">
                                                                        น้ำหนัก: {criterion.weight} คะแนน
                                                                    </span>
                                                                </p>
                                                                {/* Score buttons */}
                                                                <div className="flex flex-wrap gap-2 mb-3">
                                                                    {SCORE_OPTIONS.map((opt) => {
                                                                        const isSelected = currentScore === opt.value;
                                                                        return (
                                                                            <button
                                                                                key={opt.value}
                                                                                onClick={() => setScore(criterion.id, opt.value)}
                                                                                className={`score-btn flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 font-semibold text-sm transition-all ${isSelected ? `${opt.color} active` : `bg-white border-slate-200 text-slate-600 ${opt.hover}`
                                                                                    }`}
                                                                            >
                                                                                <span className="font-extrabold">{opt.label}</span>
                                                                                <span className={`text-xs ${isSelected ? "opacity-90" : "text-slate-400"}`}>{opt.sublabel}</span>
                                                                            </button>
                                                                        );
                                                                    })}
                                                                    {hasScore && (
                                                                        <div className={`flex items-center gap-1 text-xs px-3 py-2 rounded-xl font-semibold ${currentScore === 2 ? "bg-emerald-50 text-emerald-700" :
                                                                            currentScore === 1 ? "bg-amber-50 text-amber-700" :
                                                                                "bg-red-50 text-red-700"
                                                                            }`}>
                                                                            ได้ {((criterion.weight * currentScore) / 2).toFixed(1)} คะแนน
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="mt-3 space-y-2">
                                                                    <textarea
                                                                        value={data.evidence[criterion.id] || ""}
                                                                        onChange={(e) => setEvidence(criterion.id, e.target.value)}
                                                                        placeholder="หลักฐานที่ตรวจพบ / หมายเหตุ..."
                                                                        rows={2}
                                                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition resize-none bg-slate-50 focus:bg-white"
                                                                    />

                                                                    {/* Image Upload Area */}
                                                                    <div className="flex flex-col gap-2">
                                                                        <input
                                                                            type="file"
                                                                            accept="image/*"
                                                                            capture="environment"
                                                                            className="hidden"
                                                                            ref={(el) => { fileInputRefs.current[criterion.id] = el; }}
                                                                            onChange={(e) => {
                                                                                if (e.target.files && e.target.files[0]) {
                                                                                    handleImageUpload(criterion.id, e.target.files[0]);
                                                                                }
                                                                            }}
                                                                        />

                                                                        {data.images[criterion.id] ? (
                                                                            <div className="relative inline-block border border-slate-200 p-1 rounded-xl bg-slate-50 self-start group">
                                                                                <img
                                                                                    src={data.images[criterion.id]}
                                                                                    alt="หลักฐาน"
                                                                                    className="h-32 object-contain rounded-lg"
                                                                                />
                                                                                <button
                                                                                    onClick={() => removeImage(criterion.id)}
                                                                                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                >
                                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                                </button>
                                                                            </div>
                                                                        ) : (
                                                                            <button
                                                                                onClick={() => fileInputRefs.current[criterion.id]?.click()}
                                                                                className="flex items-center gap-2 text-xs font-semibold text-sky-600 bg-sky-50 border border-sky-200 hover:bg-sky-100 px-3 py-2 rounded-xl transition self-start"
                                                                            >
                                                                                <Camera className="w-4 h-4" />
                                                                                แนบรูปถ่ายหลักฐาน
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            {/* Dimension Summary table */}
            <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-slate-700 text-sm">สรุปคะแนนรายมิติ</h3>
                </div>
                <div className="divide-y divide-slate-50">
                    {GCHP_DIMENSIONS.map((dim) => {
                        const s = calculateDimensionScore(dim.id, data.scores);
                        const pct = (s / dim.totalWeight) * 100;
                        return (
                            <div key={dim.id} className="px-5 py-3 flex items-center gap-3">
                                <span className="w-6 text-xs font-bold text-slate-400">{dim.id}</span>
                                <span className="flex-1 text-sm text-slate-700 truncate">{dim.title}</span>
                                <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                                    <div className={`h-full rounded-full ${pct >= 80 ? "bg-emerald-400" : pct >= 50 ? "bg-amber-400" : "bg-slate-200"}`} style={{ width: `${pct}%` }} />
                                </div>
                                <span className={`text-sm font-bold w-16 text-right ${pct >= 80 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-slate-400"}`}>
                                    {s.toFixed(1)}/{dim.totalWeight}
                                </span>
                            </div>
                        );
                    })}
                    <div className="px-5 py-3 flex items-center gap-3 bg-sky-50">
                        <span className="w-6"></span>
                        <span className="flex-1 text-sm font-bold text-sky-800">คะแนนรวม</span>
                        <span className={`text-lg font-extrabold ${totalScore >= 80 ? "text-emerald-600" : totalScore >= 60 ? "text-amber-600" : "text-red-600"}`}>
                            {totalScore.toFixed(1)} / 100
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
