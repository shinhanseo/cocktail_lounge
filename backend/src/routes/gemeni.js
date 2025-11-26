// backend/src/routes/gemeni.js
// -------------------------------------------------------------
//  AI 칵테일 추천 + 이미지 생성(Flux) + S3 업로드 + 저장/조회/삭제 + 바텐더 챗
//  이미지쪽 버그/로직 개선 포함
//   - buildPrompt에서 ingredient 필드명 수정
//   - garnishText를 prompt에 실제 주입
//   - guessVisualSpec 결과를 prompt에 반영(fallback 순서 개선)
//   - 마크다운/불필요한 기호 제거(문자/중국어 노이즈 감소)
//   - 바텐더 답변이 레시피 형식일 때만 마이페이지 저장용 recipe 파싱
// -------------------------------------------------------------

import { GoogleGenAI } from "@google/genai";
import { Router } from "express";
import { authRequired } from "../middlewares/jwtauth.js";
import db from "../db/client.js";
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

// -------------------------------------------------------------
// S3 upload
// -------------------------------------------------------------
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
      // ACL: "public-read", // 버킷이 public read 정책이 아닐 때만 고려 (보안 정책에 맞게 선택)
    })
  );

  return `${process.env.AWS_S3_PUBLIC_BASE}/${key}`;
}

// -------------------------------------------------------------
// Visual spec guess (창작 레시피 fallback용) - 색상 강도 기반 개선
// -------------------------------------------------------------
function guessVisualSpec(recipe) {
  const ing = (recipe.ingredient || []).map((x) =>
    (x.item || "").toLowerCase()
  );

  // ------- Color ------
  // 색상 강도 우선순위 맵: [색상 키워드 리스트, 결정될 색상]
  // 1. 커피/초코 (가장 강한 어두운 색)
  const coffeeKeywords = ["coffee", "espresso", "cocoa", "chocolate", "커피", "초코", "초콜릿", "초콜렛", "블랙체리"];
  // 2. 베리/레드 계열 (강한 붉은색/분홍색)
  const berryKeywords = ["berry", "strawberry", "raspberry", "cranberry", "wine", "peach", "체리", "딸기", "수박", "워터멜론", "크랜베리", "와인", "피치", "복숭아"];
  // 3. 위스키/호박색 (중간 정도의 호박색)
  const amberKeywords = ["whisky", "bourbon", "scotch", "위스키", "버번"]; 
  // 4. 밀크/크림 (불투명하고 옅은 색)
  const creamKeywords = ["milk", "cream", "baileys", "irish cream", "우유", "크림", "베일리스", "깔루아"];
  // 5. 시트러스/옅은색 (가장 약한 색, 기본값)
  const citrusKeywords = ["lemon", "lime", "grapefruit", "yuzu", "시트러스", "레몬", "라임", "오렌지"];
  
  let color = "clear or pale yellow"; // 기본값 (진, 보드카, 투명 럼 등)

  // 1. 강한 붉은색/분홍색 계열 확인
  if (ing.some(x => berryKeywords.some(k => x.includes(k)))) {
    color = "vibrant red or pink";
  }
  
  // 2. 가장 강한 어두운 색 확인
  else if (ing.some(x => coffeeKeywords.some(k => x.includes(k)))) {
    color = "dark brown";
  }
  
  // 3. 불투명하고 옅은 색 확인 (크림은 다른 색을 덮음)
  else if (ing.some(x => creamKeywords.some(k => x.includes(k)))) {
    color = "creamy white or beige";
  }
  
  // 4. 호박색 계열 확인 (다른 강한 색이 없을 경우만)
  // 위스키는 다른 강한 색 (베리, 커피)이 섞이지 않았을 때 앰버색을 결정합니다.
  else if (color === "clear or pale yellow" && ing.some(x => amberKeywords.some(k => x.includes(k)))) {
    color = "amber gold or deep amber";
  }
  
  // 5. 시트러스 계열은 옅은 노란색으로 (주로 클리어 베이스일 때)
  else if (color === "clear or pale yellow" && ing.some(x => citrusKeywords.some(k => x.includes(k)))) {
      color = "pale yellow with correct transparency";
  }

  // ------- Glass ------
  let glass = "highball glass";
  const stepText = (recipe.step || []).join(" ").toLowerCase();
  
  if (stepText.includes("쉐이킹") || stepText.includes("shake") || recipe.name.includes("마티니"))
    glass = "coupe or martini glass";
    
  else if (ing.some(x => amberKeywords.some(k => x.includes(k))))
    glass = "old fashioned glass";

  else if(recipe.name.includes("뮬") || stepText.includes("구리"))
    glass = "a copper Moscow Mule Mug";

  else if(recipe.name.includes("마가리타"))
    glass = "Margarita Glass and salt lip";
  // ------- Garnish ------
  let garnishList = [];

  // 커피/크림 계열은 무가니시가 기본
  if (ing.some(x => coffeeKeywords.some(k => x.includes(k))) || ing.some(x => creamKeywords.some(k => x.includes(k)))) {
    return { color, glass, garnish: [], noGarnish: true };
  }

  // 허용되는 경우만 가니시 추가
  if (ing.some(x => x.includes("mint") || x.includes("민트")))
    garnishList.push("a small mint sprig");
    
  if (ing.some(x => x.includes("lemon") || x.includes("레몬")))
    garnishList.push("a thin lemon peel");
    
  if (ing.some(x => x.includes("lime") || x.includes("라임")))
    garnishList.push("a lime wheel");
    
  // 오렌지 - 재료 언급 시 가니시로 추가
  if (ing.some(x => x.includes("orange") || x.includes("오렌지"))) {
    garnishList.push("an orange peel or twist");
  }

  // 체리 - 위스키 조건 없이 추가
  if (ing.some(x => x.includes("cherry") || x.includes("체리")) || recipe.step.join(" ").toLowerCase().includes("체리로 장식")) {
     // 피치 크러쉬 레시피처럼 '체리로 장식'이 언급되면 추가합니다.
     garnishList.push("a maraschino cherry on a skewer");
  }


  if (garnishList.length === 0)
    return { color, glass, garnish: [], noGarnish: true };

  return { color, glass, garnish: garnishList, noGarnish: false };
}

