"use client";

import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import {
  ArrowUpRight,
  Volume2,
  VolumeX,
  Sparkles,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { PROJECTS_DATA, ProjectItem } from "@/data/projects";
import {
  CurvedLEDWall,
  BrandTypographyPlane,
  ArchitecturalGlassMonolithG,
} from "@/components/3d/StudioBackgroundAndLogo";
import { ProjectsCurvedCarousel3D } from "@/components/3d/ProjectsCarousel3D";
import {
  ProjectDetailModal,
  AllWorksCatalogModal,
} from "@/components/ui/ProjectsModals";
import { VisionServicesFooter } from "@/components/ui/VisionServicesFooter";
import {
  ArchitecturalCompassIntro,
  PersistentSoundAndIntroBadge,
  useSpatialAudioEngine,
} from "@/components/ui/ArchitecturalIntroAndAudio";

// ============================================================================
// 1. ESCENA 3D MODULAR
// ============================================================================
function StudioScene({
  mouseRef,
  scrollRef,
  onNormalUpdate,
  onScrollStateUpdate,
  onSelectProject,
}: {
  mouseRef: React.MutableRefObject<{ x: number; y: number; speed: number }>;
  scrollRef: React.MutableRefObject<{
    current: number;
    target: number;
    velocity: number;
  }>;
  onNormalUpdate: (nx: number, ny: number, nz: number) => void;
  onScrollStateUpdate: (
    idx: number,
    inWorks: boolean,
    progress: number
  ) => void;
  onSelectProject: (p: ProjectItem) => void;
}) {
  const [, setTexReadyTick] = useState(0);

  const projectTextures = useMemo(() => {
    const loader = new THREE.TextureLoader();

    const fallbackCanvas = document.createElement("canvas");
    fallbackCanvas.width = 64;
    fallbackCanvas.height = 64;
    const fCtx = fallbackCanvas.getContext("2d");
    if (fCtx) {
      fCtx.fillStyle = "#081418";
      fCtx.fillRect(0, 0, 64, 64);
    }
    const fallbackTex = new THREE.CanvasTexture(fallbackCanvas);

    const desktop: THREE.Texture[] = PROJECTS_DATA.map(() => fallbackTex);
    const mobile: THREE.Texture[] = PROJECTS_DATA.map(() => fallbackTex);
    const desktopAspects: number[] = PROJECTS_DATA.map(() => 16 / 9);
    const mobileAspects: number[] = PROJECTS_DATA.map(() => 9 / 16);

    PROJECTS_DATA.forEach((p, idx) => {
      loader.load(p.desktopImg, (tex) => {
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.anisotropy = 8;
        tex.needsUpdate = true;
        desktop[idx] = tex;
        if (tex.image && tex.image.width && tex.image.height) {
          desktopAspects[idx] = tex.image.width / tex.image.height;
        }
        setTexReadyTick((v) => v + 1);
      });

      loader.load(p.mobileImg, (tex) => {
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.anisotropy = 8;
        tex.needsUpdate = true;
        mobile[idx] = tex;
        if (tex.image && tex.image.width && tex.image.height) {
          mobileAspects[idx] = tex.image.width / tex.image.height;
        }
        setTexReadyTick((v) => v + 1);
      });
    });

    return { desktop, mobile, desktopAspects, mobileAspects };
  }, []);

  useFrame(() => {
    const prev = scrollRef.current.current;
    // Interpolación suave y amortiguada para evitar movimientos bruscos
    const next = THREE.MathUtils.lerp(prev, scrollRef.current.target, 0.075);
    scrollRef.current.velocity = (next - prev) * 14.0;
    scrollRef.current.current = next;

    const inWorks = next > 0.09 && next < 1.03;
    const total = PROJECTS_DATA.length;
    const carouselProgress = Math.max(0, (next - 0.14) / 0.86) * (total - 1);
    const activeIdx = Math.min(
      Math.max(Math.round(carouselProgress), 0),
      total - 1
    );

    onScrollStateUpdate(activeIdx, inWorks, next);
  });

  return (
    <>
      <color attach="background" args={["#020304"]} />

      <Environment resolution={256}>
        <group rotation={[-Math.PI / 4, -0.25, 0]}>
          <Lightformer
            intensity={2.4}
            rotation-x={Math.PI / 2}
            position={[0, 5, -8]}
            scale={[10, 10, 1]}
            color="#ffffff"
          />
          <Lightformer
            intensity={1.6}
            rotation-y={Math.PI / 2}
            position={[-7, 2, -1]}
            scale={[12, 2.5, 1]}
            color="#34d399"
          />
          <Lightformer
            intensity={1.6}
            rotation-y={-Math.PI / 2}
            position={[7, -2, -1]}
            scale={[12, 2.5, 1]}
            color="#38bdf8"
          />
        </group>
      </Environment>

      <ambientLight intensity={0.32} />
      <directionalLight position={[4, 7, 5]} intensity={1.4} color="#ffffff" />

      <CurvedLEDWall
        mouseRef={mouseRef}
        scrollRef={scrollRef}
        projectTextures={projectTextures}
      />

      <BrandTypographyPlane mouseRef={mouseRef} scrollRef={scrollRef} />

      <ArchitecturalGlassMonolithG
        mouseRef={mouseRef}
        scrollRef={scrollRef}
        onNormalUpdate={onNormalUpdate}
      />

      <ProjectsCurvedCarousel3D
        scrollRef={scrollRef}
        projectTextures={projectTextures}
        onSelectProject={onSelectProject}
      />
    </>
  );
}

// ============================================================================
// 2. PÁGINA PRINCIPAL COMPLETA (FIX MÓVIL, GIROSCOPIO Y HERO LANZAMIENTOS)
// ============================================================================
export default function GuiporDIStudioPage() {
  const MAX_SCROLL = 2.15;

  const mouseRef = useRef({ x: 0, y: 0, speed: 0 });
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const scrollRef = useRef({ current: 0, target: 0, velocity: 0 });
  const touchStartRef = useRef({ x: 0, y: 0 });
  const gyroBaseBetaRef = useRef<number | null>(null);

  const [showIntro, setShowIntro] = useState(true);
  const [normalVec, setNormalVec] = useState({ x: 0.0, y: -0.08, z: 1.0 });
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showSoundPrompt, setShowSoundPrompt] = useState(true);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [inWorksSection, setInWorksSection] = useState(false);
  const [activeProjectIdx, setActiveProjectIdx] = useState(0);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(
    null
  );
  const [detailDeviceView, setDetailDeviceView] = useState<
    "ordenador" | "mobil"
  >("ordenador");
  const [showAllWorksGrid, setShowAllWorksGrid] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("TODOS");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeProject = PROJECTS_DATA[activeProjectIdx] || PROJECTS_DATA[0];

  const { triggerHarmonicChime } = useSpatialAudioEngine(
    soundEnabled,
    activeProjectIdx,
    scrollProgress
  );

  const isLightVisionMode =
    scrollProgress > 1.04 &&
    scrollProgress < 1.42 &&
    !showAllWorksGrid &&
    !selectedProject;

  // Solicitar permiso de giroscopio en iOS (si aplica) al interactuar
  const requestMobileGyroPermission = useCallback(() => {
    if (
      typeof window !== "undefined" &&
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof (
        DeviceOrientationEvent as unknown as {
          requestPermission?: () => Promise<string>;
        }
      ).requestPermission === "function"
    ) {
      (
        DeviceOrientationEvent as unknown as {
          requestPermission: () => Promise<string>;
        }
      )
        .requestPermission()
        .catch(() => {});
    }
  }, []);

  const navigateToScroll = useCallback((targetVal: number) => {
    scrollRef.current.target = Math.min(Math.max(targetVal, 0), MAX_SCROLL);
    setShowAllWorksGrid(false);
    setSelectedProject(null);
    setMobileMenuOpen(false);
  }, []);

  const scrollToProjectIndex = useCallback((idx: number) => {
    const total = PROJECTS_DATA.length;
    const clampedIdx = Math.min(Math.max(idx, 0), total - 1);
    const targetScroll = 0.14 + (clampedIdx / (total - 1)) * 0.86;
    scrollRef.current.target = targetScroll;
    setShowAllWorksGrid(false);
    setSelectedProject(null);
    setMobileMenuOpen(false);
  }, []);

  const scrollToTopHero = useCallback(() => {
    navigateToScroll(0);
  }, [navigateToScroll]);

  // Bloqueo de Pull-to-Refresh nativo en html y body para que jamás se recargue la web al bajar el dedo
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverscroll = html.style.overscrollBehaviorY;
    const prevBodyOverscroll = body.style.overscrollBehaviorY;

    html.style.overscrollBehaviorY = "none";
    body.style.overscrollBehaviorY = "none";

    return () => {
      html.style.overscrollBehaviorY = prevHtmlOverscroll;
      body.style.overscrollBehaviorY = prevBodyOverscroll;
    };
  }, []);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      const dx = nx - lastMouseRef.current.x;
      const dy = ny - lastMouseRef.current.y;
      const speed = Math.min(Math.sqrt(dx * dx + dy * dy) * 8.0, 1.5);

      mouseRef.current.x = nx;
      mouseRef.current.y = ny;
      mouseRef.current.speed = speed;

      lastMouseRef.current.x = nx;
      lastMouseRef.current.y = ny;
    };

    // Giroscopio en Celular: Inclina la G, el texto y la pared LED según cómo gires el teléfono
    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;

      if (gyroBaseBetaRef.current === null) {
        gyroBaseBetaRef.current = e.beta;
      }

      // gamma: inclinación izquierda/derecha (-35° a +35°)
      const tiltX = THREE.MathUtils.clamp(e.gamma / 28, -1, 1);
      // beta: inclinación adelante/atrás relativa a cómo sostiene el teléfono
      const deltaBeta = e.beta - (gyroBaseBetaRef.current || 45);
      const tiltY = THREE.MathUtils.clamp(-deltaBeta / 28, -1, 1);

      const dx = tiltX - lastMouseRef.current.x;
      const dy = tiltY - lastMouseRef.current.y;
      const speed = Math.min(Math.sqrt(dx * dx + dy * dy) * 5.0, 1.2);

      mouseRef.current.x = THREE.MathUtils.lerp(mouseRef.current.x, tiltX, 0.35);
      mouseRef.current.y = THREE.MathUtils.lerp(mouseRef.current.y, tiltY, 0.35);
      mouseRef.current.speed = speed;

      lastMouseRef.current.x = mouseRef.current.x;
      lastMouseRef.current.y = mouseRef.current.y;
    };

    const handleWheel = (e: WheelEvent) => {
      if (showIntro || selectedProject || showAllWorksGrid || mobileMenuOpen)
        return;
      const delta = e.deltaY * 0.00045;
      scrollRef.current.target = Math.min(
        Math.max(scrollRef.current.target + delta, 0),
        MAX_SCROLL
      );
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartRef.current.x = e.touches[0].clientX;
        touchStartRef.current.y = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Si hay un modal abierto con su propio scroll interno, permitimos el scroll del modal
      if (selectedProject || showAllWorksGrid || mobileMenuOpen) return;

      // CRÍTICO: Evita que Chrome/Safari en el celular disparen Pull-to-Refresh y reinicien la página
      if (e.cancelable) {
        e.preventDefault();
      }

      if (showIntro) return;

      if (e.touches.length > 0) {
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const dy = touchStartRef.current.y - touchY;
        const dx = touchStartRef.current.x - touchX;

        // También actualizamos la posición interactiva con el dedo en pantalla móvil
        const nx = (touchX / window.innerWidth) * 2 - 1;
        const ny = -(touchY / window.innerHeight) * 2 + 1;
        mouseRef.current.x = nx;
        mouseRef.current.y = ny;
        mouseRef.current.speed = Math.min(
          Math.sqrt(dx * dx + dy * dy) * 0.04,
          1.2
        );

        // Sensibilidad táctil 3.5 veces más suave y con tope máximo por fotograma (Cero saltos violentos)
        const rawDelta =
          Math.abs(dx) > Math.abs(dy) ? dx * 0.00055 : dy * 0.00052;
        const clampedDelta = THREE.MathUtils.clamp(rawDelta, -0.026, 0.026);

        scrollRef.current.target = Math.min(
          Math.max(scrollRef.current.target + clampedDelta, 0),
          MAX_SCROLL
        );

        touchStartRef.current.x = touchX;
        touchStartRef.current.y = touchY;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedProject || showAllWorksGrid) {
        if (e.key === "Escape") {
          setSelectedProject(null);
          setShowAllWorksGrid(false);
        }
        return;
      }
      if (showIntro) return;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        scrollRef.current.target = Math.min(
          scrollRef.current.target + 0.11,
          MAX_SCROLL
        );
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        scrollRef.current.target = Math.max(scrollRef.current.target - 0.11, 0);
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("deviceorientation", handleDeviceOrientation, true);
    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    // passive: false es indispensable para bloquear el pull-to-refresh cuando se sube en móvil
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener(
        "deviceorientation",
        handleDeviceOrientation,
        true
      );
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showIntro, selectedProject, showAllWorksGrid, mobileMenuOpen]);

  const handleNormalUpdate = useCallback((nx: number, ny: number, nz: number) => {
    if (Math.random() < 0.25) {
      setNormalVec({
        x: Number(nx.toFixed(2)),
        y: Number(ny.toFixed(2)),
        z: Number(nz.toFixed(2)),
      });
    }
  }, []);

  const handleScrollStateUpdate = useCallback(
    (idx: number, inWorks: boolean, progress: number) => {
      setActiveProjectIdx(idx);
      setInWorksSection(inWorks);
      if (Math.abs(progress - scrollProgress) > 0.003) {
        setScrollProgress(progress);
      }
    },
    [scrollProgress]
  );

  const openProjectModal = useCallback(
    (proj: ProjectItem) => {
      triggerHarmonicChime();
      setDetailDeviceView(window.innerWidth < 768 ? "mobil" : "ordenador");
      setSelectedProject(proj);
    },
    [triggerHarmonicChime]
  );

  const isHeroVisible =
    scrollProgress <= 0.08 && !showAllWorksGrid && !selectedProject;

  return (
    <main className="relative w-full h-[100dvh] overflow-hidden overscroll-none bg-[#020304] text-white select-none font-sans">
      {/* 0. INTRO CINÉTICA DE COMPÁS ARQUITECTÓNICO */}
      {showIntro && (
        <ArchitecturalCompassIntro onFinish={() => setShowIntro(false)} />
      )}

      {/* 1. LIENZO WEBGL 3D */}
      <div className="fixed inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, 6.5], fov: 45 }}
          dpr={[1, 2]}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
          }}
        >
          <StudioScene
            mouseRef={mouseRef}
            scrollRef={scrollRef}
            onNormalUpdate={handleNormalUpdate}
            onScrollStateUpdate={handleScrollStateUpdate}
            onSelectProject={openProjectModal}
          />
        </Canvas>
      </div>

      {/* 2. SECCIONES DE CONTINUACIÓN DEL SCROLL: VISIÓN + SERVICIOS + FOOTER */}
      <VisionServicesFooter
        scrollProgress={scrollProgress}
        onNavigateScroll={navigateToScroll}
        onOpenCatalog={() => setShowAllWorksGrid(true)}
      />

      {/* 3. HEADER SUPERIOR DUAL */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 w-full px-5 md:px-12 lg:px-16 py-4 md:py-6 flex items-center justify-between transition-colors duration-300 ${
          isLightVisionMode ? "text-black" : "text-white"
        }`}
      >
        <button
          onClick={scrollToTopHero}
          className="group flex items-center gap-3 cursor-pointer transition-transform duration-300 hover:-translate-y-0.5 text-left"
        >
          <div
            className={`w-8 h-8 rounded border flex items-center justify-center font-black text-base tracking-tighter transition-colors ${
              isLightVisionMode
                ? "border-black/30 bg-black/5 text-black"
                : "border-white/25 bg-white/5 backdrop-blur-md text-white group-hover:border-emerald-400"
            }`}
          >
            G
          </div>
          <div className="flex flex-col">
            <span className="text-lg md:text-xl font-extrabold tracking-tight leading-none">
              GuiporDI
            </span>
            <span
              className={`text-[9px] font-mono tracking-[0.34em] uppercase mt-0.5 ${
                isLightVisionMode ? "text-black/60" : "text-white/60"
              }`}
            >
              SOLUCIONES
            </span>
          </div>
        </button>

        <nav
          className={`hidden md:flex items-center gap-9 text-xs font-mono tracking-widest uppercase ${
            isLightVisionMode ? "text-black/80" : "text-white/80"
          }`}
        >
          <button
            onClick={scrollToTopHero}
            className={`relative py-1 transition-colors duration-200 cursor-pointer ${
              scrollProgress < 0.09 && !showAllWorksGrid
                ? "text-emerald-500 font-bold"
                : ""
            }`}
          >
            Inicio
          </button>
          <button
            onClick={() => scrollToProjectIndex(0)}
            className={`relative py-1 transition-colors duration-200 cursor-pointer ${
              inWorksSection && !showAllWorksGrid
                ? "text-emerald-400 font-bold"
                : ""
            }`}
          >
            Proyectos
          </button>
          <button
            onClick={() => navigateToScroll(1.18)}
            className={`relative py-1 transition-colors duration-200 cursor-pointer ${
              scrollProgress >= 1.03 && scrollProgress < 1.42
                ? "text-emerald-600 font-bold"
                : ""
            }`}
          >
            Visión
          </button>
          <button
            onClick={() => navigateToScroll(1.62)}
            className={`relative py-1 transition-colors duration-200 cursor-pointer ${
              scrollProgress >= 1.42 && scrollProgress < 1.88
                ? "text-emerald-400 font-bold"
                : ""
            }`}
          >
            Ecosistema IA
          </button>
          <button
            onClick={() => {
              setSelectedProject(null);
              setShowAllWorksGrid(true);
            }}
            className={`relative py-1 transition-colors duration-200 cursor-pointer ${
              showAllWorksGrid ? "text-emerald-400 font-bold" : ""
            }`}
          >
            Catálogo ({PROJECTS_DATA.length})
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateToScroll(2.1)}
            className={`hidden sm:flex px-5 py-2.5 rounded-full border text-xs font-mono tracking-wider uppercase items-center gap-2 transition-all duration-300 cursor-pointer ${
              isLightVisionMode
                ? "border-black/30 bg-black text-white hover:bg-emerald-500 hover:text-black"
                : "border-white/25 bg-black/40 backdrop-blur-md text-white hover:bg-white hover:text-black"
            }`}
          >
            <span>Contacto / Cotizar</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 rounded-full border border-white/20 bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:border-emerald-400 transition-colors cursor-pointer"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      {/* 4. MENÚ MÓVIL TIPO ALCHE */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-black/90 backdrop-blur-xl flex flex-col justify-between px-7 pt-24 pb-20 md:hidden">
          <div className="space-y-4 font-mono">
            {[
              { label: "Inicio", action: scrollToTopHero },
              {
                label: "Carrusel 3D de Proyectos",
                action: () => scrollToProjectIndex(0),
              },
              {
                label: `Catálogo Completo (${PROJECTS_DATA.length})`,
                action: () => {
                  setMobileMenuOpen(false);
                  setShowAllWorksGrid(true);
                },
              },
              {
                label: "Nuestra Visión",
                action: () => navigateToScroll(1.18),
              },
              {
                label: "Servicios & GuiporDI IA",
                action: () => navigateToScroll(1.62),
              },
              {
                label: "Contacto / Footer",
                action: () => navigateToScroll(2.1),
              },
            ].map((item, i) => (
              <button
                key={i}
                onClick={item.action}
                className="w-full text-left flex items-center gap-4 text-lg tracking-wide text-white/90 hover:text-emerald-400 py-2 border-b border-white/10"
              >
                <span className="w-4 h-[1px] bg-emerald-400" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="font-mono text-xs text-white/50 space-y-2 border-t border-white/15 pt-5">
            <p className="text-emerald-400 uppercase tracking-widest">
              GuiporDI Soluciones
            </p>
            <p>Arquitectura de Software, E-Commerce & Experiencias WebGL</p>
          </div>
        </div>
      )}

      {/* 5. WIDGET DIRECCIÓN NORMAL (PC) */}
      {scrollProgress < 1.03 && (
        <aside className="hidden lg:flex fixed top-24 right-12 lg:right-16 z-20 flex-col items-end font-mono text-[10px] text-white/65 space-y-2 pointer-events-none">
          <div className="text-right">
            <p className="uppercase tracking-widest text-white/40 mb-0.5">
              Dirección Normal
            </p>
            <p className="text-white/90 tracking-wider">
              (x, y, z) = ({normalVec.x >= 0 ? `+${normalVec.x}` : normalVec.x},{" "}
              {normalVec.y >= 0 ? `+${normalVec.y}` : normalVec.y},{" "}
              {normalVec.z >= 0 ? `+${normalVec.z}` : normalVec.z})
            </p>
          </div>

          <div className="w-16 h-16 rounded-full border border-white/15 bg-black/40 backdrop-blur-sm relative flex items-center justify-center">
            <div className="absolute inset-2 rounded-full border border-dashed border-white/15" />
            <div
              className="relative w-10 h-10 transition-transform duration-150 ease-out"
              style={{
                transform: `rotateX(${normalVec.y * 45}deg) rotateY(${normalVec.x * 45}deg)`,
              }}
            >
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-rose-500 text-[7px] font-bold text-black flex items-center justify-center">
                X
              </span>
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-emerald-400 text-[7px] font-bold text-black flex items-center justify-center">
                Y
              </span>
              <span className="absolute bottom-1 left-1 w-2.5 h-2.5 rounded-full bg-sky-400 text-[7px] font-bold text-black flex items-center justify-center">
                Z
              </span>
              <div className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
          <span className="text-[9px] tracking-widest uppercase text-white/40">
            {inWorksSection
              ? `Proyecto ${activeProject.id} / 09`
              : "Refracción Activa"}
          </span>
        </aside>
      )}

      {/* 6. INDICADOR LATERAL IZQUIERDO DE SECCIONES (PC) */}
      <div
        className={`hidden md:flex fixed left-6 md:left-12 top-1/2 -translate-y-1/2 z-30 flex-col gap-3 font-mono text-[10px] tracking-[0.25em] uppercase ${
          isLightVisionMode ? "text-black" : "text-white"
        }`}
      >
        {[
          { label: "INICIO", target: 0, active: scrollProgress < 0.09 },
          {
            label: "PROYECTOS",
            target: 0.16,
            active: scrollProgress >= 0.09 && scrollProgress < 1.03,
          },
          {
            label: "VISIÓN",
            target: 1.18,
            active: scrollProgress >= 1.03 && scrollProgress < 1.42,
          },
          {
            label: "SERVICIOS",
            target: 1.62,
            active: scrollProgress >= 1.42 && scrollProgress < 1.88,
          },
          {
            label: "CONTACTO",
            target: 2.1,
            active: scrollProgress >= 1.88,
          },
        ].map((sec) => (
          <button
            key={sec.label}
            onClick={() => navigateToScroll(sec.target)}
            className={`flex items-center gap-3 transition-all cursor-pointer ${
              sec.active ? "font-bold opacity-100" : "opacity-35 hover:opacity-75"
            }`}
          >
            <span
              className={`h-[1.5px] transition-all ${
                sec.active ? "w-5 bg-emerald-500" : "w-2 bg-current"
              }`}
            />
            <span>{sec.label}</span>
          </button>
        ))}
      </div>

      {/* 7. HUD ESTADO 1: HERO INICIAL (SIN TRANSFORM PADRE QUE ROMPA FIXED) */}
      {/* 7A. Indicador Vertical "Desliza para explorar" (Móvil y PC) */}
      <div
        className={`fixed right-3.5 sm:right-6 bottom-28 sm:bottom-24 z-20 flex flex-col items-center gap-2 transition-opacity duration-500 ${
          isHeroVisible
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={() => scrollToProjectIndex(0)}
          className="font-mono text-[9px] sm:text-[10px] tracking-[0.26em] text-white/75 hover:text-emerald-400 uppercase cursor-pointer"
          style={{ writingMode: "vertical-rl" }}
        >
          scroll to explore
        </button>
        <span className="w-[1px] h-10 bg-gradient-to-b from-emerald-400 via-emerald-400/50 to-transparent animate-pulse" />
      </div>

      {/* 7B. Bloque "Últimos Lanzamientos" (Visible en Hero tanto en Celular como en PC) */}
      <section
        className={`fixed left-5 right-12 sm:left-auto sm:right-12 lg:right-16 ${
          showSoundPrompt ? "bottom-24 sm:bottom-20" : "bottom-14 sm:bottom-16"
        } z-20 sm:w-[350px] font-mono transition-opacity duration-500 ${
          isHeroVisible
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="text-[10px] tracking-[0.26em] uppercase text-emerald-400 mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            <span>Últimos Lanzamientos</span>
          </span>
          <button
            onClick={() => scrollToProjectIndex(0)}
            className="text-white/70 hover:text-white underline cursor-pointer text-[10px]"
          >
            Explorar 3D ↓
          </button>
        </div>

        {/* En móvil mostramos los 2 más recientes (igual a Alche Móvil 00:08) y en PC los 4 */}
        <div className="space-y-2 border-t border-white/20 pt-2 bg-black/35 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none p-2.5 sm:p-0 rounded-lg sm:rounded-none">
          {PROJECTS_DATA.slice(0, 4).map((item, idx) => (
            <div
              key={item.slug}
              onClick={() => scrollToProjectIndex(idx)}
              className={`${
                idx >= 2 ? "hidden sm:block" : "block"
              } group border-b border-white/10 pb-1.5 cursor-pointer transition-all duration-200 hover:border-emerald-400/50`}
            >
              <p className="text-[10px] text-white/50 group-hover:text-emerald-400 transition-colors">
                {item.date}
              </p>
              <p className="text-xs text-white/90 group-hover:text-white group-hover:translate-x-1 transition-all truncate">
                {item.title}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 7C. Coordenadas Técnicas Abajo a la Izquierda en Hero (PC) */}
      <div
        className={`fixed bottom-20 left-6 md:left-12 lg:left-16 z-20 pointer-events-none hidden sm:block transition-opacity duration-500 ${
          isHeroVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className="font-mono text-[10px] tracking-[0.25em] text-white/45 uppercase">
          ARQUITECTURA DE SOFTWARE & EXPERIENCIAS WEBGL
        </p>
        <p className="font-mono text-xs text-white/80 mt-1">
          Desliza para explorar nuestros 9 proyectos en tiempo real.
        </p>
      </div>

      {/* 8. HUD ESTADO 2: CARRUSEL DE PROYECTOS */}
      <div
        className={`fixed inset-x-0 ${
          showSoundPrompt ? "bottom-20 sm:bottom-16" : "bottom-12 sm:bottom-14"
        } z-20 px-4 sm:px-6 md:px-12 lg:px-16 transition-opacity duration-500 ${
          inWorksSection && !showAllWorksGrid && !selectedProject
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-5">
          <div className="max-w-2xl space-y-2 bg-black/65 md:bg-transparent backdrop-blur-md md:backdrop-blur-none p-3.5 sm:p-4 md:p-0 rounded-xl border border-white/15 md:border-none">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
              <span className="text-white/85 font-semibold tracking-wider">
                {activeProject.date}
              </span>
              <span className="px-2 py-0.5 rounded-sm bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 text-[10px] sm:text-[11px] line-clamp-1">
                {activeProject.highlightBadge}
              </span>
            </div>

            <div
              onClick={() => openProjectModal(activeProject)}
              className="group cursor-pointer"
            >
              <h2 className="text-lg sm:text-2xl md:text-4xl font-extrabold tracking-tight text-white group-hover:text-emerald-300 transition-colors leading-snug">
                {activeProject.title}
              </h2>
              <p className="font-mono text-[9px] sm:text-xs text-white/60 tracking-widest uppercase mt-0.5 truncate">
                {activeProject.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {activeProject.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-[9px] sm:text-[10px] font-mono tracking-wider border border-white/25 bg-black/50 text-white/85"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 font-mono px-1 sm:px-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollToProjectIndex(activeProjectIdx - 1)}
                disabled={activeProjectIdx === 0}
                className="w-8 h-8 rounded-full border border-white/25 bg-black/60 flex items-center justify-center hover:border-emerald-400 disabled:opacity-30 cursor-pointer transition-colors"
                aria-label="Proyecto anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="hidden sm:flex items-center gap-1.5 px-2">
                {PROJECTS_DATA.map((p, i) => (
                  <button
                    key={p.slug}
                    onClick={() => scrollToProjectIndex(i)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      i === activeProjectIdx
                        ? "w-6 bg-emerald-400"
                        : "w-1.5 bg-white/30 hover:bg-white/60"
                    }`}
                    title={p.title}
                  />
                ))}
              </div>

              <span className="text-xs text-white/85 px-1">
                {activeProject.id} / 09
              </span>

              <button
                onClick={() => scrollToProjectIndex(activeProjectIdx + 1)}
                disabled={activeProjectIdx === PROJECTS_DATA.length - 1}
                className="w-8 h-8 rounded-full border border-white/25 bg-black/60 flex items-center justify-center hover:border-emerald-400 disabled:opacity-30 cursor-pointer transition-colors"
                aria-label="Siguiente proyecto"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => openProjectModal(activeProject)}
                className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-4 cursor-pointer"
              >
                <span>Ver Proyecto</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setShowAllWorksGrid(true)}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-mono tracking-wider text-white border-b border-white/60 pb-0.5 hover:text-emerald-400 hover:border-emerald-400 transition-colors cursor-pointer"
              >
                <span>Más Proyectos</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 9. MODALES MODULARES */}
      <ProjectDetailModal
        selectedProject={selectedProject}
        detailDeviceView={detailDeviceView}
        setDetailDeviceView={setDetailDeviceView}
        onClose={() => setSelectedProject(null)}
        onSelectProject={(proj) => setSelectedProject(proj)}
      />

      <AllWorksCatalogModal
        show={showAllWorksGrid && !selectedProject}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onClose={() => setShowAllWorksGrid(false)}
        onSelectProject={openProjectModal}
      />

      {/* 10. CONTROL FLOTANTE PERSISTENTE DE SONIDO E INTRO (ESQUINA INFERIOR IZQUIERDA) */}
      {!showSoundPrompt && (
        <PersistentSoundAndIntroBadge
          soundEnabled={soundEnabled}
          onToggleSound={() => {
            requestMobileGyroPermission();
            setSoundEnabled((prev) => !prev);
          }}
          onReplayIntro={() => {
            scrollToTopHero();
            setShowIntro(true);
          }}
          isLightMode={isLightVisionMode}
        />
      )}

      {/* 11. BARRA INFERIOR DE BIENVENIDA DE SONIDO (SIN TEXTO CORTADO EN MÓVIL) */}
      {showSoundPrompt && (
        <footer className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-xl border-t border-white/15 px-4 sm:px-8 md:px-12 lg:px-16 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2.5 text-[10px] sm:text-xs font-mono text-white/85 text-center sm:text-left">
            <button
              onClick={() => {
                requestMobileGyroPermission();
                setSoundEnabled(!soundEnabled);
              }}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-white/25 flex items-center justify-center hover:border-emerald-400 transition-colors cursor-pointer shrink-0"
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-white/50" />
              )}
            </button>
            <span className="leading-tight">
              Este sitio utiliza audio espacial y shaders 3D interactivos.
            </span>
          </div>

          <div className="flex items-center justify-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                requestMobileGyroPermission();
                setSoundEnabled(true);
                setShowSoundPrompt(false);
              }}
              className="px-4 py-1 rounded-full border border-white/30 bg-white/10 hover:bg-white hover:text-black text-[10px] sm:text-[11px] font-mono transition-all cursor-pointer"
            >
              Activar sonido
            </button>
            <button
              onClick={() => {
                requestMobileGyroPermission();
                setSoundEnabled(false);
                setShowSoundPrompt(false);
              }}
              className="px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-mono text-white/55 hover:text-white transition-colors cursor-pointer"
            >
              Continuar sin sonido
            </button>
          </div>
        </footer>
      )}
    </main>
  );
}