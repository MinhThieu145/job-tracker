import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {

        const { roleTitle, companyName, resumeId, jobDescription, emailUsed } = await req.json();

        const newApplication = await prisma.application.create({
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

        return new Response(JSON.stringify(newApplication), { status: 201 });

    } catch (error) {
        console.error("Error handling POST request:", error);
        return new Response(JSON.stringify({ error: "Failed to handle POST request" }), { status: 500 });
    }
}