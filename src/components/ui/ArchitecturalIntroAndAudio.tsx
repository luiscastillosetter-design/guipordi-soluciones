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

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(620, ctx.currentTime);
      filter.Q.setValueAtTime(2.2, ctx.currentTime);
      filter.connect(masterGain);

      const freqs = [110.0, 164.81, 220.0, 261.63, 329.63, 392.0];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc.type = idx % 2 === 0 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        osc.detune.setValueAtTime((idx - 2.5) * 6, ctx.currentTime);

        oscGain.gain.setValueAtTime(0.04 / freqs.length, ctx.currentTime);

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

  useEffect(() => {
    if (!enabled || !ctxRef.current || !masterGainRef.current) return;
    if (prevProjectRef.current === activeProjectIdx) return;
    prevProjectRef.current = activeProjectIdx;

    const ctx = ctxRef.current;
    const now = ctx.currentTime;

    const pingOsc = ctx.createOscillator();
    const pingGain = ctx.createGain();

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
  }, [activeProjectIdx, enabled, scrollProgress]);

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
// 2. INTRO ARQUITECTÓNICA FLUIDA A 60 FPS (PALETA ESMERALDA/OBSIDIANA, CERO BOLAS)
// ============================================================================
export const ENABLE_INTRO = true; // Cambia a false si deseas desactivar la intro por completo

const TARGET_MANIFESTO =
  "Arquitectos de mundos digitales que impulsan marcas reales.";
const BRAND_POOL = "GUIPORDI SOLUCIONES ";

