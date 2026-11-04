"use client";

import React, { useState } from "react";
import {
  ArrowUpRight,
  X,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Smartphone,
  Layers,
  Globe,
  ShoppingCart,
  CheckCircle2,
  ShieldCheck,
  Copy,
  Check,
} from "lucide-react";
import { ProjectItem } from "@/data/projects";

// ============================================================================
// 1. MODAL DE FICHA TÉCNICA DEL PROYECTO / PRODUCTO SAAS (CON COMPRA GUIPORDI PAY)
// ============================================================================
export function ProjectDetailModal({
  selectedProject,
  detailDeviceView,
  setDetailDeviceView,
  onClose,
  onSelectProject,
  allProjects,
}: {
  selectedProject: ProjectItem | null;
  detailDeviceView: "ordenador" | "mobil";
  setDetailDeviceView: (v: "ordenador" | "mobil") => void;
  onClose: () => void;
  onSelectProject: (p: ProjectItem) => void;
  allProjects: ProjectItem[];
}) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState("BINANCE_PAY");
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<{
    orderCode: string;
    uniqueAmount: number;
    baseAmount: number;
  } | null>(null);

  // Estados para reportar pago
  const [paymentReference, setPaymentReference] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(
    null
  );
  const [copiedAmount, setCopiedAmount] = useState(false);

  if (!selectedProject) return null;

  const handleCreateOrganicOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientContact.trim()) return;
    setIsCreatingOrder(true);
    setVerificationResult(null);

    try {
      const res = await fetch("/api/guipordi-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_order",
          payload: {
            baseAmountUsd: selectedProject.priceUsd || 100,
            clientName,
            clientContact,
            itemSlug: selectedProject.slug,
            itemTitle: selectedProject.title,
            paymentMethod: selectedPaymentMethod,
          },
        }),
      });
      const data = await res.json();
      if (data.ok && data.order) {
        setCreatedOrder({
          orderCode: data.order.order_code,
          uniqueAmount: Number(data.order.unique_validation_amount_usd),
          baseAmount: Number(data.order.base_amount_usd),
        });
      }
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!createdOrder || !paymentReference.trim()) return;
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const res = await fetch("/api/guipordi-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify_order_payment",
          payload: {
            orderCode: createdOrder.orderCode,
            paymentReference,
          },
        }),
      });
      const data = await res.json();
      if (data.verified) {
        setVerificationResult(
          "¡Pago validado y conciliado con éxito! Tu orden está activa en nuestro sistema."
        );
      } else {
        setVerificationResult(
          data.message ||
            "Referencia registrada. Esperando acuse de recibo de Binance/Zelle..."
        );
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const currentIndex = allProjects.findIndex(
    (p) => p.slug === selectedProject.slug
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl overflow-y-auto px-4 sm:px-8 lg:px-16 py-20 animate-fadeIn font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* BARRA SUPERIOR DEL MODAL */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-emerald-400">
              <span>PROYECTO {selectedProject.id}</span>
              <span>•</span>
              <span>{selectedProject.date}</span>
              <span>•</span>
              <span
                className={`px-2 py-0.5 rounded font-bold ${
                  selectedProject.catalogType === "PORTAFOLIO"
                    ? "bg-sky-500/20 text-sky-300"
                    : selectedProject.catalogType === "DEMO_VENTA_SAAS"
                    ? "bg-emerald-400/20 text-emerald-300"
                    : "bg-amber-400/20 text-amber-300"
                }`}
              >
                {selectedProject.catalogType === "PORTAFOLIO"
                  ? "PORTAFOLIO CLIENTE"
                  : selectedProject.catalogType === "DEMO_VENTA_SAAS"
                  ? "MOSTRADOR SAAS (DISPONIBLE)"
                  : "PORTAFOLIO + MOSTRADOR SAAS"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mt-1.5">
              {selectedProject.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {selectedProject.demoUrl && (
              <a
                href={selectedProject.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full border border-emerald-400/50 bg-emerald-400/10 hover:bg-emerald-400 hover:text-black font-mono text-xs text-emerald-300 font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Globe className="w-4 h-4" />
                <span>Míralo en Vivo ↗</span>
              </a>
            )}
            <button
              onClick={() => {
                setShowCheckout(false);
                setCreatedOrder(null);
                onClose();
              }}
              className="px-4 py-2 rounded-full border border-white/25 bg-white/5 hover:bg-white hover:text-black font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Cerrar</span>
            </button>
          </div>
        </div>

        {/* SI ESTÁ ACTIVO EL CHECKOUT DE GUIPORDI PAY */}
        {showCheckout ? (
          <div className="rounded-2xl border border-emerald-400/40 bg-[#070b10] p-6 sm:p-8 space-y-6 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="font-mono text-xs text-emerald-400 uppercase tracking-widest">
                  Pasarela Orgánica Zero-Fee (GuiporDI Pay)
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  Adquirir Licencia: {selectedProject.title}
                </h2>
              </div>
              <button
                onClick={() => setShowCheckout(false)}
                className="font-mono text-xs text-white/60 hover:text-white underline cursor-pointer"
              >
                ← Volver a la ficha técnica
              </button>
            </div>

            {!createdOrder ? (
              <form
                onSubmit={handleCreateOrganicOrder}
                className="space-y-4 font-mono text-xs max-w-2xl mx-auto"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 mb-1">
                      Tu Nombre o Empresa *
                    </label>
                    <input
                      required
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Ej. Importadora Demo"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/25 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 mb-1">
                      Tu WhatsApp o Correo *
                    </label>
                    <input
                      required
                      type="text"
                      value={clientContact}
                      onChange={(e) => setClientContact(e.target.value)}
                      placeholder="+58 414... / correo"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/25 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/70 mb-1">
                    Método de Pago Orgánico (Sin Comisiones)
                  </label>
                  <select
                    value={selectedPaymentMethod}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/25 text-white font-bold"
                  >
                    <option value="BINANCE_PAY">
                      Binance Pay (USDT - Instantáneo 0% Comisión)
                    </option>
                    <option value="ZELLE">Zelle (USD Directo)</option>
                    <option value="PAGO_MOVIL">Pago Móvil (Bolívares)</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-white/50 text-[10px]">
                      PRECIO OFICIAL DE LICENCIA
                    </p>
                    <p className="text-xl font-black text-white">
                      ${selectedProject.priceUsd || 100}.00 USDT
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 text-[10px]">
                      COMISIÓN BANCARIA
                    </p>
                    <p className="text-xl font-black text-emerald-400">
                      $0.00 (Zero-Fee)
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCreatingOrder}
                  className="w-full py-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  {isCreatingOrder
                    ? "Generando orden con céntimos únicos..."
                    : "Generar Orden de Pago GuiporDI Pay"}
                </button>
              </form>
            ) : (
              <div className="space-y-6 max-w-2xl mx-auto font-mono text-xs">
                <div className="p-5 rounded-2xl bg-emerald-400/10 border border-emerald-400/40 space-y-3 text-center">
                  <span className="px-3 py-1 rounded-full bg-emerald-400 text-black font-bold text-[11px]">
                    ORDEN GENERADA: #{createdOrder.orderCode}
                  </span>
                  <p className="text-white/80">
                    Para que nuestro validador automático identifique tu pago sin
                    errores, transfiere exactamente este monto con céntimos
                    únicos:
                  </p>
                  <div className="flex items-center justify-center gap-3 py-2">
                    <span className="text-3xl font-black text-emerald-400">
                      ${createdOrder.uniqueAmount.toFixed(2)} USDT
                    </span>
                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText(
                          createdOrder.uniqueAmount.toFixed(2)
                        );
                        setCopiedAmount(true);
                        setTimeout(() => setCopiedAmount(false), 2500);
                      }}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white hover:text-black transition-colors cursor-pointer"
                      title="Copiar monto exacto"
                    >
                      {copiedAmount ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-white/50">
                    Destino Binance Pay / Zelle:{" "}
                    <strong className="text-white">
                      pagos@guipordy.com / Pay ID oficial
                    </strong>
                  </p>
                </div>

                {/* REPORTE DE REFERENCIA */}
                <div className="p-5 rounded-2xl bg-black/60 border border-white/15 space-y-4">
                  <p className="font-bold text-white">
                    2. Reporta tu Referencia o Transaction ID:
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="Ej. 294857102938 o Hash de Binance"
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-black border border-white/25 text-white"
                    />
                    <button
                      onClick={handleVerifyPayment}
                      disabled={isVerifying || !paymentReference.trim()}
                      className="px-5 py-2.5 rounded-xl bg-emerald-400 text-black font-bold hover:bg-emerald-300 cursor-pointer disabled:opacity-40"
                    >
                      {isVerifying ? "Verificando..." : "Validar Pago"}
                    </button>
                  </div>

                  {verificationResult && (
                    <div className="p-3.5 rounded-xl bg-white/[0.05] border border-white/15 text-white/90 leading-relaxed">
                      {verificationResult}
                    </div>
                  )}
                </div>

                <div className="text-center pt-2">
                  <button
                    onClick={() => {
                      setShowCheckout(false);
                      setCreatedOrder(null);
                    }}
                    className="text-white/50 hover:text-white underline cursor-pointer text-[11px]"
                  >
                    Volver al detalle del proyecto
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* CONTROLES DE VISTA ORDENADOR VS MÓVIL */}
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

              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-white/50">
                  {selectedProject.highlightBadge}
                </span>

                {selectedProject.priceUsd > 0 && (
                  <button
                    onClick={() => setShowCheckout(true)}
                    className="px-5 py-2.5 rounded-full bg-emerald-400 hover:bg-emerald-300 text-black font-mono text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Adquirir por ${selectedProject.priceUsd} USDT</span>
                  </button>
                )}
              </div>
            </div>

            {/* CONTENEDOR DE IMAGEN */}
            <div className="w-full rounded-2xl border border-white/15 bg-black/70 p-4 sm:p-6 flex items-center justify-center overflow-hidden shadow-2xl">
              {detailDeviceView === "ordenador" ? (
                <img
                  src={selectedProject.desktopImg}
                  alt={selectedProject.title}
                  className="w-full max-h-[65vh] object-contain rounded-lg border border-white/10"
                />
              ) : (
                <img
                  src={selectedProject.modalMobileImg}
                  alt={selectedProject.title}
                  className="max-h-[68vh] w-auto object-contain rounded-2xl border border-white/20 shadow-lg"
                />
              )}
            </div>

            {/* DESCRIPCIÓN Y ARQUITECTURA */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-t border-white/15 pt-8 font-sans">
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-emerald-400">
                  Descripción General del Sistema
                </h3>
                <p className="text-white/85 text-base sm:text-lg leading-relaxed">
                  {selectedProject.description}
                </p>

                {Array.isArray(selectedProject.deliverables) &&
                  selectedProject.deliverables.length > 0 && (
                    <div className="pt-4 space-y-3">
                      <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-300 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>¿Qué incluye esta entrega?</span>
                      </h4>
                      <ul className="space-y-2 font-mono text-xs text-white/80">
                        {selectedProject.deliverables.map((deliv, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{deliv}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>

              <div className="space-y-4 bg-white/[0.03] border border-white/10 rounded-xl p-5">
                <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-emerald-400 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>Ingeniería & Arquitectura</span>
                </h3>
                <ul className="space-y-3 text-xs text-white/80 font-mono">
                  {selectedProject.architecture.map((bullet, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="text-emerald-400 mt-0.5">■</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* NAVEGACIÓN ANTERIOR / SIGUIENTE */}
            <div className="flex items-center justify-between border-t border-white/15 pt-6 font-mono text-xs">
              <button
                onClick={() => {
                  const prevIdx =
                    (currentIndex - 1 + allProjects.length) % allProjects.length;
                  onSelectProject(allProjects[prevIdx]);
                }}
                className="px-5 py-2.5 border border-white/25 hover:border-emerald-400 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Proyecto Anterior</span>
              </button>

              <button
                onClick={() => {
                  const nextIdx = (currentIndex + 1) % allProjects.length;
                  onSelectProject(allProjects[nextIdx]);
                }}
                className="px-5 py-2.5 border border-white/25 hover:border-emerald-400 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span>Siguiente Proyecto</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 2. MODAL DE CATÁLOGO COMPLETO (SEPARANDO PORTAFOLIO VS MOSTRADOR SAAS)
// ============================================================================
export function AllWorksCatalogModal({
  show,
  selectedCategory,
  setSelectedCategory,
  onClose,
  onSelectProject,
  projectsList,
}: {
  show: boolean;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onClose: () => void;
  onSelectProject: (p: ProjectItem) => void;
  projectsList: ProjectItem[];
}) {
  const [catalogViewTab, setCatalogViewTab] = useState<
    "TODOS" | "DEMO_VENTA_SAAS" | "PORTAFOLIO"
  >("TODOS");

  if (!show) return null;

  const filteredProjects = projectsList.filter((p) => {
    const matchesTab =
      catalogViewTab === "TODOS" ||
      p.catalogType === catalogViewTab ||
      p.catalogType === "AMBOS";
    const matchesCat =
      selectedCategory === "TODOS" || p.category === selectedCategory;
    return matchesTab && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-30 bg-black/75 backdrop-blur-md overflow-y-auto px-4 sm:px-8 lg:px-16 pt-28 pb-24 animate-fadeIn font-sans">
      <div className="max-w-[1640px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Catálogo & Demos
            </h1>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-white/25 bg-black/50 font-mono text-xs hover:border-emerald-400 cursor-pointer text-white"
            >
              Volver al 3D
            </button>
          </div>

          {/* PESTAÑAS DE SEPARACIÓN: PORTAFOLIO VS MOSTRADOR SAAS */}
          <div className="flex flex-col gap-2 font-mono text-xs">
            {[
              { id: "TODOS", label: "Todos los Proyectos y Demos" },
              {
                id: "DEMO_VENTA_SAAS",
                label: "🛒 Mostrador SaaS (Disponibles para Compra)",
              },
              {
                id: "PORTAFOLIO",
                label: "🏆 Portafolio (Trabajos Realizados a Clientes)",
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setCatalogViewTab(
                    tab.id as "TODOS" | "DEMO_VENTA_SAAS" | "PORTAFOLIO"
                  )
                }
                className={`text-left px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
                  catalogViewTab === tab.id
                    ? "border-emerald-400 bg-emerald-400/15 text-emerald-300 font-bold"
                    : "border-white/10 bg-black/40 text-white/60 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="border-t border-white/15 pt-4 space-y-2 font-mono text-xs">
            <p className="text-white/40 uppercase tracking-widest mb-2">
              Filtrar por Categoría
            </p>
            {["TODOS", "E-Commerce", "Apps & SaaS", "IA & Cloud"].map((cat) => {
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
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((proj) => (
            <div
              key={proj.slug}
              onClick={() => onSelectProject(proj)}
              className="group cursor-pointer rounded-2xl border border-white/15 bg-[#070b10] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/50 flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video w-full overflow-hidden bg-black border-b border-white/10">
                  <img
                    src={proj.desktopImg}
                    alt={proj.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${
                        proj.catalogType === "PORTAFOLIO"
                          ? "bg-sky-500/90 text-black"
                          : proj.catalogType === "DEMO_VENTA_SAAS"
                          ? "bg-emerald-400 text-black"
                          : "bg-amber-400 text-black"
                      }`}
                    >
                      {proj.catalogType === "PORTAFOLIO"
                        ? "PORTAFOLIO"
                        : "DISPONIBLE (SAAS)"}
                    </span>
                  </div>

                  {proj.priceUsd > 0 && (
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-black/85 border border-emerald-400/40 font-mono text-xs font-black text-emerald-400">
                      ${proj.priceUsd} USDT
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between font-mono text-[11px] text-white/60">
                    <span>{proj.date}</span>
                    <span className="truncate max-w-[65%] text-right text-emerald-400">
                      [{proj.tags.join(", ")}]
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors leading-snug">
                    {proj.title}
                  </h3>

                  <p className="text-xs text-white/65 line-clamp-2">
                    {proj.description}
                  </p>
                </div>
              </div>

              <div className="px-4 py-3 bg-black/40 border-t border-white/10 flex items-center justify-between font-mono text-xs">
                <span className="text-emerald-400 flex items-center gap-1">
                  <span>Ver ficha técnica y adquirir</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
                {proj.demoUrl && (
                  <span className="text-white/60 hover:text-white">
                    Míralo en vivo ↗
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}