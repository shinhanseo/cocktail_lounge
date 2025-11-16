import { GoogleGenAI } from "@google/genai";
import { Router } from "express";
import { authRequired } from "../middlewares/jwtauth.js";
import db from "../db/client.js";

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

  prompt += `--- 출력 형식 ---
    아래 JSON 스키마를 **정확히** 지키세요.
    JSON 외의 설명 문장, 마크다운, 코드블록, 주석 등은 일절 포함하지 마세요.

    {
      "name": "칵테일 이름 (string)",
      "ingredient": [
        {
          "item": "재료 이름 (string)",
          "volume": "용량 (string, 예: 45ml)"
        }
      ],
      "step": "칵테일 제조 과정을 여러 문장으로 자세히 설명한 문자열",
      "comment": "맛을 한줄로 표현한 짧은 코멘트"
    }

    --- 추가 조건 ---
    - 반드시 JSON만 출력하세요. JSON 외 텍스트는 금지합니다.
    - 모든 텍스트는 한국어로 작성하세요.
    - ingredient 배열에는 최소 3개 이상의 재료를 포함하세요.
    - step은 2~6단계 정도로 자연스러운 문장으로 작성하세요.
    - comment는 20자 이하로 간결하게 작성하세요.
    - 만약 대표적인 칵테일이 있다면 그 칵테일의 레시피를 소개하세요.
    - baseSpirit, taste, keywords 조건을 반드시 반영하세요.
    `;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.9,
      },
    });
    console.log(response.text);
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

router.post("/save", authRequired, async (req, res, next) => {
  const userId = req.user.id;

  try {
    const {
      name,          // AI가 만든 칵테일 이름
      ingredient,    // [{ item, volume }, ...]
      step,          // string or string[]
      comment,       // 한줄 코멘트
      base,    // 사용자가 입력한 기주 (optional)
      rawTaste,      // "상큼,달콤" 이런 문자열 (optional)
      rawKeywords,   // "레몬,민트" 이런 문자열 (optional)
    } = req.body || {};

    if (!name || !ingredient || !step) {
      return res
        .status(400)
        .json({ error: "name, ingredient, step 은 필수입니다." });
    }

    // taste/keywords 문자열을 배열로 변환
    const taste =
      rawTaste &&
      rawTaste
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

    const keywords =
      rawKeywords &&
      rawKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

    // step이 문자열이면 줄바꿈 기준으로 배열로 변환
    const stepArray = Array.isArray(step)
      ? step
      : String(step)
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);

    const row = await db.query(
      `
      INSERT INTO ai_cocktails (
        user_id,
        name,
        base,
        taste,
        keywords,
        ingredient,
        step,
        comment
      )
      VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8)
      RETURNING id, created_at
      `,
      [
        userId,
        name,
        base || null,
        taste || null,
        keywords || null,
        JSON.stringify(ingredient),
        stepArray,
        comment || null,
      ]
    );

    res.status(201).json({
      id: row.id,
      created_at: row.created_at,
      message: "AI 레시피가 저장되었습니다.",
    });
  } catch (err) {
    next(err);
  }
});

export default router;
