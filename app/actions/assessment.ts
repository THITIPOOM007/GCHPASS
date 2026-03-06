"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Type matches the required data in frontend AssessmentData
type AssessmentInput = {
    orgType: string;
    district: string;
    date: string;
    assessorName1: string;
    assessorName2: string;
    agencyHead: string;
    agencyHeadPosition: string;

    totalScore: number;
    kpiA: number;
    kpiB: number;
    kpiPercentage: number;
    kpiLevel: number;

    scores: Record<string, number>;
    evidence: Record<string, string>;
    images: Record<string, string>;

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

export async function saveAssessment(data: AssessmentInput) {
    try {
        await prisma.assessment.upsert({
            where: { district: data.district },
            update: {
                orgType: data.orgType,
                date: data.date,
                assessorName1: data.assessorName1,
                assessorName2: data.assessorName2 || "",
                agencyHead: data.agencyHead,
                agencyHeadPosition: data.agencyHeadPosition,

                totalScore: data.totalScore,
                kpiA: data.kpiA,
                kpiB: data.kpiB,
                kpiPercentage: data.kpiPercentage,
                kpiLevel: data.kpiLevel,

                scores: JSON.stringify(data.scores),
                evidence: JSON.stringify(data.evidence),
                images: JSON.stringify(data.images),

                sla10: data.sla10,
                sla30: data.sla30,
                sla60: data.sla60,
                verifyDoc: data.verifyDoc,
                verifySystem: data.verifySystem,
                verifyRandom: data.verifyRandom,
                randomCount: data.randomCount || "",

                comments: data.comments || "",
                signAssessor: data.signAssessor || "",
                signAssessee: data.signAssessee || "",
            },
            create: {
                orgType: data.orgType,
                district: data.district,
                date: data.date,
                assessorName1: data.assessorName1,
                assessorName2: data.assessorName2 || "",
                agencyHead: data.agencyHead,
                agencyHeadPosition: data.agencyHeadPosition,

                totalScore: data.totalScore,
                kpiA: data.kpiA,
                kpiB: data.kpiB,
                kpiPercentage: data.kpiPercentage,
                kpiLevel: data.kpiLevel,

                scores: JSON.stringify(data.scores),
                evidence: JSON.stringify(data.evidence),
                images: JSON.stringify(data.images),

                sla10: data.sla10,
                sla30: data.sla30,
                sla60: data.sla60,
                verifyDoc: data.verifyDoc,
                verifySystem: data.verifySystem,
                verifyRandom: data.verifyRandom,
                randomCount: data.randomCount || "",

                comments: data.comments || "",
                signAssessor: data.signAssessor || "",
                signAssessee: data.signAssessee || "",
            }
        });

        // Revalidate the dashboard and assessment paths
        revalidatePath("/", "page");
        revalidatePath("/assessment", "page");

        return { success: true };
    } catch (error) {
        console.error("Failed to save assessment:", error);
        return { success: false, error: "Failed to save assessment to database." };
    }
}

export async function getAssessmentsSummary() {
    try {
        const assessments = await prisma.assessment.findMany({
            select: {
                district: true,
                orgType: true,
                totalScore: true,
                kpiPercentage: true,
                kpiLevel: true,
            }
        });
        return { success: true, data: assessments };
    } catch (error) {
        console.error("Failed to fetch summary:", error);
        return { success: false, data: [] };
    }
}

export async function getAssessmentByDistrict(district: string) {
    if (!district) return { success: false, data: null };

    try {
        const assessment = await prisma.assessment.findUnique({
            where: { district }
        });

        if (!assessment) return { success: true, data: null };

        // Parse JSON strings back to objects matching the frontend type
        return {
            success: true,
            data: {
                ...assessment,
                scores: JSON.parse(assessment.scores),
                evidence: JSON.parse(assessment.evidence),
                images: JSON.parse(assessment.images || "{}")
            }
        };
    } catch (error) {
        console.error("Failed to fetch assessment for district:", district, error);
        return { success: false, data: null };
    }
}

export async function deleteAssessment(district: string) {
    try {
        await prisma.assessment.delete({
            where: { district },
        });
        revalidatePath("/", "page");
        revalidatePath("/assessment", "page");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete assessment for district:", district, error);
        return { success: false };
    }
}

