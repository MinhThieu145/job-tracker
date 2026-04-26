import Anthropic from "@anthropic-ai/sdk"

const anthropicClient = new Anthropic({
    apiKey: process.env['ANTHROPIC_API_KEY'], 
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const jobDescription = body.jobDescription;

        // Call the Anthropic API to parse the job description
        const response = await anthropicClient.messages.create({
            model: "claude-haiku-4-5",
            max_tokens: 1024,
            system: "You are a job description parser. Extract structured information from the job description the user provides. Be precise — use the exact company name and job title as written in the description. If a field cannot be found, return an empty string for that field..",
            messages: [
                { role: "user",
                  content: `Here is the job description: ${jobDescription}`
                }
            ],
            output_config: {
                format: {
                    type: "json_schema",
                    schema: {
                        type: "object",
                        properties: {
                            companyName: { type: "string" },
                            roleTitle: { type: "string" },

                        },
                        required: ["companyName", "roleTitle"],
                        additionalProperties: false

                    }
                }
            },
            temperature: 0.2,
        });

        const block = response.content[0];
        if (block.type === "text") {
            const parsedData = JSON.parse(block.text);
            return new Response(JSON.stringify(parsedData), { status: 200 });
        } else {
            return new Response(JSON.stringify({ error: "Unexpected response format from Anthropic API" }), { status: 500 });
        }

    } catch (error) {
        console.error("Error parsing job description:", error);
        return new Response(JSON.stringify({ error: "Failed to parse job description" }), { status: 500 });
    }


}