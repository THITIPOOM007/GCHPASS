"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ClipboardList, MapPin, BarChart3, ClipboardCheck, Loader2 } from "lucide-react";
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
    { id: 1, label: "ข้อมูลทั่วไป", icon: MapPin },
    { id: 2, label: "ประเมิน 10 มิติ", icon: BarChart3 },
    { id: 3, label: "คำนวณ KPI", icon: ClipboardList },
    { id: 4, label: "สรุปผล", icon: ClipboardCheck },
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
                    // Hard navigation so dashboard re-fetches server data
                    window.location.href = "/";
                } else {
                    showToast("บันทึกข้อมูลลงฐานข้อมูลเรียบร้อย ✓");
                }
            } else {
                showToast("เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่", "error");
            }
        });
    };

    const handleNext = () => { if (currentStep < 4) setCurrentStep((s) => s + 1); };
    const handleBack = () => { if (currentStep > 1) setCurrentStep((s) => s - 1); };
    const goNext = () => { setDirection(1); handleNext(); };
    const goBack = () => { setDirection(-1); handleBack(); };

    const stepVariants = {
        initial: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
        animate: { x: 0, opacity: 1 },
        exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
    };

    if (loadingExisting) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-slate-500">
                    <Loader2 className="w-10 h-10 animate-spin text-sky-500" />
                    <p className="text-sm font-medium">กำลังโหลดข้อมูลการประเมิน...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                        <ClipboardCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-800 leading-tight">แบบฟอร์มตรวจประเมิน GCHP 2569</h1>
                        <p className="text-xs text-slate-500">สำนักงานสาธารณสุขจังหวัดศรีสะเกษ</p>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                        <a
                            href="/"
                            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-sky-600 hover:bg-sky-50 border border-slate-200 hover:border-sky-200 px-3 py-2 rounded-xl transition"
                        >
                            ← Dashboard
                        </a>
                        <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
                            <span className="text-sm text-slate-500">คะแนน GCHP:</span>
                            <span className={`text-xl font-bold ${totalScore >= 80 ? "text-emerald-600" : totalScore >= 60 ? "text-amber-600" : "text-red-500"}`}>
                                {totalScore.toFixed(1)}
                            </span>
                            <span className="text-sm text-slate-400">/ 100</span>
                        </div>
                        <button
                            onClick={() => handleSave(false)}
                            disabled={isPending}
                            className="bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
                        >
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            บันทึก
                        </button>
                    </div>
                </div>

                {/* Step Indicator */}
                <div className="max-w-6xl mx-auto px-4 pb-3">
                    <div className="flex items-center gap-0">
                        {STEPS.map((step, idx) => {
                            const Icon = step.icon;
                            const isDone = currentStep > step.id;
                            const isActive = currentStep === step.id;
                            return (
                                <div key={step.id} className="flex items-center flex-1">
                                    <button
                                        onClick={() => { setDirection(step.id > currentStep ? 1 : -1); setCurrentStep(step.id); }}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium ${isActive ? "bg-sky-100 text-sky-700" : isDone ? "text-emerald-600" : "text-slate-400"}`}
                                    >
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${isDone ? "bg-emerald-500 text-white" : isActive ? "bg-sky-500 text-white" : "bg-slate-200 text-slate-500"}`}>
                                            {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                                        </div>
                                        <span className="hidden sm:block">{step.label}</span>
                                    </button>
                                    {idx < STEPS.length - 1 && (
                                        <div className={`flex-1 h-0.5 mx-1 ${isDone ? "bg-emerald-400" : "bg-slate-200"}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                        />
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
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        {currentStep === 1 && <Step1General data={data} update={update} />}
                        {currentStep === 2 && <Step2Dimensions data={data} update={update} totalScore={totalScore} />}
                        {currentStep === 3 && <Step3KPI data={data} update={update} />}
                        {currentStep === 4 && <Step4Conclusion data={data} update={update} totalScore={totalScore} />}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
                    <button
                        onClick={goBack}
                        disabled={currentStep === 1}
                        className="px-6 py-3 rounded-xl border border-slate-300 text-slate-600 font-semibold hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        ← ย้อนกลับ
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleSave(false)}
                            disabled={isPending}
                            className="px-6 py-3 rounded-xl border border-sky-300 text-sky-600 font-semibold hover:bg-sky-50 transition-colors disabled:opacity-60 flex items-center gap-2"
                        >
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "💾"}
                            บันทึก
                        </button>
                        {currentStep < 4 ? (
                            <button
                                onClick={goNext}
                                className="px-8 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-bold hover:from-sky-600 hover:to-sky-700 transition-all shadow-md hover:shadow-lg"
                            >
                                ถัดไป →
                            </button>
                        ) : (
                            <button
                                onClick={() => handleSave(true)}
                                disabled={isPending}
                                className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg disabled:opacity-60 flex items-center gap-2"
                            >
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "✓"}
                                ส่งผลการประเมิน
                            </button>
                        )}
                    </div>
                </div>
            </main>

            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ y: 80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 80, opacity: 0 }}
                        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl text-white font-semibold text-sm ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"}`}
                    >
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
