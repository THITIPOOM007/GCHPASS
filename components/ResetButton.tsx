"use client";

import { useState, useTransition } from "react";
import { deleteAssessment } from "@/app/actions/assessment";
import { RotateCcw, AlertTriangle, X, Loader2 } from "lucide-react";

interface Props {
    district: string;
    orgType?: string;
}

export default function ResetButton({ district, orgType = "สสอ." }: Props) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const displayName = `${orgType}${district}`;

    const handleConfirm = () => {
        startTransition(async () => {
            await deleteAssessment(district);
            setOpen(false);
            // Page will revalidate automatically via server action
        });
    };

    return (
        <>
            {/* Reset trigger button — compact icon button */}
            <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
                title="คืนค่า / รีเซ็ต"
                className="flex items-center justify-center gap-1 text-xs font-semibold text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 hover:text-red-700 px-2.5 py-2 rounded-xl transition-all flex-shrink-0"
            >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">รีเซ็ต</span>
            </button>

            {/* Confirmation Modal */}
            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={() => !isPending && setOpen(false)}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

                    {/* Dialog */}
                    <div
                        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 border border-slate-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        {!isPending && (
                            <button
                                onClick={() => setOpen(false)}
                                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
                            >
                                <X className="w-4 h-4 text-slate-500" />
                            </button>
                        )}

                        {/* Warning icon */}
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                        </div>

                        {/* Text */}
                        <h2 className="text-lg font-extrabold text-slate-800 text-center mb-2">
                            ยืนยันการรีเซ็ต?
                        </h2>
                        <p className="text-sm text-slate-600 text-center mb-1">
                            ข้อมูลการประเมินของ
                        </p>
                        <p className="text-base font-bold text-sky-700 text-center mb-4">
                            {displayName}
                        </p>
                        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
                            <p className="text-xs text-red-700 text-center leading-relaxed">
                                ⚠️ ข้อมูลทั้งหมดจะถูกลบออกจากฐานข้อมูล<br />
                                รวมถึงคะแนน, KPI, ลายเซ็น และไฟล์แนบทุกอย่าง<br />
                                <strong>ไม่สามารถกู้คืนได้</strong>
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setOpen(false)}
                                disabled={isPending}
                                className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition disabled:opacity-50"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={isPending}
                                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold hover:from-red-600 hover:to-red-700 transition shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        กำลังรีเซ็ต...
                                    </>
                                ) : (
                                    <>
                                        <RotateCcw className="w-4 h-4" />
                                        รีเซ็ต
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
