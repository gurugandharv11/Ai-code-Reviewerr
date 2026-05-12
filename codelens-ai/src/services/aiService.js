import OpenAI from "openai";

const client = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
});

export async function getAISuggestions(code) {

    try {

        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{
                    role: "system",
                    content: `
You are a senior security and code review AI.

Analyze code for:
- syntax issues
- runtime risks
- optimization
- unused variables
- infinite loops
- security vulnerabilities
- complexity

Return JSON array only.
`
                },
                {
                    role: "user",
                    content: code
                }
            ],
            temperature: 0.2
        });

        return response.choices[0].message.content;

    } catch (err) {

        console.log(err);

        return null;

    }

}