"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Sparkles,
  Send,
  Bot,
  Check,
  Copy,
  MessageSquare,
  Cpu,
  ShoppingBag,
  Video,
  Zap,
  ArrowUpRight,
} from "lucide-react";

export const WHATSAPP_OFFICIAL_LINK =
  process.env.NEXT_PUBLIC_WHATSAPP_URL ||
  "https://wa.me/message/BR7LF2YMXKTVF1";

export interface CustomQuoteConfig {
  environmentType: string;
  businessNiche: string;
  aiModule: string;
  apiRecharge: string;
  mediaPack: string;
  clientName: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const ENVIRONMENT_OPTIONS = [
  "No requiero entorno web por ahora",
  "Landing / Embudo de Ventas AIDA",
  "Entorno de Ventas Digital Completo",
  "E-Commerce Multi-Rubro (Tienda Virtual)",
  "Aplicación Móvil / Sistema SaaS a Medida",
];

const AI_MODULE_OPTIONS = [
  "Sin integración de IA",
  "Incluir IA en mi Entorno Digital",
  "Bot de Ventas WhatsApp (Estilo Sofía)",
  "Asistente Ejecutivo Voz/Texto (Estilo Jarvis)",
  "Ecosistema Completo (Jarvis + Sofía)",
];

const API_RECHARGE_OPTIONS = [
  "No requiero recarga API",
  "Recarga Saldo Anthropic (Claude API)",
  "Recarga Saldo OpenAI (ChatGPT API)",
  "Pool Empresarial Multi-Modelo API",
];

const MEDIA_PACK_OPTIONS = [
  "Sin activos para redes",
  "Pack Imágenes Estratégicas para Redes",
  "Pack Videos Comerciales (Reels / Ads)",
  "Combo Imágenes + Videos (Sin Community Manager)",
];

export function AIConciergeQuoteModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeMobileTab, setActiveMobileTab] = useState<"builder" | "chat">(
    "builder"
  );
  const [config, setConfig] = useState<CustomQuoteConfig>({
    environmentType: "Entorno de Ventas Digital Completo",
    businessNiche: "",
    aiModule: "Incluir IA en mi Entorno Digital",
    apiRecharge: "No requiero recarga API",
    mediaPack: "Sin activos para redes",
    clientName: "",
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hola, soy el Arquitecto IA de GuiporDI Soluciones. Puedes armar tu solución a medida seleccionando los módulos del panel (Entornos de Ventas Digitales, E-Commerce para cualquier negocio, Agentes como Jarvis o Sofía, Recargas de Saldo Anthropic/OpenAI o Videos/Imágenes para redes) o escribirme directamente qué tienes en mente.",
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  // Genera el texto estructurado listo para copiar y enviar al WhatsApp oficial
  const buildFormattedSummary = () => {
    return [
      "⚡ *SOLICITUD DE COTIZACIÓN — GUIPORDI SOLUCIONES*",
      config.clientName ? `👤 *Cliente:* ${config.clientName}` : null,
      config.businessNiche
        ? `🏢 *Rubro / Negocio:* ${config.businessNiche}`
        : null,
      `🌐 *Entorno Digital:* ${config.environmentType}`,
      `🤖 *Módulo de IA:* ${config.aiModule}`,
      `🔋 *Recarga Saldo API:* ${config.apiRecharge}`,
      `🎬 *Activos Visuales Redes:* ${config.mediaPack}`,
    ]
      .filter(Boolean)
      .join("\n");
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText ?? inputPrompt).trim();
    if (!textToSend || isLoading) return;

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: textToSend },
    ];
    setMessages(newMessages);
    if (!customText) setInputPrompt("");
    setIsLoading(true);
    setActiveMobileTab("chat");

    try {
      const res = await fetch("/api/ai-concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          config,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.reply ||
            "He analizado tu solicitud. Puedes enviarla a nuestro WhatsApp directo para darte el presupuesto formal.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Tu configuración ya está lista. Pulsa el botón verde de WhatsApp para enviarla directamente a Luis Castillo.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeSelectionWithAI = () => {
    const prompt = `Evalúa mi selección actual y dime qué incluye exactamente y cómo me ayudará: Entorno (${config.environmentType}), Rubro (${
      config.businessNiche || "General"
    }), IA (${config.aiModule}), Recarga API (${
      config.apiRecharge
    }), Redes (${config.mediaPack}).`;
    handleSendMessage(prompt);
  };

  const handleGoToWhatsApp = async () => {
    const summary = buildFormattedSummary();
    try {
      await navigator.clipboard.writeText(summary);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 3500);
    } catch {
      // Continúa si el navegador móvil restringe clipboard automático
    }
    window.open(WHATSAPP_OFFICIAL_LINK, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-2 sm:p-5 md:p-8 animate-fadeIn">
      <div className="relative w-full max-w-6xl h-[92dvh] sm:h-[86vh] rounded-2xl border border-white/20 bg-[#05080b] text-white shadow-[0_0_90px_rgba(16,185,129,0.18)] flex flex-col overflow-hidden">
        {/* BARRA SUPERIOR DEL COTIZADOR IA */}
        <div className="px-4 sm:px-6 py-4 border-b border-white/15 bg-black/60 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-400/15 border border-emerald-400/50 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold tracking-tight">
                  Arquitecto & Cotizador IA en Vivo
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-400/15 border border-emerald-400/40 font-mono text-[10px] text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Claude Haiku 4.5 Activo
                </span>
              </div>
              <p className="font-mono text-[10px] sm:text-xs text-white/55">
                Arma tu ecosistema a medida o consulta cualquier duda con nuestra IA
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-full border border-white/20 bg-white/5 hover:bg-white hover:text-black font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar</span>
          </button>
        </div>

        {/* CONMUTADOR DE PESTAÑAS EN MÓVIL (PARA QUE EN CELULAR SE VEA LIMPIO Y ORDENADO) */}
        <div className="grid grid-cols-2 lg:hidden border-b border-white/15 bg-black/40 font-mono text-xs shrink-0">
          <button
            onClick={() => setActiveMobileTab("builder")}
            className={`py-2.5 flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeMobileTab === "builder"
                ? "border-emerald-400 text-emerald-400 font-bold bg-emerald-400/5"
                : "border-transparent text-white/60"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>1. Armar a tu Gusto</span>
          </button>
          <button
            onClick={() => setActiveMobileTab("chat")}
            className={`py-2.5 flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeMobileTab === "chat"
                ? "border-emerald-400 text-emerald-400 font-bold bg-emerald-400/5"
                : "border-transparent text-white/60"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>2. Asesor IA & Enviar</span>
          </button>
        </div>

        {/* CUERPO PRINCIPAL DIVIDIDO EN 2 COLUMNAS (PC) O PESTAÑAS (MÓVIL) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* COLUMNA IZQUIERDA: CONFIGURADOR INTERACTIVO DE MÓDULOS */}
          <div
            className={`lg:col-span-7 overflow-y-auto p-4 sm:p-6 space-y-5 border-r border-white/10 ${
              activeMobileTab === "builder" ? "block" : "hidden lg:block"
            }`}
          >
            {/* Datos rápidos del negocio */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-emerald-400 mb-1">
                  Tu Nombre o Empresa (Opcional)
                </label>
                <input
                  type="text"
                  value={config.clientName}
                  onChange={(e) =>
                    setConfig({ ...config, clientName: e.target.value })
                  }
                  placeholder="Ej. Importadora / Tu Nombre"
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/15 text-xs text-white placeholder:text-white/35 focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-emerald-400 mb-1">
                  Rubro o Tipo de Negocio
                </label>
                <input
                  type="text"
                  value={config.businessNiche}
                  onChange={(e) =>
                    setConfig({ ...config, businessNiche: e.target.value })
                  }
                  placeholder="Ej. Zapatería, Ferretería, Agencia, SaaS..."
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/15 text-xs text-white placeholder:text-white/35 focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {/* BLOQUE 1: ENTORNOS DE VENTAS DIGITALES & E-COMMERCE */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 uppercase tracking-wider">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>1. Entornos de Ventas Digitales & E-Commerce</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ENVIRONMENT_OPTIONS.map((opt) => {
                  const active = config.environmentType === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() =>
                        setConfig({ ...config, environmentType: opt })
                      }
                      className={`text-left px-3 py-2 rounded-lg border text-xs font-mono transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        active
                          ? "border-emerald-400 bg-emerald-400/15 text-white font-bold"
                          : "border-white/15 bg-white/[0.02] text-white/70 hover:border-white/35"
                      }`}
                    >
                      <span className="leading-snug">{opt}</span>
                      {active && (
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BLOQUE 2: AGENTES DE INTELIGENCIA ARTIFICIAL (JARVIS / SOFÍA) */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 uppercase tracking-wider">
                <Bot className="w-3.5 h-3.5" />
                <span>2. Inteligencia Artificial & Agentes (Jarvis / Sofía)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AI_MODULE_OPTIONS.map((opt) => {
                  const active = config.aiModule === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setConfig({ ...config, aiModule: opt })}
                      className={`text-left px-3 py-2 rounded-lg border text-xs font-mono transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        active
                          ? "border-emerald-400 bg-emerald-400/15 text-white font-bold"
                          : "border-white/15 bg-white/[0.02] text-white/70 hover:border-white/35"
                      }`}
                    >
                      <span className="leading-snug">{opt}</span>
                      {active && (
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BLOQUE 3: RECARGA DE SALDO DE PROVEEDORES IA (ANTHROPIC / OPENAI) */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" />
                <span>3. Recarga de Saldo & Créditos API (Anthropic / GPT)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {API_RECHARGE_OPTIONS.map((opt) => {
                  const active = config.apiRecharge === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setConfig({ ...config, apiRecharge: opt })}
                      className={`text-left px-3 py-2 rounded-lg border text-xs font-mono transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        active
                          ? "border-emerald-400 bg-emerald-400/15 text-white font-bold"
                          : "border-white/15 bg-white/[0.02] text-white/70 hover:border-white/35"
                      }`}
                    >
                      <span className="leading-snug">{opt}</span>
                      {active && (
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BLOQUE 4: ACTIVOS VISUALES PARA REDES SOCIALES (VIDEO & IMAGEN) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-mono text-xs text-emerald-400 uppercase tracking-wider">
                  <Video className="w-3.5 h-3.5" />
                  <span>4. Videos e Imágenes para Redes Sociales</span>
                </span>
                <span className="font-mono text-[10px] text-white/45">
                  *Producción creativa (No Community Manager)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {MEDIA_PACK_OPTIONS.map((opt) => {
                  const active = config.mediaPack === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setConfig({ ...config, mediaPack: opt })}
                      className={`text-left px-3 py-2 rounded-lg border text-xs font-mono transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        active
                          ? "border-emerald-400 bg-emerald-400/15 text-white font-bold"
                          : "border-white/15 bg-white/[0.02] text-white/70 hover:border-white/35"
                      }`}
                    >
                      <span className="leading-snug">{opt}</span>
                      {active && (
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Botón para pedirle a la IA que evalúe el paquete armado */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleAnalyzeSelectionWithAI}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-emerald-400/50 bg-emerald-400/10 hover:bg-emerald-400 hover:text-black font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Consultar Propuesta con la IA →</span>
              </button>

              <button
                type="button"
                onClick={handleGoToWhatsApp}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white text-black hover:bg-emerald-400 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Cotizar este Paquete en WhatsApp</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* COLUMNA DERECHA: GLOBO DE CONVERSACIÓN CON EL ARQUITECTO IA */}
          <div
            className={`lg:col-span-5 flex flex-col h-full overflow-hidden bg-black/40 ${
              activeMobileTab === "chat" ? "flex" : "hidden lg:flex"
            }`}
          >
            {/* Mensajes del Chat */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs sm:text-sm">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-emerald-400 text-black font-medium rounded-br-xs"
                        : "bg-white/[0.06] border border-white/15 text-white/90 rounded-bl-xs"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/[0.06] border border-white/15 rounded-2xl px-4 py-2.5 font-mono text-xs text-emerald-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Estructurando solución a medida...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Caja de entrada de preguntas a la IA */}
            <div className="p-3 border-t border-white/10 bg-black/60 space-y-2.5">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  placeholder="Pregúntale a la IA sobre tu tienda, bot, saldo API..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputPrompt.trim()}
                  className="px-3.5 py-2.5 rounded-xl bg-emerald-400 text-black font-bold hover:bg-emerald-300 disabled:opacity-40 transition-colors cursor-pointer"
                  aria-label="Enviar mensaje"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* Botón Directo al WhatsApp Oficial + Copiado Automático del Resumen */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGoToWhatsApp}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-mono text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  <span>Hablar con Luis en WhatsApp</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={ async () => {
                    await navigator.clipboard.writeText(buildFormattedSummary());
                    setCopiedSummary(true);
                    setTimeout(() => setCopiedSummary(false), 2500);
                  }}
                  className="px-3 py-2.5 rounded-xl border border-white/20 bg-white/5 hover:border-emerald-400 font-mono text-[11px] text-white/80 flex items-center gap-1.5 cursor-pointer"
                  title="Copiar resumen técnico para pegar en WhatsApp"
                >
                  {copiedSummary ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Copiar Resumen</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}