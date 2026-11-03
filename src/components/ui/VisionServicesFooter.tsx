"use client";

import React from "react";
import {
  ArrowUpRight,
  Sparkles,
  Cpu,
  Globe,
  Database,
  MessageSquare,
} from "lucide-react";
import { WHATSAPP_OFFICIAL_LINK } from "@/components/ui/AIConciergeQuoteModal";

interface VisionServicesFooterProps {
  scrollProgress: number;
  onNavigateScroll: (target: number) => void;
  onOpenCatalog: () => void;
  onOpenQuoteModal: () => void;
}

export function VisionServicesFooter({
  scrollProgress,
  onNavigateScroll,
  onOpenCatalog,
  onOpenQuoteModal,
}: VisionServicesFooterProps) {
  // 1. Sección VISIÓN (Blanca): Entra en 1.02, plena entre 1.12 y 1.38, sale en 1.48
  const visionEnter = Math.min(Math.max((scrollProgress - 1.0) / 0.12, 0), 1);
  const visionExit = Math.min(Math.max((scrollProgress - 1.38) / 0.1, 0), 1);
  const visionVisibility = visionEnter * (1 - visionExit);

  const visionInternal = Math.min(
    Math.max((scrollProgress - 1.02) / 0.42, 0),
    1
  );

  const prismBurst =
    scrollProgress > 1.32 && scrollProgress < 1.48
      ? Math.sin(((scrollProgress - 1.32) / 0.16) * Math.PI)
      : 0;

  // 2. Sección SERVICIOS & ECOSISTEMA IA (1.44 -> 1.94)
  const servicesEnter = Math.min(
    Math.max((scrollProgress - 1.42) / 0.1, 0),
    1
  );
  const servicesExit = Math.min(
    Math.max((scrollProgress - 1.88) / 0.08, 0),
    1
  );
  const servicesVisibility = servicesEnter * (1 - servicesExit);
  const servicesInternal = Math.min(
    Math.max((scrollProgress - 1.44) / 0.44, 0),
    1
  );

  // 3. Sección FOOTER ARQUITECTÓNICO (1.88 -> 2.15)
  const footerVisibility = Math.min(
    Math.max((scrollProgress - 1.86) / 0.12, 0),
    1
  );

  if (scrollProgress < 0.98) return null;

  return (
    <div className="fixed inset-0 z-20 pointer-events-none overflow-hidden">
      {/* =====================================================================
          FASE A: SECCIÓN "VISIÓN" (CON ESPACIADO MÓVIL DESPEJADO)
      ===================================================================== */}
      {visionVisibility > 0.005 && (
        <section
          className="absolute inset-0 bg-[#f2f4f6] text-[#090b0e] flex items-center justify-center transition-transform duration-75"
          style={{
            opacity: visionVisibility,
            transform: `translateY(${(1 - visionEnter) * 18}%)`,
          }}
        >
          {/* Cuadrícula técnica clara con cruces '+' */}
          <div
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)
              `,
              backgroundSize: "96px 96px",
            }}
          />

          <div className="absolute inset-0 grid grid-cols-4 md:grid-cols-6 grid-rows-4 pointer-events-none">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-center text-black/25 font-mono text-xs"
              >
                +
              </div>
            ))}
          </div>

          {/* Monolito "G" Técnico en Wireframe + Barra Diagonal Holográfica Iridescente */}
          <div
            className="relative w-[260px] sm:w-[420px] md:w-[540px] aspect-square flex items-center justify-center transition-transform duration-150"
            style={{
              transform: `scale(${1 + prismBurst * 1.45}) rotate(${
                (visionInternal - 0.5) * -8
              }deg)`,
            }}
          >
            <svg
              viewBox="0 0 400 400"
              className="w-full h-full drop-shadow-sm overflow-visible"
            >
              <defs>
                <linearGradient
                  id="alcheHoloGrad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    stopColor="#00ffa3"
                    stopOpacity={0.35 + visionInternal * 0.65}
                  />
                  <stop offset="35%" stopColor="#00d4ff" stopOpacity="0.9" />
                  <stop offset="70%" stopColor="#ff2a85" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#ffe600" stopOpacity="0.9" />
                </linearGradient>

                <filter id="holoGrain">
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.85"
                    numOctaves="3"
                    result="noise"
                  />
                  <feColorMatrix
                    type="matrix"
                    values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.28 0"
                  />
                  <feComposite operator="in" in2="SourceGraphic" />
                  <feBlend mode="overlay" in2="SourceGraphic" />
                </filter>
              </defs>

              <circle
                cx="200"
                cy="200"
                r="175"
                fill="none"
                stroke="rgba(0,0,0,0.08)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <line
                x1="0"
                y1="200"
                x2="400"
                y2="200"
                stroke="rgba(0,0,0,0.08)"
                strokeWidth="1"
              />
              <line
                x1="200"
                y1="0"
                x2="200"
                y2="400"
                stroke="rgba(0,0,0,0.08)"
                strokeWidth="1"
              />

              <polygon
                points="325,95 275,35 125,35 65,105 65,295 125,365 280,365 335,300 335,190 205,190 185,235 275,235 275,285 240,315 155,315 120,275 120,125 155,85 240,85 280,125"
                fill="rgba(255,255,255,0.65)"
                stroke="rgba(0,0,0,0.22)"
                strokeWidth="1.5"
                transform="translate(12, 10)"
              />

              <polygon
                points="325,95 275,35 125,35 65,105 65,295 125,365 280,365 335,300 335,190 205,190 185,235 275,235 275,285 240,315 155,315 120,275 120,125 155,85 240,85 280,125"
                fill="rgba(255,255,255,0.88)"
                stroke="#ffffff"
                strokeWidth="2.5"
              />

              <polygon
                points="195,35 125,35 65,105 65,295 120,360 165,315 120,275 120,125 155,85"
                fill="url(#alcheHoloGrad)"
                filter="url(#holoGrain)"
                style={{
                  opacity: Math.min(1, visionInternal * 1.6),
                }}
              />
            </svg>
          </div>

          {/* Contenedor Panorámico de Textos "VISIÓN" (Optimizado en Móvil y PC) */}
          <div className="absolute inset-0 max-w-[1680px] mx-auto px-5 md:px-12 lg:px-16 pt-20 pb-20 md:py-0 flex flex-col justify-center gap-4 md:gap-8">
            <div>
              <span
                className="text-4xl sm:text-6xl md:text-8xl font-black tracking-widest uppercase select-none"
                style={{
                  WebkitTextStroke: "1.5px rgba(15, 20, 25, 0.35)",
                  color: "transparent",
                }}
              >
                VISIÓN
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-8 items-center">
              <div className="md:col-span-5 space-y-2">
                <div className="flex flex-col items-start gap-1">
                  <span className="bg-[#0b0d10] text-white text-base sm:text-2xl md:text-3xl font-extrabold px-2.5 py-1 tracking-tight shadow-md">
                    Entornos de ventas digitales
                  </span>
                  <span className="bg-[#0b0d10] text-white text-base sm:text-2xl md:text-3xl font-extrabold px-2.5 py-1 tracking-tight shadow-md">
                    y experiencias inmersivas que
                  </span>
                  <span className="bg-[#0b0d10] text-white text-base sm:text-2xl md:text-3xl font-extrabold px-2.5 py-1 tracking-tight shadow-md">
                    multiplican tu facturación
                  </span>
                </div>
                <p className="font-mono text-[11px] sm:text-xs text-black/65 max-w-sm pt-0.5 leading-relaxed">
                  Ingeniería de software a medida, e-commerce multi-rubro y
                  ecosistemas de IA sin precedentes.
                </p>
              </div>

              <div className="hidden md:block md:col-span-2" />

              <div className="md:col-span-5 flex flex-col md:items-end text-left md:text-right space-y-2">
                <div className="flex flex-col items-start md:items-end gap-1">
                  <span className="bg-[#0b0d10] text-white text-base sm:text-2xl md:text-3xl font-extrabold px-2.5 py-1 tracking-tight shadow-md">
                    Creamos tecnología que
                  </span>
                  <span className="bg-[#0b0d10] text-white text-base sm:text-2xl md:text-3xl font-extrabold px-2.5 py-1 tracking-tight shadow-md">
                    impulsa marcas reales
                  </span>
                </div>
                <p className="font-mono text-[11px] sm:text-xs text-black/65 max-w-sm pt-0.5 leading-relaxed">
                  Desde sincronización con inventarios locales hasta agentes
                  autónomos como Jarvis y Sofía.
                </p>
              </div>
            </div>
          </div>

          {prismBurst > 0.05 && (
            <div
              className="absolute inset-0 pointer-events-none mix-blend-multiply"
              style={{
                opacity: prismBurst * 0.85,
                background:
                  "linear-gradient(125deg, #00ffa3 0%, #00d4ff 45%, #ff2a85 80%, #ffe600 100%)",
              }}
            />
          )}
        </section>
      )}

      {/* =====================================================================
          FASE B: SECCIÓN "SERVICIOS & ECOSISTEMA IA" (SIN ROCE CON HEADER MÓVIL)
      ===================================================================== */}
      {servicesVisibility > 0.005 && (
        <section
          className="absolute inset-0 flex items-center justify-center px-4 sm:px-6 md:px-12 lg:px-16 pt-16 pb-16 md:py-0"
          style={{
            opacity: servicesVisibility,
          }}
        >
          <div className="w-full max-w-[1640px] mx-auto">
            {servicesInternal < 0.68 ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-12 items-center">
                <div className="lg:col-span-7 perspective-[1400px]">
                  <div
                    className="relative rounded-lg overflow-hidden border border-white/25 bg-black/70 shadow-2xl transition-all duration-500 max-h-[30vh] sm:max-h-none"
                    style={{
                      transform:
                        "rotateY(14deg) rotateX(2deg) translateZ(0px)",
                      boxShadow: "0 25px 70px -15px rgba(16, 185, 129, 0.25)",
                    }}
                  >
                    <img
                      src={
                        servicesInternal < 0.34
                          ? "/projects/energykva-ordenador.png"
                          : "/projects/rapitravel-ordenador.png"
                      }
                      alt="Servicio Destacado GuiporDI"
                      className="w-full aspect-video object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/65 via-transparent to-emerald-500/10" />
                    <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 flex items-center justify-between font-mono text-[10px] sm:text-xs text-white/90 bg-black/65 backdrop-blur-md px-3 py-1.5 border border-white/15">
                      <span className="truncate pr-2">
                        {servicesInternal < 0.34
                          ? "01 / ENTORNOS DE VENTAS & E-COMMERCE"
                          : "02 / SUPER-APPS, SAAS & MOVILIDAD"}
                      </span>
                      <span className="text-emerald-400 shrink-0">
                        ACTIVO ●
                      </span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-3 sm:space-y-5 bg-black/65 backdrop-blur-md p-4 sm:p-6 md:p-8 border border-white/15 rounded-xl lg:rounded-none">
                  <div className="flex items-center justify-between font-mono text-[10px] sm:text-xs text-emerald-400">
                    <span className="flex items-center gap-2">
                      {servicesInternal < 0.34 ? (
                        <Database className="w-3.5 h-3.5" />
                      ) : (
                        <Globe className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {servicesInternal < 0.34
                          ? "ENTORNOS DE VENTAS DIGITALES"
                          : "APLICACIONES & PLATAFORMAS SAAS"}
                      </span>
                    </span>
                    <span className="px-2 py-0.5 border border-emerald-400/40 bg-emerald-400/10">
                      {servicesInternal < 0.34 ? "PILAR 01" : "PILAR 02"}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
                    {servicesInternal < 0.34
                      ? "E-Commerce Multi-Rubro & Embudos AIDA"
                      : "Sistemas SaaS, Apps & Automatización"}
                  </h2>

                  <p className="text-xs sm:text-base text-white/85 leading-relaxed">
                    {servicesInternal < 0.34
                      ? "Creamos tiendas virtuales y entornos de ventas digitales para cualquier negocio (zapaterías, ferreterías, importadoras, repuestos), además de paquetes de videos e imágenes de alta conversión para redes sociales."
                      : "Construimos aplicaciones móviles, sistemas administrativos, plataformas de boletería QR y flujos operativos a medida con velocidad extrema en dispositivos móviles y escritorio."}
                  </p>

                  <div className="pt-1 pointer-events-auto">
                    <button
                      onClick={onOpenQuoteModal}
                      className="px-4 py-2 rounded-full border border-emerald-400/50 bg-emerald-400/15 hover:bg-emerald-400 hover:text-black font-mono text-[11px] text-emerald-300 font-bold inline-flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Armar y Cotizar mi Entorno con IA →</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* SUB-ETAPA 3: SHOWCASE "GuiporDI IA ✦ (↗)" + RECARGAS API */
              <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-black/80 backdrop-blur-xl p-5 sm:p-10 lg:p-14 shadow-2xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                  <div className="lg:col-span-7 space-y-4 sm:space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-400/40 bg-emerald-400/10 font-mono text-[10px] sm:text-xs text-emerald-300">
                      <Cpu className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        AGENTES IA (JARVIS / SOFÍA) & RECARGAS API
                      </span>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                      <h2 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tight text-white">
                        GuiporDI IA
                      </h2>
                      <Sparkles className="w-7 h-7 sm:w-11 sm:h-11 text-emerald-400 animate-pulse shrink-0" />
                      <span className="text-xl sm:text-4xl font-mono text-white/70">
                        (↗)
                      </span>
                    </div>

                    <p className="text-xs sm:text-base md:text-lg text-white/85 leading-relaxed max-w-2xl">
                      Implementamos asistentes ejecutivos multimodales (Jarvis
                      IA), bots cerradores de ventas para WhatsApp (Sofía) y
                      servicio directo de{" "}
                      <strong className="text-emerald-300">
                        recarga de saldo API para Anthropic (Claude) y OpenAI
                      </strong>
                      .
                    </p>

                    <div className="pt-1 flex flex-wrap items-center gap-3 pointer-events-auto">
                      <button
                        onClick={onOpenQuoteModal}
                        className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-emerald-400 text-black font-mono text-xs uppercase tracking-wider font-extrabold hover:bg-emerald-300 transition-colors inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Cotizar Agente IA / Recarga Saldo</span>
                      </button>

                      <button
                        onClick={onOpenCatalog}
                        className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-full border border-white/25 bg-white/5 text-white font-mono text-xs uppercase tracking-wider hover:bg-white hover:text-black transition-colors inline-flex items-center gap-2 cursor-pointer"
                      >
                        <span>Ver los 9 Proyectos</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-5 hidden sm:block">
                    <div className="relative rounded-xl overflow-hidden border border-white/20 shadow-2xl">
                      <img
                        src="/projects/jarvis-ordenador.png"
                        alt="Jarvis IA GuiporDI"
                        className="w-full aspect-video object-cover object-top"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* =====================================================================
          FASE C: FOOTER ARQUITECTÓNICO CON WHATSAPP OFICIAL Y COTIZADOR IA
      ===================================================================== */}
      {footerVisibility > 0.005 && (
        <section
          className="absolute inset-0 bg-[#020406]/95 backdrop-blur-xl flex flex-col justify-between pt-20 pb-14 px-5 md:px-12 lg:px-16 pointer-events-auto"
          style={{
            opacity: footerVisibility,
          }}
        >
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-35">
            <svg viewBox="0 0 1600 900" className="w-full h-full">
              <line
                x1="0"
                y1="250"
                x2="1600"
                y2="250"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1="650"
                x2="1600"
                y2="650"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="1"
              />
              <line
                x1="280"
                y1="0"
                x2="580"
                y2="900"
                stroke="rgba(255,255,255,0.22)"
                strokeWidth="1"
              />
              <line
                x1="480"
                y1="0"
                x2="180"
                y2="900"
                stroke="rgba(255,255,255,0.22)"
                strokeWidth="1"
              />
              <circle
                cx="800"
                cy="450"
                r="240"
                fill="none"
                stroke="rgba(52, 211, 153, 0.35)"
                strokeWidth="1"
                strokeDasharray="6 6"
              />
            </svg>
          </div>

          <div className="relative z-10 max-w-[1680px] w-full mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center my-auto">
            <div className="md:col-span-5 flex items-center gap-5">
              <div className="w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center border border-white/20 bg-white/[0.03] relative shrink-0">
                <span className="text-5xl sm:text-7xl font-black tracking-tighter text-white">
                  G
                </span>
                <span className="absolute -top-1.5 -left-1.5 text-xs text-white/40">
                  +
                </span>
                <span className="absolute -top-1.5 -right-1.5 text-xs text-white/40">
                  +
                </span>
                <span className="absolute -bottom-1.5 -left-1.5 text-xs text-white/40">
                  +
                </span>
                <span className="absolute -bottom-1.5 -right-1.5 text-xs text-white/40">
                  +
                </span>
              </div>
              <div className="font-mono space-y-2">
                <p className="text-xs tracking-[0.3em] text-emerald-400 uppercase">
                  GUIPORDI SOLUCIONES
                </p>
                <p className="text-xs sm:text-sm text-white/80 max-w-xs">
                  Entornos de ventas digitales, e-commerce multi-rubro, agentes
                  IA y recargas API.
                </p>
                <div className="pt-1 flex flex-wrap gap-2">
                  <button
                    onClick={onOpenQuoteModal}
                    className="px-3.5 py-1.5 rounded-full bg-emerald-400 text-black font-mono text-[11px] font-bold hover:bg-emerald-300 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Cotizador IA</span>
                  </button>
                  <a
                    href={WHATSAPP_OFFICIAL_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-full border border-white/25 bg-white/5 hover:bg-white hover:text-black font-mono text-[11px] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3 h-3 text-emerald-400" />
                    <span>WhatsApp Directo</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 font-mono text-xs">
              <div className="space-y-2.5">
                <p className="text-white/40 uppercase tracking-widest">
                  Navegación
                </p>
                <ul className="space-y-2 text-white/85">
                  <li>
                    <button
                      onClick={() => onNavigateScroll(0)}
                      className="hover:text-emerald-400 cursor-pointer"
                    >
                      Inicio (Top)
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onNavigateScroll(0.16)}
                      className="hover:text-emerald-400 cursor-pointer"
                    >
                      Carrusel 3D (09)
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onNavigateScroll(1.18)}
                      className="hover:text-emerald-400 cursor-pointer"
                    >
                      Nuestra Visión
                    </button>
                  </li>
                </ul>
              </div>

              <div className="space-y-2.5">
                <p className="text-white/40 uppercase tracking-widest">
                  Soluciones IA
                </p>
                <ul className="space-y-2 text-white/85">
                  <li>
                    <button
                      onClick={onOpenQuoteModal}
                      className="text-emerald-400 font-bold hover:underline cursor-pointer"
                    >
                      Armar Paquete a Medida
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={onOpenQuoteModal}
                      className="hover:text-emerald-400 cursor-pointer"
                    >
                      Recargas Saldo Claude API
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={onOpenCatalog}
                      className="hover:text-emerald-400 cursor-pointer"
                    >
                      Catálogo Completo
                    </button>
                  </li>
                </ul>
              </div>

              <div className="space-y-2.5 col-span-2 sm:col-span-1">
                <p className="text-white/40 uppercase tracking-widest">
                  Contacto Directo
                </p>
                <div className="flex flex-col gap-2">
                  <a
                    href={WHATSAPP_OFFICIAL_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-emerald-400 font-bold hover:text-emerald-300"
                  >
                    <span>WhatsApp Oficial</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://guipordy.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-white hover:text-emerald-400"
                  >
                    <span>guipordy.com</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://telotengosolutions.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-white/75 hover:text-emerald-400"
                  >
                    <span>telotengosolutions.com</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 max-w-[1680px] w-full mx-auto border-t border-white/15 pt-3 flex flex-col sm:flex-row items-baseline justify-between gap-2">
            <h2 className="text-[14vw] sm:text-[11vw] font-black tracking-tighter leading-none text-white select-none">
              GuiporDI
            </h2>
            <div className="font-mono text-[11px] text-white/50 text-right">
              <p>©2026 GuiporDI Soluciones.</p>
              <p className="text-[10px] text-white/35">
                Todos los derechos reservados.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}