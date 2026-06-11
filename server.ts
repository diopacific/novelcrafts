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

  // 집필 API
  app.post("/api/write", async (req, res) => {
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

[이전까지의 이야기 요약]
${pastSummary || '이번 화가 첫 시작입니다.'}

[이번 화(제 ${episodeNumber}화) 집필 지시사항]
${userDirection}

당신은 최고의 웹소설 작가입니다. 위 설정과 이전 이야기 요약, 그리고 사용자의 [이번 화 집필 지시사항]을 철저히 반영하여 제 ${episodeNumber}화 본문을 집필하세요.
- 문체: 웹소설 특유의 모던하고 흡입력 있는 문체 (간결한 문단, 감각적인 묘사, 매력적인 대화)
- 템포: 루즈해지지 않도록 행동과 사건 위주로 속도감 있게 전개할 것.
- 분량: 웹소설 1화 분량이 되도록 가능한 길고 상세하게 작성할 것. (최소 2000자 이상).

집필을 완료한 후, 다음 회차 작성을 위해 이번 제 ${episodeNumber}화의 내용을 2~3줄로 요약해주세요.

결과는 반드시 아래 JSON 형식으로만 반환하세요.
\`\`\`json
{
  "content": "생성된 소설 본문 (여러 문단, 줄바꿈 등 포함)",
  "summary": "방금 작성된 이 회차에서 벌어진 핵심 사건 요약"
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
      res.status(code).json({ error: error.message || "Failed to write episode" });
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
