import { Suspense } from "react";
import AssessmentPage from "./page";

export default function AssessmentLayout() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 flex items-center justify-center">
                <div className="text-slate-400 text-sm">กำลังโหลด...</div>
            </div>
        }>
            <AssessmentPage />
        </Suspense>
    );
}
