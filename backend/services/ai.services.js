import "dotenv/config";
import { getOpenAIClient } from "../config/openai.js";
import { getGeminiClient } from "../config/gemini.js";

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
const AI_PROVIDER = process.env.AI_PROVIDER || "gemini";

//Non Streaming
const callOpenAI = async (prompt, temperature = 0.7) => {
  const openai = getOpenAIClient();
  const response = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature,
  });
  return response.choices[0].message.content;
};

const callGemini = async (prompt, temperature = 0.7) => {
  const gemini = getGeminiClient();
  const response = await gemini.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: { temperature },
  });
  return response.text;
};

export const callAI = async (prompt, temperature = 0.7) => {
  if (AI_PROVIDER === "openai") {
    return await callOpenAI(prompt, temperature);
  }
  return await callGemini(prompt, temperature);
};

// Streaming 
export const streamAI = async (prompt, temperature = 0.7, res) => {
  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); //send header immediately

  if (AI_PROVIDER === "openai") {
    const openai = getOpenAIClient();
    const stream = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature,
      stream: true, 
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || "";
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

  } else {
    // Gemini streaming
    const gemini = getGeminiClient();
    const stream = await gemini.models.generateContentStream({
      model: GEMINI_MODEL,
      contents: prompt,
      config: { temperature },
    });

    for await (const chunk of stream) {
      const text = chunk.text || "";
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }
  }

  // done
  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
};

export const streamChat = async (
  { systemPrompt, history = [], message },
  temperature = 0.7,
  res,
) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  if (AI_PROVIDER === "openai") {
    const openai = getOpenAIClient();
    const stream = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: message },
      ],
      temperature,
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || "";
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }
  } else {
    const gemini = getGeminiClient();
    const geminiHistory = history.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const stream = await gemini.models.generateContentStream({
      model: GEMINI_MODEL,
      contents: [
        ...geminiHistory,
        { role: "user", parts: [{ text: message }] },
      ],
      config: {
        systemInstruction: systemPrompt,
        temperature,
      },
    });

    for await (const chunk of stream) {
      const text = chunk.text || "";
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }
  }

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
};
