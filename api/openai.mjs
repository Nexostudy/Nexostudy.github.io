export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return Response.json(
        { error: "Method not allowed" },
        { status: 405 }
      );
    }

    try {
      const body = await request.json();
      const prompt = body?.prompt;

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

      const response = await fetch(
        "https://api.openai.com/v1/responses",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
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

        return Response.json(
          { error: "OpenAI no pudo generar la respuesta." },
          { status: response.status }
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
  }
};
