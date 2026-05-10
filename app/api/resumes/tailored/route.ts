import { RelationType } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { ResumeStructuredDataSchema } from "@/lib/schemas/resume-structured-data"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const { parentResumeId, label, notes, structuredData } = await req.json()

        if (!parentResumeId || typeof parentResumeId !== "string") {
            return NextResponse.json({ error: "Missing parentResumeId" }, { status: 400 })
        }

        if (!label || typeof label !== "string") {
            return NextResponse.json({ error: "Missing tailored resume label" }, { status: 400 })
        }

        const structuredDataResult = ResumeStructuredDataSchema.safeParse(structuredData)

        if (!structuredDataResult.success) {
            return NextResponse.json(
                {
                    error: "Invalid resume structuredData",
                    issues: structuredDataResult.error.issues,
                },
                { status: 400 }
            )
        }

        const parentResume = await prisma.resumeVersion.findUnique({
            where: {
                id: parentResumeId,
            },
        })

        if (!parentResume) {
            return NextResponse.json({ error: "Parent resume not found" }, { status: 404 })
        }

        const tailoredResume = await prisma.$transaction(async (tx) => {
            const childResume = await tx.resumeVersion.create({
                data: {
                    label,
                    notes,
                    isGolden: false,
                    structuredData: structuredDataResult.data,
                },
            })

            await tx.resumeLineage.create({
                data: {
                    resumeId: childResume.id,
                    parentResumeId,
                    relationType: RelationType.BASED_ON,
                    notes: "Tailored resume generated from application editor",
                },
            })

            return childResume
        })

        return NextResponse.json(tailoredResume, { status: 201 })
    } catch (error) {
        console.error("Error creating tailored resume:", error)
        return NextResponse.json({ error: "Failed to create tailored resume" }, { status: 500 })
    }
}
