import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";


export async function GET(req: Request) {
    try {
        const resumes = await prisma.resumeVersion.findMany({
            orderBy: {
                createdAt: "desc",
            }
        })
        
        return new Response(JSON.stringify(resumes), { status: 200 });

    } catch (error) {
        console.error("Error fetching resumes:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch resumes" }), { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { label, notes, fileName, fileUrl } = await req.json();

        const newResume = await prisma.resumeVersion.create({
            data: {
                label: label,
                notes: notes,
                fileName: fileName,
                fileUrl: fileUrl
            }
        })

        return new Response(JSON.stringify(newResume), { status: 201 });

    } catch (error) {
        console.error("Error creating new resume:", error);
        return new Response(JSON.stringify({ error: "Failed to create new resume" }), { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { resumeId } = await req.json()

        // 1. look up for the fileName (we can only delete through the resume file name not id)
        const resumeData = await prisma.resumeVersion.findUnique({
            where: { id: resumeId }
        })
        
        if (!resumeData) {
            return NextResponse.json({ error: "Resume not found" }, { status: 404 });
        }

        const resumeFileName = `${resumeData?.fileName}.pdf`
        console.log("Delete file name: ", resumeFileName);

        if (!resumeData) {
                return NextResponse.json({ error: "Resume not found" }, { status: 404 });
            }

        // 2. DELETE from the db (the record)
        const deleteResume = await prisma.resumeVersion.delete({
            where: {
                id: resumeId
            }
        })

        // 3. DELETE that file from the storage
        const { data, error } = await supabase.storage
            .from("resumes")
            .remove([resumeFileName])
        
        return new Response(JSON.stringify(deleteResume), {status: 200})


    } catch (error) {
        console.log("Error deleting resume:", error);
        return NextResponse.json({error: "Failed to delete the resume record"}, {status: 500})
    }
}