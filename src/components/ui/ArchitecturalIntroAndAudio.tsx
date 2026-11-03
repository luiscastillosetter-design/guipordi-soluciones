"use client";

import React, { useEffect, useState, useRef } from "react";
import { Volume2, VolumeX, RotateCcw } from "lucide-react";

// ============================================================================
// 1. MOTOR DE AUDIO ESPACIAL WEB AUDIO API (AMBIENTE + INTERACCIÓN 3D)
// ============================================================================
export function useSpatialAudioEngine(
  enabled: boolean,
  activeProjectIdx: number,
  scrollProgress: number
) {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const isPlayingRef = useRef(false);
  const prevProjectRef = useRef(activeProjectIdx);

  // Inicializar o detener el sintetizador ambiental
  useEffect(() => {
    if (!enabled) {
      if (masterGainRef.current && ctxRef.current) {
        masterGainRef.current.gain.setTargetAtTime(
          0.0001,
          ctxRef.current.currentTime,
          0.4
        );
      }
      return;
    }

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;

    if (!ctxRef.current) {
      const ctx = new AudioCtx();
      ctxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      // Filtro paso-bajo cálido de estudio
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(620, ctx.currentTime);
      filter.Q.setValueAtTime(2.2, ctx.currentTime);
      filter.connect(masterGain);

      // Acorde ambiental espacial (Re menor novena / Ecosistema Futurista)
      const freqs = [110.0, 164.81, 220.0, 261.63, 329.63, 392.0];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc.type = idx % 2 === 0 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        // Ligero detune para dar amplitud estereofónica
        osc.detune.setValueAtTime((idx - 2.5) * 6, ctx.currentTime);

        oscGain.gain.setValueAtTime(0.04 / freqs.length, ctx.currentTime);

        // Modulación lenta (LFO) para que el pad "respire"
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.12 + idx * 0.04, ctx.currentTime);
        lfoGain.gain.setValueAtTime(0.015, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(oscGain.gain);

        osc.connect(oscGain);
        oscGain.connect(filter);

        osc.start();
        lfo.start();
      });

      isPlayingRef.current = true;
    }

    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume();
    }

    if (masterGainRef.current && ctxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(
        0.55,
        ctxRef.current.currentTime,
        0.8
      );
    }
  }, [enabled]);

  // Pulso cristalino sutil al cambiar de proyecto en el carrusel 3D
  useEffect(() => {
    if (!enabled || !ctxRef.current || !masterGainRef.current) return;
    if (prevProjectRef.current === activeProjectIdx) return;
    prevProjectRef.current = activeProjectIdx;

    const ctx = ctxRef.current;
    const now = ctx.currentTime;

    const pingOsc = ctx.createOscillator();
    const pingGain = ctx.createGain();

    // Escala pentatónica cristalina según el índice del proyecto
    const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const freq = scale[activeProjectIdx % scale.length];

    pingOsc.type = "sine";
    pingOsc.frequency.setValueAtTime(freq, now);
    pingOsc.frequency.exponentialRampToValueAtTime(freq * 1.005, now + 0.35);

    pingGain.gain.setValueAtTime(0.0001, now);
    pingGain.gain.linearRampToValueAtTime(0.045, now + 0.02);
    pingGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    pingOsc.connect(pingGain);
    pingGain.connect(masterGainRef.current);

    pingOsc.start(now);
    pingOsc.stop(now + 0.48);
  }, [activeProjectIdx, enabled]);

  // Devolver función para disparar destello sonoro al abrir modales o reiniciar intro
  const triggerHarmonicChime = () => {
    if (!enabled || !ctxRef.current || !masterGainRef.current) return;
    const ctx = ctxRef.current;
    const now = ctx.currentTime;

    [440, 659.25, 880].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, now + i * 0.06);

      gain.gain.setValueAtTime(0.0001, now + i * 0.06);
      gain.gain.linearRampToValueAtTime(0.035, now + i * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.6);

      osc.connect(gain);
      gain.connect(masterGainRef.current!);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.65);
    });
  };

  return { triggerHarmonicChime };
}

// ============================================================================
// 2. INTRO CINÉTICA DE COMPÁS ARQUITECTÓNICO + PORTAL ESFÉRICO (ESTILO ALCHE)
// ============================================================================
const TARGET_MANIFESTO =
  "Arquitectos de mundos digitales que impulsan marcas reales.";
const SCRAMBLE_CHARS = "GUIPORDISOLUCIONES01X+/#ΔΛΞΠΣΦΨΩ";

