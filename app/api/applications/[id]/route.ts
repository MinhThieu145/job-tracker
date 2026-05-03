import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params } : {params: Promise<{id: string}>}
) {
    const { id: applicationId } = await params

    try {
        const applicationData = await prisma.application.findUnique({
            where: {
                id: applicationId
            }
        })

        return NextResponse.json(applicationData, { status: 200})
    } catch (error) {
        console.log(`Error fetching application Id: ${applicationId}`, error)
        return NextResponse.json({error: `Failed to fetch application id ${applicationId}`})
    }
}