// -------------------------------------------------------------
// Canonical overrides (대표칵테일 정확도용)
// -------------------------------------------------------------
const colorByCocktail = {
  "위스키 사워": "pale yellow with a creamy foam top",
  "마가리타": "light green or clear depending on style",
  "모히또": "clear with mint and lime",
  "네그로니": "deep red",
  "올드 패션드": "amber gold",
  "코스모폴리탄": "pink",
  "피나콜라다": "creamy white",
  "마티니": "crystal clear",
};

const glassByCocktail = {
  "위스키 사워": "old fashioned glass",
  "마가리타": "margarita glass",
  "모히또": "highball glass",
  "네그로니": "lowball glass",
  "올드 패션드": "rocks glass",
  "코스모폴리탄": "martini glass",
  "피나콜라다": "hurricane glass",
  "마티니": "martini glass",
};

function buildPrompt(recipe, garnishText = "") {
  const guessed = guessVisualSpec(recipe);

  // fallback 순서: canonical 맵 → guessed → 일반
  const expectedColor =
    colorByCocktail[recipe.name] ||
    guessed.color ||
    "natural cocktail color appropriate for the recipe";

  const glass =
    glassByCocktail[recipe.name] ||
    guessed.glass ||
    "cocktail glass appropriate for the style";

  const ingredientsText = (recipe.ingredient || [])
    .map((i) => i.item)
    .filter(Boolean)
    .join(", ");

  return `
    Realistic high-end cocktail product photography.

    Cocktail name: ${recipe.name}

    Color and appearance:
    - The drink color must be: ${expectedColor}
    - Do not tint the drink based on small garnish items.
    - Natural liquid look with correct transparency and viscosity.

    Glassware:
    - Serve in a ${glass}
    - Proper fill level, no spills.

    Garnish rules:
    ${garnishText}

    Background and lighting:
    - Dark bar mood lighting.
    - Soft reflections.
    - Background must be abstract, blurred, or smooth gradients.

    Strict rules:
    - Absolutely no text, letters, logos, menus, symbols, signage, neon letters.
    - No watermark.
    - No human hands.

    Recipe context (not for color):
    - Ingredients: ${ingredientsText}

    Camera:
    - 50mm prime lens, shallow depth of field.
    - Professional studio product shot.
    `.trim();
}

