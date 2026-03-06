"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ClipboardList, MapPin, BarChart3, ClipboardCheck, Loader2, Sparkles, Save } from "lucide-react";
import Step1General from "@/components/wizard/Step1General";
import Step2Dimensions from "@/components/wizard/Step2Dimensions";
import Step3KPI from "@/components/wizard/Step3KPI";
import Step4Conclusion from "@/components/wizard/Step4Conclusion";
import { ScoreMap, calculateTotalGCHP, calculateKPI, determineLevel } from "@/lib/scoring";
import { saveAssessment, getAssessmentByDistrict } from "@/app/actions/assessment";

export type AssessmentData = {
    orgType: string;
    date: string;
    district: string;
    assessorName1: string;
    assessorName2: string;
    agencyHead: string;
    agencyHeadPosition: string;
    scores: ScoreMap;
    evidence: Record<string, string>;
    images: Record<string, string>; // Store dimId -> Base64 Data URL
    kpiA: number;
    kpiB: number;
    sla10: boolean;
    sla30: boolean;
    sla60: boolean;
    verifyDoc: boolean;
    verifySystem: boolean;
    verifyRandom: boolean;
    randomCount: string;
    comments: string;
    signAssessor: string;
    signAssessee: string;
};

const STEPS = [
    { id: 1, label: "ข้อมูลทั่วไป", icon: MapPin, color: "from-sky-500 to-sky-600" },
    { id: 2, label: "ประเมิน 10 มิติ", icon: BarChart3, color: "from-purple-500 to-indigo-600" },
    { id: 3, label: "คำนวณ KPI", icon: ClipboardList, color: "from-amber-500 to-orange-600" },
    { id: 4, label: "สรุปผล", icon: ClipboardCheck, color: "from-emerald-500 to-emerald-600" },
];

const defaultData: AssessmentData = {
    orgType: "สสอ.",
    date: new Date().toISOString().split("T")[0],
    district: "",
    assessorName1: "",
    assessorName2: "",
    agencyHead: "",
    agencyHeadPosition: "",
    scores: {},
    evidence: {},
    images: {},
    kpiA: 0,
    kpiB: 0,
    sla10: false,
    sla30: false,
    sla60: false,
    verifyDoc: false,
    verifySystem: false,
    verifyRandom: false,
    randomCount: "",
    comments: "",
    signAssessor: "",
    signAssessee: "",
};

/** Shimmer loading skeleton */
function LoadingScreen() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-sky-900 to-emerald-900 flex items-center justify-center relative overflow-hidden">
            {/* Background orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-32 -right-32 w-96 h-96 bg-sky-400 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-400 rounded-full blur-3xl"
                />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-6">
                {/* Animated icon */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", duration: 0.8, bounce: 0.4 }}
                    className="w-24 h-24 bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl flex items-center justify-center shadow-2xl"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                        <Sparkles className="w-10 h-10 text-sky-300" />
                    </motion.div>
                </motion.div>

                {/* Text */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center"
                >
                    <h2 className="text-white text-xl font-bold mb-2">กำลังโหลดข้อมูลการประเมิน</h2>
                    <p className="text-sky-300 text-sm">โปรดรอสักครู่...</p>
                </motion.div>

                {/* Animated dots */}
                <div className="flex gap-2">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{ y: [0, -12, 0], opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
                            className="w-3 h-3 bg-sky-400 rounded-full"
                        />
                    ))}
                </div>

                {/* Skeleton cards */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="w-80 space-y-3"
                >
                    {[1, 0.7, 0.5].map((w, i) => (
                        <motion.div
                            key={i}
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                            className="h-4 bg-white/20 rounded-full"
                            style={{ width: `${w * 100}%` }}
                        />
                    ))}
                </motion.div>
            </div>
        </div>
    );
}

