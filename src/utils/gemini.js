const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export async function analyzeMedicines(medicineList) {
  try {
    const prompt = `
      You are a medical AI. Analyze the following medicines.

      Return STRICT JSON only:

      {
        "medicines": [
          { 
            "name": "",
            "disease": "",
            "reason": "",
            "category": "",
            "severity": ""
          }
        ],
        "summary": ""
      }

      Medicines: ${medicineList.join(", ")}
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview-01:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    return JSON.parse(rawText);

  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
}
