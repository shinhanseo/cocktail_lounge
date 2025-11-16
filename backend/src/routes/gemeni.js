import { GoogleGenAI } from "@google/genai";
import { Router } from "express";

const router = Router();
const GOOGLE_GEMENI_ID = process.env.GOOGLE_GEMENI_ID;
const ai = new GoogleGenAI({ apiKey: GOOGLE_GEMENI_ID });

// AI 호출 함수
async function generateCocktailRecommendation(requirements) {
  const { taste, baseSpirit, keywords } = requirements; 
  
  let tasteString = null;
  if (Array.isArray(taste) && taste.length > 0) {
    if (taste.length === 1) {
      tasteString = taste[0] + "한";
    } else {
      tasteString = taste.join(", ") + "한";
    }
  }

  let prompt = "다음 요구사항에 맞춰 창의적인 칵테일 레시피를 생성해줘.\n";

  if (baseSpirit) {
    prompt += `- **주요 기주(Base Spirit):** 반드시 ${baseSpirit}를(을) 사용해야 함.\n`;
  }

  if (tasteString) {
    prompt += `- **주요 맛:** ${tasteString} 느낌의 칵테일이어야 함.\n`;
  }

  if (keywords && keywords.length > 0) {
    prompt += `- **포함되어야 할 특징/재료:** ${keywords.join(", ")} 등의 요소를 포함해야 함.\n`;
  }

  prompt +=
    "\n응답은 칵테일 이름, 재료 목록(용량 필수), 상세한 제조 과정을 담은 **JSON 형식**으로 응답해야 하며, 각각 key 값을 name, ingredient, step으로 지정해야한다. 또한  ingredient에 재료는 item 용량은 volume 으로 표기한다. 다른 설명이나 텍스트는 일절 포함하지 마세요.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.9,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API 호출 중 오류 발생:", error);
    throw new Error("칵테일 추천 레시피를 생성할 수 없습니다.");
  }
}

router.post("/", async (req, res) => {
  // 프론트에서 오는 형태: { baseSpirit, rawTaste, rawKeywords }
  const { baseSpirit, rawTaste, rawKeywords } = req.body || {};

  // 문자열을 배열로 변환
  const taste = rawTaste
    ? rawTaste
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const keywords = rawKeywords
    ? rawKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    : [];

  // 검증 로직: taste 배열도 같이 고려
  if (!baseSpirit && taste.length === 0) {
    return res.status(400).json({
      error: "맛(Taste)이나 기주(Base Spirit) 중 하나는 반드시 입력해야 합니다.",
    });
  }

  const requirements = { baseSpirit, taste, keywords };

  try {
    const jsonRecipeString = await generateCocktailRecommendation(requirements);

    res.status(200).json({
      recipe: JSON.parse(jsonRecipeString),
    });
  } catch (error) {
    console.error("추천 생성 에러:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
