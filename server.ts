import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // AI 제안 API (방향성 제시)
  app.post("/api/suggest", async (req, res) => {
    try {
      const { bible, pastSummary, episodeNumber } = req.body;
      const prompt = `
[작품 설정]
- 메인 스토리: ${bible.story}
- 세계관: ${bible.world}
- 퇴마/능력 시스템: ${bible.system}
- 캐릭터: ${bible.character}
- 빌런/적대 세력: ${bible.villain}
- 작품 구성: ${bible.structure}

[최근 회차 흐름]
${pastSummary || '아직 작성된 회차가 없습니다. (본격적인 이야기의 시작입니다)'}

위 작품 설정과 최근 흐름을 바탕으로, 제 ${episodeNumber}화에서 전개할 수 있는 흥미로운 "플롯 전개 방향" 3가지를 구체적인 사건 위주로 제안해주세요.`.trim();

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { 
          temperature: 0.8,
          systemInstruction: "당신은 최고의 웹소설 스토리 컨설턴트입니다. 흥미를 유발하고 이야기를 확장할 수 있는 3가지 전개 제안을 하세요. 반드시 JSON 형식 { \"suggestions\": [\"...\", \"...\", \"...\"] } 으로만 반환하세요.",
          responseMimeType: "application/json"
        },
      });

      let parsed = {};
      try {
        parsed = JSON.parse(response.text || "{}");
      } catch (parseError) {
        console.error("JSON parse error:", parseError, "Response was:", response.text);
      }
      res.json(parsed);
    } catch (error: any) {
      console.error("API Suggest Error:", error);
      const code = typeof error.status === 'number' ? error.status : (error.code || 500);
      res.status(typeof code === 'number' ? code : 500).json({ error: error.message || "Failed to suggest directions" });
    }
  });

  // 장면 플롯 기획 API
  app.post("/api/plan-scenes", async (req, res) => {
    try {
      const { bible, pastSummary, episodeNumber, userDirection } = req.body;
      const prompt = `
[작품 설정]
- 메인 스토리: ${bible.story}
- 세계관: ${bible.world}
- 캐릭터: ${bible.character}
- 빌런/적대 세력: ${bible.villain}

[최근 회차 흐름]
${pastSummary || '아직 작성된 회차가 없습니다.'}

[제 ${episodeNumber}화 전체 방향성 지시]
${userDirection}

위 정보를 바탕으로, 총 5000자 분량(웹소설 1화)을 확보할 수 있도록 제 ${episodeNumber}화를 4개의 세부 장면(1.발단, 2.전개, 3.위기, 4.절정/결말)으로 분할하여 기획해주세요.`.trim();

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: { 
          temperature: 0.8,
          systemInstruction: "당신은 천재적인 웹소설 기획자입니다. 사용자의 지시사항을 바탕으로 4개 장면 플롯을 구성하세요. 각 장면은 자연스러운 전개와 텐션을 가져야 합니다. 반드시 JSON 형식 { \"scenes\": [ { \"title\": \"장면 1 (발단)\", \"plot\": \"세부 내용\" }, ... ] } 으로만 반환하세요.",
          responseMimeType: "application/json"
        },
      });

      let parsed = {};
      try {
        parsed = JSON.parse(response.text || "{}");
      } catch (parseError) {
        console.error("JSON parse error:", parseError, "Response was:", response.text);
      }
      res.json(parsed);
    } catch (error: any) {
      console.error("API Plan Scenes Error:", error);
      const code = typeof error.status === 'number' ? error.status : (error.code || 500);
      res.status(typeof code === 'number' ? code : 500).json({ error: error.message || "Failed to plan scenes" });
    }
  });

  // 개별 장면 집필 API
  app.post("/api/write-scene", async (req, res) => {
    try {
      // 불필요하게 많은 바이블 필드를 보내지 않고, 작성에 직결된 필드만 추출하여 토큰을 절약합니다.
      const { bible, pastSummary, episodeNumber, sceneTitle, scenePlot, previousScenesContent } = req.body;
      const prompt = `
[작품 설정 체계 - Priority 1]
${bible.world} / ${bible.system} / ${bible.character}

[최근 회차 흐름]
${pastSummary || '이번 화가 첫 시작입니다.'}

[이번 화 현재까지 집필된 부분]
${previousScenesContent || '(이번 화의 첫 장면입니다)'}

[타겟 집필 장면]
- 장면 명칭: ${sceneTitle}
- 장면 플롯: ${scenePlot}

이 타겟 장면의 **본문 원고만** 집필하세요. 이전 내용과 이어지되, 지시된 플롯 범위 내에서만 서술해야 합니다.`.trim();

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: { 
          temperature: 0.7,
          systemInstruction: "당신은 매력적인 필력을 가진 탑급 웹소설 작가입니다. 주어진 플롯만을 약 1200~1500자 분량으로 생생하게 묘사하세요. 모바일 환경에 맞춰 시원한 엔터(줄바꿈), 대화와 상황 묘사의 황금 비율(5:5)을 유지하세요. 절대 JSON 구조 외에 다른 말을 덧붙이지 마세요. 반드시 { \"content\": \"생성된 원고 텍스트\" } 형식의 JSON으로만 반환하세요.",
          responseMimeType: "application/json"
        },
      });

      let parsed = {};
      try {
        parsed = JSON.parse(response.text || "{}");
      } catch (parseError) {
        console.error("JSON parse error:", parseError, "Response was:", response.text);
      }
      res.json(parsed);
    } catch (error: any) {
      console.error("API Write Scene Error:", error);
      const code = typeof error.status === 'number' ? error.status : (error.code || 500);
      res.status(typeof code === 'number' ? code : 500).json({ error: error.message || "Failed to write scene" });
    }
  });

  // 회차 요약 API
  app.post("/api/summarize-episode", async (req, res) => {
    try {
      const { episodeNumber, fullContent } = req.body;
      const prompt = `
방금 작성된 제 ${episodeNumber}화 전체 본문입니다.

[본문]
${fullContent}

다음 화 집필 시 '최근 회차 흐름'으로 활용될 수 있도록, 가장 중요한 사건이나 인물의 행보 উই주로 3~4줄로 명확히 요약해주세요.`.trim();

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { 
          temperature: 0.3,
          systemInstruction: "당신은 날카로운 통찰력을 가진 웹소설 편집자입니다. 회차의 핵심 줄거리만 추출하여 요약하세요. 반드시 JSON 형식 { \"summary\": \"요약 텍스트\" } 으로만 반환하세요.",
          responseMimeType: "application/json"
        },
      });

      let parsed = {};
      try {
        parsed = JSON.parse(response.text || "{}");
      } catch (parseError) {
        console.error("JSON parse error:", parseError, "Response was:", response.text);
      }
      res.json(parsed);
    } catch (error: any) {
      console.error("API Summarize Episode Error:", error);
      const code = typeof error.status === 'number' ? error.status : (error.code || 500);
      res.status(typeof code === 'number' ? code : 500).json({ error: error.message || "Failed to summarize episode" });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
