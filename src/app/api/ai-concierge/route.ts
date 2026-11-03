import { NextRequest, NextResponse } from "next/server";

const PRICING_RULES_PROMPT = `Eres el Arquitecto Comercial IA de GuiporDI Soluciones, dirigido por Luis Castillo y Catherine Nedjme. 
Tu objetivo es cotizar con absoluta precisión los requerimientos del cliente basándote estrictamente en las siguientes REGLAS OFICIALES DE PRECIOS Y POLÍTICAS. 
PROHIBIDO INVENTAR PRECIOS O TIEMPOS DE ENTREGA QUE NO ESTÉN AQUÍ ESTIPULADOS.

### 1. ACTIVOS VISUALES PARA REDES SOCIALES (MEDIA LAB):
- **Pack de 10 Imágenes para RRSS:** 50 USDT. (Descuento único del 10% al por mayor a partir de 3 packs).
- **Videos Comerciales / Reels / Ads:** 20 USDT la unidad. (Pack de 10 en adelante: salen a mitad de precio = 10 USDT c/u).
- **Más de 30 Videos o Combos de Imágenes + Videos:** Precio a consultar directamente con Luis Castillo.
- **Aclaratoria:** No ofrecemos servicio de Community Manager (gestión/publicación diaria), solo producción creativa de activos.

### 2. AGENTES E INTELIGENCIA ARTIFICIAL:
- **Bot de WhatsApp Personalizado + CRM:** 300 USDT.
- **Asistente Personal con Base de Datos (Jarvis / Sofía):** A partir de 200 USDT (dependiendo de las integraciones complejas, requiere consulta).
- **Recargas de Saldo y Créditos API (Anthropic Claude / OpenAI):** Precio y disponibilidad a consultar directamente con Luis Castillo.

### 3. ENTORNOS DE VENTAS DIGITALES & E-COMMERCE:
- **Landing Page / Embudo de Ventas AIDA:** A consultar / cotizar según alcance.
- **E-Commerce Full (Tienda Virtual / Sincronización ERP):** 1000 USDT. Descuentos por deducción de poderes a consultar con Luis Castillo.
- **Aplicaciones Móviles & SaaS a Medida:** Desde 1500 USDT (requiere consulta obligatoria para establecer precio exacto).

### 4. REGLAS DE SEGURIDAD, SPAM Y LÍMITES DE LA IA:
- **Límite Estricto:** Si el usuario hace preguntas muy repetitivas o excede las 4 interacciones en la misma sesión, recuérdale amablemente que para avanzar al siguiente nivel de ingeniería debe pulsar el botón de WhatsApp.
- **Cero Inventos (Preguntas Críticas):** Si te preguntan datos críticos como "Exactamente en cuántos días se entrega un entorno de ventas", plazos de desarrollo exactos o condiciones especiales que requieran negociación, **NO inventes plazos**. Responde de forma ejecutiva que ese detalle técnico se define directamente con Luis Castillo, y facilítale el mensaje preestablecido para WhatsApp.
- **Formato de Derivación a WhatsApp:** Cuando el cliente deba pasar a WhatsApp (por superar límites, negociar descuentos o consultar precios a medida), incluye siempre un enlace con el texto preescrito exacto que el cliente debe enviarte, usando este formato: 
  https://wa.me/message/BR7LF2YMXKTVF1?text=Hola%20Luis,%20vengo%20de%20la%20web%20y%20quiero%20consultar%20sobre:%20[Escribe%20aquí%20tu%20pregunta]`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, config } = body;

    const baseUrl = (process.env.MWAPI_BASE_URL || "https://api.mwapi.dev").replace(/\/+$/, "");
    const apiKey = process.env.MWAPI_API_KEY;
    const model = process.env.MWAPI_MODEL || "claude-haiku-4-5-20251001";

    // Control anti-spam: Si la conversación supera los 8 mensajes (4 turnos del usuario), frenamos educadamente
    const userMessagesCount = Array.isArray(messages)
      ? messages.filter((m: { role: string }) => m.role === "user").length
      : 0;

    if (userMessagesCount > 4) {
      return NextResponse.json({
        reply:
          "Has alcanzado el límite de consultas de cortesía con el asistente virtual para proteger nuestros recursos de IA. Para brindarte una asesoría de ingeniería personalizada y cerrar tu cotización oficial, por favor pulsa el botón inferior y salta directo al WhatsApp de Luis Castillo.",
        hitLimit: true,
      });
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          reply:
            "He procesado tu solicitud con las tarifas oficiales de GuiporDI Soluciones. Pulsa el botón de WhatsApp para enviarme el resumen con la pregunta exacta.",
        },
        { status: 200 }
      );
    }

    const configSummary = config
      ? `\n\n[CONFIGURACIÓN ACTUAL SELECCIONADA POR EL CLIENTE]:
- Tipo de Entorno: ${config.environmentType || "N/D"}
- Rubro del Negocio: ${config.businessNiche || "N/D"}
- Módulo IA: ${config.aiModule || "N/D"}
- Recarga API: ${config.apiRecharge || "N/D"}
- Redes (Video/Img): ${config.mediaPack || "N/D"}`
      : "";

    const apiMessages = [
      { role: "system", content: PRICING_RULES_PROMPT + configSummary },
      ...(Array.isArray(messages) ? messages.slice(-8) : []),
    ];

    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: apiMessages,
        temperature: 0.4,
        max_tokens: 450,
      }),
    });

    if (!response.ok) {
      const fallbackRes = await fetch(`${baseUrl}/v1/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          system: PRICING_RULES_PROMPT + configSummary,
          messages: (Array.isArray(messages) ? messages.slice(-8) : []).map(
            (m: { role: string; content: string }) => ({
              role: m.role === "assistant" ? "assistant" : "user",
              content: m.content,
            })
          ),
          max_tokens: 450,
        }),
      });

      if (fallbackRes.ok) {
        const fbData = await fallbackRes.json();
        const fbText =
          fbData?.content?.[0]?.text ||
          "Tu cotización ha sido calculada. Escríbenos al WhatsApp oficial para ultimar detalles.";
        return NextResponse.json({ reply: fbText });
      }

      throw new Error(`Error API IA: ${response.status}`);
    }

    const data = await response.json();
    const reply =
      data?.choices?.[0]?.message?.content ||
      data?.content?.[0]?.text ||
      "Cotización estructurada con éxito. Envíanosla a través de nuestro WhatsApp oficial.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Error en /api/admin-erp:", error);
    return NextResponse.json(
      {
        reply:
          "Hemos registrado tu selección de servicios. Pulsa el botón inferior para abrir el WhatsApp de Luis Castillo con tu cotización lista.",
      },
      { status: 200 }
    );
  }
}