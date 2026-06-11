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

[이전 회차까지의 요약]
${pastSummary || '아직 작성된 회차가 없습니다. (본격적인 이야기의 시작입니다)'}

당신은 웹소설 전문 기획자이자 편집자입니다.
위 설정을 바탕으로 제 ${episodeNumber}화에서 전개할 수 있는 흥미로운 "집필 방향(플롯 아이디어)"을 3가지 제안해주세요. 
사용자가 제안을 보고 어떤 이야기로 이어갈지 결정할 수 있도록 구체적인 상황이나 사건 위주로 작성하세요.

반드시 아래 JSON 형식으로만 반환하세요.
\`\`\`json
{
  "suggestions": [
    "제안 1: ...",
    "제안 2: ...",
    "제안 3: ..."
  ]
}
\`\`\`
`.trim();

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { temperature: 0.8 },
      });

      let textContent = response.text;
      const jsonMatch = textContent.match(/\`\`\`json\s*([\s\S]*?)\s*\`\`\`/);
      if (jsonMatch) textContent = jsonMatch[1];
      
      res.json(JSON.parse(textContent));
    } catch (error: any) {
      console.error(error);
      const code = error.status || 500;
      res.status(code).json({ error: error.message || "Failed to suggest directions" });
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
- 퇴마/능력 시스템: ${bible.system}
- 캐릭터: ${bible.character}
- 빌런/적대 세력: ${bible.villain}
- 작품 구성: ${bible.structure}

[이전 회차 요약]
${pastSummary || '아직 작성된 회차가 없습니다. (본격적인 이야기의 시작입니다)'}

[제 ${episodeNumber}화 전체 방향성]
${userDirection}

당신은 웹소설 기획자입니다. 제 ${episodeNumber}화 한 편의 분량을 충분히 확보하기 위해(총 5000자 이상), 전체 방향성을 바탕으로 이번 화를 4개의 세부 장면(1.발단, 2.전개, 3.위기, 4.절정 및 결말)으로 세밀하게 나누어 플롯을 기획해주세요.

반드시 아래 JSON 형식으로만 반환하세요.
\`\`\`json
{
  "scenes": [
    { "title": "장면 1 (발단)", "plot": "..." },
    { "title": "장면 2 (전개)", "plot": "..." },
    { "title": "장면 3 (위기)", "plot": "..." },
    { "title": "장면 4 (절정/결말)", "plot": "..." }
  ]
}
\`\`\`
`.trim();

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: { temperature: 0.8 },
      });

      let textContent = response.text;
      const jsonMatch = textContent.match(/\`\`\`json\s*([\s\S]*?)\s*\`\`\`/);
      if (jsonMatch) textContent = jsonMatch[1];
      
      res.json(JSON.parse(textContent));
    } catch (error: any) {
      console.error(error);
      const code = error.status || 500;
      res.status(code).json({ error: error.message || "Failed to plan scenes" });
    }
  });

  // 개별 장면 집필 API
  app.post("/api/write-scene", async (req, res) => {
    try {
      const { bible, pastSummary, episodeNumber, sceneTitle, scenePlot, previousScenesContent } = req.body;
      const prompt = `
[작품 설정 요약]
- 세계관: ${bible.world}
- 캐릭터: ${bible.character}
- 전반적인 스토리: ${bible.story}
- 시스템: ${bible.system}
- 빌런: ${bible.villain}

[이전 회차 요약]
${pastSummary || '이번 화가 첫 시작입니다.'}

[이번 화 현재까지의 내용]
${previousScenesContent || '(이번 화의 첫 장면입니다)'}

[현재 집필할 장면 정보]
- 장면 명칭: ${sceneTitle}
- 장면 플롯(지시사항): ${scenePlot}

당신은 탁월한 웹소설 작가입니다. 위 [집필할 장면 정보]에 맞추어 **이 장면의 본문만** 집필하세요.
- 문체: 모던하고 흡입력 있는 웹소설 문체 (짧은 문단, 생동감 있는 대화, 세밀한 심리 및 액션 묘사)
- 템포: 루즈해지지 않도록 속도감 있게 전개하되, 묘사는 구체적으로 하세요.
- 분량: 이 장면만으로 1500자 내외가 되도록 상황, 감정선, 대화를 충분히 늘려서 상세하게 작성하세요.
- 주의: 주어진 [장면 플롯]의 내용만 전개하세요. 다음 장면의 내용까지 미리 쓰거나 섣불리 끝맺지 마세요.

결과는 반드시 아래 JSON 형식으로만 반환하세요.
\`\`\`json
{
  "content": "생성된 이 장면의 본문 원고 (줄바꿈 포함)"
}
\`\`\`
`.trim();

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: { temperature: 0.7 },
      });

      let textContent = response.text;
      const jsonMatch = textContent.match(/\`\`\`json\s*([\s\S]*?)\s*\`\`\`/);
      if (jsonMatch) textContent = jsonMatch[1];

      res.json(JSON.parse(textContent));
    } catch (error: any) {
      console.error(error);
      const code = error.status || 500;
      res.status(code).json({ error: error.message || "Failed to write scene" });
    }
  });

  // 회차 요약 API
  app.post("/api/summarize-episode", async (req, res) => {
    try {
      const { episodeNumber, fullContent } = req.body;
      const prompt = `
당신은 웹소설 편집자입니다. 아래 방금 작성된 제 ${episodeNumber}화의 전체 본문을 읽고, 다음 화 집필 시 컨텍스트로 활용할 수 있도록 핵심 사건 위주로 3~4줄로 요약해주세요.

[본문]
${fullContent}

결과는 반드시 아래 JSON 형식으로만 반환하세요.
\`\`\`json
{
  "summary": "회차 요약 내용 (문자열)"
}
\`\`\`
`.trim();

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { temperature: 0.3 },
      });

      let textContent = response.text;
      const jsonMatch = textContent.match(/\`\`\`json\s*([\s\S]*?)\s*\`\`\`/);
      if (jsonMatch) textContent = jsonMatch[1];

      res.json(JSON.parse(textContent));
    } catch (error: any) {
      console.error(error);
      const code = error.status || 500;
      res.status(code).json({ error: error.message || "Failed to summarize episode" });
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
