import { notFound } from "next/navigation";
import { getAssessmentByDistrict } from "@/app/actions/assessment";
import { GCHP_DIMENSIONS } from "@/lib/gchp-data";
import { calculateDimensionScore, calculateKPI, calculateTotalGCHP, determineLevel } from "@/lib/scoring";
import PrintButton from "./PrintButton";

export default async function ReportPage({ params }: { params: Promise<{ district: string }> }) {
    const { district: rawDistrict } = await params;
    const district = decodeURIComponent(rawDistrict);
    const result = await getAssessmentByDistrict(district);
    if (!result.success || !result.data) notFound();

    const d = result.data as any;
    const scores = d.scores ?? {};
    const evidence = d.evidence ?? {};
    const images = d.images ?? {};
    const total = calculateTotalGCHP(scores);
    const kpiPct = calculateKPI(d.kpiA, d.kpiB);
    const lv = determineLevel(kpiPct);
    const org = `${d.orgType || "สสอ."}${d.orgType === "รพ." && d.district === "เมืองศรีสะเกษ" ? "ศรีสะเกษ" : d.district}`;


    const lvColor = lv.level >= 4 ? "#059669" : lv.level === 3 ? "#7c3aed" : lv.level === 2 ? "#d97706" : "#dc2626";
    const totColor = total >= 80 ? "#059669" : total >= 60 ? "#d97706" : "#dc2626";

    const statusBadge = (pct: number) => pct >= 80
        ? { label: "ผ่านเกณฑ์", bg: "#dcfce7", color: "#166534" }
        : pct >= 50 ? { label: "พอใช้", bg: "#fef9c3", color: "#854d0e" }
            : pct > 0 ? { label: "ต้องปรับปรุง", bg: "#fee2e2", color: "#991b1b" }
                : { label: "—", bg: "#f1f5f9", color: "#94a3b8" };

    return (
        <>
            {/* ── Toolbar (screen only) ── */}
            <nav style={{ background: "#0f172a", color: "white", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }} className="print:hidden">
                <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 14 }}>
                    <a href="/" style={{ color: "#94a3b8", textDecoration: "none" }}>← กลับ Dashboard</a>
                    <span style={{ color: "#334155" }}>|</span>
                    <span style={{ fontWeight: 700 }}>รายงาน GCHP — {org}</span>
                </div>
                <PrintButton />
            </nav>

            {/* ── Report wrapper ── */}
            <div id="rpt" style={{ background: "#cbd5e1", padding: "28px 0", minHeight: "100vh" }}>

                {/* ════════════════════════════════
                    PAGE 1 – SUMMARY
                ════════════════════════════════ */}
                <div className="A4">

                    {/* HEADER BAND */}
                    <div style={{ background: "linear-gradient(100deg,#0f172a 0%,#1e3a5f 50%,#0f4c3a 100%)", borderRadius: 10, overflow: "hidden", marginBottom: 18 }}>
                        {/* Accent stripe */}
                        <div style={{ height: 5, background: "linear-gradient(90deg,#38bdf8,#34d399)" }} />
                        <div style={{ padding: "18px 22px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                {/* Logo box */}
                                <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 10, width: 54, height: 54, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white", flexShrink: 0 }}>
                                    <span style={{ fontSize: 16, fontWeight: 900, lineHeight: 1 }}>GCHP</span>
                                    <span style={{ fontSize: 9, color: "#94a3b8", marginTop: 2 }}>2569</span>
                                </div>
                                <div>
                                    <div style={{ fontSize: 9, color: "#7dd3fc", letterSpacing: 3, marginBottom: 3 }}>รายงานผลการตรวจประเมิน</div>
                                    <div style={{ fontSize: 17, fontWeight: 900, color: "white", lineHeight: 1.25 }}>
                                        มาตรฐานการจัดการเรื่องร้องเรียน (GCHP)<br />ปีงบประมาณ 2569
                                    </div>
                                    <div style={{ fontSize: 12, color: "#7dd3fc", marginTop: 4 }}>สำนักงานสาธารณสุขจังหวัดศรีสะเกษ</div>
                                </div>
                            </div>
                            <div style={{ textAlign: "right", color: "white", flexShrink: 0 }}>
                                <div style={{ fontSize: 10, color: "#94a3b8" }}>วันที่ตรวจประเมิน</div>
                                <div style={{ fontSize: 15, fontWeight: 800 }}>{d.date}</div>
                            </div>
                        </div>
                    </div>

                    {/* INFO 3-COL */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                        {[
                            { label: "หน่วยงานที่รับการตรวจ", val: org, accent: "#0284c7" },
                            { label: "ผู้บริหาร / ตำแหน่ง", val: `${d.agencyHead || "—"}${d.agencyHeadPosition ? `\n(${d.agencyHeadPosition})` : ""}`, accent: "#0369a1" },
                            { label: "ผู้ตรวจประเมิน", val: [d.assessorName1, d.assessorName2].filter(Boolean).join("\n") || "—", accent: "#0f172a" },
                        ].map((x) => (
                            <div key={x.label} style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
                                <div style={{ background: x.accent, padding: "5px 12px" }}>
                                    <span style={{ color: "white", fontSize: 10, fontWeight: 700 }}>{x.label}</span>
                                </div>
                                <div style={{ padding: "8px 12px", fontSize: 13, fontWeight: 700, whiteSpace: "pre-line", lineHeight: 1.4 }}>{x.val}</div>
                            </div>
                        ))}
                    </div>

                    {/* SCORE CARDS — equal height, text never overflows */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
                        {/* Card 1 */}
                        <div style={{ border: `2px solid ${totColor}40`, borderRadius: 10, padding: "14px 16px", textAlign: "center", background: `${totColor}08` }}>
                            <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 1, marginBottom: 6 }}>คะแนน GCHP รวม</div>
                            <div style={{ fontSize: 42, fontWeight: 900, color: totColor, lineHeight: 1 }}>{total.toFixed(1)}</div>
                            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 5 }}>จาก 100 คะแนน</div>
                        </div>
                        {/* Card 2 */}
                        <div style={{ border: "2px solid #bae6fd", borderRadius: 10, padding: "14px 16px", textAlign: "center", background: "#f0f9ff" }}>
                            <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 1, marginBottom: 6 }}>ผลตัวชี้วัด KPI</div>
                            <div style={{ fontSize: 42, fontWeight: 900, color: "#0284c7", lineHeight: 1 }}>{d.kpiB > 0 ? `${kpiPct.toFixed(0)}%` : "—"}</div>
                            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 5 }}>{d.kpiB > 0 ? `จำนวนร้องเรียน A=${d.kpiA} B=${d.kpiB}` : "ยังไม่ระบุข้อมูล KPI"}</div>
                        </div>
                        {/* Card 3 — level, no overflow */}
                        <div style={{ border: `2px solid ${lvColor}`, borderRadius: 10, padding: "14px 16px", textAlign: "center", background: `${lvColor}10` }}>
                            <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 1, marginBottom: 6 }}>ระดับการประเมิน</div>
                            <div style={{ fontSize: 28, fontWeight: 900, color: lvColor, lineHeight: 1.2 }}>ระดับที่ {lv.level}</div>
                            <div style={{ fontSize: 11, color: lvColor, fontWeight: 700, marginTop: 4, lineHeight: 1.3 }}>{lv.label}</div>
                        </div>
                    </div>

                    {/* VERIFY */}
                    <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 16px", background: "#f8fafc", marginBottom: 14, display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, color: "#0369a1", fontWeight: 800 }}>วิธีการตรวจสอบข้อมูล:</span>
                        {[
                            { label: "เอกสาร / รายงาน", val: d.verifyDoc },
                            { label: "ระบบสารสนเทศ", val: d.verifySystem },
                            { label: "สัมภาษณ์ / สังเกตการณ์", val: d.verifyRandom },
                        ].map(v => (
                            <span key={v.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, borderRadius: 4, background: v.val ? "#059669" : "#e2e8f0", color: "white", fontSize: 11, fontWeight: 900 }}>
                                    {v.val ? "✓" : ""}
                                </span>
                                {v.label}
                            </span>
                        ))}
                    </div>

                    {/* DIMENSION TABLE */}
                    <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #e2e8f0", marginBottom: 16 }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                            <thead>
                                <tr style={{ background: "#0f172a" }}>
                                    {["มิติ", "ชื่อมิติการประเมิน", "คะแนนเต็ม", "คะแนนที่ได้", "ร้อยละ", "สถานะ"].map((h, i) => (
                                        <th key={h} style={{ padding: "9px 10px", color: "#e2e8f0", fontSize: 11, fontWeight: 700, textAlign: i === 1 ? "left" : "center", whiteSpace: "nowrap" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {GCHP_DIMENSIONS.map((dim, i) => {
                                    const s = calculateDimensionScore(dim.id, scores);
                                    const p = s / dim.totalWeight * 100;
                                    const c = p >= 80 ? "#059669" : p >= 50 ? "#b45309" : p > 0 ? "#dc2626" : "#94a3b8";
                                    const b = statusBadge(p);
                                    return (
                                        <tr key={dim.id} style={{ background: i % 2 === 0 ? "#ffffff" : "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                                            <td style={{ padding: "7px 10px", textAlign: "center", fontWeight: 800, color: "#0284c7", fontSize: 14 }}>{dim.id}</td>
                                            <td style={{ padding: "7px 10px", fontSize: 12 }}>{dim.title}</td>
                                            <td style={{ padding: "7px 10px", textAlign: "center", color: "#64748b" }}>{dim.totalWeight}</td>
                                            <td style={{ padding: "7px 10px", textAlign: "center", fontWeight: 900, fontSize: 16, color: c }}>{s.toFixed(1)}</td>
                                            <td style={{ padding: "7px 10px", textAlign: "center", fontWeight: 700, fontSize: 13, color: c }}>{p.toFixed(0)}%</td>
                                            <td style={{ padding: "7px 10px", textAlign: "center" }}>
                                                <span style={{ background: b.bg, color: b.color, borderRadius: 5, padding: "2px 9px", fontSize: 11, fontWeight: 700 }}>{b.label}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr style={{ background: "#f0f9ff", borderTop: "2px solid #bae6fd" }}>
                                    <td colSpan={2} style={{ padding: "8px 10px", fontWeight: 800, color: "#1e40af", fontSize: 13, textAlign: "right" }}>รวมคะแนน GCHP ทั้งหมด</td>
                                    <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 700, color: "#475569" }}>100</td>
                                    <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 900, fontSize: 20, color: totColor }}>{total.toFixed(1)}</td>
                                    <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 800, color: totColor }}>{total.toFixed(0)}%</td>
                                    <td style={{ padding: "8px 10px", textAlign: "center" }}>
                                        <span style={{ background: `${lvColor}20`, color: lvColor, borderRadius: 5, padding: "3px 10px", fontSize: 12, fontWeight: 900 }}>{lv.label}</span>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* COMMENTS */}
                    {d.comments && (
                        <div style={{ border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", background: "#f0fdf4", marginBottom: 16 }}>
                            <div style={{ fontSize: 11, color: "#059669", fontWeight: 800, marginBottom: 6 }}>■ ข้อเสนอแนะ / ข้อสังเกต</div>
                            <div style={{ fontSize: 13, lineHeight: 1.8, whiteSpace: "pre-line" }}>{d.comments}</div>
                        </div>
                    )}

                    {/* SIGNATURES */}
                    <div style={{ borderTop: "2px dashed #cbd5e1", paddingTop: 16, marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                        {[
                            { title: "ผู้ตรวจประเมิน", name: d.assessorName1, sig: d.signAssessor },
                            { title: "ผู้รับการตรวจประเมิน", name: d.agencyHead, sig: d.signAssessee },
                        ].map((s, i) => (
                            <div key={i} style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 10 }}>{s.title}</div>
                                <div style={{ height: 88, borderBottom: "1.5px solid #94a3b8", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", borderRadius: "8px 8px 0 0" }}>
                                    {s.sig
                                        ? <img src={s.sig} alt="ลายเซ็น" style={{ maxHeight: 84, maxWidth: "90%", objectFit: "contain" }} />
                                        : <span style={{ color: "#cbd5e1", fontSize: 11 }}>— ยังไม่ได้ลงนาม —</span>
                                    }
                                </div>
                                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 8 }}>{s.name || "—"}</div>
                                <div style={{ fontSize: 11, color: "#94a3b8" }}>ลงชื่อ (E-Signature)</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ════════════════════════════════
                    PAGE N – PER DIMENSION
                ════════════════════════════════ */}
                {GCHP_DIMENSIONS.map((dim) => {
                    const ds = calculateDimensionScore(dim.id, scores);
                    const dp = ds / dim.totalWeight * 100;
                    const dc = dp >= 80 ? "#059669" : dp >= 50 ? "#d97706" : "#dc2626";
                    const db = statusBadge(dp);
                    return (
                        <div key={dim.id} className="A4 page-break">
                            {/* Dim header */}
                            <div style={{ display: "flex", alignItems: "center", gap: 14, background: "#f0f9ff", border: "1.5px solid #bae6fd", borderRadius: 10, padding: "12px 16px", marginBottom: 14 }}>
                                <div style={{ width: 46, height: 46, borderRadius: 10, background: "linear-gradient(135deg,#0284c7,#0c4a6e)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, flexShrink: 0 }}>{dim.id}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 15, fontWeight: 900, color: "#0c4a6e" }}>มิติที่ {dim.id}: {dim.title}</div>
                                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>{org} | วันที่ตรวจ {d.date}</div>
                                </div>
                                <div style={{ border: `2px solid ${dc}`, borderRadius: 10, padding: "8px 16px", textAlign: "center", background: `${dc}10`, flexShrink: 0 }}>
                                    <div style={{ fontSize: 24, fontWeight: 900, color: dc, lineHeight: 1 }}>{ds.toFixed(1)}</div>
                                    <div style={{ fontSize: 11, color: "#64748b" }}>/ {dim.totalWeight} คะแนน</div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: dc, marginTop: 2 }}>{dp.toFixed(0)}% – <span style={{ background: db.bg, color: db.color, borderRadius: 4, padding: "1px 6px", fontSize: 10 }}>{db.label}</span></div>
                                </div>
                            </div>

                            {/* Criteria table */}
                            <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #e2e8f0", marginBottom: 14 }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                                    <thead>
                                        <tr style={{ background: "#0f172a" }}>
                                            {["รหัส", "เกณฑ์การประเมิน", "น้ำหนัก", "ผล", "คะแนน", "หลักฐาน / หมายเหตุ"].map((h, i) => (
                                                <th key={h} style={{ padding: "8px 8px", color: "#e2e8f0", fontSize: 11, fontWeight: 700, textAlign: [1, 5].includes(i) ? "left" : "center" }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dim.criteria.map((c, i) => {
                                            const sv = scores[c.id];
                                            const pts = typeof sv === "number" ? (c.weight * sv / 2).toFixed(1) : "—";
                                            const cc = sv === 2 ? "#059669" : sv === 1 ? "#d97706" : sv === 0 ? "#dc2626" : "#94a3b8";
                                            return (
                                                <tr key={c.id} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc", verticalAlign: "top", borderBottom: "1px solid #f1f5f9" }}>
                                                    <td style={{ padding: "7px 8px", textAlign: "center", fontWeight: 800, color: "#0284c7", fontSize: 12 }}>{c.id}</td>
                                                    <td style={{ padding: "7px 8px", fontSize: 12, lineHeight: 1.5 }}>{c.label}</td>
                                                    <td style={{ padding: "7px 8px", textAlign: "center", color: "#64748b" }}>{c.weight}</td>
                                                    <td style={{ padding: "7px 8px", textAlign: "center", fontWeight: 900, fontSize: 20, color: cc, lineHeight: 1 }}>{sv ?? "—"}</td>
                                                    <td style={{ padding: "7px 8px", textAlign: "center", fontWeight: 800, color: cc }}>{pts}</td>
                                                    <td style={{ padding: "7px 8px", fontSize: 11, color: "#475569", lineHeight: 1.5 }}>{evidence[c.id] || "—"}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot>
                                        <tr style={{ background: "#f0f9ff", borderTop: "2px solid #bae6fd" }}>
                                            <td colSpan={3} style={{ padding: "7px 10px", fontWeight: 800, color: "#0369a1", fontSize: 12, textAlign: "right" }}>รวมมิติ {dim.id}</td>
                                            <td />
                                            <td style={{ padding: "7px 8px", textAlign: "center", fontWeight: 900, fontSize: 16, color: dc }}>{ds.toFixed(1)}</td>
                                            <td style={{ padding: "7px 8px", fontSize: 12, color: "#64748b" }}>จาก {dim.totalWeight} คะแนน ({dp.toFixed(0)}%)</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Photo evidence */}
                            {dim.criteria.some(c => images[c.id]) && (
                                <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px", background: "#fafafa" }}>
                                    <div style={{ fontSize: 11, color: "#0369a1", fontWeight: 800, marginBottom: 10 }}>■ ภาพถ่ายหลักฐานประกอบการประเมิน</div>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
                                        {dim.criteria.filter(c => images[c.id]).map(c => (
                                            <div key={c.id} style={{ textAlign: "center" }}>
                                                <img src={images[c.id]} alt={c.id} style={{ width: 148, height: 108, objectFit: "cover", borderRadius: 8, border: "1px solid #e2e8f0", display: "block" }} />
                                                <div style={{ fontSize: 10, color: "#64748b", maxWidth: 148, marginTop: 5, lineHeight: 1.4 }}>
                                                    <strong>{c.id}</strong> {c.label.substring(0, 48)}{c.label.length > 48 ? "…" : ""}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;800;900&display=swap');
                *, *::before, *::after { box-sizing: border-box; }
                body { margin: 0; font-family: 'TH Sarabun New', 'Sarabun', 'Tahoma', sans-serif !important; }
                #rpt, #rpt * { font-family: 'TH Sarabun New', 'Sarabun', 'Tahoma', sans-serif !important; }
                .A4 {
                    background: #ffffff;
                    width: 210mm;
                    min-height: 297mm;
                    margin: 0 auto 22px;
                    padding: 14mm 16mm;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.18);
                }
                @media print {
                    body { margin: 0; }
                    nav { display: none !important; }
                    #rpt { background: white; padding: 0; }
                    .A4 { width: 100%; margin: 0; padding: 10mm 12mm; box-shadow: none; min-height: unset; }
                    .page-break { page-break-before: always; }
                }
                @page { size: A4 portrait; margin: 0; }
            `}</style>
        </>
    );
}
