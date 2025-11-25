import { GoogleGenAI } from "@google/genai";
import { Router } from "express";
import { authRequired } from "../middlewares/jwtauth.js";
import db from "../db/client.js";
import axios from "axios";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import { HfInference } from "@huggingface/inference";

const router = Router();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMENI_ID });

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const hf = new HfInference(process.env.HF_TOKEN);

// S3 upload
async function uploadImageToS3(imageBuffer, recipeName) {
  const bucket = process.env.AWS_S3_BUCKET;

  const safeName = String(recipeName || "ai-cocktail")
    .toLowerCase()
    .replace(/[^a-z0-9가-힣-_]/g, "-")
    .slice(0, 40);

  const key = `ai_cocktails/${safeName}-${crypto.randomUUID()}.png`;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: imageBuffer,
      ContentType: "image/png",
    })
  );

  return `${process.env.AWS_S3_PUBLIC_BASE}/${key}`;
}

// HuggingFace image generation (free-tier friendly)
// Returns PNG buffer
async function generateCocktailImage(recipe) {
  const ingredientsText = (recipe.ingredient || [])
    .slice(0, 5)
    .map((i) => i.item)
    .join(", ");

    const prompt = `
    Realistic cocktail product photo.
    - Cocktail name: ${recipe.name}
    - Main ingredients: ${ingredientsText}
    - Natural glassware and garnish matching the recipe
    - Dark bar mood lighting but **no visible signs, no visible text**
    - Background must be abstract, blurry, or simple shapes
    - Absolutely no letters, no words, no numbers, no symbols
    - No neon signs, no logos, no stickers, no menus
    - The image must contain ZERO text or characters of ANY language

    `;


  // 무료에서 비교적 잘 열리는 모델(권장)
  const model = "black-forest-labs/FLUX.1-schnell";

  const out = await hf.textToImage({
    model,
    inputs: prompt,
    parameters: {
      height: 768,
      width: 768,
      num_inference_steps: 16,
      guidance_scale: 6.5,
    },
  });

  // out은 Blob 이라서 Buffer로 변환
  const arrayBuffer = await out.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function generateWithRetry(prompt, configOverride = {}) {
  const MAX_RETRY = 7;

  for (let i = 0; i < MAX_RETRY; i++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          temperature: 0.6,
          ...configOverride,
        },
      });
      return response;
    } catch (err) {
      console.error(
        `Gemini 호출 실패 (${i + 1}/${MAX_RETRY})`,
        err.status,
        err.message
      );

      if (err.status === 503 && i < MAX_RETRY - 1) {
        await new Promise((r) => setTimeout(r, 400));
        continue;
      }
      throw err;
    }
  }
}

