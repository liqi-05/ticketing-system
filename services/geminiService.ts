import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize client only if key exists (handled in component)
const ai = new GoogleGenAI({ apiKey });

export const askArchitect = async (question: string, context: string): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing. Please restart the application with a valid API Key.";
  }

  try {
    const model = 'gemini-3-pro-preview';
    
    const response = await ai.models.generateContent({
      model: model,
      contents: `
You are the Principal Backend Architect of "FairTix". 
You are defending the architectural decisions of a high-concurrency ticketing engine built with **C# .NET 8, PostgreSQL, and Redis**.

**Strict Architectural Rules (Do not deviate):**
1. **Queueing:** We use **Redis Lists** (FIFO) for the Waiting Room. We DO NOT use Kafka or RabbitMQ (overkill for this use case).
2. **Session Management:** We use **Redis Sets** with a TTL for "Active Sessions".
3. **Concurrency:** We use **PostgreSQL Optimistic Concurrency** (RowVersion/Xmin) for seat locking. We avoid Pessimistic Locking to prevent deadlocks.
4. **Language:** All backend logic is C# .NET 8.

**Context of user's current view:**
${context}

**User Question:** ${question}

Provide a technical, confident answer. If the user suggests a different stack (like Kafka), explain why our Redis approach is sufficient and simpler for this specific load profile. Use Markdown.
`,
      config: {
        thinkingConfig: {
          thinkingBudget: 16000 // Enable thinking for complex architectural reasoning
        }
      }
    });

    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Error consulting the architect: ${error instanceof Error ? error.message : String(error)}`;
  }
};