export function ArchitecturalCompassIntro({
  onFinish,
}: {
  onFinish: () => void;
}) {
  // Fases: 0 = Trazado de compás (0.0s - 3.0s), 1 = Portal Óptico (3.0s - 3.9s), 2 = Fade out (3.9s - 4.4s)
  const [phase, setPhase] = useState<0 | 1 | 2>(0);
  const [scrambledText, setScrambledText] = useState("");
  const [drawProgress, setDrawProgress] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    let animId: number;

    const tick = (now: number) => {
      const elapsed = (now - startTime) / 1000; // en segundos
      const normDraw = Math.min(elapsed / 2.7, 1);
      setDrawProgress(normDraw);

      // Efecto de decodificación tipográfica (igual a "Architect worlds that move..." de Alche)
      const totalChars = TARGET_MANIFESTO.length;
      const revealedCount = Math.floor(normDraw * totalChars);
      let output = TARGET_MANIFESTO.slice(0, revealedCount);

      if (revealedCount < totalChars) {
        const scrambleLen = Math.min(12, totalChars - revealedCount);
        for (let i = 0; i < scrambleLen; i++) {
          output +=
            SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
      }
      setScrambledText(output);

      if (elapsed >= 2.85 && elapsed < 3.65) {
        setPhase(1); // Explosión del Portal de Lente Óptico
      } else if (elapsed >= 3.65 && elapsed < 4.25) {
        setPhase(2); // Apertura final hacia el lienzo WebGL
      } else if (elapsed >= 4.25) {
        onFinish();
        return;
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [onFinish]);

  const strokeDash = 2400;
  const currentOffset = strokeDash * (1 - drawProgress);

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#020304] flex items-center justify-center overflow-hidden select-none transition-opacity duration-500 ${
        phase === 2 ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* LIENZO SVG DE COMPÁS GEOMÉTRICO (ORDENADOR Y MÓVIL) */}
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        className={`w-full h-full transition-transform duration-700 ease-out ${
          phase >= 1 ? "scale-125 opacity-35" : "scale-100 opacity-100"
        }`}
      >
        {/* Marcos Verticales y Horizontales de Construcción */}
        <g
          stroke="rgba(255, 255, 255, 0.28)"
          strokeWidth="1"
          fill="none"
          strokeDasharray={strokeDash}
          strokeDashoffset={currentOffset}
        >
          {/* Verticales simétricas */}
          <line x1="280" y1="0" x2="280" y2="900" />
          <line x1="560" y1="0" x2="560" y2="900" />
          <line x1="1040" y1="0" x2="1040" y2="900" />
          <line x1="1320" y1="0" x2="1320" y2="900" />

          {/* Horizontales de tercios y base de texto */}
          <line x1="280" y1="150" x2="1320" y2="150" />
          <line x1="280" y1="360" x2="1320" y2="360" />
          <line x1="280" y1="595" x2="1320" y2="595" />
          <line x1="280" y1="680" x2="1320" y2="680" />
          <line x1="280" y1="735" x2="1320" y2="735" />
        </g>

        {/* Líneas Triples Diagonales Paralelas (Idénticas a 00:12 en PC y 00:03 en Móvil de Alche) */}
        <g
          stroke="rgba(255, 255, 255, 0.72)"
          strokeWidth="1.25"
          fill="none"
          strokeDasharray={strokeDash}
          strokeDashoffset={currentOffset * 0.85}
        >
          {/* Haz diagonal descendente izquierdo -> derecho */}
          <line x1="540" y1="0" x2="1090" y2="900" />
          <line x1="554" y1="0" x2="1104" y2="900" />
          <line x1="568" y1="0" x2="1118" y2="900" />

          {/* Haz diagonal ascendente derecho -> izquierdo */}
          <line x1="1060" y1="0" x2="510" y2="900" />
          <line x1="1046" y1="0" x2="496" y2="900" />
          <line x1="1032" y1="0" x2="482" y2="900" />
        </g>

        {/* Círculos de Compás (Exterior Continuo + Interior Punteado + Ejes) */}
        <g
          fill="none"
          stroke="rgba(255, 255, 255, 0.42)"
          strokeWidth="1"
          style={{
            opacity: Math.min(1, drawProgress * 1.4),
          }}
        >
          <circle
            cx="800"
            cy="430"
            r="265"
            strokeDasharray={strokeDash}
            strokeDashoffset={currentOffset}
          />
          <circle
            cx="800"
            cy="430"
            r="165"
            strokeDasharray="5 5"
            stroke="rgba(255, 255, 255, 0.35)"
          />
          {/* Diagonales punteadas por el centro del compás */}
          <line
            x1="560"
            y1="250"
            x2="1040"
            y2="610"
            strokeDasharray="4 4"
            stroke="rgba(255, 255, 255, 0.25)"
          />
          <line
            x1="1040"
            y1="250"
            x2="560"
            y2="610"
            strokeDasharray="4 4"
            stroke="rgba(255, 255, 255, 0.25)"
          />
        </g>

        {/* Silueta Geométrica Central del Monolito "G" formándose en el centro del compás */}
        <g
          transform="translate(600, 230)"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeDasharray={strokeDash}
          strokeDashoffset={currentOffset * 0.7}
        >
          <polygon points="325,95 275,35 125,35 65,105 65,295 125,365 280,365 335,300 335,190 205,190 185,235 275,235 275,285 240,315 155,315 120,275 120,125 155,85 240,85 280,125" />
        </g>
      </svg>

      {/* TEXTO MANIFIESTO CON DECODIFICACIÓN EN TIEMPO REAL (COMO EN ALCHE 00:13) */}
      <div
        className={`absolute inset-x-0 top-[74%] flex justify-center px-6 transition-opacity duration-300 ${
          phase >= 1 ? "opacity-0" : "opacity-100"
        }`}
      >
        <p className="font-mono text-xs sm:text-sm md:text-base tracking-wider text-white/90 bg-black/60 px-4 py-1">
          {scrambledText}
          <span className="inline-block w-2 h-4 ml-1 bg-emerald-400 animate-pulse align-middle" />
        </p>
      </div>

      {/* PORTAL ÓPTICO DE DOBLE LENTE ESFÉRICO (SEGUNDO 00:17 EN PC Y 00:06 EN MÓVIL) */}
      {phase >= 1 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-[340px] sm:w-[560px] aspect-square rounded-full flex items-center justify-center animate-ping-once">
            {/* Esfera exterior de refracción cromática */}
            <div
              className="w-full h-full rounded-full border-2 border-white/80 shadow-[0_0_120px_rgba(52,211,153,0.6)] flex items-center justify-center overflow-hidden"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(255,255,255,0.95) 0%, rgba(56,189,248,0.75) 35%, rgba(30,27,75,0.9) 70%, transparent 100%)",
              }}
            >
              {/* Lóbulo izquierdo del lente infinito (00:17) */}
              <div className="w-1/2 h-3/5 rounded-full border border-black/40 bg-gradient-to-r from-black via-zinc-200 to-white shadow-inner -mr-2 transform -rotate-6" />
              {/* Lóbulo derecho con aberración azul/cian */}
              <div className="w-1/2 h-3/5 rounded-full border-2 border-blue-500 bg-gradient-to-l from-blue-600 via-sky-300 to-white shadow-inner -ml-2 transform rotate-6" />
            </div>
          </div>
        </div>
      )}

      {/* Botón discreto para saltar la intro si el usuario desea entrar de inmediato */}
      <button
        onClick={onFinish}
        className="absolute bottom-8 right-8 font-mono text-[10px] tracking-[0.25em] uppercase text-white/40 hover:text-white border border-white/15 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
      >
        Saltar Intro ↗
      </button>
    </div>
  );
}

