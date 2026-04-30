import { prisma } from "@/lib/prisma";
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
    const { label, notes, fileUrl, fileName } = await req.json()

    try {
        const updateResume = await prisma.resumeVersion.update({
            where: { id: id },
            data: {
                label: label,
                notes: notes,
                fileUrl: fileUrl,
                fileName: fileName
            }
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