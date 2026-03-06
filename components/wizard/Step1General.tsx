"use client";

import { AssessmentData } from "@/app/assessment/page";
import { SISAKET_DISTRICTS } from "@/lib/gchp-data";
import { CalendarDays, MapPin, User, Users } from "lucide-react";

// แสดงชื่อพิเศษเฉพาะตอนเลือก รพ. (ไม่แก้ key ในฐานข้อมูล)
const HOSPITAL_DISPLAY_NAME: Record<string, string> = {
    "เมืองศรีสะเกษ": "ศรีสะเกษ",
};

interface Props {
    data: AssessmentData;
    update: (patch: Partial<AssessmentData>) => void;
}

export default function Step1General({ data, update }: Props) {
    return (
        <div className="max-w-3xl mx-auto">
            <SectionHeader
                icon={<MapPin className="w-6 h-6 text-sky-600" />}
                title="ส่วนที่ 1: ข้อมูลทั่วไป"
                subtitle="กรอกข้อมูลพื้นฐานสำหรับการตรวจประเมินครั้งนี้"
            />

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                {/* Date */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-sky-500" />
                        วันที่ตรวจประเมิน
                        <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-slate-400 mb-2">กำหนดการตรวจประเมินระหว่างวันที่ 23–30 มีนาคม 2569</p>
                    <input
                        type="date"
                        value={data.date}
                        onChange={(e) => update({ date: e.target.value })}
                        min="2026-03-23"
                        max="2026-03-30"
                        className="w-full sm:w-64 border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition"
                    />
                </div>

                {/* Org Type */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-sky-500" />
                        ประเภทหน่วยงานรับการตรวจ
                        <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="orgType"
                                value="สสอ."
                                checked={data.orgType === "สสอ."}
                                onChange={(e) => update({ orgType: e.target.value })}
                                className="w-4 h-4 text-sky-500"
                            />
                            <span className="text-sm text-slate-700">สำนักงานสาธารณสุขอำเภอ (สสอ.)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="orgType"
                                value="รพ."
                                checked={data.orgType === "รพ."}
                                onChange={(e) => update({ orgType: e.target.value })}
                                className="w-4 h-4 text-sky-500"
                            />
                            <span className="text-sm text-slate-700">โรงพยาบาล (รพ.)</span>
                        </label>
                    </div>
                </div>

                {/* District */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        รายชื่ออำเภอเป้าหมาย
                        <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={data.district}
                        onChange={(e) => update({ district: e.target.value })}
                        className="w-full sm:w-80 border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition bg-white"
                    >
                        <option value="">— เลือกอำเภอ —</option>
                        {SISAKET_DISTRICTS.map((d) => {
                            const displayName = data.orgType === "รพ."
                                ? (HOSPITAL_DISPLAY_NAME[d] ?? d)
                                : d;
                            return (
                                <option key={d} value={d}>
                                    {data.orgType}{displayName}
                                </option>
                            );
                        })}
                    </select>
                </div>

                <div className="border-t border-slate-100 pt-4">
                    <h3 className="text-sm font-bold text-slate-600 mb-4 flex items-center gap-2">
                        <Users className="w-4 h-4 text-sky-500" />
                        ข้อมูลผู้บริหาร / ผู้รับประเมิน
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <TextField
                            label="ชื่อหัวหน้าหน่วยงาน / ผู้รับผิดชอบ (พิมพ์หรือเลือก)"
                            value={data.agencyHead}
                            onChange={(v) => update({ agencyHead: v })}
                            placeholder="ชื่อ-นามสกุล"
                        />
                        <ComboBoxField
                            label="ตำแหน่ง (พิมพ์หรือเลือก)"
                            value={data.agencyHeadPosition}
                            onChange={(v) => update({ agencyHeadPosition: v })}
                            placeholder="พิมพ์ตำแหน่งงาน..."
                            options={[
                                "สาธารณสุขอำเภอ",
                                "ผู้อำนวยการโรงพยาบาล",
                                "เภสัชกร",
                                "เภสัชกรปฏิบัติการ",
                                "เภสัชกรชำนาญการ",
                                "เภสัชกรชำนาญการพิเศษ",
                                "เภสัชกรเชี่ยวชาญ",
                                "นักวิชาการสาธารณสุขปฏิบัติการ",
                                "นักวิชาการสาธารณสุขชำนาญการ"
                            ]}
                            listId="positions-list"
                        />
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                    <h3 className="text-sm font-bold text-slate-600 mb-4 flex items-center gap-2">
                        <User className="w-4 h-4 text-sky-500" />
                        ผู้ตรวจประเมิน GCHP
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <ComboBoxField
                            label="ผู้ตรวจประเมิน คนที่ 1 (พิมพ์หรือเลือก)"
                            value={data.assessorName1}
                            onChange={(v) => update({ assessorName1: v })}
                            placeholder="ชื่อ-นามสกุล"
                            options={["ภก.ฐิติภูมิ เพ็งชัย", "ภญ.ฐิติพร อินศร"]}
                            listId="assessors-list-1"
                        />
                        <ComboBoxField
                            label="ผู้ตรวจประเมิน คนที่ 2 (พิมพ์หรือเลือก)"
                            value={data.assessorName2}
                            onChange={(v) => update({ assessorName2: v })}
                            placeholder="ชื่อ-นามสกุล"
                            options={["ภก.ฐิติภูมิ เพ็งชัย", "ภญ.ฐิติพร อินศร"]}
                            listId="assessors-list-2"
                        />
                    </div>
                </div>

                {/* Info Box */}
                <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
                    <p className="text-sky-800 text-sm font-semibold mb-1">📋 เกณฑ์การให้คะแนนมาตรฐาน GCHP</p>
                    <div className="grid sm:grid-cols-3 gap-2 mt-2 text-xs">
                        <div className="bg-emerald-100 text-emerald-800 rounded-lg p-2 text-center font-semibold">
                            2 คะแนน<br />
                            <span className="font-normal">ครบถ้วนสมบูรณ์</span>
                        </div>
                        <div className="bg-amber-100 text-amber-800 rounded-lg p-2 text-center font-semibold">
                            1 คะแนน<br />
                            <span className="font-normal">มีข้อบกพร่อง</span>
                        </div>
                        <div className="bg-red-100 text-red-800 rounded-lg p-2 text-center font-semibold">
                            0 คะแนน<br />
                            <span className="font-normal">ไม่มีระบบ</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TextField({
    label, value, onChange, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition text-sm"
            />
        </div>
    );
}

function ComboBoxField({
    label, value, onChange, placeholder, options, listId
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; options: string[]; listId: string }) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
            <input
                type="text"
                list={listId}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition text-sm bg-white"
            />
            <datalist id={listId}>
                {options.map((opt, idx) => (
                    <option key={idx} value={opt} />
                ))}
            </datalist>
        </div>
    );
}

function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
    return (
        <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">{icon}</div>
                <h2 className="text-xl font-bold text-slate-800">{title}</h2>
            </div>
            <p className="text-sm text-slate-500 ml-13 pl-1">{subtitle}</p>
        </div>
    );
}
