
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractionResult, TaskStatus } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const extractionSchema = {
  type: Type.OBJECT,
  properties: {
    tasks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "A unique slugified ID for the task" },
          title: { type: Type.STRING, description: "Short title of the task" },
          description: { type: Type.STRING, description: "Detailed description of what needs to be done" },
          dueDate: { type: Type.STRING, description: "ISO date string if a deadline is mentioned, otherwise null" },
          category: { type: Type.STRING, description: "A category like 'Work', 'Personal', 'Health', etc." },
          status: { type: Type.STRING, description: "Either 'todo' or 'done'. If the entry is struck through, it's 'done'." },
          isUrgent: { type: Type.BOOLEAN, description: "True if the task is highlighted in red or explicitly marked as urgent" },
          dependencies: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of IDs of tasks that this task depends on" 
          },
          createdAt: { type: Type.STRING, description: "The date of the journal entry" }
        },
        required: ["id", "title", "description", "category", "status", "isUrgent", "dependencies", "createdAt"]
      }
    }
  },
  required: ["tasks"]
};

export async function extractTasksFromJournal(content: string): Promise<ExtractionResult> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Analyze the following journal entries. 
        Note:
        1. Entries are chronological with the latest at the top.
        2. If text is strike-through (formatted as ~~text~~ or explicitly described as completed), mark as status 'done'.
        3. If text is highlighted in Red or described as 'Urgent' or 'Critical', mark as isUrgent = true.
        4. Infer dependencies between tasks based on context (e.g., "Must finish A before starting B").
        5. Extract due dates and categories.

        JOURNAL CONTENT:
        ${content}
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: extractionSchema
      }
    });

    const text = response.text || '{"tasks": []}';
    return JSON.parse(text) as ExtractionResult;
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw error;
  }
}
