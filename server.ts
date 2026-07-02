import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // AI Routes
  app.post("/api/ai/autocomplete", async (req, res) => {
    try {
      const { text, context, instruction } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key is not configured on the server." });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `당신은 웹소설 전문 AI 어시스턴트입니다. 사용자가 작성 중인 원고를 보고, 다음 문장이나 문단을 이어서 작성해주세요.
      
[설정 바이블 요약]
${context}

[이전 문맥]
${text.slice(-2000)}

[요청 사항]
${instruction || "자연스럽게 다음 내용을 3~4문장으로 이어 써주세요. 웹소설 특유의 간결하고 몰입감 있는 문체를 유지하세요."}

이어질 내용만 바로 작성하세요:`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error('AI Autocomplete Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/feedback", async (req, res) => {
    try {
      const { text, context } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key is not configured on the server." });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `당신은 탑급 웹소설 편집자입니다. 작가의 원고를 읽고 발전 방향을 제안해주세요.

[설정 바이블 요약]
${context}

[현재 원고]
${text}

다음 사항들을 분석해주세요:
1. 문장력과 가독성 (어색한 부분, 개선점)
2. 전개 속도와 몰입도 (독자 후킹 여부)
3. 캐릭터 묘사 및 매력도
4. 개선을 위한 구체적인 제안 (1~2가지)

답변은 간결하고 전문적이며, 따뜻하게 격려하는 톤으로 작성해주세요.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      res.json({ feedback: response.text });
    } catch (error: any) {
      console.error('AI Feedback Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