export default function AssessmentPage() {
    const searchParams = useSearchParams();
    const districtParam = searchParams.get("district") ?? "";
    const router = useRouter();

    const [currentStep, setCurrentStep] = useState(1);
    const [data, setData] = useState<AssessmentData>({ ...defaultData, district: districtParam });
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
    const [isPending, startTransition] = useTransition();
    const [direction, setDirection] = useState(1);
    const [loadingExisting, setLoadingExisting] = useState(false);
    const [isFinalSubmit, setIsFinalSubmit] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Load existing assessment if a district is preset
    useEffect(() => {
        if (!districtParam) return;
        setLoadingExisting(true);
        getAssessmentByDistrict(districtParam).then((result) => {
            if (result.success && result.data) {
                const d = result.data;
                setData({
                    orgType: d.orgType,
                    date: d.date,
                    district: d.district,
                    assessorName1: d.assessorName1,
                    assessorName2: d.assessorName2 ?? "",
                    agencyHead: d.agencyHead,
                    agencyHeadPosition: d.agencyHeadPosition,
                    scores: d.scores as ScoreMap,
                    evidence: d.evidence as Record<string, string>,
                    images: d.images as Record<string, string>,
                    kpiA: d.kpiA,
                    kpiB: d.kpiB,
                    sla10: d.sla10,
                    sla30: d.sla30,
                    sla60: d.sla60,
                    verifyDoc: d.verifyDoc,
                    verifySystem: d.verifySystem,
                    verifyRandom: d.verifyRandom,
                    randomCount: d.randomCount ?? "",
                    comments: d.comments ?? "",
                    signAssessor: d.signAssessor ?? "",
                    signAssessee: d.signAssessee ?? "",
                });
            }
        }).finally(() => setLoadingExisting(false));
    }, [districtParam]);

    const update = (patch: Partial<AssessmentData>) => setData((prev) => ({ ...prev, ...patch }));
    const totalScore = useMemo(() => calculateTotalGCHP(data.scores), [data.scores]);

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleSave = (finalSubmit = false) => {
        if (!data.district) {
            showToast("กรุณาระบุชื่ออำเภอก่อนบันทึก", "error");
            return;
        }
        const kpiPct = calculateKPI(data.kpiA, data.kpiB);
        const level = determineLevel(kpiPct);

        startTransition(async () => {
            const result = await saveAssessment({
                ...data,
                totalScore,
                kpiPercentage: kpiPct,
                kpiLevel: level.level,
            });
            if (result.success) {
                if (finalSubmit) {
                    window.location.href = "/";
                } else {
                    setSaveSuccess(true);
                    setTimeout(() => setSaveSuccess(false), 2000);
                    showToast("บันทึกข้อมูลลงฐานข้อมูลเรียบร้อย ✓");
                }
            } else {
                showToast("เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่", "error");
            }
        });
    };

    const goNext = () => { setDirection(1); if (currentStep < 4) setCurrentStep((s) => s + 1); };
    const goBack = () => { setDirection(-1); if (currentStep > 1) setCurrentStep((s) => s - 1); };

    const stepVariants = {
        initial: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0, scale: 0.97 }),
        animate: { x: 0, opacity: 1, scale: 1 },
        exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0, scale: 0.97 }),
    };

    const scoreColor = totalScore >= 80 ? "text-emerald-400" : totalScore >= 60 ? "text-amber-400" : "text-red-400";

    if (loadingExisting) {
        return <LoadingScreen />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50">
            {/* ===== PREMIUM HEADER ===== */}
            <header className="sticky top-0 z-30 shadow-lg">
                {/* Gradient header bar */}
                <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-emerald-600 text-white px-4 py-3">
                    <div className="max-w-6xl mx-auto flex items-center gap-3">
                        <motion.div
                            whileHover={{ rotate: 10, scale: 1.05 }}
                            className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-md backdrop-blur-sm flex-shrink-0"
                        >
                            <ClipboardCheck className="w-5 h-5 text-white" />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-base font-bold text-white leading-tight">แบบฟอร์มตรวจประเมิน GCHP 2569</h1>
                            <p className="text-sky-200 text-xs truncate">
                                {data.district ? `📍 ${data.orgType}${data.orgType === "รพ." && data.district === "เมืองศรีสะเกษ" ? "ศรีสะเกษ" : data.district}` : "สำนักงานสาธารณสุขจังหวัดศรีสะเกษ"}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 ml-auto">
                            {/* Score chip */}
                            <div className="hidden sm:flex items-center gap-1.5 bg-white/15 backdrop-blur border border-white/20 rounded-xl px-3 py-1.5">
                                <span className="text-white/70 text-xs">GCHP</span>
                                <span className={`text-xl font-black ${scoreColor}`}>{totalScore.toFixed(1)}</span>
                                <span className="text-white/50 text-xs">/100</span>
                            </div>
                            <a
                                href="/"
                                className="hidden sm:flex items-center gap-1.5 bg-white/15 border border-white/20 hover:bg-white/25 text-white text-xs font-medium px-3 py-2 rounded-xl transition"
                            >
                                ← Dashboard
                            </a>
                            <motion.button
                                onClick={() => handleSave(false)}
                                disabled={isPending}
                                whileTap={{ scale: 0.95 }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md disabled:opacity-60 ${saveSuccess
                                    ? "bg-emerald-500 text-white"
                                    : "bg-white text-sky-700 hover:bg-sky-50"
                                    }`}
                            >
                                <AnimatePresence mode="wait">
                                    {isPending ? (
                                        <motion.div key="spinner" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        </motion.div>
                                    ) : saveSuccess ? (
                                        <motion.div key="check" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                                            <CheckCircle2 className="w-4 h-4" />
                                        </motion.div>
                                    ) : (
                                        <motion.div key="save" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                                            <Save className="w-4 h-4" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                {saveSuccess ? "บันทึกแล้ว!" : "บันทึก"}
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Step Indicator Bar */}
                <div className="bg-white border-b border-slate-200 px-4 py-3">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex items-center relative">
                            {STEPS.map((step, idx) => {
                                const Icon = step.icon;
                                const isDone = currentStep > step.id;
                                const isActive = currentStep === step.id;
                                return (
                                    <div key={step.id} className="flex items-center flex-1">
                                        <button
                                            onClick={() => { setDirection(step.id > currentStep ? 1 : -1); setCurrentStep(step.id); }}
                                            className="flex items-center gap-2 relative group"
                                        >
                                            {/* Circle */}
                                            <motion.div
                                                layout
                                                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm font-bold transition-all ${isDone
                                                    ? "bg-emerald-500 text-white shadow-emerald-200 shadow-md"
                                                    : isActive
                                                        ? `bg-gradient-to-br ${step.color} text-white shadow-md`
                                                        : "bg-slate-100 text-slate-400"
                                                    }`}
                                            >
                                                {isDone ? (
                                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </motion.div>
                                                ) : (
                                                    <Icon className="w-4 h-4" />
                                                )}
                                            </motion.div>
                                            <span className={`hidden sm:block text-xs font-semibold transition-colors ${isActive ? "text-sky-700" : isDone ? "text-emerald-600" : "text-slate-400"}`}>
                                                {step.label}
                                            </span>
                                        </button>
                                        {idx < STEPS.length - 1 && (
                                            <div className="flex-1 mx-2 h-1 rounded-full bg-slate-100 overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                                                    initial={false}
                                                    animate={{ width: isDone ? "100%" : "0%" }}
                                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Overall progress bar */}
                        <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-sky-500 via-purple-500 to-emerald-500 rounded-full"
                                initial={false}
                                animate={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                        </div>
                        <div className="flex justify-between mt-1">
                            <span className="text-xs text-slate-400">ขั้นตอนที่ {currentStep} / {STEPS.length}</span>
                            <span className="text-xs font-semibold text-sky-600">{STEPS[currentStep - 1].label}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 py-6">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={currentStep}
                        custom={direction}
                        variants={stepVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                        {currentStep === 1 && <Step1General data={data} update={update} />}
                        {currentStep === 2 && <Step2Dimensions data={data} update={update} totalScore={totalScore} />}
                        {currentStep === 3 && <Step3KPI data={data} update={update} />}
                        {currentStep === 4 && <Step4Conclusion data={data} update={update} totalScore={totalScore} />}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
                    <motion.button
                        onClick={goBack}
                        disabled={currentStep === 1}
                        whileHover={{ scale: currentStep === 1 ? 1 : 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        ← ย้อนกลับ
                    </motion.button>
                    <div className="flex gap-3">
                        <motion.button
                            onClick={() => handleSave(false)}
                            disabled={isPending}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            className="px-5 py-3 rounded-xl border-2 border-sky-200 text-sky-600 font-semibold hover:bg-sky-50 transition-all disabled:opacity-60 flex items-center gap-2"
                        >
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            บันทึก
                        </motion.button>
                        {currentStep < 4 ? (
                            <motion.button
                                onClick={goNext}
                                whileHover={{ scale: 1.03, boxShadow: "0 8px 25px rgba(14,165,233,0.35)" }}
                                whileTap={{ scale: 0.97 }}
                                className="px-8 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-bold transition-all shadow-md"
                            >
                                ถัดไป →
                            </motion.button>
                        ) : (
                            <motion.button
                                onClick={() => handleSave(true)}
                                disabled={isPending}
                                whileHover={{ scale: 1.03, boxShadow: "0 8px 25px rgba(16,185,129,0.35)" }}
                                whileTap={{ scale: 0.97 }}
                                className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold transition-all shadow-md disabled:opacity-60 flex items-center gap-2"
                            >
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                ส่งผลการประเมิน
                            </motion.button>
                        )}
                    </div>
                </div>
            </main>

            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ y: 100, opacity: 0, scale: 0.8 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 100, opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-2xl shadow-2xl text-white font-semibold text-sm flex items-center gap-2 ${toast.type === "success"
                            ? "bg-gradient-to-r from-emerald-600 to-emerald-500"
                            : "bg-gradient-to-r from-red-600 to-red-500"
                            }`}
                    >
                        {toast.type === "success" ? (
                            <CheckCircle2 className="w-4 h-4" />
                        ) : (
                            <span>⚠️</span>
                        )}
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
