import { anthropicClient } from "@/lib/anthropic";
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server";
import { jsonSchemaOutputFormat } from "@anthropic-ai/sdk/helpers/json-schema";

export async function POST(req: Request) {
    try {
        // 1. we take in the resumeId and jobDescription
        const { resumeId, jobDescription } = await req.json()

        // 2. get the resume data structured
        const resumeData = await prisma.resumeVersion.findUnique({
            where: {
                id: resumeId
            }
        })


        // Since the resumeData can be null we would need at least 2 check like this
        // so that typescript is not complain
        if (!resumeData) {
            return NextResponse.json(
                { error: "Resume not found" },
                { status: 404 }
            );
        }

        if (!resumeData.structuredData) {
            return NextResponse.json(
                { error: "Resume has no structuredData" },
                { status: 400 }
            );
        }

        // while we at it. Might as well also check this.
        // typescript not complain but it's good to check
        if (!jobDescription || typeof (jobDescription) != "string") {
            return NextResponse.json({ error: "Missing or error parsing job description", status: 400 })
        }

        const { structuredData } = resumeData;

        // 3. Now we gotta feed the AI both and got the result back

        // 3.1 Build the prompt for the Claude AI
        const prompt = `
        You are a Senior Technical Recruiter and Resume Positioning Analyst.

        Compare this job description against this resume structured data.

        Rules:
        - Ignore location, visa, education, degree type, and logistics.
        - Focus only on work, responsibilities, tools, skills, and business needs.
        - Do not rewrite bullets yet.
        - Do not invent experience.
        - Use exact resume evidence when claiming a match.

        JOB DESCRIPTION:
        ${jobDescription}

        RESUME STRUCTURED DATA:
        ${JSON.stringify(structuredData, null, 2)}
        `;

        // define the output the schema for Claude
        // Claude must return exactly like the properties
        const resumeAnalysisSchema = {
            type: "object",
            additionalProperties: false,
            properties: {
                jobSummary: {
                    type: "string",
                    description:
                        "One concise sentence explaining what this role actually needs, focusing on work and skills rather than logistics.",
                },

                roleArchetype: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                        label: {
                            type: "string",
                            description:
                                "The true role type based on the actual work, such as BI / Reporting Analyst, Data Analyst, Data Engineer, Software Engineer, ML / AI Engineer, Product Analyst, Operations Analyst, or Other.",
                        },
                        reason: {
                            type: "string",
                            description:
                                "Explain why this archetype fits based on the JD responsibilities, tools, team needs, and day-to-day work.",
                        },
                    },
                    required: ["label", "reason"],
                },

                techHierarchy: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                        tier1: {
                            type: "array",
                            description:
                                "Daily-driver skills/tools. The role likely cannot be done without these on Day 1.",
                            items: {
                                type: "object",
                                additionalProperties: false,
                                properties: {
                                    skill: {
                                        type: "string",
                                        description: "A Tier 1 technical skill, tool, platform, or method.",
                                    },
                                    reason: {
                                        type: "string",
                                        description:
                                            "Why this skill belongs in Tier 1 based on JD context clues, not just keyword frequency.",
                                    },
                                },
                                required: ["skill", "reason"],
                            },
                        },

                        tier2: {
                            type: "array",
                            description:
                                "Differentiator skills/tools. Important, but not the core daily workflow.",
                            items: {
                                type: "object",
                                additionalProperties: false,
                                properties: {
                                    skill: {
                                        type: "string",
                                        description: "A Tier 2 technical skill, tool, platform, or method.",
                                    },
                                    reason: {
                                        type: "string",
                                        description:
                                            "Why this skill belongs in Tier 2 instead of Tier 1 or Tier 3.",
                                    },
                                },
                                required: ["skill", "reason"],
                            },
                        },

                        tier3: {
                            type: "array",
                            description:
                                "Wishlist skills/tools. Nice-to-have, occasional, generic, or HR-padding items.",
                            items: {
                                type: "object",
                                additionalProperties: false,
                                properties: {
                                    skill: {
                                        type: "string",
                                        description: "A Tier 3 technical skill, tool, platform, or method.",
                                    },
                                    reason: {
                                        type: "string",
                                        description:
                                            "Why this skill is lower priority based on the JD context.",
                                    },
                                },
                                required: ["skill", "reason"],
                            },
                        },
                    },
                    required: ["tier1", "tier2", "tier3"],
                },

                responsibilityHierarchy: {
                    type: "array",
                    description:
                        "Top responsibilities ranked by importance based on what the role actually does.",
                    items: {
                        type: "object",
                        additionalProperties: false,
                        properties: {
                            rank: {
                                type: "number",
                                description: "Importance rank, starting from 1.",
                            },
                            responsibility: {
                                type: "string",
                                description:
                                    "A core responsibility from the JD, rewritten clearly and specifically.",
                            },
                            whatItMeans: {
                                type: "string",
                                description:
                                    "Plain-English explanation of what this responsibility means day-to-day.",
                            },
                            whyCore: {
                                type: "string",
                                description:
                                    "Why this responsibility is central to the role based on JD signals.",
                            },
                            resumeCoverage: {
                                type: "string",
                                enum: [
                                    "strong_match",
                                    "partial_match",
                                    "covered_but_buried",
                                    "semantic_match",
                                    "missing",
                                ],
                                description:
                                    "How well the selected resume supports this responsibility.",
                            },
                            bestEvidence: {
                                type: "array",
                                description:
                                    "Exact resume evidence supporting this responsibility. Empty array if missing.",
                                items: {
                                    type: "object",
                                    additionalProperties: false,
                                    properties: {
                                        company: {
                                            type: "string",
                                            description:
                                                "Company, project, or section where the evidence appears.",
                                        },
                                        bullet: {
                                            type: "string",
                                            description:
                                                "Original bullet or resume evidence. Do not invent or rewrite.",
                                        },
                                        reason: {
                                            type: "string",
                                            description:
                                                "Why this evidence supports the responsibility.",
                                        },
                                    },
                                    required: ["company", "bullet", "reason"],
                                },
                            },
                            recommendedAction: {
                                type: "string",
                                enum: [
                                    "no_action",
                                    "move_existing_bullet_higher",
                                    "rewrite_existing_bullet",
                                    "add_keyword_to_skills_if_true",
                                    "mention_in_bullet",
                                    "do_not_claim",
                                ],
                                description:
                                    "Best next action based on the resume's coverage of this responsibility.",
                            },
                        },
                        required: [
                            "rank",
                            "responsibility",
                            "whatItMeans",
                            "whyCore",
                            "resumeCoverage",
                            "bestEvidence",
                            "recommendedAction",
                        ],
                    },
                },

                keywordCoverage: {
                    type: "array",
                    description:
                        "Meaningful technical skills, tools, platforms, frameworks, methodologies, business processes, and domain keywords from the JD.",
                    items: {
                        type: "object",
                        additionalProperties: false,
                        properties: {
                            keyword: {
                                type: "string",
                                description:
                                    "A meaningful keyword, tool, skill, platform, method, domain phrase, or business-process phrase from the JD.",
                            },
                            category: {
                                type: "string",
                                enum: [
                                    "tool",
                                    "language",
                                    "platform",
                                    "framework",
                                    "methodology",
                                    "domain",
                                    "business_process",
                                    "soft_skill",
                                    "other",
                                ],
                                description: "Category of the keyword.",
                            },
                            tier: {
                                type: "number",
                                enum: [1, 2, 3],
                                description:
                                    "1 = daily driver, 2 = differentiator, 3 = wishlist.",
                            },
                            status: {
                                type: "string",
                                enum: [
                                    "covered",
                                    "covered_but_buried",
                                    "semantic_match",
                                    "missing",
                                ],
                                description:
                                    "Whether the resume covers this keyword exactly, indirectly, weakly, or not at all.",
                            },
                            evidence: {
                                type: "array",
                                items: {
                                    type: "string",
                                },
                                description:
                                    "Exact resume locations, bullets, skills, or project evidence where this keyword/concept appears. Empty if missing.",
                            },
                            recommendation: {
                                type: "string",
                                enum: [
                                    "keep",
                                    "move_higher",
                                    "add_to_skills_if_true",
                                    "mention_in_bullet",
                                    "do_not_add_unless_true",
                                    "ignore_low_priority",
                                ],
                                description:
                                    "What the user should do with this keyword when tailoring the resume.",
                            },
                            reason: {
                                type: "string",
                                description:
                                    "Why this coverage status and recommendation were chosen.",
                            },
                        },
                        required: [
                            "keyword",
                            "category",
                            "tier",
                            "status",
                            "evidence",
                            "recommendation",
                            "reason",
                        ],
                    },
                },

                criticalGaps: {
                    type: "array",
                    description:
                        "Only true Tier 1 gaps that are absent from the resume and could hurt screening.",
                    items: {
                        type: "object",
                        additionalProperties: false,
                        properties: {
                            gap: {
                                type: "string",
                                description:
                                    "The missing Tier 1 skill, tool, domain, or responsibility.",
                            },
                            type: {
                                type: "string",
                                enum: ["skill", "responsibility", "domain", "tool"],
                                description: "Type of critical gap.",
                            },
                            tier: {
                                type: "number",
                                enum: [1],
                                description:
                                    "Critical gaps must always be Tier 1.",
                            },
                            reason: {
                                type: "string",
                                description:
                                    "Why this is a serious gap, not just a minor keyword issue.",
                            },
                            evidenceChecked: {
                                type: "array",
                                items: {
                                    type: "string",
                                },
                                description:
                                    "Resume sections, bullets, or skills checked before deciding this is missing.",
                            },
                        },
                        required: ["gap", "type", "tier", "reason", "evidenceChecked"],
                    },
                },

                matchStrengths: {
                    type: "array",
                    description:
                        "Strongest ways this resume already matches the JD's core responsibilities.",
                    items: {
                        type: "object",
                        additionalProperties: false,
                        properties: {
                            responsibility: {
                                type: "string",
                                description:
                                    "JD responsibility or business need that the candidate matches.",
                            },
                            yourEvidence: {
                                type: "string",
                                description:
                                    "Specific resume evidence proving the match.",
                            },
                            whyItMatches: {
                                type: "string",
                                description:
                                    "Why this evidence makes the candidate strong or safe for the role.",
                            },
                        },
                        required: ["responsibility", "yourEvidence", "whyItMatches"],
                    },
                },

                riskAssessment: {
                    type: "array",
                    description:
                        "Positioning risks where the resume may be framed incorrectly for this JD.",
                    items: {
                        type: "object",
                        additionalProperties: false,
                        properties: {
                            risk: {
                                type: "string",
                                description:
                                    "A specific positioning risk for this resume against this JD.",
                            },
                            severity: {
                                type: "string",
                                enum: ["low", "medium", "high"],
                                description:
                                    "How serious the positioning risk is.",
                            },
                            mitigation: {
                                type: "string",
                                description:
                                    "How the user should reduce this risk when tailoring the resume.",
                            },
                        },
                        required: ["risk", "severity", "mitigation"],
                    },
                },

                recommendedNextActions: {
                    type: "array",
                    description:
                        "Prioritized next steps the user should take after reading this analysis.",
                    items: {
                        type: "object",
                        additionalProperties: false,
                        properties: {
                            priority: {
                                type: "number",
                                description: "Action priority, starting from 1.",
                            },
                            action: {
                                type: "string",
                                description:
                                    "A practical next action. Do not write a full resume bullet here.",
                            },
                            reason: {
                                type: "string",
                                description:
                                    "Why this action matters for this JD/resume comparison.",
                            },
                        },
                        required: ["priority", "action", "reason"],
                    },
                },
            },

            required: [
                "jobSummary",
                "roleArchetype",
                "techHierarchy",
                "responsibilityHierarchy",
                "keywordCoverage",
                "criticalGaps",
                "matchStrengths",
                "riskAssessment",
                "recommendedNextActions",
            ],
        } as const;

        const response = await anthropicClient.messages.parse({
            model: "claude-sonnet-4-6",
            max_tokens: 6000,
            output_config: {
                format: jsonSchemaOutputFormat(resumeAnalysisSchema),
            },
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        // extract the parsed output from claude
        if (response.stop_reason == "refusal") {
            return NextResponse.json({ error: "Claude detect violation message and refuse to answer " })
        }


        return NextResponse.json(response.parsed_output, { status: 200 });

    } catch (error) {
        console.error("encounter error when comparing resume with jd:", error)
        return NextResponse.json({ error: "Encounter error when comparing resume with jd" }, { status: 500 })
    }


}
