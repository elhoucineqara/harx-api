// harx/services/ai/utils/formatVertexResponse.ts

export const cleanAndFormatResponse = (response: any) => {
    try {
        const text = response.candidates[0].content.parts[0].text;
        // Basic cleanup if wrapped in markdown code blocks
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("Error parsing Vertex response:", error);
        return { error: "Failed to parse AI response" };
    }
};

export const parseJsonResponseContactCenter = (text: string) => {
    try {
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("Error parsing Contact Center response:", error);
        return { error: "Failed to parse AI response" };
    }
};