export function ArchitecturalCompassIntro({
  onFinish,
}: {
  onFinish: () => void;
}) {
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const [lineProgress, setLineProgress] = useState(0); // 0 -> 1: Trazado de compás
  const [logoProgress, setLogoProgress] = useState(0); // 0 -> 1: Monolito G central
  const [irisProgress, setIrisProgress] = useState(0); // 0 -> 1: Apertura radial hacia el 3D
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    if (!ENABLE_INTRO) {
      onFinishRef.current();
      return;
    }

    let animId: number;
    let lastTime = performance.now();
    let virtualElapsed = 0;
    let warmupFrames = 0;

    const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
    const easeInOutCubic = (x: number) =>
      x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

    const tick = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;

      // Esperamos 4 fotogramas de calentamiento mientras Three.js compila los shaders en el fondo.
      // Además limitamos el delta máximo a 0.033s (30-60fps) para que NUNCA dé saltos ni se quede pegada.
      if (warmupFrames < 4) {
        warmupFrames++;
        animId = requestAnimationFrame(tick);
        return;
      }

      const dt = Math.min(rawDt, 0.033);
      virtualElapsed += dt;

      // 1. Trazado fluido de las líneas de compás (0.0s a 1.75s)
      const rawLines = Math.min(Math.max(virtualElapsed / 1.75, 0), 1);
      setLineProgress(easeOutCubic(rawLines));

      // 2. Trazado completo de la "G" arquitectónica central (0.35s a 1.95s)
      const rawLogo = Math.min(Math.max((virtualElapsed - 0.35) / 1.6, 0), 1);
      setLogoProgress(easeInOutCubic(rawLogo));

      // 3. Decodificación tipográfica limpia (0.15s a 1.90s)
      const textNorm = Math.min(Math.max((virtualElapsed - 0.15) / 1.75, 0), 1);
      const totalChars = TARGET_MANIFESTO.length;
      const lockedCount = Math.floor(easeOutCubic(textNorm) * totalChars);

      if (textNorm >= 1) {
        setDisplayText(TARGET_MANIFESTO);
      } else {
        let str = TARGET_MANIFESTO.slice(0, lockedCount);
        const tail = Math.min(8, totalChars - lockedCount);
        for (let i = 0; i < tail; i++) {
          const idx =
            (lockedCount + i + Math.floor(virtualElapsed * 24)) %
            BRAND_POOL.length;
          str += BRAND_POOL[idx];
        }
        setDisplayText(str);
      }

      // 4. Apertura limpia de Iris / Zoom arquitectónico hacia la escena 3D (2.10s a 2.95s)
      const rawIris = Math.min(Math.max((virtualElapsed - 2.1) / 0.85, 0), 1);
      const smoothIris = easeInOutCubic(rawIris);
      setIrisProgress(smoothIris);

      if (virtualElapsed >= 2.95) {
        onFinishRef.current();
        return;
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Radio del iris transparente que se abre desde el centro del compás para revelar la escena 3D
  const holeRadiusVh = Math.pow(irisProgress, 1.8) * 165;
  const ringOpacity =
    irisProgress > 0.01 ? Math.sin(irisProgress * Math.PI) * 0.85 : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden select-none"
      style={{
        // Máscara radial que abre un agujero perfecto desde el centro de la G hacia afuera
        background:
          irisProgress <= 0.001
            ? "#020304"
            : `radial-gradient(circle at 50% 47%, transparent ${holeRadiusVh}vmax, rgba(16, 185, 129, ${
                ringOpacity * 0.28
              }) ${holeRadiusVh + 2}vmax, #020304 ${holeRadiusVh + 14}vmax)`,
        opacity: 1 - Math.max(0, (irisProgress - 0.65) / 0.35),
        pointerEvents: irisProgress > 0.5 ? "none" : "auto",
      }}
    >
      {/* LIENZO SVG DEL COMPÁS ARQUITECTÓNICO (PC Y MÓVIL) */}
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
        style={{
          transform: `scale(${1 + irisProgress * 0.28})`,
          opacity: 1 - irisProgress * 0.9,
        }}
      >
        {/* Líneas Ortogonales de Construcción */}
        <g
          stroke="rgba(255, 255, 255, 0.28)"
          strokeWidth="0.9"
          fill="none"
          strokeDasharray="1"
          strokeDashoffset={1 - lineProgress}
        >
          <line pathLength="1" x1="290" y1="0" x2="290" y2="900" />
          <line pathLength="1" x1="560" y1="0" x2="560" y2="900" />
          <line pathLength="1" x1="1040" y1="0" x2="1040" y2="900" />
          <line pathLength="1" x1="1310" y1="0" x2="1310" y2="900" />

          <line pathLength="1" x1="290" y1="150" x2="1310" y2="150" />
          <line pathLength="1" x1="290" y1="355" x2="1310" y2="355" />
          <line pathLength="1" x1="290" y1="590" x2="1310" y2="590" />

          <line pathLength="1" x1="290" y1="676" x2="1310" y2="676" />
          <line pathLength="1" x1="290" y1="712" x2="1310" y2="712" />
          <line pathLength="1" x1="290" y1="726" x2="1310" y2="726" />
        </g>

        {/* Líneas Triples Diagonales Paralelas */}
        <g
          stroke="rgba(255, 255, 255, 0.65)"
          strokeWidth="1.1"
          fill="none"
          strokeDasharray="1"
          strokeDashoffset={1 - lineProgress}
        >
          <line pathLength="1" x1="542" y1="0" x2="1082" y2="900" />
          <line pathLength="1" x1="555" y1="0" x2="1095" y2="900" />
          <line pathLength="1" x1="568" y1="0" x2="1108" y2="900" />

          <line pathLength="1" x1="1058" y1="0" x2="518" y2="900" />
          <line pathLength="1" x1="1045" y1="0" x2="505" y2="900" />
          <line pathLength="1" x1="1032" y1="0" x2="492" y2="900" />
        </g>

        {/* Círculos de Compás con Destello Esmeralda Sutil */}
        <g fill="none" style={{ opacity: lineProgress }}>
          <circle
            pathLength="1"
            cx="800"
            cy="425"
            r="265"
            stroke="rgba(255, 255, 255, 0.42)"
            strokeWidth="1"
            strokeDasharray="1"
            strokeDashoffset={1 - lineProgress}
          />
          <circle
            cx="800"
            cy="425"
            r="165"
            stroke="rgba(52, 211, 153, 0.38)"
            strokeWidth="1"
            strokeDasharray="4 5"
          />
          <line
            x1="560"
            y1="245"
            x2="1040"
            y2="605"
            stroke="rgba(255, 255, 255, 0.22)"
            strokeWidth="1"
            strokeDasharray="4 5"
          />
          <line
            x1="1040"
            y1="245"
            x2="560"
            y2="605"
            stroke="rgba(255, 255, 255, 0.22)"
            strokeWidth="1"
            strokeDasharray="4 5"
          />
        </g>

        {/* Monolito "G" de Doble Línea en el Centro del Compás */}
        {logoProgress > 0.01 && (
          <g transform="translate(600, 225)" fill="none">
            <polygon
              pathLength="1"
              points="325,95 275,35 125,35 65,105 65,295 125,365 280,365 335,300 335,190 205,190 185,235 275,235 275,285 240,315 155,315 120,275 120,125 155,85 240,85 280,125"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeDasharray="1"
              strokeDashoffset={1 - logoProgress}
            />
            <polygon
              pathLength="1"
              points="325,95 275,35 125,35 65,105 65,295 125,365 280,365 335,300 335,190 205,190 185,235 275,235 275,285 240,315 155,315 120,275 120,125 155,85 240,85 280,125"
              stroke="rgba(52, 211, 153, 0.65)"
              strokeWidth="1"
              transform="translate(8, 8) scale(0.96)"
              strokeDasharray="1"
              strokeDashoffset={1 - Math.max(0, (logoProgress - 0.12) / 0.88)}
            />
          </g>
        )}
      </svg>

      {/* TEXTO MANIFIESTO EN EL RENGLÓN DE COMPÁS */}
      <div
        className="absolute inset-x-0 top-[75.2%] -translate-y-1/2 flex justify-center px-6 pointer-events-none"
        style={{
          opacity: Math.max(0, 1 - irisProgress * 2.2),
        }}
      >
        <p className="font-mono text-[11px] sm:text-xs md:text-sm tracking-[0.08em] text-white/95 whitespace-nowrap overflow-hidden text-center">
          {displayText}
        </p>
      </div>

      {/* Botón para saltar intro */}
      <button
        onClick={() => onFinishRef.current()}
        className="absolute bottom-8 right-8 z-20 font-mono text-[10px] tracking-[0.25em] uppercase text-white/40 hover:text-white border border-white/15 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
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
      <button
        onClick={onToggleSound}
        className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
          isLightMode
            ? "border-black/20 bg-white/80 text-black hover:border-black"
            : "border-white/15 bg-black/60 backdrop-blur-md text-white/85 hover:border-emerald-400 hover:text-white"
        }`}
        title={
          soundEnabled ? "Silenciar audio espacial" : "Activar audio espacial"
        }
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

      {ENABLE_INTRO && (
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
      )}
    </div>
  );
}