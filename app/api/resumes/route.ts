import { prisma } from "@/lib/prisma";


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