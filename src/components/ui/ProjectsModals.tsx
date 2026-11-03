"use client";

import React, { useMemo } from "react";
import {
  ArrowUpRight,
  X,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Smartphone,
  Layers,
} from "lucide-react";
import { PROJECTS_DATA, ProjectItem } from "@/data/projects";

// ============================================================================
// 1. MODAL DE FICHA TÉCNICA DEL PROYECTO (USA modalMobileImg DE 1080x1920)
// ============================================================================
export function ProjectDetailModal({
  selectedProject,
  detailDeviceView,
  setDetailDeviceView,
  onClose,
  onSelectProject,
}: {
  selectedProject: ProjectItem | null;
  detailDeviceView: "ordenador" | "mobil";
  setDetailDeviceView: (v: "ordenador" | "mobil") => void;
  onClose: () => void;
  onSelectProject: (p: ProjectItem) => void;
}) {
  if (!selectedProject) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl overflow-y-auto px-5 md:px-12 lg:px-16 py-24 animate-fadeIn">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-5">
          <div>
            <div className="flex items-center gap-3 font-mono text-xs text-emerald-400">
              <span>PROYECTO {selectedProject.id} / 09</span>
              <span>•</span>
              <span>{selectedProject.date}</span>
              <span>•</span>
              <span>[{selectedProject.tags.join(", ")}]</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight mt-2">
              {selectedProject.title}
            </h1>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-white/25 bg-white/5 hover:bg-white hover:text-black font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Cerrar Vista</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex rounded-full border border-white/20 bg-black/60 p-1 font-mono text-xs">
            <button
              onClick={() => setDetailDeviceView("ordenador")}
              className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all cursor-pointer ${
                detailDeviceView === "ordenador"
                  ? "bg-emerald-400 text-black font-bold"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Vista Ordenador (PC)</span>
            </button>
            <button
              onClick={() => setDetailDeviceView("mobil")}
              className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all cursor-pointer ${
                detailDeviceView === "mobil"
                  ? "bg-emerald-400 text-black font-bold"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Vista Móvil (Teléfono)</span>
            </button>
          </div>

          <span className="font-mono text-xs text-white/50">
            {selectedProject.highlightBadge}
          </span>
        </div>

        <div className="w-full rounded-2xl border border-white/15 bg-black/70 p-4 sm:p-6 flex items-center justify-center overflow-hidden shadow-2xl">
          {detailDeviceView === "ordenador" ? (
            <img
              src={selectedProject.desktopImg}
              alt={`${selectedProject.title} - Vista Ordenador`}
              className="w-full max-h-[68vh] object-contain rounded-lg border border-white/10"
            />
          ) : (
            <img
              src={selectedProject.modalMobileImg}
              alt={`${selectedProject.title} - Vista Móvil MD`}
              className="max-h-[70vh] w-auto object-contain rounded-2xl border border-white/20 shadow-lg"
            />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-t border-white/15 pt-8">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-emerald-400">
              Descripción General del Proyecto
            </h3>
            <p className="text-white/85 text-base sm:text-lg leading-relaxed">
              {selectedProject.description}
            </p>
          </div>

          <div className="space-y-4 bg-white/[0.03] border border-white/10 rounded-xl p-5">
            <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-emerald-400 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>Ingeniería & Arquitectura</span>
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-white/80 font-mono">
              {selectedProject.architecture.map((bullet, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="text-emerald-400 mt-0.5">■</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/15 pt-6 font-mono text-xs">
          <button
            onClick={() => {
              const prevIdx =
                (PROJECTS_DATA.findIndex(
                  (p) => p.slug === selectedProject.slug
                ) -
                  1 +
                  PROJECTS_DATA.length) %
                PROJECTS_DATA.length;
              onSelectProject(PROJECTS_DATA[prevIdx]);
            }}
            className="px-5 py-2.5 border border-white/25 hover:border-emerald-400 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Proyecto Anterior</span>
          </button>

          <button
            onClick={() => {
              const nextIdx =
                (PROJECTS_DATA.findIndex(
                  (p) => p.slug === selectedProject.slug
                ) +
                  1) %
                PROJECTS_DATA.length;
              onSelectProject(PROJECTS_DATA[nextIdx]);
            }}
            className="px-5 py-2.5 border border-white/25 hover:border-emerald-400 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <span>Siguiente Proyecto</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. MODAL DE CATÁLOGO COMPLETO "WORKS"
// ============================================================================
export function AllWorksCatalogModal({
  show,
  selectedCategory,
  setSelectedCategory,
  onClose,
  onSelectProject,
}: {
  show: boolean;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onClose: () => void;
  onSelectProject: (p: ProjectItem) => void;
}) {
  const filteredProjects = useMemo(() => {
    if (selectedCategory === "TODOS") return PROJECTS_DATA;
    return PROJECTS_DATA.filter((p) => p.category === selectedCategory);
  }, [selectedCategory]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-30 bg-black/65 backdrop-blur-md overflow-y-auto px-5 md:px-12 lg:px-16 pt-28 pb-24 animate-fadeIn">
      <div className="max-w-[1640px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight">
              Proyectos
            </h1>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-white/25 bg-black/50 font-mono text-xs hover:border-emerald-400 cursor-pointer"
            >
              Volver al Carrusel 3D
            </button>
          </div>

          <div className="flex flex-wrap lg:flex-col items-start gap-3 font-mono text-xs sm:text-sm pt-2">
            {["TODOS", "E-Commerce", "Apps & SaaS", "IA & Cloud"].map((cat) => {
              const count =
                cat === "TODOS"
                  ? PROJECTS_DATA.length
                  : PROJECTS_DATA.filter((p) => p.category === cat).length;
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-2 py-1 transition-all cursor-pointer ${
                    active
                      ? "text-emerald-400 font-bold translate-x-1"
                      : "text-white/55 hover:text-white"
                  }`}
                >
                  {active && <span>•</span>}
                  <span>{cat}</span>
                  <span className="text-[10px] text-white/40">[{count}]</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredProjects.map((proj) => (
            <div
              key={proj.slug}
              onClick={() => onSelectProject(proj)}
              className="group cursor-pointer space-y-3 transition-transform duration-300 hover:-translate-y-1.5"
            >
              <div className="relative aspect-video w-full overflow-hidden border border-white/15 bg-black/60">
                <img
                  src={proj.desktopImg}
                  alt={proj.title}
                  className="hidden sm:block w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <img
                  src={proj.mobileImg}
                  alt={proj.title}
                  className="block sm:hidden w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="font-mono text-xs text-emerald-300 flex items-center gap-1">
                    <span>Abrir ficha técnica</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between font-mono text-[11px] text-white/60">
                <span>{proj.date}</span>
                <span className="truncate max-w-[70%] text-right">
                  [{proj.tags.join(", ")}]
                </span>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                {proj.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}