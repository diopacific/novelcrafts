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
        model: "gemini-2.0-flash",
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

  // 장면 플롯 및 감정선 기획 API (Stage 1, 2, 3)
  app.post("/api/plan-scenes", async (req, res) => {
    try {
      const { bible, pastSummary, episodeNumber, userDirection } = req.body;
      const prompt = `
[작품 설정 체계 - Priority 1]
- 메인 스토리: ${bible.story}
- 세계관: ${bible.world}
- 캐릭터: ${bible.character}
- 빌런/적대 세력: ${bible.villain}

[최근 회차 흐름 (Memory)]
${pastSummary || '아직 작성된 회차가 없습니다.'}

[이번 화 전체 방향성 (User Direction)]
${userDirection}

당신은 AI 파이프라인의 [Stage 1: Episode Generator], [Stage 2: Scene Planner], [Stage 3: Emotion Planner] 모듈입니다.
위 정보를 바탕으로 총 5000자 분량(웹소설 1화)을 확보할 수 있도록 제 ${episodeNumber}화를 4개의 세부 장면으로 분할 기획해주세요.

1. 이번 화 전체의 에피소드 발생 목표/갈등을 한 줄로 정의하세요.
2. 4개의 각 Scene에는 Goal(목표), Conflict(갈등), Location(장소), Characters(등장인물), Ending Hook(엔딩 훅)을 모두 포함하여 상세히 기술하세요.
3. 각 Scene의 감정선 변화(Emotion Curve)를 작성하세요. (예: 기대 -> 의문 -> 경악)

반드시 아래 JSON 형식으로만 반환하세요:
{
  "episodeGoal": "이번 화의 핵심 목표 및 요약",
  "scenes": [
    { "title": "장면 1 (발단)", "plot": "Goal: ... Conflict: ... Location: ... Characters: ... Ending Hook: ...", "emotion": "감정 흐름" },
    ...
  ]
}
`.trim();

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: { 
          temperature: 0.8,
          systemInstruction: "당신은 6-Stage 파이프라인의 수석 기획자입니다. JSON 형식으로만 응답하세요.",
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

  // 개별 장면 집필 및 검증 API (Stage 4, 5)
  app.post("/api/write-scene", async (req, res) => {
    try {
      const { bible, pastSummary, sceneTitle, scenePlot, sceneEmotion, previousScenesContent } = req.body;
      const prompt = `
[작품 설정 체계 - Priority 1]
${bible.world} / ${bible.system} / ${bible.character}

[최근 회차 흐름]
${pastSummary || '이번 화가 첫 시작입니다.'}

[이번 화 현재까지 집필된 부분]
${previousScenesContent || '(이번 화의 첫 장면입니다)'}

[타겟 집필 장면 기획안]
- 장면 명칭: ${sceneTitle}
- 장면 플롯: ${scenePlot}
- 감정선 흐름: ${sceneEmotion}

당신은 [Stage 4: Scene Writer]이자 [Stage 5: Scene Validator]입니다.
이 타겟 장면의 **본문 원고만** 집필하세요. 이전 내용과 이어지되, 지시된 플롯 범위 내에서만 서술해야 합니다.
본문을 작성한 후, 스스로 설정 충돌, 감정선 유지 여부를 검증하고 점수(100점 만점)와 피드백을 추가하세요.

반드시 아래 JSON 형식으로만 반환하세요:
{
  "content": "작성된 본문 (모바일 가독성을 위해 2~3문장마다 줄바꿈, 1200~1500자 분량, 대사와 행동 중심)",
  "validationScore": 95,
  "validationFeedback": "감정선이 훌륭하게 유지되었습니다."
}
`.trim();

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: { 
          temperature: 0.7,
          systemInstruction: "당신은 매력적인 필력을 가진 Scene Writer 및 엄격한 Validator입니다. 오직 JSON 형식으로만 반환하세요.",
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

  // 에피소드 컴포징 API (Stage 6)
  app.post("/api/compose-episode", async (req, res) => {
    try {
      const { episodeNumber, fullContent } = req.body;
      const prompt = `
당신은 [Stage 6: Episode Composer] 모듈입니다.
아래는 Stage 4, 5를 통과한 4개의 Scene 단위 초안입니다.

[제 ${episodeNumber}화 Scene 초안들]
${fullContent}

[지시사항]
1. 각 Scene 사이의 끊어지는 느낌을 없애고 호흡이 부드러운 하나의 회차(최소 5000자 보장)로 매끄럽게 연결 및 보완하세요.
2. 중복 표현 제거, 문체 통일, 감정선 연결, 엔딩 훅 강화를 수행하세요.
3. 최종 완성된 본문(finalContent)과, RAG Memory 업데이트에 사용할 핵심 사건 위주의 3~4줄 요약(summary)을 작성하세요.

반드시 아래 JSON 형식으로만 반환하세요:
{
  "finalContent": "자연스럽게 병합/보완된 최종 원고",
  "summary": "다음 화 컨텍스트를 위한 핵심 요약"
}
`.trim();

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash", // Composer Needs high context & reasoning
        contents: prompt,
        config: { 
          temperature: 0.4,
          systemInstruction: "당신은 날카로운 통찰력을 가진 수석 편집자이자 Episode Composer입니다. Scene 초안들을 하나의 완벽한 회차 본문으로 병합하고, 다음 화를 위한 기억(Summary)을 작성합니다. 오직 JSON으로 응답하세요.",
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
      console.error("API Compose Episode Error:", error);
      const code = typeof error.status === 'number' ? error.status : (error.code || 500);
      res.status(typeof code === 'number' ? code : 500).json({ error: error.message || "Failed to compose episode" });
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
