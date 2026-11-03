"use client";

import React from "react";
import { ArrowUpRight, Sparkles, Cpu, Globe, Database } from "lucide-react";

interface VisionServicesFooterProps {
  scrollProgress: number; // Rango extendido: 0.0 a 2.25
  onNavigateScroll: (target: number) => void;
  onOpenCatalog: () => void;
}

export function VisionServicesFooter({
  scrollProgress,
  onNavigateScroll,
  onOpenCatalog,
}: VisionServicesFooterProps) {
  // ==========================================================================
  // CÁLCULO MATEMÁTICO DE TRANSICIONES SEGÚN EL AVANCE DEL SCROLL (1.0 -> 2.25)
  // ==========================================================================
  // 1. Sección VISIÓN (Blanca): Entra en 1.02, plena entre 1.12 y 1.38, sale en 1.48
  const visionEnter = Math.min(Math.max((scrollProgress - 1.0) / 0.12, 0), 1);
  const visionExit = Math.min(Math.max((scrollProgress - 1.38) / 0.1, 0), 1);
  const visionVisibility = visionEnter * (1 - visionExit);

  // Progreso interno dentro de VISIÓN (0 a 1) para mover el prisma holográfico
  const visionInternal = Math.min(
    Math.max((scrollProgress - 1.02) / 0.42, 0),
    1
  );

  // Destello de zoom holográfico al final de VISIÓN (como en el segundo 00:56 del video)
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

  // 3. Sección FOOTER ARQUITECTÓNICO (1.88 -> 2.25)
  const footerVisibility = Math.min(
    Math.max((scrollProgress - 1.86) / 0.12, 0),
    1
  );

  if (scrollProgress < 0.98) return null;

  return (
    <div className="fixed inset-0 z-20 pointer-events-none overflow-hidden">
      {/* =====================================================================
          FASE A: SECCIÓN "VISIÓN" (ESTÉTICA BLANCA ARQUITECTÓNICA + HOLOGRAMA)
      ===================================================================== */}
      {visionVisibility > 0.005 && (
        <section
          className="absolute inset-0 bg-[#f2f4f6] text-[#090b0e] flex items-center justify-center transition-transform duration-75"
          style={{
            opacity: visionVisibility,
            transform: `translateY(${(1 - visionEnter) * 18}%)`,
          }}
        >
          {/* Cuadrícula técnica clara con cruces '+' (Estilo Alche 00:51) */}
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

          {/* Cruces '+' técnicas distribuidas en el plano blanco */}
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
            className="relative w-[310px] sm:w-[440px] md:w-[540px] aspect-square flex items-center justify-center transition-transform duration-150"
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
                {/* Gradiente Holográfico Arcoíris estilo Alche 00:54 */}
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

                {/* Filtro de grano mineral para la barra iridiscente */}
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

              {/* Líneas de compás de construcción detrás de la G */}
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

              {/* Sombra arquitectónica 3D del monolito G */}
              <polygon
                points="325,95 275,35 125,35 65,105 65,295 125,365 280,365 335,300 335,190 205,190 185,235 275,235 275,285 240,315 155,315 120,275 120,125 155,85 240,85 280,125"
                fill="rgba(255,255,255,0.65)"
                stroke="rgba(0,0,0,0.22)"
                strokeWidth="1.5"
                transform="translate(12, 10)"
              />

              {/* Contorno principal del monolito G en blanco técnico */}
              <polygon
                points="325,95 275,35 125,35 65,105 65,295 125,365 280,365 335,300 335,190 205,190 185,235 275,235 275,285 240,315 155,315 120,275 120,125 155,85 240,85 280,125"
                fill="rgba(255,255,255,0.88)"
                stroke="#ffffff"
                strokeWidth="2.5"
              />

              {/* Barra Diagonal Holográfica Iridescente que recorre el pilar de la G */}
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

          {/* Contenedor Panorámico de Textos "VISIÓN" (Dual PC y Móvil) */}
          <div className="absolute inset-0 max-w-[1680px] mx-auto px-6 md:px-12 lg:px-16 flex flex-col justify-between py-24 md:py-0 md:justify-center">
            {/* Título Gigante Contorneado "VISIÓN" */}
            <div className="md:mb-8">
              <span
                className="text-5xl sm:text-7xl md:text-8xl font-black tracking-widest uppercase select-none"
                style={{
                  WebkitTextStroke: "1.5px rgba(15, 20, 25, 0.35)",
                  color: "transparent",
                }}
              >
                VISIÓN
              </span>
            </div>

            {/* Bloques Izquierdo y Derecho con Cintas Negras (Idéntico a Alche 00:53) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Bloque Izquierdo */}
              <div className="md:col-span-5 space-y-3">
                <div className="flex flex-col items-start gap-1.5">
                  <span className="bg-[#0b0d10] text-white text-lg sm:text-2xl md:text-3xl font-extrabold px-3 py-1 tracking-tight shadow-md">
                    Ingeniería digital inédita
                  </span>
                  <span className="bg-[#0b0d10] text-white text-lg sm:text-2xl md:text-3xl font-extrabold px-3 py-1 tracking-tight shadow-md">
                    y experiencias inmersivas que
                  </span>
                  <span className="bg-[#0b0d10] text-white text-lg sm:text-2xl md:text-3xl font-extrabold px-3 py-1 tracking-tight shadow-md">
                    multiplican tus ventas
                  </span>
                </div>
                <p className="font-mono text-xs text-black/60 max-w-sm pt-1">
                  Arquitectura de software a medida, e-commerce de alta
                  velocidad y entornos WebGL sin precedentes.
                </p>
              </div>

              {/* Espacio Central para la G */}
              <div className="hidden md:block md:col-span-2" />

              {/* Bloque Derecho */}
              <div className="md:col-span-5 flex flex-col md:items-end text-left md:text-right space-y-3">
                <div className="flex flex-col items-start md:items-end gap-1.5">
                  <span className="bg-[#0b0d10] text-white text-lg sm:text-2xl md:text-3xl font-extrabold px-3 py-1 tracking-tight shadow-md">
                    Creamos ecosistemas que
                  </span>
                  <span className="bg-[#0b0d10] text-white text-lg sm:text-2xl md:text-3xl font-extrabold px-3 py-1 tracking-tight shadow-md">
                    impulsan marcas reales
                  </span>
                </div>
                <p className="font-mono text-xs text-black/60 max-w-sm pt-1">
                  Desde sincronización industrial con bases de datos locales
                  hasta agentes autónomos de inteligencia artificial.
                </p>
              </div>
            </div>
          </div>

          {/* Capa de Explosión Iridescente de Transición (Segundo 00:56 del video) */}
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
          FASE B: SECCIÓN "SERVICIOS & ECOSISTEMA IA" (ESTILO ALCHE 00:58 - 01:03)
      ===================================================================== */}
      {servicesVisibility > 0.005 && (
        <section
          className="absolute inset-0 flex items-center justify-center px-5 md:px-12 lg:px-16"
          style={{
            opacity: servicesVisibility,
          }}
        >
          <div className="w-full max-w-[1640px] mx-auto">
            {/* SUB-ETAPA 1 y 2: PANTALLA CURVA 3D A LA IZQUIERDA + ESPECIFICACIÓN A LA DERECHA */}
            {servicesInternal < 0.68 ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Visor con Perspectiva 3D Inclinada (Como los monitores curvos de Alche en 00:59) */}
                <div className="lg:col-span-7 perspective-[1400px]">
                  <div
                    className="relative rounded-lg overflow-hidden border border-white/25 bg-black/70 shadow-2xl transition-all duration-500"
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
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between font-mono text-xs text-white/90 bg-black/60 backdrop-blur-md px-4 py-2 border border-white/15">
                      <span>
                        {servicesInternal < 0.34
                          ? "01 / INFRAESTRUCTURA E-COMMERCE & ERP SYNC"
                          : "02 / SUPER-APPS, SAAS MULTI-SEDE & MOVILIDAD"}
                      </span>
                      <span className="text-emerald-400">EN PRODUCCIÓN ●</span>
                    </div>
                  </div>
                </div>

                {/* Columna Derecha de Explicación Técnica (Estilo "Fortnite Creative Works" / "Unreal Engine Works") */}
                <div className="lg:col-span-5 space-y-5 bg-black/55 backdrop-blur-md p-6 md:p-8 border border-white/10">
                  <div className="flex items-center justify-between font-mono text-xs text-emerald-400">
                    <span className="flex items-center gap-2">
                      {servicesInternal < 0.34 ? (
                        <Database className="w-4 h-4" />
                      ) : (
                        <Globe className="w-4 h-4" />
                      )}
                      <span>
                        {servicesInternal < 0.34
                          ? "ARQUITECTURA COMERCIAL CLOUD"
                          : "PLATAFORMAS INTERACTIVAS DE GRAN ESCALA"}
                      </span>
                    </span>
                    <span className="px-2 py-0.5 border border-emerald-400/40 bg-emerald-400/10">
                      {servicesInternal < 0.34 ? "PILAR 01" : "PILAR 02"}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
                    {servicesInternal < 0.34
                      ? "E-Commerce & Sincronización ERP"
                      : "Sistemas SaaS & Aplicaciones Móviles"}
                  </h2>

                  <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                    {servicesInternal < 0.34
                      ? "Desarrollamos tiendas virtuales de velocidad extrema en Next.js conectadas en tiempo real con tu inventario físico (Firebird SQL, PostgreSQL, Redis), con paneles administrativos autogestionables y embudos de alta conversión."
                      : "Construimos aplicaciones de movilidad, sistemas de gestión deportiva y plataformas de boletería masiva con conciliación bancaria automática Zero-Fee, mapas interactivos en vivo y experiencia táctil nativa."}
                  </p>

                  <p className="font-mono text-xs text-white/50 leading-relaxed border-t border-white/15 pt-4">
                    {servicesInternal < 0.34
                      ? "Casos reales desplegados: Importadora TodoMax, Energy KVA (3.375 equipos sincronizados), Materiales y Metales Acarigua y BK Electronics."
                      : "Casos reales desplegados: Rapitravel (Urbano, Mascotas y Fletes), Apex Hub Gym, Iglesia Iviluz y G12 Tickets SaaS."}
                  </p>
                </div>
              </div>
            ) : (
              /* SUB-ETAPA 3: SHOWCASE "GuiporDI IA ✦ (↗)" (IDÉNTICO A "stellla ✦ (↗)" EN 01:03 PC Y 01:53 MÓVIL) */
              <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-black/75 backdrop-blur-xl p-6 sm:p-12 lg:p-16 shadow-2xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-400/40 bg-emerald-400/10 font-mono text-xs text-emerald-300">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>LABORATORIO DE INTELIGENCIA ARTIFICIAL & WEBGL</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <h2 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white">
                        GuiporDI IA
                      </h2>
                      <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 text-emerald-400 animate-pulse" />
                      <span className="text-2xl sm:text-4xl font-mono text-white/70">
                        (↗)
                      </span>
                    </div>

                    <p className="text-base sm:text-lg text-white/85 leading-relaxed max-w-2xl">
                      Plataforma propia de agentes autónomos de voz y texto
                      (Jarvis IA & Sofía Bot) integrada con bases de datos
                      serverless en Neon DB, Supabase y experiencias 3D
                      interactivas para automatizar ventas, atención y
                      operaciones 24/7.
                    </p>

                    <div className="pt-2 pointer-events-auto">
                      <button
                        onClick={onOpenCatalog}
                        className="px-6 py-3 rounded-full bg-white text-black font-mono text-xs uppercase tracking-widest font-bold hover:bg-emerald-400 transition-colors inline-flex items-center gap-2 cursor-pointer"
                      >
                        <span>Explorar los 9 Proyectos</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-5">
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
          FASE C: FOOTER ARQUITECTÓNICO CON COMPÁS (ESTILO ALCHE 01:05 - 01:07)
      ===================================================================== */}
      {footerVisibility > 0.005 && (
        <section
          className="absolute inset-0 bg-[#020406]/95 backdrop-blur-xl flex flex-col justify-between pt-24 pb-14 px-6 md:px-12 lg:px-16 pointer-events-auto"
          style={{
            opacity: footerVisibility,
          }}
        >
          {/* Trazado de Compás Arquitectónico de Fondo (Círculo Punteado + Líneas Diagonales) */}
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

          {/* Parte Superior del Footer: Isotipo "G" Sólido + Columnas de Enlaces */}
          <div className="relative z-10 max-w-[1680px] w-full mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-center my-auto">
            {/* Emblema Geométrico Blanco a la Izquierda (Como el triángulo blanco de Alche en 01:05) */}
            <div className="md:col-span-5 flex items-center gap-6">
              <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center border border-white/20 bg-white/[0.03] relative">
                <span className="text-6xl sm:text-7xl font-black tracking-tighter text-white">
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
              <div className="font-mono space-y-1">
                <p className="text-xs tracking-[0.3em] text-emerald-400 uppercase">
                  GUIPORDI SOLUCIONES
                </p>
                <p className="text-sm text-white/80 max-w-xs">
                  Ingeniería de software, diseño interactivo WebGL y sistemas
                  empresariales.
                </p>
              </div>
            </div>

            {/* Matriz de Navegación del Footer */}
            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 font-mono text-xs">
              <div className="space-y-3">
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

              <div className="space-y-3">
                <p className="text-white/40 uppercase tracking-widest">
                  Ecosistema
                </p>
                <ul className="space-y-2 text-white/85">
                  <li>
                    <button
                      onClick={onOpenCatalog}
                      className="hover:text-emerald-400 cursor-pointer"
                    >
                      Catálogo Completo
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onNavigateScroll(1.52)}
                      className="hover:text-emerald-400 cursor-pointer"
                    >
                      E-Commerce & ERP
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onNavigateScroll(1.78)}
                      className="hover:text-emerald-400 cursor-pointer"
                    >
                      GuiporDI IA ✦
                    </button>
                  </li>
                </ul>
              </div>

              <div className="space-y-3 col-span-2 sm:col-span-1">
                <p className="text-white/40 uppercase tracking-widest">
                  Contacto Directo
                </p>
                <div className="flex flex-col gap-2">
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

          {/* Tipografía Gigante de Cierre "GuiporDI" a todo el ancho (Estilo ALCHE 01:07) */}
          <div className="relative z-10 max-w-[1680px] w-full mx-auto border-t border-white/15 pt-4 flex flex-col sm:flex-row items-baseline justify-between gap-4">
            <h2 className="text-[15vw] sm:text-[11vw] font-black tracking-tighter leading-none text-white select-none">
              GuiporDI
            </h2>
            <div className="font-mono text-xs text-white/50 text-right">
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