import { prisma } from "@/lib/prisma"
import { ResumeAnalysisSchemaLenient } from "@/lib/schemas/resume-analysis";
import { SuggestionsResponseSchema } from "@/lib/schemas/resume-suggestions";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {

        const {
            roleTitle,
            companyName,
            resumeId,
            jobDescription,
            emailUsed,
            analysisResult,
            aiSuggestions,
        } = await req.json();

        if (!roleTitle || typeof roleTitle !== "string") {
            return NextResponse.json({ error: "Missing roleTitle" }, { status: 400 });
        }

        if (!companyName || typeof companyName !== "string") {
            return NextResponse.json({ error: "Missing companyName" }, { status: 400 });
        }

        if (!resumeId || typeof resumeId !== "string") {
            return NextResponse.json({ error: "Missing resumeId" }, { status: 400 });
        }

        if (!jobDescription || typeof jobDescription !== "string") {
            return NextResponse.json({ error: "Missing jobDescription" }, { status: 400 });
        }

        if (typeof emailUsed !== "string") {
            return NextResponse.json({ error: "Missing emailUsed" }, { status: 400 });
        }

        if (!analysisResult) {
            return NextResponse.json({ error: "Missing analysisResult" }, { status: 400 });
        }

        if (!aiSuggestions) {
            return NextResponse.json({ error: "Missing aiSuggestions" }, { status: 400 });
        }

        const analysisValidation = ResumeAnalysisSchemaLenient.safeParse(analysisResult);

        if (!analysisValidation.success) {
            return NextResponse.json(
                {
                    error: "Invalid analysisResult",
                    issues: analysisValidation.error.issues,
                },
                { status: 400 }
            );
        }

        const suggestionsValidation = SuggestionsResponseSchema.safeParse({ aiSuggestions });

        if (!suggestionsValidation.success) {
            return NextResponse.json(
                {
                    error: "Invalid aiSuggestions",
                    issues: suggestionsValidation.error.issues,
                },
                { status: 400 }
            );
        }

        const newApplication = await prisma.$transaction(async (tx) => {
            const application = await tx.application.create({
                data: {
                    roleTitle: roleTitle,
                    company: {
                        connectOrCreate: {
                            where: { name: companyName },
                            create: { name: companyName }
                        }
                    },

                    resume: {
                        connect: {
                            id: resumeId
                        }
                    },

                    jobDescription: jobDescription,
                    emailUsed: emailUsed

                }
            });

            await tx.resumeAnalysis.create({
                data: {
                    applicationId: application.id,
                    resumeId,
                    resultJson: {
                        analysis: analysisResult,
                        aiSuggestions,
                    },
                    promptVersion: "resume-analysis-v1",
                }
            });

            return application;
        });

        return new Response(JSON.stringify(newApplication), { status: 201 });

    } catch (error) {
        console.error("Error handling POST request:", error);
        return new Response(JSON.stringify({ error: "Failed to handle POST request" }), { status: 500 });
    }
}


export async function GET(req: Request) {
    try {
        const applications = await prisma.application.findMany({
            orderBy: {
                createdAt: "desc",
            },
            include: {
                company: true,
                resume: true,
            }
        });

        return new Response(JSON.stringify(applications), { status: 200 });
    } catch (error) {
        console.error("Error fetching applications:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch applications" }), { status: 500 });
    }
}