// ============================================================================
// 3. WIDGET FLOTANTE PERSISTENTE DE SONIDO Y REPETICIÓN DE INTRO (ABAJO IZQ)
// ============================================================================
export function PersistentSoundAndIntroBadge({
  soundEnabled,
  onToggleSound,
  onReplayIntro,
  isLightMode,
}: {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onReplayIntro: () => void;
  isLightMode: boolean;
}) {
  return (
    <div className="fixed bottom-4 left-5 md:left-12 lg:left-16 z-30 flex items-center gap-4 font-mono text-[11px]">
      {/* Botón "G sound" idéntico al "A sound" de la esquina inferior izquierda de Alche */}
      <button
        onClick={onToggleSound}
        className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
          isLightMode
            ? "border-black/20 bg-white/80 text-black hover:border-black"
            : "border-white/15 bg-black/60 backdrop-blur-md text-white/85 hover:border-emerald-400 hover:text-white"
        }`}
        title={soundEnabled ? "Silenciar audio espacial" : "Activar audio espacial"}
      >
        <span
          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-transform ${
            soundEnabled
              ? "bg-emerald-400 text-black animate-spin"
              : "bg-white/15 text-white/70"
          }`}
          style={{ animationDuration: "6s" }}
        >
          G
        </span>
        {soundEnabled ? (
          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <VolumeX className="w-3.5 h-3.5 opacity-50" />
        )}
        <span className="tracking-wider uppercase text-[10px]">
          {soundEnabled ? "sonido on" : "sonido off"}
        </span>
      </button>

      {/* Botón para volver a ver la Intro de Compás en cualquier momento */}
      <button
        onClick={onReplayIntro}
        className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
          isLightMode
            ? "border-black/15 bg-white/70 text-black/60 hover:text-black"
            : "border-white/10 bg-black/40 backdrop-blur-md text-white/45 hover:text-emerald-400 hover:border-white/30"
        }`}
        title="Repetir animación de introducción"
      >
        <RotateCcw className="w-3 h-3" />
        <span className="text-[10px] uppercase tracking-wider">Intro</span>
      </button>
    </div>
  );
}