async function generateCocktailRecommendation(requirements) {
  const { taste, baseSpirit, keywords, abv } = requirements;

  let tasteString = null;
  if (Array.isArray(taste) && taste.length > 0) {
    tasteString = taste.length === 1 ? taste[0] + "한" : taste.join(", ") + "한";
  }

  let prompt = "다음 요구사항에 맞춰 창의적인 칵테일 레시피를 생성해줘.\n";

  if (baseSpirit) {
    prompt += `- 주요 기주(Base Spirit): 반드시 ${baseSpirit}를(을) 사용해야 함.\n`;
  }

  if (tasteString) {
    prompt += `- 주요 맛: ${tasteString} 느낌의 칵테일이어야 함.\n`;
  }

  if (keywords && keywords.length > 0) {
    prompt += `- 포함되어야 할 특징/재료: ${keywords.join(", ")} 등의 요소를 포함해야 함.\n`;
  }

  let abvText = "";
  if (abv) {
    const n = Number(abv);
    if (!Number.isNaN(n)) {
      if (n <= 10) {
        abvText = "도수가 낮은 (약 5~10% 수준, 맥주나 약한 하이볼 느낌)";
      } else if (n <= 20) {
        abvText = "중간 정도 도수 (약 10~20% 수준, 일반적인 칵테일 느낌)";
      } else {
        abvText = "도수가 높은 (20% 이상, 스트롱 칵테일 느낌)";
      }
    }
  }
  if (abvText) {
    prompt += `- 도수(ABV) 조건: ${abvText} 이어야 합니다.\n`;
  }

  prompt += `--- 출력 형식 ---
    아래 JSON 스키마를 정확히 지키세요.
    JSON 외의 설명 문장, 마크다운, 코드블록, 주석 등은 일절 포함하지 마세요.

    {
      "name": "칵테일 이름 (string)",
      "abv": 12,
      "ingredient": [
        {
          "item": "재료 이름 (string)",
          "volume": "용량 (string, 예: 45ml)"
        }
      ],
      "step": ["1단계", "2단계", "3단계"],
      "comment": "맛을 한줄로 표현한 짧은 코멘트"
    }

    --- 추가 조건 ---
    - 반드시 JSON만 출력하세요. JSON 외 텍스트는 금지합니다.
    - 모든 텍스트는 한국어로 작성하세요.
    - ingredient 배열에는 최소 3개 이상의 재료를 포함하세요.
    - step은 2~6단계 정도로 자연스러운 문장으로 작성하세요.
    - step은 단계별 배열로 반환하세요.
    - comment는 20자 이하로 간결하게 작성하세요.
    - 만약 대표적인 칵테일이 있다면 그 칵테일의 레시피를 소개하세요.
    - baseSpirit, taste, keywords, abv 조건을 반드시 반영하세요.
    - 사용자가 입력한 abv 값이 있다면 abv 필드에는 그 값과 최대한 가까운 정수를 적으세요.
    - 도수가 낮은 칵테일(약 5~10%)일수록 베이스 술의 양을 줄이고 논알코올 재료의 비중을 높이세요.
    - 도수가 높은 칵테일(약 20% 이상)일수록 베이스 술이나 리큐르의 비율을 늘리세요.
    - 재료 비율과 abv 설명이 서로 모순되지 않도록 노력하세요.
    - 가급적 인터넷에 존재하는 칵테일을 기준으로 레시피를 짜세요.
    `;

  const response = await generateWithRetry(prompt, {
    responseMimeType: "application/json",
  });
  return response.text;
}

