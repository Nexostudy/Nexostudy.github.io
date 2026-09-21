export default async (req) => {
  if (req.method !== "POST") {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405 }
    );
  }

  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return Response.json(
        { error: "Falta el texto para la IA." },
        { status: 400 }
      );
    }

    if (prompt.length > 12000) {
      return Response.json(
        { error: "El texto es demasiado largo." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "La API key no está configurada." },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5.6-luna",
        instructions:
          "Eres el asistente de estudio de Nexostudy. Ayuda a estudiantes a comprender, resumir, practicar y estudiar. Explica de forma clara, sencilla y apropiada para su edad. No inventes información.",
        input: prompt,
        max_output_tokens: 800
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      return Response.json(
        { error: "OpenAI no pudo responder." },
        { status: 500 }
      );
    }

    const text = (data.output || [])
      .flatMap(item => item.content || [])
      .filter(part => part.type === "output_text")
      .map(part => part.text)
      .join("\n");

    return Response.json({ text });

  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Ha ocurrido un error." },
      { status: 500 }
    );
  }
};

export const config = {
  path: "/api/openai",
  rateLimit: {
    windowLimit: 10,
    windowSize: 60,
    aggregateBy: ["ip", "domain"]
  }
};