// -------------------------------------------------------------
// Image generation (Flux Schnell)
// -------------------------------------------------------------
async function generateCocktailImage(recipe) {
  const { garnish, noGarnish } = guessVisualSpec(recipe);

  let garnishText = `
    - The drink must have no garnish of any kind.
    - No citrus, no fruits, no herbs, no decor on or near the glass.
    - The surface of the drink must be perfectly clean.
    `.trim();

  if (!noGarnish) {
    garnishText = `
    - The only decoration allowed is: ${garnish.join(", ")}.
    - No additional fruits, herbs, or decor beyond the allowed item(s).
    `.trim();
  }

  const prompt = buildPrompt(recipe, garnishText);

  const model = "black-forest-labs/FLUX.1-schnell";
  const negativePrompt = "too yellow, bright orange, amber color, yellow tint, bad crop, blurry, ugly, messy, bad composition";

  const out = await hf.textToImage({
    model,
    inputs: prompt,
    parameters: {
      height: 768,
      width: 768,
      num_inference_steps: 16,
      guidance_scale: 7,
      negative_prompt : negativePrompt,
    },
  });

  const arrayBuffer = await out.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// -------------------------------------------------------------
// Gemini retry helper
// -------------------------------------------------------------
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

// -------------------------------------------------------------
// Bartender 레시피 텍스트 파싱 (칵테일 이름/재료/제조과정/코멘트만 추출)
// -------------------------------------------------------------
function parseBartenderRecipe(text = "") {
  try {
    // 1) 칵테일 이름
    const nameMatch = text.match(/칵테일 이름:\s*(.+)/);
    // 2) 도수
    const abvMatch = text.match(/도수:\s*(\d+)\s*%/);

    // 3) [재료] ~ [제조 과정] 구간
    const ingSectionMatch = text.match(/\[재료\]([\s\S]*?)\[제조 과정\]/);
    // 4) [제조 과정] ~ [코멘트] 구간
    const stepSectionMatch = text.match(/\[제조 과정\]([\s\S]*?)\[코멘트\]/);
    // 5) [코멘트] 이후
    const commentSectionMatch = text.match(/\[코멘트\]\s*([\s\S]*)/);

    if (!nameMatch || !ingSectionMatch || !stepSectionMatch) {
      // 필수 섹션이 없으면 레시피가 아니라고 판단
      return null;
    }

    // --- 재료 파싱 ---
    const ingredientLines = ingSectionMatch[1]
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.startsWith("-"));

    const ingredient = ingredientLines.map((line) => {
      const noDash = line.replace(/^-+/, "").trim(); // "- " 제거
      // 마지막 공백 기준으로 "이름" / "용량" 나누기 (예: "진 45ml")
      const idx = noDash.lastIndexOf(" ");
      if (idx === -1) {
        return { item: noDash, volume: "" };
      }
      return {
        item: noDash.slice(0, idx).trim(),
        volume: noDash.slice(idx + 1).trim(),
      };
    });

    // --- 제조 과정 파싱 ---
    const stepLines = stepSectionMatch[1]
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => /^\d+\./.test(l)); // "1. ", "2. " 등

    const step = stepLines.map((l) => l.replace(/^\d+\.\s*/, "").trim());

    // --- 코멘트 ---
    let comment = "";
    if (commentSectionMatch) {
      comment = commentSectionMatch[1].trim().split("\n")[0];
    }

    if (!ingredient.length || !step.length) return null;

    return {
      name: nameMatch[1].trim(),
      abv: abvMatch ? parseInt(abvMatch[1], 10) : null,
      ingredient,
      step,
      comment,
    };
  } catch (e) {
    console.error("바텐더 레시피 파싱 실패:", e);
    return null;
  }
}

// -------------------------------------------------------------
// Recipe generation prompt
// -------------------------------------------------------------
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
    prompt += `- 포함되어야 할 특징/재료: ${keywords.join(
      ", "
    )} 등의 요소를 포함해야 함.\n`;
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

// -------------------------------------------------------------
// Generate recipe + image + upload to S3
// -------------------------------------------------------------
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
    const jsonRecipeString = await generateCocktailRecommendation(
      requirements
    );

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

// -------------------------------------------------------------
// Save generated recipe
// -------------------------------------------------------------
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
      rawTaste && rawTaste.split(",").map((t) => t.trim()).filter(Boolean);

    const keywords =
      rawKeywords && rawKeywords.split(",").map((k) => k.trim()).filter(Boolean);

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

// -------------------------------------------------------------
// List saved recipes (with search + paging)
// -------------------------------------------------------------
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

// -------------------------------------------------------------
// Get one saved recipe
// -------------------------------------------------------------
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

// -------------------------------------------------------------
// Delete saved recipe
// -------------------------------------------------------------
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

// -------------------------------------------------------------
// Bartender chat (레시피일 때만 recipe 객체 내려줌)
// -------------------------------------------------------------
router.post("/bartender-chat", authRequired, async (req, res, next) => {
  try {
    const { messages } = req.body || {};

    const lastUserMessage = [...(messages || [])]
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
      `.trim();

    const conversationText = (messages || [])
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
      `.trim();

    const response = await generateWithRetry(prompt);
    const replyText = response.text;

    const trimmed =
      (replyText && replyText.trim()) ||
      "지금은 잠시 레시피를 만들기 어렵습니다. 조금 뒤에 다시 시도해 주세요.";
    
    const parsedRecipe = parseBartenderRecipe(trimmed);
    // 레시피 형식일 때만 파싱 → recipe 객체 생성
    if (!parsedRecipe) {
      return res.json({
        reply: trimmed,
        recipe: null,
      });
    }
    
    let imageUrl = null;
    try {
      const imageBuffer = await generateCocktailImage(parsedRecipe);
      imageUrl = await uploadImageToS3(imageBuffer, parsedRecipe.name);
    } catch (e) {
      console.error("이미지 생성/업로드 실패:", e.message);
    }
    
    // 응답용 객체에 붙이기
    parsedRecipe.image_url = imageUrl ?? null;
    
    return res.json({
      reply: trimmed,
      recipe: parsedRecipe,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