// Generate recipe + image + upload to S3
router.post("/", async (req, res) => {
  const { baseSpirit, rawTaste, rawKeywords, abv } = req.body || {};

  const taste = rawTaste
    ? rawTaste.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const keywords = rawKeywords
    ? rawKeywords.split(",").map((k) => k.trim()).filter(Boolean)
    : [];

  if (!baseSpirit && taste.length === 0) {
    return res.status(400).json({
      error: "맛(Taste)이나 기주(Base Spirit) 중 하나는 반드시 입력해야 합니다.",
    });
  }

  const requirements = { baseSpirit, taste, keywords, abv };

  try {
    const jsonRecipeString = await generateCocktailRecommendation(requirements);

    let recipe;
    try {
      recipe = JSON.parse(jsonRecipeString);
    } catch (e) {
      console.error("AI JSON 파싱 실패 원문:", jsonRecipeString);
      throw new Error("AI가 올바른 JSON을 반환하지 않았습니다.");
    }

    let imageUrl = null;
    try {
      const imageBuffer = await generateCocktailImage(recipe);
      imageUrl = await uploadImageToS3(imageBuffer, recipe.name);
    } catch (e) {
      console.error("이미지 생성/업로드 실패:", e.message);
    }

    recipe.image_url = imageUrl;

    return res.status(200).json({
      recipe,
      imageUrl,
      taste,
      keywords,
      abv,
    });
  } catch (error) {
    console.error("추천 생성 에러:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Save generated recipe
router.post("/save", authRequired, async (req, res, next) => {
  const userId = req.user.id;

  try {
    const {
      name,
      ingredient,
      step,
      comment,
      base,
      rawTaste,
      rawKeywords,
      abv,
      image_url,
    } = req.body || {};

    const check = await db.query(
      `SELECT id FROM ai_cocktails WHERE name = $1 AND user_id = $2`,
      [name, userId]
    );

    if (check.length > 0) {
      return res
        .status(400)
        .json({ error: "동일한 칵테일을 이미 저장하셨습니다." });
    }

    if (!name || !ingredient || !step) {
      return res
        .status(400)
        .json({ error: "name, ingredient, step 은 필수입니다." });
    }

    const taste =
      rawTaste &&
      rawTaste.split(",").map((t) => t.trim()).filter(Boolean);

    const keywords =
      rawKeywords &&
      rawKeywords.split(",").map((k) => k.trim()).filter(Boolean);

    const stepArray = Array.isArray(step)
      ? step
      : String(step)
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);

    const [row] = await db.query(
      `
      INSERT INTO ai_cocktails (
        user_id,
        name,
        base,
        taste,
        keywords,
        ingredient,
        step,
        comment,
        abv,
        image_url
      )
      VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10)
      RETURNING id, created_at, image_url
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
        abv ? Number(abv) : null,
        image_url || null,
      ]
    );

    return res.status(201).json({
      id: row.id,
      created_at: row.created_at,
      image_url: row.image_url,
      message: "AI 레시피가 저장되었습니다.",
    });
  } catch (err) {
    next(err);
  }
});

// List saved recipes (with search + paging)
router.get("/save", authRequired, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = Math.max(parseInt(req.query.page ?? "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit ?? "5", 10), 1);
    const offset = (page - 1) * limit;
    const keyword = (req.query.keyword ?? "").trim();

    let whereClauses = ["user_id = $1"];
    let params = [userId];

    if (keyword) {
      params.push(keyword);
      const idx = params.length;

      whereClauses.push(`
        (
          name ILIKE '%' || $${idx} || '%'
          OR comment ILIKE '%' || $${idx} || '%'
          OR EXISTS (
            SELECT 1 FROM unnest(taste) AS t
            WHERE t ILIKE '%' || $${idx} || '%'
          )
          OR EXISTS (
            SELECT 1 FROM unnest(keywords) AS kw
            WHERE kw ILIKE '%' || $${idx} || '%'
          )
        )
      `);
    }

    const whereSql = "WHERE " + whereClauses.join(" AND ");

    const countRows = await db.query(
      `
      SELECT COUNT(*)::int AS count
      FROM ai_cocktails
      ${whereSql}
      `,
      params
    );

    const total = countRows[0]?.count ?? 0;
    const pageCount = Math.max(Math.ceil(total / limit), 1);
    const hasPrev = page > 1;
    const hasNext = page < pageCount;

    params.push(limit, offset);

    const rows = await db.query(
      `
      SELECT
        id,
        name,
        base,
        taste,
        keywords,
        comment,
        abv,
        image_url,
        to_char(created_at, 'YYYY-MM-DD') AS created_at
      FROM ai_cocktails
      ${whereSql}
      ORDER BY created_at DESC, id DESC
      LIMIT $${params.length - 1}
      OFFSET $${params.length}
      `,
      params
    );

    return res.json({
      items: rows,
      meta: {
        total,
        page,
        limit,
        pageCount,
        hasPrev,
        hasNext,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Get one saved recipe
router.get("/save/:id", authRequired, async (req, res, next) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const [row] = await db.query(
      `
      SELECT id, name, base, taste, keywords, ingredient, step, comment, created_at, abv, image_url
      FROM ai_cocktails
      WHERE id = $1 AND user_id = $2
      `,
      [id, userId]
    );

    if (!row) {
      return res.status(404).json({ error: "레시피를 찾을 수 없습니다." });
    }

    return res.json(row);
  } catch (err) {
    next(err);
  }
});

// Delete saved recipe
router.delete("/save/:id", authRequired, async (req, res, next) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const rows = await db.query(
      `
      SELECT user_id FROM ai_cocktails 
      WHERE id = $1 AND user_id = $2
      `,
      [id, userId]
    );

    if (!rows.length)
      return res.status(404).json({ message: "레시피 없음" });

    if (rows[0].user_id !== req.user.id)
      return res.status(403).json({ message: "권한 없음" });

    await db.query(
      `
      DELETE FROM ai_cocktails 
      WHERE id = $1 AND user_id = $2
      `,
      [id, userId]
    );

    return res.json({ message: "삭제 완료" });
  } catch (err) {
    next(err);
  }
});

// Bartender chat
router.post("/bartender-chat", authRequired, async (req, res, next) => {
  try {
    const { messages } = req.body || {};

    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === "user");
    const lastContent = lastUserMessage?.content?.trim() ?? "";

    if (!lastContent) {
      return res.status(400).json({ error: "사용자 메시지가 비어 있습니다." });
    }

    const systemPrompt = `
      당신은 한국어를 사용하는 "AI 칵테일 바텐더"입니다.

      [대화 규칙]
      - 반드시 칵테일, 술, 재료, 맛, 도수, 분위기, 제조 방법과 관련된 이야기만 합니다.
      - 다른 주제(연애, 주식, 코딩, 게임 등)가 나오면
        "저는 칵테일 전용 바텐더라서, 술/칵테일 관련 이야기만 도와드릴 수 있어요." 라고 말한 뒤
        사용자의 취향(기주, 맛, 도수, 분위기 등)을 자연스럽게 다시 질문합니다.
      - 레시피가 아닌 일반 대화는 3문장 이하로 짧고 친절하게 대답합니다.
      - 모든 답변은 한국어로 합니다.

      [레시피 출력 규칙]
      - 사용자가 레시피, 제조 방법, 만들기 등을 요청하면 반드시 아래 형식으로 "텍스트만" 출력합니다.
      - 마크다운, 코드블록, JSON, 따옴표, 설명 문장, 부가 텍스트는 절대 포함하지 않습니다.

      --- 레시피 출력 형식 ---
      칵테일 이름: (칵테일 이름)
      도수: (정수)% 

      [재료]
      - 재료1 이름 용량
      - 재료2 이름 용량
      - 재료3 이름 용량
      (최소 3개 이상)

      [제조 과정]
      1. 첫 번째 단계
      2. 두 번째 단계
      3. 세 번째 단계
      (2~6단계)

      [코멘트]
      20자 이하 짧은 맛 표현
      ------------------------

      [레시피 구성 조건]
      - 사용자의 조건(baseSpirit, taste, keywords, abv 등)을 최대한 반영합니다.
      - 사용자가 도수(abv)를 요구하면 도수는 그 값과 가장 가까운 정수로 작성합니다.
      - 낮은 도수(5~10%)는 베이스 술 비중을 줄이고 논알코올 비중을 높입니다.
      - 높은 도수(20% 이상)는 베이스 술 또는 리큐르 양을 늘립니다.
      - 재료 구성과 도수가 모순되지 않도록 합니다.
      - 가능한 경우 실존하는 칵테일을 기반으로 레시피를 구성합니다.
      `;

    const conversationText = messages
      .map((m) => {
        const prefix = m.role === "user" ? "사용자" : "바텐더";
        return `${prefix}: ${m.content}`;
      })
      .join("\n");

    const prompt = `
      ${systemPrompt}

      --- 지금까지의 대화 ---
      ${conversationText}

      위 대화를 이어서, "바텐더" 역할로 자연스럽게 한 번만 답변하세요.
      `;

    const response = await generateWithRetry(prompt);
    const replyText = response.text;

    const trimmed =
      replyText.trim() ||
      "지금은 잠시 레시피를 만들기 어렵습니다. 조금 뒤에 다시 시도해 주세요.";

    return res.json({ reply: trimmed });
  } catch (err) {
    next(err);
  }
});

export default router;
