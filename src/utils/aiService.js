import { GoogleGenerativeAI } from "@google/generative-ai";

/* ================== GEMINI INIT ================== */

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;

if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
} else {
  console.warn("Gemini API Key missing. Add it inside .env file");
}

// latest working model
const MODEL = "gemini-2.0-flash";

/* ================== HELPER DELAY ================== */
/* prevents 429 too many requests */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ================== IMAGE → BASE64 ================== */

async function fileToGenerativePart(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64Data = reader.result.split(",")[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* =========================================================
   1) READ PRESCRIPTION IMAGE
   ========================================================= */

export async function analyzePrescriptionImage(imageFile) {
  if (!genAI) throw new Error("Gemini not configured");

  const model = genAI.getGenerativeModel({ model: MODEL });

  const imagePart = await fileToGenerativePart(imageFile);

  const prompt = `
Read the doctor's prescription image.

Extract medicines and return STRICT JSON ARRAY:

[
  {
    "name": "",
    "quantity": "",
    "timing": {"morning":false,"afternoon":false,"night":false},
    "note": ""
  }
]

Rules:
1-0-1 => morning & night true
1-1-1 => all true
Unreadable => empty string
NO MARKDOWN
`;

  try {
    await sleep(1500); // rate limit protection
    const result = await model.generateContent([prompt, imagePart]);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch (e) {
    console.error("Prescription read failed", e);
    throw new Error("Prescription reading failed");
  }
}

/* =========================================================
   2) HEALTH SUMMARY
   ========================================================= */

export async function analyzeHealthTrends(records) {
  if (!genAI) return "AI unavailable";

  const model = genAI.getGenerativeModel({ model: MODEL });

  const prompt = `
Give a short 3 sentence doctor summary from this patient history:

${JSON.stringify(records.slice(0, 10))}
`;

  try {
    await sleep(1500);
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch {
    return "Could not analyze history.";
  }
}

/* =========================================================
   3) MEDICINE INSIGHTS
   ========================================================= */

export async function getMedicineInsights(medicines) {
  if (!genAI || !medicines?.length) return null;

  const model = genAI.getGenerativeModel({ model: MODEL });

  const prompt = `
Explain medicines for patient in simple English.

Return STRICT JSON:

{
 "summary": "",
 "riskAnalysis":[
  {"name":"Safe","value":0},
  {"name":"Moderate Caution","value":0},
  {"name":"High Risk","value":0}
 ]
}

Values must sum to 100.
`;

  try {
    await sleep(1500);
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch (err) {
    console.error(err);
    return null;
  }
}

/* =========================================================
   4) CHART GENERATOR (MOST IMPORTANT)
   ========================================================= */

export async function analyzePrescriptionForCharts(age, medicines) {
  if (!genAI) return null;

  const model = genAI.getGenerativeModel({ model: MODEL });

  const prompt = `
Convert prescription into chart data.

Age: ${age}
Medicines:
${JSON.stringify(medicines)}

Rules:
1-0-1 = 2/day
1-1-1 = 3/day
Low risk=1 Medium=2 High=3

Return STRICT JSON:

{
 "disclaimer":"Informational only",
 "chart_data":{
   "medicine_duration_chart":[{"medicine_name":"","duration_days":0}],
   "daily_dosage_chart":[{"medicine_name":"","frequency_per_day":0}],
   "side_effect_risk_chart":[{"medicine_name":"","risk_level":1}],
   "medicine_usage_chart":[{"usage_type":"","count":0}]
 }
}
`;

  try {
    await sleep(2000); // VERY IMPORTANT
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch (err) {
    console.error("Chart AI failed", err);
    return null;
  }
}
