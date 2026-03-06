/**
 * Reset script — ลบข้อมูล Assessment ทั้งหมดในฐานข้อมูล
 * รัน: npx tsx scripts/reset-db.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const count = await prisma.assessment.count();
    console.log(`พบข้อมูลทั้งหมด ${count} รายการ`);

    if (count === 0) {
        console.log("✅ ฐานข้อมูลว่างเปล่าอยู่แล้ว ไม่ต้องทำอะไร");
        return;
    }

    const deleted = await prisma.assessment.deleteMany({});
    console.log(`✅ ลบข้อมูลสำเร็จ ${deleted.count} รายการ — ฐานข้อมูลว่างเปล่าแล้ว`);
}

main()
    .catch((e) => { console.error("❌ เกิดข้อผิดพลาด:", e); process.exit(1); })
    .finally(() => prisma.$disconnect());
