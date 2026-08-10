import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf-8');

const targetStr = `  app.post("/api/ai/feedback", async (req, res) => {`;

const replaceStr = `  app.post("/api/ai/correct", async (req, res) => {
    try {
      const { text, context } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key is not configured on the server." });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = \`당신은 탁월한 웹소설 문장 교정 AI입니다. 
다음 어색하거나 매끄럽지 않은 문장을 웹소설 특유의 리듬감, 몰입감, 가독성을 살려 더 자연스럽게 3가지 버전으로 다듬어 제안해주세요.

[전후 문맥 요약]
\${context}

[교정할 문장]
\${text}

---
응답 형식:
반드시 다음 JSON 형식으로만 응답해주세요. (마크다운 백틱 없이 순수 JSON만 반환)
{
  "suggestions": [
    "첫 번째 제안 문장",
    "두 번째 제안 문장",
    "세 번째 제안 문장"
  ]
}\`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      let responseText = response.text || "{}";
      responseText = responseText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
      
      const parsed = JSON.parse(responseText);
      res.json(parsed);
    } catch (error: any) {
      console.error('AI Correct Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/feedback", async (req, res) => {`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('server.ts', code);
