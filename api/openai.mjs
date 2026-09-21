export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body || {};

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({
        error: "Falta el texto para la IA."
      });
    }

    if (prompt.length > 12000) {
      return res.status(400).json({
        error: "El texto es demasiado largo."
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "La API key no está configurada."
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-5.6-luna",
          instructions:
            "Eres el asistente de estudio de Nexostudy. Ayuda a estudiantes a comprender, resumir, memorizar y practicar sus materias. Explica de forma clara, sencilla y apropiada para estudiantes. No inventes información.",
          input: prompt,
          max_output_tokens: 800
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);
