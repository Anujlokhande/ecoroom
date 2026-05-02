import dotenv from "dotenv";
dotenv.config();
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

//this function will generate memory chips which is ultimately the summarisation of the last 50 messages

const TEMPLATE = `
    You are an AI Memory Generator for a chat application.

Your job is to summarize recent chat messages into a SHORT, USEFUL memory that helps users quickly understand what happened without reading all messages.

MESSAGES:
{{MESSAGES}}

Instructions:
- Messages are in format: "username: message"
- Focus ONLY on meaningful content (ignore greetings, filler like "ok", "lol")
- Capture:
  1. What problem/discussion happened
  2. What actions were taken
  3. What was the outcome (if any)
- Keep it concise and structured
- Do NOT repeat messages
- Do NOT include unnecessary details
-Return ONLY raw JSON.
-Do NOT wrap in markdown or code blocks.

Output STRICTLY in JSON:

{
  "summary": "2–3 lines max, clear timeline of events",
  "user_intent": "Main goal or problem users were trying to solve",
  "important_events": [
    "key event 1",
    "key event 2"
  ],
  "outcome": "final result or current status",
  "importance_score": 1-10
}
`;

export const memoryChipGenerator = async (messages) => {
  const formattedMessages = messages
    .map((m) => `${m.username}: ${m.text}`)
    .join("\n");
  const prompt = TEMPLATE.replace("{{MESSAGES}}", formattedMessages);
  const result = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  return JSON.parse(result.text);
};
