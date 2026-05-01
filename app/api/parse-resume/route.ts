import { anthropicClient } from "@/lib/anthropic";
import { NextResponse } from "next/server";

export async function POST(req: Request) {

    try {
        const { resumeText } = await req.json()

        // Call anthropic to parse the resume
        const response = await anthropicClient.messages.create({
            model: "claude-haiku-4-5",
            max_tokens: 2048,
            system: `You are a resume parser. Extract structured information from the resume text provided. 
        Be precise — use exact company names, job titles, and bullet points as written. 
        Do not summarize or rewrite bullet points. Extract them verbatim.`,
            messages: [
                {
                    role: "user",
                    content: `Here is the resume text: ${resumeText}`
                }
            ],
            output_config: {
                format: {
                    type: "json_schema",
                    schema: {
                        type: "object",
                        properties: {
                            experiences: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        company: { type: "string" },
                                        role: { type: "string" },
                                        startDate: { type: "string" },
                                        endDate: { type: "string" },
                                        bullets: {
                                            type: "array",
                                            items: { type: "string" }
                                        }
                                    },
                                    required: ["company", "role", "startDate", "endDate", "bullets"],
                                    additionalProperties: false
                                }
                            },
                            projects: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        name: { type: "string" },
                                        technologies: {
                                            type: "array",
                                            items: { type: "string" }
                                        },
                                        bullets: {
                                            type: "array",
                                            items: { type: "string" }
                                        }
                                    },
                                    required: ["name", "technologies", "bullets"],
                                    additionalProperties: false
                                }
                            },
                            skills: {
                                type: "array",
                                items: { type: "string" }
                            }
                        },
                        required: ["experiences", "projects", "skills"],
                        additionalProperties: false
                    }
                }
            },
            temperature: 0.1,
        });

        
        const block = response.content[0];
        if (block.type === "text") {
            const parsedData = JSON.parse(block.text);
            return NextResponse.json(parsedData);
        } else {
            return NextResponse.json({ error: "Unexpected response format from Anthropic API" }, { status: 500 });
        }


    } catch (error) {
        console.error("Error parsing resume:", error);
        return NextResponse.json({ error: "Failed to parse resume" }, { status: 500 });
        
    }

}