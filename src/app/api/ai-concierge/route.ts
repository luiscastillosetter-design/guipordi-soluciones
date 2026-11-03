import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Eres el Arquitecto Comercial IA de GuiporDI Soluciones, la agencia de ingeniería de software, entornos de ventas digitales e inteligencia artificial dirigida por Luis Castillo y Catherine Nedjme.

REGLAS ESTRICTAS DE VENTAS Y POSICIONAMIENTO:
1. NUNCA uses el término "páginas web tradicionales". Nosotros construimos "Entornos de Ventas Digitales", "Ecosistemas E-Commerce de Alta Conversión" y "Arquitecturas SaaS".
2. Nuestro catálogo de soluciones a medida permite que el cliente arme su proyecto a su gusto:
   - ENTORNOS DE VENTAS DIGITALES:
     * Landing / Embudo de Ventas AIDA de alta velocidad.
     * E-Commerce Completo para cualquier rubro (zapaterías, ferreterías, importadoras, repuestos, tiendas por departamento, sincronización con inventarios/ERP como en TodoMax, Energy KVA, Materiales Acarigua y BK Electronics).
     * Aplicaciones Móviles y Plataformas SaaS (estilo Rapitravel, Apex Hub Gym, boletería QR y sistemas administrativos).
   - FUERZA LABORAL DE INTELIGENCIA ARTIFICIAL:
     * Bot Cerrador de Ventas y Calificación para WhatsApp (Arquitectura Sofía).
     * Agente Ejecutivo Multimodal de Voz y Texto con memoria en base de datos (Arquitectura Jarvis).
     * Integración de Asistentes IA dentro del Entorno de Ventas Digital del cliente.
   - RECARGA DE SALDO Y CÓMPUTO API (PROVEEDOR DE LIQUIDEZ IA):
     * Servicio de recarga de saldo y provisión de créditos API para Anthropic (Claude) y OpenAI (ChatGPT API), ideal para desarrolladores, agencias o empresas que necesitan saldo operativo inmediato sin trabas de tarjetas o bloqueos regionales. (Aclarar siempre si preguntan por Gemini que Google maneja membresías o facturación Cloud directa, mientras que nosotros recargamos saldo directo para Anthropic Claude y ecosistemas compatibles).
   - LABORATORIO DE ACTIVOS VISUALES PARA REDES SOCIALES (MEDIA LAB):
     * Generación y edición profesional de Videos Comerciales (Reels, TikToks, Video Ads) e Imágenes Estratégicas de alta conversión para redes sociales.
     * ACLARATORIA IMPORTANTE: NO ofrecemos servicio de Community Manager (publicación diaria o responder comentarios), nos especializamos exclusivamente en entregar los paquetes de videos e imágenes listos para vender.

ESTILO DE RESPUESTA:
- Sé conciso, ejecutivo, persuasivo y muy claro (máximo 2 a 3 párrafos breves o viñetas limpias).
- Analiza la configuración que el cliente haya seleccionado en el panel y dale una recomendación técnica exacta de cómo ese ecosistema multiplicará sus resultados.
- Al final de cada respuesta, invítalo a pulsar el botón "Enviar Configuración a WhatsApp" para cerrar los detalles directamente con Luis Castillo.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, config } = body;

    const baseUrl = (process.env.MWAPI_BASE_URL || "https://api.mwapi.dev").replace(/\/+$/, "");
    const apiKey = process.env.MWAPI_API_KEY;
    const model = process.env.MWAPI_MODEL || "claude-haiku-4-5-20251001";

    if (!apiKey) {
      return NextResponse.json(
        {
          reply:
            "He registrado tu configuración personalizada. Pulsa el botón inferior de WhatsApp para enviarla directamente a nuestro equipo de ingeniería y recibir tu cotización inmediata.",
        },
        { status: 200 }
      );
    }

    const configSummary = config
      ? `\n\n[CONFIGURACIÓN ACTUAL SELECCIONADA POR EL CLIENTE EN EL PANEL]:
- Tipo de Entorno: ${config.environmentType || "Por definir"}
- Rubro del Negocio: ${config.businessNiche || "No especificado aún"}
- Integración de IA: ${config.aiModule || "Por definir"}
- Recarga de Saldo API: ${config.apiRecharge || "No seleccionada"}
- Activos Visuales Redes (Video/Imagen): ${config.mediaPack || "No seleccionado"}`
      : "";

    const apiMessages = [
      { role: "system", content: SYSTEM_PROMPT + configSummary },
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
        temperature: 0.6,
        max_tokens: 550,
      }),
    });

    if (!response.ok) {
      // Intento alternativo con formato /v1/messages nativo de Anthropic por si el proxy lo requiere
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
          system: SYSTEM_PROMPT + configSummary,
          messages: (Array.isArray(messages) ? messages.slice(-8) : []).map(
            (m: { role: string; content: string }) => ({
              role: m.role === "assistant" ? "assistant" : "user",
              content: m.content,
            })
          ),
          max_tokens: 550,
        }),
      });

      if (fallbackRes.ok) {
        const fbData = await fallbackRes.json();
        const fbText =
          fbData?.content?.[0]?.text ||
          "Excelente elección. Tu configuración está lista para ser cotizada por WhatsApp.";
        return NextResponse.json({ reply: fbText });
      }

      throw new Error(`Error del proveedor IA: ${response.status}`);
    }

    const data = await response.json();
    const reply =
      data?.choices?.[0]?.message?.content ||
      data?.content?.[0]?.text ||
      "Tu configuración a medida está lista. Pulsa el botón de WhatsApp para recibir el presupuesto exacto.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Error en /api/ai-concierge:", error);
    return NextResponse.json(
      {
        reply:
          "He procesado los módulos seleccionados en tu paquete personalizado. Puedes pulsar el botón de WhatsApp abajo para enviarnos el resumen técnico y darte el precio exacto de inmediato.",
      },
      { status: 200 }
    );
  }
}