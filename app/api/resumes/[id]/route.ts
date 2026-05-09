import { prisma } from "@/lib/prisma";
import { ResumeStructuredDataSchema } from "@/lib/schemas/resume-structured-data";
import type { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";


export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {

    const { id: resumeId } = await params

    try {
        const resumeData = await prisma.resumeVersion.findUnique({
            where: {
                id: resumeId
            }
        })

        return NextResponse.json(resumeData, { status: 200 })

    } catch (error) {
        console.log(`Error while fetching resume ID ${resumeId}`, error)
        return NextResponse.json({ error: `Error while fetching resume ID ${resumeId}` }, { status: 404 })
    }
}


export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {

    const { id } = await params
    const { label, notes, fileUrl, fileName, structuredData } = await req.json()

    try {
        const data: Prisma.ResumeVersionUpdateInput = {
            label,
            notes,
            fileUrl,
            fileName,
        }

        if (structuredData !== undefined) {
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

            data.structuredData = structuredDataResult.data
        }

        const updateResume = await prisma.resumeVersion.update({
            where: { id: id },
            data
        })
        
        return NextResponse.json( updateResume, { status: 200 } )
    } catch (error) {
        console.error("PATCH resume encounter error:", error);
        
        return NextResponse.json(
            { error: "Failed to update resume" }, // body
            { status: 500 } // option
        )
    }


}
