"use client";

import { useState } from "react";
import { BookOpen, X, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

export default function ManualButton() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-sky-800/40 hover:bg-sky-800/60 border border-sky-400/30 text-sky-100 text-sm font-medium px-4 py-2.5 rounded-xl transition-all"
            >
                <BookOpen className="w-4 h-4" />
                คู่มือ / เกณฑ์การประเมิน
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
                    onClick={() => setOpen(false)}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

                    {/* Modal Content */}
                    <div
                        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-emerald-600 px-6 py-5 flex items-center justify-between text-white shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    <BookOpen className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold leading-tight">คู่มือและเกณฑ์การตรวจประเมิน GCHP</h2>
                                    <p className="text-sky-100 text-xs mt-0.5">ปีงบประมาณ 2569</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Scrollable Body */}
                        <div className="overflow-y-auto p-6 space-y-8 flex-1">

                            {/* Section 1: Scoring Rules */}
                            <section>
                                <h3 className="text-lg font-bold text-sky-800 flex items-center gap-2 mb-4 border-b border-sky-100 pb-2">
                                    <CheckCircle2 className="w-5 h-5" />
                                    1. เกณฑ์การให้คะแนนระดับข้อ (Criteria)
                                </h3>
                                <div className="grid sm:grid-cols-3 gap-4">
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                                        <div className="text-emerald-700 font-bold text-lg mb-1">2 คะแนน</div>
                                        <div className="text-sm font-semibold text-slate-700 mb-2">ครบถ้วนสมบูรณ์</div>
                                        <p className="text-xs text-slate-600">มีเอกสาร/หลักฐานครบถ้วน มีการปฏิบัติจริงอย่างเป็นระบบและต่อเนื่อง</p>
                                    </div>
                                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                                        <div className="text-amber-700 font-bold text-lg mb-1">1 คะแนน</div>
                                        <div className="text-sm font-semibold text-slate-700 mb-2">มีข้อบกพร่องบางส่วน</div>
                                        <p className="text-xs text-slate-600">มีหลักฐานแต่ไม่สมบูรณ์ หรือมีการปฏิบัติแต่ไม่ต่อเนื่อง/ไม่ครอบคลุม</p>
                                    </div>
                                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                                        <div className="text-red-700 font-bold text-lg mb-1">0 คะแนน</div>
                                        <div className="text-sm font-semibold text-slate-700 mb-2">ไม่มีระบบ/ไม่พบหลักฐาน</div>
                                        <p className="text-xs text-slate-600">ไม่มีการดำเนินการตามเกณฑ์ หรือไม่มีหลักฐานเชิงประจักษ์ใดๆ</p>
                                    </div>
                                </div>
                            </section>

                            {/* Section 2: Dimensions */}
                            <section>
                                <h3 className="text-lg font-bold text-sky-800 flex items-center gap-2 mb-4 border-b border-sky-100 pb-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    2. โครงสร้าง 10 มิติการประเมิน
                                </h3>
                                <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-sky-50 text-sky-900 border-b border-sky-100">
                                            <tr>
                                                <th className="px-4 py-3 font-semibold w-16 text-center">มิติ</th>
                                                <th className="px-4 py-3 font-semibold">รายละเอียดมิติ</th>
                                                <th className="px-4 py-3 font-semibold text-center w-24">คะแนนเต็ม</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                            {[
                                                { id: 1, title: "สถานที่รับเรื่องร้องเรียน", max: 10 },
                                                { id: 2, title: "ช่องทางการรับเรื่องร้องเรียน (อย่างน้อย 3 ช่องทาง)", max: 8 },
                                                { id: 3, title: "บุคลากร", max: 10 },
                                                { id: 4, title: "การจัดเก็บข้อมูลและการเก็บรักษาความปลอดภัย", max: 20 },
                                                { id: 5, title: "ชุดคำถาม หรือชุดความรู้ Q&A", max: 8 },
                                                { id: 6, title: "คู่มือขั้นตอน หรือวิธีการปฏิบัติงาน SOP", max: 10 },
                                                { id: 7, title: "การจัดการเรื่องร้องเรียน", max: 14 },
                                                { id: 8, title: "ระยะเวลาการจัดการข้อร้องเรียน (SLA)", max: 10 },
                                                { id: 9, title: "การรายงานผลการปฏิบัติงาน", max: 6 },
                                                { id: 10, title: "การนำข้อมูลไปใช้ประโยชน์", max: 4 },
                                            ].map((d) => (
                                                <tr key={d.id} className="hover:bg-slate-100/50 transition-colors">
                                                    <td className="px-4 py-3 text-center font-bold text-sky-700">{d.id}</td>
                                                    <td className="px-4 py-3 text-slate-700">{d.title}</td>
                                                    <td className="px-4 py-3 text-center text-slate-500 font-medium">{d.max}</td>
                                                </tr>
                                            ))}
                                            <tr className="bg-sky-50 font-bold border-t-2 border-sky-200 text-sky-900">
                                                <td className="px-4 py-3 text-right" colSpan={2}>รวมคะแนน GCHP ทั้งหมด</td>
                                                <td className="px-4 py-3 text-center">100</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            {/* Section 3: KPI Conditions */}
                            <section>
                                <h3 className="text-lg font-bold text-sky-800 flex items-center gap-2 mb-4 border-b border-sky-100 pb-2">
                                    <AlertCircle className="w-5 h-5" />
                                    3. การคำนวณและเกณฑ์ระดับตัวชี้วัด (KPI)
                                </h3>
                                <div className="space-y-4">
                                    <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
                                        <div className="bg-white px-4 py-3 rounded-xl border border-sky-200 shadow-sm font-black text-xl text-sky-800 text-center whitespace-nowrap">
                                            KPI = (A / B) × 100
                                        </div>
                                        <div className="text-sm text-slate-700">
                                            <p className="mb-1"><span className="font-bold text-emerald-600 text-base">A</span> = จำนวนเรื่องร้องเรียนที่แก้ไขยุติได้ภายในเวลาที่กำหนด</p>
                                            <p><span className="font-bold text-rose-500 text-base">B</span> = จำนวนเรื่องร้องเรียนที่รับไว้ดำเนินการทั้งหมด</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-center">
                                            <div className="text-emerald-700 font-bold text-sm mb-1">ระดับ 5</div>
                                            <div className="font-black text-emerald-600 text-xl">100%</div>
                                        </div>
                                        <div className="bg-sky-50 border border-sky-200 p-3 rounded-xl text-center">
                                            <div className="text-sky-700 font-bold text-sm mb-1">ระดับ 4</div>
                                            <div className="font-black text-sky-600 text-xl">95–99%</div>
                                        </div>
                                        <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-center">
                                            <div className="text-blue-700 font-bold text-sm mb-1">ระดับ 3</div>
                                            <div className="font-black text-blue-600 text-xl">91–94%</div>
                                        </div>
                                        <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-center">
                                            <div className="text-amber-700 font-bold text-sm mb-1">ระดับ 2</div>
                                            <div className="font-black text-amber-600 text-xl">80–90%</div>
                                        </div>
                                        <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-center">
                                            <div className="text-red-700 font-bold text-sm mb-1">ระดับ 1</div>
                                            <div className="font-black text-red-600 text-xl">&lt; 80%</div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
