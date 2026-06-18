const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-pro";
const DEFAULT_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS) || 12000;

const buildPrompt = ({ isStarterMode, userProfile, catalog }) => {
  const baseInstructions = [
    "You are an AI ecommerce recommendation engine.",
    "Analyze:",
    "1. User purchase history",
    "2. User wishlist behaviour",
    "3. User cart behaviour",
    "4. Product categories",
    "5. Product pricing",
    "6. Product descriptions",
    "Your objective is to recommend the 10 best products for this customer.",
    "Rules:",
    "- Recommend only products that exist in the provided catalog.",
    "- Never invent products.",
    "- Do not recommend products already purchased.",
    "- Do not recommend products already present in wishlist.",
    "- Do not recommend products already present in cart.",
    "- Prioritize category relevance.",
    "- Prioritize similar price ranges.",
    "- Consider product descriptions.",
    "- Consider overall customer interests.",
    "For each recommendation provide:",
    '{"productId": number, "score": 1-100, "reason": "under 20 words"}',
    "Requirements:",
    "- score between 1 and 100",
    "- reason under 20 words",
    "- return exactly 10 recommendations",
    "- return valid JSON only",
    "- no markdown",
    "- no explanations outside JSON",
  ];

  if (isStarterMode) {
    baseInstructions.push(
      'This is a new customer. Return top 10 trending starter recommendations for a new customer.',
    );
  }

  return [
    ...baseInstructions,
    "",
    "User profile:",
    JSON.stringify(userProfile),
    "",
    "Catalog:",
    JSON.stringify(catalog),
  ].join("\n");
};

const extractTextFromGeminiResponse = (payload) => {
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) {
    return "";
  }

  return parts
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .join("")
    .trim();
};

const parseRecommendationJson = (rawText) => {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Empty Gemini response");
  }

  const trimmed = rawText.trim();

  try {
    return JSON.parse(trimmed);
  } catch (error) {
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw new Error("Gemini did not return valid JSON");
    }

    return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
  }
};

const generateRecommendations = async ({
  userProfile,
  catalog,
  isStarterMode,
}) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error("Missing Gemini API key");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${GEMINI_API_URL}/${DEFAULT_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: buildPrompt({ isStarterMode, userProfile, catalog }),
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topP: 0.9,
            responseMimeType: "application/json",
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini request failed: ${response.status} ${errorText}`);
    }

    const payload = await response.json();
    const rawText = extractTextFromGeminiResponse(payload);
    const parsed = parseRecommendationJson(rawText);

    if (!Array.isArray(parsed?.recommendations)) {
      throw new Error("Gemini response missing recommendations array");
    }

    return parsed.recommendations;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Gemini request timed out");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

module.exports = {
  generateRecommendations,
};
