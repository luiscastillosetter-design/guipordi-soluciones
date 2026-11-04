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
  MessageSquare,
  Globe,
} from "lucide-react";

import {
  PROJECTS_DATA as FALLBACK_PROJECTS,
  ProjectItem,
} from "@/data/projects";
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
import {
  AIConciergeQuoteModal,
  WHATSAPP_OFFICIAL_LINK,
} from "@/components/ui/AIConciergeQuoteModal";

// ============================================================================
// ESCENA 3D MODULAR
// ============================================================================
function StudioScene({
  mouseRef,
  scrollRef,
  onNormalUpdate,
  onScrollStateUpdate,
  onSelectProject,
  projectsList,
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
  projectsList: ProjectItem[];
}) {
  const [, setTexReadyTick] = useState(0);

  const carouselProjects = useMemo(() => {
    const list = projectsList.filter((p) => p.in3dCarousel);
    return list.length > 0 ? list : projectsList.slice(0, 9);
  }, [projectsList]);

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

    const desktop: THREE.Texture[] = carouselProjects.map(() => fallbackTex);
    const mobile: THREE.Texture[] = carouselProjects.map(() => fallbackTex);
    const desktopAspects: number[] = carouselProjects.map(() => 16 / 9);
    const mobileAspects: number[] = carouselProjects.map(() => 9 / 16);

    carouselProjects.forEach((p, idx) => {
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
  }, [carouselProjects]);

  useFrame(() => {
    const prev = scrollRef.current.current;
    const next = THREE.MathUtils.lerp(prev, scrollRef.current.target, 0.075);
    scrollRef.current.velocity = (next - prev) * 14.0;
    scrollRef.current.current = next;

    // MAGIA DE DECAIMIENTO: Si el cursor se detiene, la velocidad (efecto agua) baja a 0 rápidamente.
    mouseRef.current.speed = THREE.MathUtils.lerp(mouseRef.current.speed, 0, 0.1);

    const inWorks = next > 0.09 && next < 1.03;
    const total = carouselProjects.length;
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
// PÁGINA PRINCIPAL
// ============================================================================
export default function GuiporDIStudioPage() {
  const MAX_SCROLL = 2.15;

  const mouseRef = useRef({ x: 0, y: 0, speed: 0 });
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const scrollRef = useRef({ current: 0, target: 0, velocity: 0 });
  // Añadimos isTouching para que el acelerómetro no pelee con el dedo
  const touchStartRef = useRef({ x: 0, y: 0, isTouching: false }); 

  const [projectsList, setProjectsList] =
    useRef<ProjectItem[]>(FALLBACK_PROJECTS).current === FALLBACK_PROJECTS
      ? useState<ProjectItem[]>(FALLBACK_PROJECTS)
      : useState<ProjectItem[]>(FALLBACK_PROJECTS);

  useEffect(() => {
    fetch("/api/admin-erp?mode=public_catalog")
      .then((res) => res.json())
      .then((data) => {
        if (data.catalog && Array.isArray(data.catalog) && data.catalog.length > 0) {
          setProjectsList(data.catalog);
        }
      })
      .catch(() => {});
  }, [setProjectsList]);

  // Bloquea el "Pull-to-refresh" nativo de los navegadores móviles
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

  const carouselProjects = useMemo(() => {
    const list = projectsList.filter((p) => p.in3dCarousel);
    return list.length > 0 ? list : projectsList.slice(0, 9);
  }, [projectsList]);

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
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const activeProject =
    carouselProjects[activeProjectIdx] || carouselProjects[0] || projectsList[0];

  const { triggerHarmonicChime } = useSpatialAudioEngine(
    soundEnabled,
    activeProjectIdx,
    scrollProgress
  );

  const isLightVisionMode =
    scrollProgress > 1.04 &&
    scrollProgress < 1.42 &&
    !showAllWorksGrid &&
    !selectedProject &&
    !showQuoteModal;

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
    setShowQuoteModal(false);
  }, []);

  const scrollToProjectIndex = useCallback((idx: number) => {
    const total = carouselProjects.length;
    const clampedIdx = Math.min(Math.max(idx, 0), total - 1);
    const targetScroll = 0.14 + (clampedIdx / (total - 1)) * 0.86;
    scrollRef.current.target = targetScroll;
    setShowAllWorksGrid(false);
    setSelectedProject(null);
    setMobileMenuOpen(false);
    setShowQuoteModal(false);
  }, [carouselProjects.length]);

  const scrollToTopHero = useCallback(() => {
    navigateToScroll(0);
  }, [navigateToScroll]);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      const dx = nx - lastMouseRef.current.x;
      const dy = ny - lastMouseRef.current.y;
      
      // Multiplicador 80% más pequeño para la ola del agua (máximo en 0.12)
      const speed = Math.min(Math.sqrt(dx * dx + dy * dy) * 1.5, 0.12);

      mouseRef.current.x = nx;
      mouseRef.current.y = ny;
      mouseRef.current.speed = speed;

      lastMouseRef.current.x = nx;
      lastMouseRef.current.y = ny;
    };

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (touchStartRef.current.isTouching) return; // Prioriza el dedo si estás tocando
      if (e.gamma === null || e.beta === null) return;

      // Calibración natural de la gravedad: Inclinación absoluta para móvil
      const tiltX = THREE.MathUtils.clamp(e.gamma / 35, -1, 1);
      const tiltY = THREE.MathUtils.clamp((e.beta - 45) / 35, -1, 1);
      
      const dx = tiltX - lastMouseRef.current.x;
      const dy = tiltY - lastMouseRef.current.y;
      
      // Velocidad ínfima para que el giroscopio no haga olas en reposo
      const speed = Math.min(Math.sqrt(dx * dx + dy * dy) * 0.8, 0.1);

      mouseRef.current.x = THREE.MathUtils.lerp(mouseRef.current.x, tiltX, 0.2);
      mouseRef.current.y = THREE.MathUtils.lerp(mouseRef.current.y, tiltY, 0.2);
      mouseRef.current.speed = speed;

      lastMouseRef.current.x = mouseRef.current.x;
      lastMouseRef.current.y = mouseRef.current.y;
    };

    const handleWheel = (e: WheelEvent) => {
      if (
        showIntro ||
        selectedProject ||
        showAllWorksGrid ||
        mobileMenuOpen ||
        showQuoteModal
      )
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
        touchStartRef.current.isTouching = true;
      }
    };

    const handleTouchEnd = () => {
      touchStartRef.current.isTouching = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (
        selectedProject ||
        showAllWorksGrid ||
        mobileMenuOpen ||
        showQuoteModal ||
        showIntro
      )
        return;

      if (e.touches.length > 0) {
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const dxScroll = touchStartRef.current.x - touchX;
        const dyScroll = touchStartRef.current.y - touchY;

        // Efecto del agua bajo el dedo (también pequeñito)
        const nx = (touchX / window.innerWidth) * 2 - 1;
        const ny = -(touchY / window.innerHeight) * 2 + 1;
        const dxMouse = nx - lastMouseRef.current.x;
        const dyMouse = ny - lastMouseRef.current.y;

        mouseRef.current.speed = Math.min(Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse) * 1.5, 0.12);
        mouseRef.current.x = nx;
        mouseRef.current.y = ny;
        lastMouseRef.current.x = nx;
        lastMouseRef.current.y = ny;

        // Scroll súper fluido y sin bloqueos
        const rawDelta = Math.abs(dxScroll) > Math.abs(dyScroll) ? dxScroll * 0.00055 : dyScroll * 0.00052;
        const clampedDelta = THREE.MathUtils.clamp(rawDelta, -0.026, 0.026);
        scrollRef.current.target = Math.min(Math.max(scrollRef.current.target + clampedDelta, 0), MAX_SCROLL);
        
        touchStartRef.current.x = touchX;
        touchStartRef.current.y = touchY;
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("deviceorientation", handleDeviceOrientation, true);
    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("deviceorientation", handleDeviceOrientation, true);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    showIntro,
    selectedProject,
    showAllWorksGrid,
    mobileMenuOpen,
    showQuoteModal,
  ]);

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

  const openQuoteModalWithSound = useCallback(() => {
    triggerHarmonicChime();
    setMobileMenuOpen(false);
    setShowQuoteModal(true);
  }, [triggerHarmonicChime]);

  const isHeroVisible =
    scrollProgress <= 0.08 &&
    !showAllWorksGrid &&
    !selectedProject &&
    !showQuoteModal;

  return (
    <main className="relative w-full h-[100dvh] overflow-hidden overscroll-none bg-[#020304] text-white select-none font-sans">
      {showIntro && (
        <ArchitecturalCompassIntro onFinish={() => setShowIntro(false)} />
      )}

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
            projectsList={projectsList}
          />
        </Canvas>
      </div>

      <VisionServicesFooter
        scrollProgress={scrollProgress}
        onNavigateScroll={navigateToScroll}
        onOpenCatalog={() => setShowAllWorksGrid(true)}
        onOpenQuoteModal={openQuoteModalWithSound}
      />

      <header
        className={`fixed top-0 left-0 right-0 z-40 w-full px-4 sm:px-6 md:px-12 lg:px-16 py-4 md:py-6 flex items-center justify-between transition-colors duration-300 ${
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
            className={`relative py-1 cursor-pointer ${
              scrollProgress < 0.09 && !showAllWorksGrid
                ? "text-emerald-500 font-bold"
                : ""
            }`}
          >
            Inicio
          </button>
          <button
            onClick={() => scrollToProjectIndex(0)}
            className={`relative py-1 cursor-pointer ${
              inWorksSection && !showAllWorksGrid
                ? "text-emerald-400 font-bold"
                : ""
            }`}
          >
            Proyectos 3D
          </button>
          <button
            onClick={() => navigateToScroll(1.18)}
            className={`relative py-1 cursor-pointer ${
              scrollProgress >= 1.03 && scrollProgress < 1.42
                ? "text-emerald-600 font-bold"
                : ""
            }`}
          >
            Visión
          </button>
          <button
            onClick={() => navigateToScroll(1.62)}
            className={`relative py-1 cursor-pointer ${
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
            className={`relative py-1 cursor-pointer ${
              showAllWorksGrid ? "text-emerald-400 font-bold" : ""
            }`}
          >
            Catálogo & Demos ({projectsList.length})
          </button>
        </nav>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={openQuoteModalWithSound}
            className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full border text-[11px] sm:text-xs font-mono tracking-wider uppercase flex items-center gap-1.5 sm:gap-2 transition-all duration-300 cursor-pointer ${
              isLightVisionMode
                ? "border-black/30 bg-black text-white hover:bg-emerald-500 hover:text-black"
                : "border-emerald-400/50 bg-emerald-400/15 backdrop-blur-md text-emerald-300 hover:bg-emerald-400 hover:text-black shadow-lg shadow-emerald-500/10"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cotizar con IA</span>
          </button>

          <a
            href={WHATSAPP_OFFICIAL_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className={`hidden lg:flex w-10 h-10 rounded-full border items-center justify-center transition-all duration-300 cursor-pointer ${
              isLightVisionMode
                ? "border-black/25 bg-black/5 text-black hover:bg-black hover:text-white"
                : "border-white/20 bg-black/40 backdrop-blur-md text-white hover:border-emerald-400 hover:text-emerald-400"
            }`}
            title="Hablar directamente por WhatsApp"
          >
            <MessageSquare className="w-4 h-4" />
          </a>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 rounded-full border border-white/20 bg-black/60 backdrop-blur-md flex items-center justify-center text-white cursor-pointer"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      {/* MENÚ MÓVIL */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-black/90 backdrop-blur-xl flex flex-col justify-between px-7 pt-24 pb-20 md:hidden font-mono">
          <div className="space-y-3.5">
            {[
              { label: "Inicio", action: scrollToTopHero },
              {
                label: "⚡ Cotizar Proyecto con IA",
                action: openQuoteModalWithSound,
                highlight: true,
              },
              {
                label: "Carrusel 3D de Proyectos",
                action: () => scrollToProjectIndex(0),
              },
              {
                label: `Catálogo & Mostrador SaaS (${projectsList.length})`,
                action: () => {
                  setMobileMenuOpen(false);
                  setShowAllWorksGrid(true);
                },
              },
              { label: "Nuestra Visión", action: () => navigateToScroll(1.18) },
              {
                label: "Servicios & GuiporDI IA",
                action: () => navigateToScroll(1.62),
              },
            ].map((item, i) => (
              <button
                key={i}
                onClick={item.action}
                className={`w-full text-left flex items-center gap-4 text-base py-2 border-b border-white/10 ${
                  item.highlight
                    ? "text-emerald-400 font-bold"
                    : "text-white/90"
                }`}
              >
                <span className="w-4 h-[1px] bg-emerald-400" />
                <span>{item.label}</span>
              </button>
            ))}

            <a
              href={WHATSAPP_OFFICIAL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 mt-4 py-3 rounded-xl bg-emerald-400 text-black font-mono text-xs font-extrabold uppercase tracking-wider"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Directo con Luis Castillo</span>
            </a>
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
              ? `Proyecto ${activeProject.id} / ${carouselProjects.length}`
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

      {/* 7. HUD ESTADO 1: HERO INICIAL */}
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

        <div className="space-y-2 border-t border-white/20 pt-2 bg-black/35 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none p-2.5 sm:p-0 rounded-lg sm:rounded-none">
          {carouselProjects.slice(0, 4).map((item, idx) => (
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

      <div
        className={`fixed bottom-20 left-6 md:left-12 lg:left-16 z-20 pointer-events-none hidden sm:block transition-opacity duration-500 ${
          isHeroVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className="font-mono text-[10px] tracking-[0.25em] text-white/45 uppercase">
          ENTORNOS DE VENTAS DIGITALES, E-COMMERCE & IA
        </p>
        <p className="font-mono text-xs text-white/80 mt-1">
          Desliza para explorar nuestros proyectos y demos o cotiza en vivo con IA.
        </p>
      </div>

      {/* HUD INFERIOR: CARRUSEL 3D */}
      <div
        className={`fixed inset-x-0 ${
          showSoundPrompt ? "bottom-20 sm:bottom-16" : "bottom-12 sm:bottom-14"
        } z-20 px-4 sm:px-6 md:px-12 lg:px-16 transition-opacity duration-500 ${
          inWorksSection &&
          !showAllWorksGrid &&
          !selectedProject &&
          !showQuoteModal
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-5">
          <div className="max-w-2xl space-y-2 bg-black/65 md:bg-transparent backdrop-blur-md p-3.5 sm:p-4 md:p-0 rounded-xl border border-white/15 md:border-none">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
              <span className="text-white/85 font-semibold">
                {activeProject.date}
              </span>
              <span className="px-2 py-0.5 rounded-sm bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 text-[10px]">
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
              <p className="font-mono text-[9px] sm:text-xs text-white/60 uppercase mt-0.5 truncate">
                {activeProject.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {activeProject.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-[9px] font-mono border border-white/25 bg-black/50 text-white/85"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 font-mono">
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollToProjectIndex(activeProjectIdx - 1)}
                disabled={activeProjectIdx === 0}
                className="w-8 h-8 rounded-full border border-white/25 bg-black/60 flex items-center justify-center hover:border-emerald-400 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs text-white/85 px-1">
                {activeProject.id} / {carouselProjects.length}
              </span>

              <button
                onClick={() => scrollToProjectIndex(activeProjectIdx + 1)}
                disabled={activeProjectIdx === carouselProjects.length - 1}
                className="w-8 h-8 rounded-full border border-white/25 bg-black/60 flex items-center justify-center hover:border-emerald-400 disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => openProjectModal(activeProject)}
                className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-4 cursor-pointer"
              >
                <span>Ver Ficha / Adquirir</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setShowAllWorksGrid(true)}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-mono tracking-wider text-white border-b border-white/60 pb-0.5 hover:text-emerald-400 cursor-pointer"
              >
                <span>Catálogo & Demos</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODALES Y COTIZADOR IA */}
      <ProjectDetailModal
        selectedProject={selectedProject}
        detailDeviceView={detailDeviceView}
        setDetailDeviceView={setDetailDeviceView}
        onClose={() => setSelectedProject(null)}
        onSelectProject={(proj) => setSelectedProject(proj)}
        allProjects={projectsList}
      />

      <AllWorksCatalogModal
        show={showAllWorksGrid && !selectedProject}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onClose={() => setShowAllWorksGrid(false)}
        onSelectProject={openProjectModal}
        projectsList={projectsList}
      />

      <AIConciergeQuoteModal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
      />

      {/* BARRA INFERIOR DE AUDIO */}
      {showSoundPrompt && (
        <footer className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-xl border-t border-white/15 px-4 sm:px-8 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-xs">
          <div className="flex items-center gap-2.5 text-white/85">
            <button
              onClick={() => {
                requestMobileGyroPermission();
                setSoundEnabled(!soundEnabled);
              }}
              className="w-6 h-6 rounded-full border border-white/25 flex items-center justify-center hover:border-emerald-400 cursor-pointer"
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-white/50" />
              )}
            </button>
            <span>Audio espacial y shaders 3D interactivos activos.</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                requestMobileGyroPermission();
                setSoundEnabled(true);
                setShowSoundPrompt(false);
              }}
              className="px-4 py-1 rounded-full border border-white/30 bg-white/10 hover:bg-white hover:text-black text-[11px] cursor-pointer"
            >
              Activar sonido
            </button>
            <button
              onClick={() => {
                requestMobileGyroPermission();
                setSoundEnabled(false);
                setShowSoundPrompt(false);
              }}
              className="px-3 py-1 rounded-full text-[11px] text-white/55 hover:text-white cursor-pointer"
            >
              Continuar sin sonido
            </button>
          </div>
        </footer>
      )}
    </main>
  );
}