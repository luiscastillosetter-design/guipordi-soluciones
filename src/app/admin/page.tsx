"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Lock,
  TrendingUp,
  DollarSign,
  Users,
  Cpu,
  ShoppingBag,
  Zap,
  Plus,
  Trash2,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Search,
  ArrowUpRight,
  MessageSquare,
  Edit3,
  Globe,
  Layers,
  CreditCard,
  MailCheck,
  Copy,
  Check,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";
import {
  QuoteLeadRecord,
  SystemSaleRecord,
  ApiRechargeRecord,
  CatalogItemRecord,
  CatalogItemType,
  PaymentMethodRecord,
  OrganicOrderRecord,
  IncomingPaymentVaultRecord,
} from "@/lib/supabase";

type AdminTab =
  | "catalog"
  | "guipordi_pay"
  | "leads"
  | "sales"
  | "recharges";

const EMPTY_CATALOG_FORM: CatalogItemRecord = {
  code_id: "13",
  slug: "",
  date: "2026.11.03",
  catalog_type: "DEMO_VENTA_SAAS",
  category: "Apps & SaaS",
  highlight_badge: "",
  title: "",
  subtitle: "",
  description: "",
  tags: ["Next.js", "Supabase", "Tailwind CSS"],
  architecture: [
    "Arquitectura Full-Stack de alta velocidad en Next.js y Supabase.",
    "Panel administrativo autogestionable en tiempo real.",
    "Diseño responsive dual optimizado para móvil y ordenador.",
  ],
  deliverables: [
    "Plataforma Web Completa con tu Marca",
    "Panel Administrativo + Base de Datos",
    "Despliegue en Producción Listo para Vender",
  ],
  desktop_img: "/projects/guipordi-ordenador.png",
  mobile_img: "/projects/guipordi-mobil.png",
  modal_mobile_img: "/projects/guipordi-mobilMD.png",
  accent_rgb: [0.05, 0.45, 0.36],
  price_usd: 1000,
  billing_type: "Licencia Marca Blanca / Pago Único",
  demo_url: "",
  in_3d_carousel: true,
  is_active: true,
};

const EMPTY_PAYMENT_METHOD_FORM: PaymentMethodRecord = {
  method_type: "BINANCE_PAY",
  label: "Binance Pay (USDT - Instantáneo)",
  account_holder: "Luis Antonio Castillo / GuiporDI Soluciones",
  account_identifier: "",
  bank_or_network: "Binance Pay / USDT",
  qr_image_url: "",
  instructions:
    "Envía el monto exacto con los céntimos únicos indicados en tu orden y coloca el Order ID o referencia.",
  is_active: true,
};

export default function GuiporDIAdminPage() {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dbWarning, setDbWarning] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<AdminTab>("catalog");
  const [catalogSubFilter, setCatalogSubFilter] = useState<
    "TODOS" | "PORTAFOLIO" | "DEMO_VENTA_SAAS"
  >("TODOS");
  const [searchQuery, setSearchQuery] = useState("");

  // Estado de las 7 tablas de Supabase
  const [leads, setLeads] = useState<QuoteLeadRecord[]>([]);
  const [sales, setSales] = useState<SystemSaleRecord[]>([]);
  const [recharges, setRecharges] = useState<ApiRechargeRecord[]>([]);
  const [catalog, setCatalog] = useState<CatalogItemRecord[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodRecord[]>(
    []
  );
  const [organicOrders, setOrganicOrders] = useState<OrganicOrderRecord[]>([]);
  const [paymentsVault, setPaymentsVault] = useState<
    IncomingPaymentVaultRecord[]
  >([]);

  // Modales de creación y edición
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [showNewRechargeModal, setShowNewRechargeModal] = useState(false);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);

  // Estado para editar o crear Proyecto / Demo SaaS
  const [catalogForm, setCatalogForm] =
    useState<CatalogItemRecord>(EMPTY_CATALOG_FORM);
  const [tagsText, setTagsText] = useState("");
  const [architectureText, setArchitectureText] = useState("");
  const [deliverablesText, setDeliverablesText] = useState("");

  // Estado para editar o crear Método de Pago
  const [paymentMethodForm, setPaymentMethodForm] =
    useState<PaymentMethodRecord>(EMPTY_PAYMENT_METHOD_FORM);

  // Simulador / Probador de Correos de GuiporDI Pay
  const [testEmailSubject, setTestEmailSubject] = useState(
    "Binance Pay: Has recibido 450.24 USDT"
  );
  const [testEmailBody, setTestEmailBody] = useState(
    "Has recibido un pago de 450.24 USDT de parte de cliente_demo por Binance Pay. Order ID: 294857102938."
  );
  const [copiedWorkerCode, setCopiedWorkerCode] = useState(false);

  // Formulario Nueva Venta de Sistema
  const [saleForm, setSaleForm] = useState<SystemSaleRecord>({
    client_name: "",
    client_contact: "",
    project_name: "",
    category: "Entorno Digital / E-Commerce",
    total_amount_usd: 0,
    paid_amount_usd: 0,
    payment_method: "Zelle / Binance",
    payment_status: "ABONADO",
    delivery_status: "EN DESARROLLO",
    notes: "",
  });

  // Formulario Nueva Recarga de Saldo API
  const [rechargeForm, setRechargeForm] = useState<ApiRechargeRecord>({
    client_name: "",
    client_contact: "",
    provider: "Anthropic (Claude API)",
    platform_source: "OpenRouter / Codedhub / Shofapro",
    credits_loaded_usd: 50,
    cost_usd: 50,
    sale_price_usd: 65,
    payment_method: "Binance Pay / Pago Móvil",
    status: "ACTIVO",
    notes: "",
  });

  const fetchAllAdminData = useCallback(async (adminPin: string) => {
    setIsLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/admin-erp", {
        method: "GET",
        headers: {
          "x-admin-pin": adminPin,
        },
      });

      if (res.status === 401) {
        setIsAuthenticated(false);
        setAuthError("PIN de acceso incorrecto.");
        sessionStorage.removeItem("guipordi_admin_pin");
        return;
      }

      const data = await res.json();
      setLeads(data.leads || []);
      setSales(data.sales || []);
      setRecharges(data.recharges || []);
      setCatalog(data.catalog || []);
      setPaymentMethods(data.paymentMethods || []);
      setOrganicOrders(data.organicOrders || []);
      setPaymentsVault(data.paymentsVault || []);
      setDbWarning(data.dbWarning || null);
      setIsAuthenticated(true);
      sessionStorage.setItem("guipordi_admin_pin", adminPin);
    } catch {
      setAuthError("Error al conectar con el servidor administrativo.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedPin = sessionStorage.getItem("guipordi_admin_pin");
    if (savedPin) {
      setPin(savedPin);
      fetchAllAdminData(savedPin);
    }
  }, [fetchAllAdminData]);

  // ==========================================================================
  // CÁLCULO DE KPIS EJECUTIVOS EN TIEMPO REAL
  // ==========================================================================
  const kpis = useMemo(() => {
    const totalSalesContracted = sales.reduce(
      (acc, s) => acc + Number(s.total_amount_usd || 0),
      0
    );
    const totalSalesCollected = sales.reduce(
      (acc, s) => acc + Number(s.paid_amount_usd || 0),
      0
    );
    const pendingReceivables = Math.max(
      0,
      totalSalesContracted - totalSalesCollected
    );

    const totalRechargesRevenue = recharges.reduce(
      (acc, r) => acc + Number(r.sale_price_usd || 0),
      0
    );
    const totalRechargesCost = recharges.reduce(
      (acc, r) => acc + Number(r.cost_usd || 0),
      0
    );
    const netRechargesProfit = totalRechargesRevenue - totalRechargesCost;

    const validatedOrganicOrders = organicOrders.filter(
      (o) => o.status === "PAGADO_VALIDADO"
    ).length;

    return {
      totalSalesContracted,
      totalCashCollected: totalSalesCollected + totalRechargesRevenue,
      pendingReceivables,
      netRechargesProfit,
      validatedOrganicOrders,
    };
  }, [sales, recharges, organicOrders]);

  // ==========================================================================
  // FUNCIONES PARA ABRIR EL MODAL DE CREACIÓN / EDICIÓN DE CATÁLOGO
  // ==========================================================================
  const openCreateCatalogModal = () => {
    const nextCode = String(catalog.length + 1).padStart(2, "0");
    const initial = { ...EMPTY_CATALOG_FORM, code_id: nextCode };
    setCatalogForm(initial);
    setTagsText(initial.tags.join(", "));
    setArchitectureText(initial.architecture.join("\n"));
    setDeliverablesText(initial.deliverables.join("\n"));
    setShowCatalogModal(true);
  };

  const openEditCatalogModal = (item: CatalogItemRecord) => {
    setCatalogForm({
      ...item,
      demo_url: item.demo_url || "",
      price_usd: Number(item.price_usd || 0),
    });
    setTagsText(Array.isArray(item.tags) ? item.tags.join(", ") : "");
    setArchitectureText(
      Array.isArray(item.architecture) ? item.architecture.join("\n") : ""
    );
    setDeliverablesText(
      Array.isArray(item.deliverables) ? item.deliverables.join("\n") : ""
    );
    setShowCatalogModal(true);
  };

  const handleSaveCatalogItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const parsedTags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const parsedArch = architectureText
      .split("\n")
      .map((a) => a.trim())
      .filter(Boolean);
    const parsedDeliv = deliverablesText
      .split("\n")
      .map((d) => d.trim())
      .filter(Boolean);

    const cleanSlug =
      catalogForm.slug.trim() ||
      catalogForm.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const finalPayload: CatalogItemRecord = {
      ...catalogForm,
      slug: cleanSlug,
      tags: parsedTags,
      architecture: parsedArch,
      deliverables: parsedDeliv,
      price_usd: Number(catalogForm.price_usd || 0),
      demo_url: catalogForm.demo_url?.trim() || "",
    };

    try {
      if (catalogForm.id) {
        // Editar proyecto o producto existente
        const { id, created_at, ...updates } = finalPayload;
        void created_at;
        await fetch("/api/admin-erp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-pin": pin,
          },
          body: JSON.stringify({
            action: "update_record",
            payload: {
              table: "guipordi_catalog_items",
              id,
              updates,
            },
          }),
        });
      } else {
        // Crear nuevo proyecto o producto SaaS
        await fetch("/api/admin-erp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-pin": pin,
          },
          body: JSON.stringify({
            action: "create_catalog_item",
            payload: finalPayload,
          }),
        });
      }

      setShowCatalogModal(false);
      await fetchAllAdminData(pin);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedInitialCatalog = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/admin-erp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-pin": pin,
        },
        body: JSON.stringify({
          action: "seed_initial_catalog",
        }),
      });
      await fetchAllAdminData(pin);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================================================
  // FUNCIONES DE MÉTODOS DE COBRO Y PROBADOR DE CORREOS (GUIPORDI PAY)
  // ==========================================================================
  const openCreatePaymentMethodModal = () => {
    setPaymentMethodForm(EMPTY_PAYMENT_METHOD_FORM);
    setShowPaymentMethodModal(true);
  };

  const openEditPaymentMethodModal = (method: PaymentMethodRecord) => {
    setPaymentMethodForm(method);
    setShowPaymentMethodModal(true);
  };

  const handleSavePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (paymentMethodForm.id) {
        const { id, created_at, ...updates } = paymentMethodForm;
        void created_at;
        await fetch("/api/admin-erp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-pin": pin,
          },
          body: JSON.stringify({
            action: "update_record",
            payload: {
              table: "guipordi_payment_methods",
              id,
              updates,
            },
          }),
        });
      } else {
        await fetch("/api/admin-erp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-pin": pin,
          },
          body: JSON.stringify({
            action: "create_payment_method",
            payload: paymentMethodForm,
          }),
        });
      }
      setShowPaymentMethodModal(false);
      await fetchAllAdminData(pin);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateIncomingEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await fetch("/api/guipordi-pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-pin": pin,
        },
        body: JSON.stringify({
          action: "ingest_email_webhook",
          payload: {
            subject: testEmailSubject,
            bodyText: testEmailBody,
          },
        }),
      });
      await fetchAllAdminData(pin);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================================================
  // ACCIONES CRUD DE VENTAS, RECARGAS Y REGISTROS GENERALES
  // ==========================================================================
  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin-erp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-pin": pin,
        },
        body: JSON.stringify({
          action: "create_system_sale",
          payload: {
            ...saleForm,
            total_amount_usd: Number(saleForm.total_amount_usd),
            paid_amount_usd: Number(saleForm.paid_amount_usd),
          },
        }),
      });
      if (res.ok) {
        setShowNewSaleModal(false);
        setSaleForm({
          client_name: "",
          client_contact: "",
          project_name: "",
          category: "Entorno Digital / E-Commerce",
          total_amount_usd: 0,
          paid_amount_usd: 0,
          payment_method: "Zelle / Binance",
          payment_status: "ABONADO",
          delivery_status: "EN DESARROLLO",
          notes: "",
        });
        await fetchAllAdminData(pin);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin-erp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-pin": pin,
        },
        body: JSON.stringify({
          action: "create_api_recharge",
          payload: {
            ...rechargeForm,
            credits_loaded_usd: Number(rechargeForm.credits_loaded_usd),
            cost_usd: Number(rechargeForm.cost_usd),
            sale_price_usd: Number(rechargeForm.sale_price_usd),
          },
        }),
      });
      if (res.ok) {
        setShowNewRechargeModal(false);
        await fetchAllAdminData(pin);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRecord = async (
    table: string,
    id: string | undefined,
    updates: Record<string, unknown>
  ) => {
    if (!id) return;
    await fetch("/api/admin-erp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-pin": pin,
      },
      body: JSON.stringify({
        action: "update_record",
        payload: { table, id, updates },
      }),
    });
    await fetchAllAdminData(pin);
  };

  const handleDeleteRecord = async (table: string, id: string | undefined) => {
    if (!id) return;
    await fetch("/api/admin-erp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-pin": pin,
      },
      body: JSON.stringify({
        action: "delete_record",
        payload: { table, id },
      }),
    });
    await fetchAllAdminData(pin);
  };

  const handleConvertLeadToSale = (lead: QuoteLeadRecord) => {
    setSaleForm({
      client_name: lead.client_name || "Cliente Web",
      client_contact: lead.client_contact || "",
      project_name: `${lead.environment_type} (${
        lead.business_niche || "Personalizado"
      })`,
      category:
        lead.ai_module !== "Sin integración de IA"
          ? "Entorno Digital + Agente IA"
          : "Entorno Digital / E-Commerce",
      total_amount_usd: Number(lead.estimated_value_usd || 0),
      paid_amount_usd: 0,
      payment_method: "Zelle / Binance",
      payment_status: "PENDIENTE",
      delivery_status: "EN DESARROLLO",
      notes: `IA: ${lead.ai_module} | Recarga API: ${lead.api_recharge} | Redes: ${lead.media_pack}`,
    });
    setActiveTab("sales");
    setShowNewSaleModal(true);
  };

  const cloudflareWorkerSnippet = `// CLOUDFLARE EMAIL WORKER NATIVO — GUIPORDI PAY (100% CÓDIGO PROPIO, CERO TERCEROS)
export default {
  async email(message, env, ctx) {
    const rawEmail = await new Response(message.raw).text();
    const subject = message.headers.get("subject") || "Notificacion de Pago";
    await fetch("${
      typeof window !== "undefined" ? window.location.origin : "https://guipordy.com"
    }/api/guipordi-pay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-guipordi-webhook-secret": "${pin || "2026"}"
      },
      body: JSON.stringify({
        action: "ingest_email_webhook",
        payload: { subject, bodyText: rawEmail }
      })
    });
  }
};`;

  // ==========================================================================
  // PANTALLA DE LOGIN POR PIN
  // ==========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#020406] text-white flex flex-col items-center justify-center p-5 font-sans">
        <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#070b0f] p-6 sm:p-8 shadow-[0_0_80px_rgba(16,185,129,0.12)] space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded border border-emerald-400/50 bg-emerald-400/10 flex items-center justify-center font-black text-lg text-emerald-400">
                G
              </div>
              <div>
                <h1 className="text-lg font-extrabold tracking-tight">
                  GuiporDI ERP & CMS Admin
                </h1>
                <p className="font-mono text-[10px] tracking-[0.25em] text-white/50 uppercase">
                  CATÁLOGO DINÁMICO, VENTAS & GUIPORDI PAY
                </p>
              </div>
            </div>
            <Lock className="w-5 h-5 text-emerald-400" />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchAllAdminData(pin);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block font-mono text-xs text-white/70 mb-1.5">
                Ingresa tu PIN Maestro (`ADMIN_SECRET_PIN`)
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/20 text-center font-mono text-lg tracking-[0.5em] text-white focus:outline-none focus:border-emerald-400"
                autoFocus
              />
            </div>

            {authError && (
              <p className="font-mono text-xs text-rose-400 text-center">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading || !pin.trim()}
              className="w-full py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-mono text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40"
            >
              {isLoading ? "Verificando..." : "Entrar al Centro de Control"}
            </button>
          </form>

          <div className="pt-2 border-t border-white/10 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-mono text-xs text-white/50 hover:text-emerald-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver al Escenario 3D Público</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // FILTRADO DE BÚSQUEDA
  // ==========================================================================
  const q = searchQuery.toLowerCase().trim();

  const filteredCatalog = catalog.filter((item) => {
    const matchesSub =
      catalogSubFilter === "TODOS" ||
      item.catalog_type === catalogSubFilter ||
      item.catalog_type === "AMBOS";
    const matchesQ =
      !q ||
      item.title?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.slug?.toLowerCase().includes(q);
    return matchesSub && matchesQ;
  });

  const filteredLeads = leads.filter(
    (l) =>
      !q ||
      l.client_name?.toLowerCase().includes(q) ||
      l.business_niche?.toLowerCase().includes(q) ||
      l.environment_type?.toLowerCase().includes(q)
  );
  const filteredSales = sales.filter(
    (s) =>
      !q ||
      s.client_name?.toLowerCase().includes(q) ||
      s.project_name?.toLowerCase().includes(q) ||
      s.category?.toLowerCase().includes(q)
  );
  const filteredRecharges = recharges.filter(
    (r) =>
      !q ||
      r.client_name?.toLowerCase().includes(q) ||
      r.provider?.toLowerCase().includes(q) ||
      r.platform_source?.toLowerCase().includes(q)
  );

  return (
    <div className="min-h-screen bg-[#030508] text-white font-sans pb-24">
      {/* HEADER SUPERIOR DEL SISTEMA ADMINISTRATIVO */}
      <header className="sticky top-0 z-30 bg-[#05080c]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-9 h-9 rounded-lg border border-white/20 bg-white/5 hover:border-emerald-400 flex items-center justify-center font-black text-base transition-colors"
              title="Volver a la web pública"
            >
              G
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight">
                  GuiporDI Soluciones — ERP, Catálogo & GuiporDI Pay
                </h1>
                <span className="px-2 py-0.5 rounded bg-emerald-400/15 border border-emerald-400/40 font-mono text-[10px] text-emerald-300">
                  EN VIVO
                </span>
              </div>
              <p className="font-mono text-[10px] text-white/50">
                Edita proyectos, publica demos SaaS, valida pagos orgánicos y
                administra ventas
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => fetchAllAdminData(pin)}
              className="px-3 py-2 rounded-lg border border-white/15 bg-white/5 hover:border-emerald-400 font-mono text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Sincronizar</span>
            </button>

            <button
              onClick={openCreateCatalogModal}
              className="px-3.5 py-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-black font-mono text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Proyecto / Demo SaaS</span>
            </button>

            <button
              onClick={() => setShowNewSaleModal(true)}
              className="px-3 py-2 rounded-lg border border-white/20 bg-white/5 hover:border-emerald-400 text-white font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Venta Manual</span>
            </button>

            <button
              onClick={() => setShowNewRechargeModal(true)}
              className="px-3 py-2 rounded-lg border border-amber-400/40 bg-amber-400/10 hover:bg-amber-400 hover:text-black text-amber-300 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Recarga API</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {dbWarning && (
          <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-4 flex items-start gap-3 font-mono text-xs text-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-300">
                Aviso de Base de Datos (Supabase):
              </p>
              <p className="mt-0.5 text-white/80">{dbWarning}</p>
              <p className="mt-1 text-white/60">
                Asegúrate de haber ejecutado el bloque SQL de la Tarea 1 en el
                SQL Editor de Supabase.
              </p>
            </div>
          </div>
        )}

        {/* TARJETAS DE KPIS FINANCIEROS Y OPERATIVOS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="rounded-xl border border-white/10 bg-[#070b10] p-4 space-y-1">
            <div className="flex items-center justify-between text-white/50 font-mono text-[10px] uppercase">
              <span>Catálogo Activo</span>
              <Layers className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-white">{catalog.length}</p>
            <p className="font-mono text-[10px] text-white/45">
              Portafolio + Mostrador SaaS
            </p>
          </div>

          <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/[0.06] p-4 space-y-1">
            <div className="flex items-center justify-between text-emerald-300 font-mono text-[10px] uppercase">
              <span>Total Recaudado (Caja)</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-emerald-400">
              ${kpis.totalCashCollected.toFixed(2)}
            </p>
            <p className="font-mono text-[10px] text-emerald-200/60">
              Sistemas + GuiporDI Pay + API
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#070b10] p-4 space-y-1">
            <div className="flex items-center justify-between text-white/50 font-mono text-[10px] uppercase">
              <span>Ventas Contratadas</span>
              <ShoppingBag className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-2xl font-black text-white">
              ${kpis.totalSalesContracted.toFixed(2)}
            </p>
            <p className="font-mono text-[10px] text-sky-400">
              Por cobrar: ${kpis.pendingReceivables.toFixed(2)}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#070b10] p-4 space-y-1">
            <div className="flex items-center justify-between text-white/50 font-mono text-[10px] uppercase">
              <span>Órdenes GuiporDI Pay</span>
              <CreditCard className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-white">
              {organicOrders.length}
            </p>
            <p className="font-mono text-[10px] text-emerald-400">
              {kpis.validatedOrganicOrders} pagos auto-validados
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#070b10] p-4 space-y-1">
            <div className="flex items-center justify-between text-white/50 font-mono text-[10px] uppercase">
              <span>Ganancia Neta API</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-amber-400">
              +${kpis.netRechargesProfit.toFixed(2)}
            </p>
            <p className="font-mono text-[10px] text-white/45">
              {leads.length} cotizaciones IA
            </p>
          </div>
        </section>

        {/* BARRA DE PESTAÑAS DEL ADMIN */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <button
              onClick={() => setActiveTab("catalog")}
              className={`px-4 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "catalog"
                  ? "border-emerald-400 bg-emerald-400 text-black font-extrabold"
                  : "border-white/15 bg-white/5 text-white/70 hover:text-white"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>1. Portafolio & Mostrador SaaS ({catalog.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("guipordi_pay")}
              className={`px-4 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "guipordi_pay"
                  ? "border-emerald-400 bg-emerald-400 text-black font-extrabold"
                  : "border-white/15 bg-white/5 text-white/70 hover:text-white"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>2. Pasarela GuiporDI Pay ({organicOrders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("leads")}
              className={`px-4 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "leads"
                  ? "border-emerald-400 bg-emerald-400 text-black font-extrabold"
                  : "border-white/15 bg-white/5 text-white/70 hover:text-white"
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>3. Cotizaciones IA ({leads.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("sales")}
              className={`px-4 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "sales"
                  ? "border-emerald-400 bg-emerald-400 text-black font-extrabold"
                  : "border-white/15 bg-white/5 text-white/70 hover:text-white"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>4. Ventas Sistemas ({sales.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("recharges")}
              className={`px-4 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "recharges"
                  ? "border-emerald-400 bg-emerald-400 text-black font-extrabold"
                  : "border-white/15 bg-white/5 text-white/70 hover:text-white"
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>5. Recargas API ({recharges.length})</span>
            </button>
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar proyecto, cliente, orden..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/15 text-xs text-white placeholder:text-white/35 focus:outline-none focus:border-emerald-400"
            />
          </div>
        </div>

        {/* ===================================================================
            PESTAÑA 1: GESTOR DINÁMICO DE PORTAFOLIO & MOSTRADOR SAAS (EDICIÓN TOTAL)
        =================================================================== */}
        {activeTab === "catalog" && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#070b10] border border-white/15 rounded-2xl p-4">
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                {[
                  { id: "TODOS", label: "Todos los Ítems" },
                  {
                    id: "PORTAFOLIO",
                    label: "Portafolio Clientes (Trabajos Hechos)",
                  },
                  {
                    id: "DEMO_VENTA_SAAS",
                    label: "Mostrador SaaS (Demos a la Venta)",
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() =>
                      setCatalogSubFilter(
                        tab.id as "TODOS" | "PORTAFOLIO" | "DEMO_VENTA_SAAS"
                      )
                    }
                    className={`px-3.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      catalogSubFilter === tab.id
                        ? "border-emerald-400 bg-emerald-400/15 text-emerald-300 font-bold"
                        : "border-white/10 bg-black/40 text-white/60 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleSeedInitialCatalog}
                  className="px-3.5 py-2 rounded-xl border border-emerald-400/40 bg-emerald-400/10 hover:bg-emerald-400 hover:text-black font-mono text-xs text-emerald-300 font-bold flex items-center gap-2 cursor-pointer transition-all"
                  title="Carga los 9 proyectos del carrusel + GuiporDI Pay + Evenpass QR en Supabase para poder editarlos"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>
                    {catalog.length === 0
                      ? "⚡ Cargar los 12 Proyectos Base para Editar"
                      : "Restaurar / Sincronizar Base"}
                  </span>
                </button>

                <button
                  onClick={openCreateCatalogModal}
                  className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-mono text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Nuevo Proyecto / Demo</span>
                </button>
              </div>
            </div>

            {catalog.length === 0 ? (
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/[0.04] p-10 text-center space-y-4">
                <p className="text-base font-extrabold text-white">
                  Tu tabla dinámica de catálogo en Supabase está vacía
                </p>
                <p className="font-mono text-xs text-white/70 max-w-xl mx-auto">
                  Pulsa el botón inferior para importar automáticamente los 9
                  proyectos actuales (TodoMax, Energy KVA, Rapitravel, Apex Hub,
                  etc.) más Evenpass QR y GuiporDI Pay. Así podrás editar sus
                  textos, precios, imágenes y enlaces &ldquo;Míralo en
                  vivo&rdquo; con un clic.
                </p>
                <button
                  onClick={handleSeedInitialCatalog}
                  className="px-6 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-mono text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Cargar los 12 Proyectos Base Ahora</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredCatalog.map((item) => (
                  <div
                    key={item.id || item.slug}
                    className="rounded-2xl border border-white/15 bg-[#070b10] overflow-hidden flex flex-col justify-between hover:border-emerald-400/40 transition-all"
                  >
                    <div>
                      <div className="relative aspect-video w-full bg-black border-b border-white/10 overflow-hidden">
                        <img
                          src={item.desktop_img}
                          alt={item.title}
                          className="w-full h-full object-cover object-top"
                        />
                        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                          <span className="px-2 py-0.5 rounded bg-black/80 border border-white/20 text-white font-bold">
                            #{item.code_id}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded font-bold ${
                              item.catalog_type === "PORTAFOLIO"
                                ? "bg-sky-500/90 text-black"
                                : item.catalog_type === "DEMO_VENTA_SAAS"
                                ? "bg-emerald-400 text-black"
                                : "bg-amber-400 text-black"
                            }`}
                          >
                            {item.catalog_type === "PORTAFOLIO"
                              ? "PORTAFOLIO CLIENTE"
                              : item.catalog_type === "DEMO_VENTA_SAAS"
                              ? "MOSTRADOR SAAS (VENTA)"
                              : "PORTAFOLIO + VENTA SAAS"}
                          </span>
                          {item.in_3d_carousel && (
                            <span className="px-2 py-0.5 rounded bg-purple-500/80 text-white">
                              En Carrusel 3D
                            </span>
                          )}
                        </div>

                        {Number(item.price_usd) > 0 && (
                          <div className="absolute bottom-3 right-3 px-3 py-1 rounded-lg bg-black/85 border border-emerald-400/50 font-mono text-xs font-black text-emerald-400">
                            ${Number(item.price_usd).toFixed(0)} USDT
                          </div>
                        )}
                      </div>

                      <div className="p-5 space-y-2.5">
                        <div className="flex items-center justify-between font-mono text-[10px] text-emerald-400">
                          <span>{item.category}</span>
                          <span>{item.date}</span>
                        </div>

                        <h3 className="text-lg font-extrabold text-white leading-snug">
                          {item.title}
                        </h3>

                        <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>

                        {item.demo_url && (
                          <div className="pt-1">
                            <a
                              href={item.demo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 font-mono text-xs text-emerald-400 hover:underline"
                            >
                              <Globe className="w-3.5 h-3.5" />
                              <span>Míralo en vivo: {item.demo_url}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="px-5 py-3.5 bg-black/50 border-t border-white/10 flex items-center justify-between gap-2 font-mono text-xs">
                      <button
                        onClick={() => openEditCatalogModal(item)}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-400/15 border border-emerald-400/40 hover:bg-emerald-400 hover:text-black text-emerald-300 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar Textos / Imágenes / Link</span>
                      </button>

                      <button
                        onClick={() =>
                          handleDeleteRecord("guipordi_catalog_items", item.id)
                        }
                        className="p-2 rounded-xl border border-white/15 text-white/40 hover:text-rose-400 hover:border-rose-400/40 cursor-pointer"
                        title="Eliminar del catálogo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            PESTAÑA 2: PASARELA ORGÁNICA GUIPORDI PAY & TESORERÍA
        =================================================================== */}
        {activeTab === "guipordi_pay" && (
          <div className="space-y-8">
            {/* SUB-SECCIÓN A: CUENTAS DE COBRO ACTIVAS (BINANCE PAY / ZELLE / PAGO MÓVIL) */}
            <div className="rounded-2xl border border-white/15 bg-[#070b10] p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-400" />
                    <span>
                      Mis Cuentas Receptoras (Binance Pay, Zelle, Pago Móvil)
                    </span>
                  </h2>
                  <p className="font-mono text-xs text-white/55">
                    Estos son los datos que verán tus clientes al comprar un
                    Demo SaaS o Pack en la web.
                  </p>
                </div>
                <button
                  onClick={openCreatePaymentMethodModal}
                  className="px-4 py-2 rounded-xl bg-emerald-400 text-black font-mono text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Método de Cobro</span>
                </button>
              </div>

              {paymentMethods.length === 0 ? (
                <p className="font-mono text-xs text-white/50">
                  Pulsa &ldquo;Agregar Método de Cobro&rdquo; o sincroniza el
                  catálogo base para cargar tus cuentas de Binance Pay y Zelle.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paymentMethods.map((pm) => (
                    <div
                      key={pm.id}
                      className="p-4 rounded-xl border border-white/15 bg-black/50 flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded bg-emerald-400/15 border border-emerald-400/40 font-mono text-[10px] text-emerald-300 font-bold">
                            {pm.method_type}
                          </span>
                          <span className="font-mono text-[10px] text-white/45">
                            {pm.bank_or_network}
                          </span>
                        </div>
                        <h3 className="text-sm font-extrabold text-white pt-1">
                          {pm.label}
                        </h3>
                        <p className="font-mono text-xs text-emerald-400 font-bold">
                          ID / Cuenta: {pm.account_identifier}
                        </p>
                        <p className="font-mono text-[11px] text-white/65">
                          Titular: {pm.account_holder}
                        </p>
                        {pm.instructions && (
                          <p className="text-xs text-white/50 pt-1">
                            {pm.instructions}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10 font-mono text-xs">
                        <button
                          onClick={() => openEditPaymentMethodModal(pm)}
                          className="px-3 py-1.5 rounded-lg border border-white/20 hover:border-emerald-400 text-white/80 hover:text-emerald-400 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar Cuenta</span>
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteRecord(
                              "guipordi_payment_methods",
                              pm.id
                            )
                          }
                          className="p-1.5 rounded-lg border border-white/15 text-white/40 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SUB-SECCIÓN B: ÓRDENES DE COMPRA DIRECTA (CHECKOUT GUIPORDI PAY) */}
            <div className="rounded-2xl border border-white/15 bg-[#070b10] p-5 sm:p-6 space-y-4">
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                Órdenes de Compra Directa en la Web ({organicOrders.length})
              </h2>

              {organicOrders.length === 0 ? (
                <p className="font-mono text-xs text-white/50">
                  Aún no hay órdenes de compra directa. Cuando un visitante
                  compre un Demo SaaS o Pack desde la web, aparecerá aquí con su
                  monto único de validación.
                </p>
              ) : (
                <div className="space-y-3">
                  {organicOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-4 rounded-xl border border-white/15 bg-black/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4 font-mono text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-300 font-bold">
                            {ord.order_code}
                          </span>
                          <span className="text-white font-bold">
                            {ord.item_title}
                          </span>
                          <span className="text-white/50">
                            ({ord.payment_method})
                          </span>
                        </div>
                        <p className="text-white/80">
                          👤 {ord.client_name} • 📱 {ord.client_contact}
                        </p>
                        <p className="text-white/50">
                          Referencia reportada:{" "}
                          <strong className="text-white">
                            {ord.payment_reference || "Esperando reporte"}
                          </strong>
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="px-3 py-2 rounded-lg bg-black border border-white/10 text-right">
                          <p className="text-[10px] text-white/45">
                            Monto Único Asignado
                          </p>
                          <p className="text-sm font-black text-emerald-400">
                            $
                            {Number(ord.unique_validation_amount_usd).toFixed(
                              2
                            )}
                          </p>
                        </div>

                        <select
                          value={ord.status}
                          onChange={(e) =>
                            handleUpdateRecord(
                              "guipordi_organic_orders",
                              ord.id,
                              { status: e.target.value }
                            )
                          }
                          className={`px-3 py-2 rounded-lg border font-bold ${
                            ord.status === "PAGADO_VALIDADO"
                              ? "bg-emerald-400/20 border-emerald-400 text-emerald-300"
                              : "bg-black border-white/20 text-amber-300"
                          }`}
                        >
                          <option value="PENDIENTE_PAGO">PENDIENTE PAGO</option>
                          <option value="VERIFICANDO">VERIFICANDO</option>
                          <option value="PAGADO_VALIDADO">
                            PAGADO Y VALIDADO
                          </option>
                          <option value="REVISION_MANUAL">
                            REVISIÓN MANUAL
                          </option>
                          <option value="ENTREGADO">ENTREGADO</option>
                        </select>

                        <button
                          onClick={() =>
                            handleDeleteRecord(
                              "guipordi_organic_orders",
                              ord.id
                            )
                          }
                          className="p-2 rounded-lg border border-white/15 text-white/40 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SUB-SECCIÓN C: BÓVEDA DE CORREOS ENTRANTES + SIMULADOR + CLOUDFLARE WORKER */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 rounded-2xl border border-white/15 bg-[#070b10] p-5 space-y-4">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <MailCheck className="w-4 h-4 text-emerald-400" />
                  <span>
                    Simulador / Probador de Acuses de Correo (Binance Pay /
                    Zelle)
                  </span>
                </h3>
                <p className="font-mono text-xs text-white/60">
                  Pega aquí el texto de un correo de confirmación de Binance Pay
                  o Zelle para probar cómo el motor RegEx extrae el monto y
                  auto-valida la orden sin usar plataformas de terceros.
                </p>

                <form
                  onSubmit={handleSimulateIncomingEmail}
                  className="space-y-3 font-mono text-xs"
                >
                  <div>
                    <label className="block text-white/60 mb-1">
                      Asunto del Correo (Subject)
                    </label>
                    <input
                      type="text"
                      value={testEmailSubject}
                      onChange={(e) => setTestEmailSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 mb-1">
                      Cuerpo del Correo (Body)
                    </label>
                    <textarea
                      rows={3}
                      value={testEmailBody}
                      onChange={(e) => setTestEmailBody(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold cursor-pointer"
                  >
                    Procesar Correo y Conciliar en Bóveda
                  </button>
                </form>

                <div className="pt-3 border-t border-white/10 space-y-2">
                  <p className="font-mono text-[11px] text-emerald-400 uppercase">
                    Últimos Pagos Detectados en Bóveda ({paymentsVault.length})
                  </p>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {paymentsVault.map((v) => (
                      <div
                        key={v.id}
                        className="p-2.5 rounded-lg bg-black/60 border border-white/10 flex items-center justify-between font-mono text-[11px]"
                      >
                        <div>
                          <span className="text-emerald-400 font-bold">
                            {v.provider}
                          </span>{" "}
                          • Ref: {v.reference_or_order_id}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">
                            ${Number(v.amount_detected).toFixed(2)} {v.currency}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] ${
                              v.status === "CONSUMIDO"
                                ? "bg-emerald-400/20 text-emerald-300"
                                : "bg-amber-400/20 text-amber-300"
                            }`}
                          >
                            {v.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 rounded-2xl border border-white/15 bg-[#070b10] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-white">
                    Conector Nativo Cloudflare Email Worker (Cero Terceros)
                  </h3>
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(
                        cloudflareWorkerSnippet
                      );
                      setCopiedWorkerCode(true);
                      setTimeout(() => setCopiedWorkerCode(false), 2500);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-emerald-400/40 bg-emerald-400/10 text-emerald-300 font-mono text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedWorkerCode ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Worker JS</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="font-mono text-xs text-white/60 leading-relaxed">
                  En tu panel de Cloudflare &rarr; Email Routing &rarr; Email
                  Workers, pega este script de 18 líneas. Cada vez que Binance
                  Pay o Zelle envíe un acuse a tu correo, Cloudflare lo
                  empujará en tiempo real a `/api/guipordi-pay` sin pasar por
                  intermediarios.
                </p>
                <pre className="p-3.5 rounded-xl bg-black border border-white/10 font-mono text-[11px] text-emerald-300 overflow-x-auto leading-relaxed">
                  {cloudflareWorkerSnippet}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            PESTAÑA 3: COTIZACIONES Y LEADS DEL ARQUITECTO IA
        =================================================================== */}
        {activeTab === "leads" && (
          <div className="space-y-4">
            {filteredLeads.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center font-mono text-xs text-white/50">
                No hay cotizaciones registradas todavía. Cuando un visitante use
                el Cotizador IA en la web, aparecerá aquí automáticamente.
              </div>
            ) : (
              filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="rounded-2xl border border-white/15 bg-[#070b10] p-5 space-y-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-base font-extrabold text-white">
                          {lead.client_name || "Visitante Web"}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/15 border border-emerald-400/40 font-mono text-[10px] text-emerald-300">
                          {lead.business_niche || "Rubro General"}
                        </span>
                        {lead.client_contact && (
                          <span className="font-mono text-xs text-white/70">
                            📱 {lead.client_contact}
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-[10px] text-white/40 mt-1">
                        Fecha:{" "}
                        {lead.created_at
                          ? new Date(lead.created_at).toLocaleString()
                          : "Reciente"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                      <select
                        value={lead.status || "NUEVO"}
                        onChange={(e) =>
                          handleUpdateRecord("guipordi_quotes_leads", lead.id, {
                            status: e.target.value,
                          })
                        }
                        className="px-3 py-1.5 rounded-lg bg-black border border-white/20 text-xs text-emerald-400 font-bold"
                      >
                        <option value="NUEVO">NUEVO</option>
                        <option value="CONTACTADO">CONTACTADO</option>
                        <option value="EN NEGOCIACION">EN NEGOCIACIÓN</option>
                        <option value="CERRADO">CERRADO (VENDIDO)</option>
                        <option value="DESCARTADO">DESCARTADO</option>
                      </select>

                      <button
                        onClick={() => handleConvertLeadToSale(lead)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-black font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>Convertir en Venta</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() =>
                          handleDeleteRecord("guipordi_quotes_leads", lead.id)
                        }
                        className="p-1.5 rounded-lg border border-white/15 text-white/40 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
                    <div className="p-3 rounded-xl bg-black/50 border border-white/10">
                      <p className="text-[10px] text-white/45 uppercase">
                        Entorno Digital
                      </p>
                      <p className="text-white font-semibold mt-0.5">
                        {lead.environment_type}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-black/50 border border-white/10">
                      <p className="text-[10px] text-white/45 uppercase">
                        Módulo IA
                      </p>
                      <p className="text-emerald-300 font-semibold mt-0.5">
                        {lead.ai_module}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-black/50 border border-white/10">
                      <p className="text-[10px] text-white/45 uppercase">
                        Recarga Saldo API
                      </p>
                      <p className="text-amber-300 font-semibold mt-0.5">
                        {lead.api_recharge}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-black/50 border border-white/10">
                      <p className="text-[10px] text-white/45 uppercase">
                        Activos Redes
                      </p>
                      <p className="text-sky-300 font-semibold mt-0.5">
                        {lead.media_pack}
                      </p>
                    </div>
                  </div>

                  {lead.ai_recommendation && (
                    <div className="p-3.5 rounded-xl bg-emerald-400/[0.04] border border-emerald-400/20 text-xs text-white/80 leading-relaxed">
                      <p className="font-mono text-[10px] text-emerald-400 uppercase mb-1 flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3" />
                        <span>Propuesta generada por Claude Haiku 4.5:</span>
                      </p>
                      <p className="whitespace-pre-wrap">
                        {lead.ai_recommendation}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ===================================================================
            PESTAÑA 4: LIBRO MAYOR DE VENTAS DE SISTEMAS
        =================================================================== */}
        {activeTab === "sales" && (
          <div className="space-y-4">
            {filteredSales.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center font-mono text-xs text-white/50">
                Aún no hay ventas registradas. Las compras auto-validadas por
                GuiporDI Pay o las que registres manualmente aparecerán aquí.
              </div>
            ) : (
              filteredSales.map((sale) => {
                const pending = Math.max(
                  0,
                  Number(sale.total_amount_usd) - Number(sale.paid_amount_usd)
                );
                return (
                  <div
                    key={sale.id}
                    className="rounded-2xl border border-white/15 bg-[#070b10] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                  >
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-emerald-300">
                          {sale.category}
                        </span>
                        <span className="font-mono text-xs text-white/50">
                          {sale.payment_method}
                        </span>
                      </div>
                      <h3 className="text-lg font-extrabold text-white">
                        {sale.project_name}
                      </h3>
                      <p className="font-mono text-xs text-white/75">
                        👤 Cliente: <strong>{sale.client_name}</strong>{" "}
                        {sale.client_contact ? `(${sale.client_contact})` : ""}
                      </p>
                      {sale.notes && (
                        <p className="font-mono text-[11px] text-white/50 pt-1">
                          Nota: {sale.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 font-mono text-xs">
                      <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-right min-w-[115px]">
                        <p className="text-[10px] text-white/45">Contrato</p>
                        <p className="text-base font-black text-white">
                          ${Number(sale.total_amount_usd).toFixed(2)}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-400/10 border border-emerald-400/30 text-right min-w-[115px]">
                        <p className="text-[10px] text-emerald-300">Cobrado</p>
                        <p className="text-base font-black text-emerald-400">
                          ${Number(sale.paid_amount_usd).toFixed(2)}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-right min-w-[115px]">
                        <p className="text-[10px] text-white/45">Restante</p>
                        <p
                          className={`text-base font-black ${
                            pending > 0 ? "text-amber-400" : "text-white/40"
                          }`}
                        >
                          ${pending.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <select
                          value={sale.payment_status}
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            const updates: Record<string, unknown> = {
                              payment_status: newStatus,
                            };
                            if (newStatus === "PAGADO") {
                              updates.paid_amount_usd = sale.total_amount_usd;
                            }
                            handleUpdateRecord(
                              "guipordi_system_sales",
                              sale.id,
                              updates
                            );
                          }}
                          className="px-3 py-1.5 rounded-lg bg-black border border-white/20 text-xs text-emerald-400 font-bold"
                        >
                          <option value="PAGADO">PAGADO 100%</option>
                          <option value="ABONADO">ABONADO</option>
                          <option value="PENDIENTE">PENDIENTE</option>
                        </select>

                        <select
                          value={sale.delivery_status}
                          onChange={(e) =>
                            handleUpdateRecord(
                              "guipordi_system_sales",
                              sale.id,
                              { delivery_status: e.target.value }
                            )
                          }
                          className="px-3 py-1.5 rounded-lg bg-black border border-white/20 text-xs text-sky-300"
                        >
                          <option value="EN DESARROLLO">EN DESARROLLO</option>
                          <option value="ENTREGADO">ENTREGADO</option>
                          <option value="MANTENIMIENTO">MANTENIMIENTO</option>
                        </select>
                      </div>

                      <button
                        onClick={() =>
                          handleDeleteRecord("guipordi_system_sales", sale.id)
                        }
                        className="p-2 rounded-lg border border-white/15 text-white/40 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ===================================================================
            PESTAÑA 5: CONTROL DE RECARGAS DE SALDO API
        =================================================================== */}
        {activeTab === "recharges" && (
          <div className="space-y-4">
            {filteredRecharges.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center font-mono text-xs text-white/50">
                No hay recargas API registradas todavía.
              </div>
            ) : (
              filteredRecharges.map((rec) => {
                const profit =
                  Number(rec.sale_price_usd) - Number(rec.cost_usd);
                return (
                  <div
                    key={rec.id}
                    className="rounded-2xl border border-white/15 bg-[#070b10] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded bg-amber-400/15 border border-amber-400/40 font-mono text-[10px] text-amber-300 font-bold">
                          {rec.provider}
                        </span>
                        <span className="font-mono text-xs text-white/50">
                          Vía: {rec.platform_source}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-white">
                        Cliente: {rec.client_name}{" "}
                        {rec.client_contact ? `(${rec.client_contact})` : ""}
                      </h3>
                      <p className="font-mono text-[11px] text-white/50">
                        Método: {rec.payment_method}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
                      <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-right">
                        <p className="text-[10px] text-white/45">
                          Créditos API
                        </p>
                        <p className="text-sm font-bold text-white">
                          ${Number(rec.credits_loaded_usd).toFixed(2)}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-right">
                        <p className="text-[10px] text-white/45">Costo</p>
                        <p className="text-sm font-bold text-white/75">
                          ${Number(rec.cost_usd).toFixed(2)}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-right">
                        <p className="text-[10px] text-white/45">Venta</p>
                        <p className="text-sm font-bold text-emerald-400">
                          ${Number(rec.sale_price_usd).toFixed(2)}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-400/10 border border-emerald-400/30 text-right">
                        <p className="text-[10px] text-emerald-300">Ganancia</p>
                        <p className="text-sm font-black text-emerald-400">
                          +${profit.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleDeleteRecord("guipordi_api_recharges", rec.id)
                        }
                        className="p-2 rounded-lg border border-white/15 text-white/40 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* =====================================================================
          MODAL MAESTRO: CREAR O EDITAR PROYECTO / DEMO SAAS (CON LINK EN VIVO E IMÁGENES)
      ===================================================================== */}
      {showCatalogModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <form
            onSubmit={handleSaveCatalogItem}
            className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl border border-white/20 bg-[#070b10] p-5 sm:p-7 space-y-5 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white">
                  {catalogForm.id
                    ? `Editar: ${catalogForm.title}`
                    : "Publicar Nuevo Proyecto de Portafolio o Demo SaaS"}
                </h2>
                <p className="font-mono text-xs text-white/55">
                  Modifica textos, precios, imágenes y el enlace &ldquo;Míralo
                  en vivo&rdquo; en tiempo real.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCatalogModal(false)}
                className="px-3 py-1.5 rounded-lg border border-white/20 text-xs font-mono text-white/70 hover:text-white cursor-pointer"
              >
                Cerrar ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div>
                <label className="block text-emerald-400 mb-1">
                  Ubicación en la Web *
                </label>
                <select
                  value={catalogForm.catalog_type}
                  onChange={(e) =>
                    setCatalogForm({
                      ...catalogForm,
                      catalog_type: e.target.value as CatalogItemType,
                    })
                  }
                  className="w-full px-3 py-2.5 rounded-lg bg-black border border-white/20 text-white font-bold"
                >
                  <option value="PORTAFOLIO">
                    Solo Portafolio (Trabajo de Cliente)
                  </option>
                  <option value="DEMO_VENTA_SAAS">
                    Solo Mostrador SaaS (Producto en Venta)
                  </option>
                  <option value="AMBOS">
                    Ambos (Portafolio + Mostrador de Venta)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-white/60 mb-1">
                  Categoría del Filtro
                </label>
                <select
                  value={catalogForm.category}
                  onChange={(e) =>
                    setCatalogForm({ ...catalogForm, category: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-lg bg-black border border-white/20 text-white"
                >
                  <option value="E-Commerce">E-Commerce</option>
                  <option value="Apps & SaaS">Apps & SaaS</option>
                  <option value="IA & Cloud">IA & Cloud</option>
                </select>
              </div>

              <div>
                <label className="block text-white/60 mb-1">
                  Número (#01, #10...) y Fecha
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={catalogForm.code_id}
                    onChange={(e) =>
                      setCatalogForm({
                        ...catalogForm,
                        code_id: e.target.value,
                      })
                    }
                    placeholder="01"
                    className="px-3 py-2 rounded-lg bg-black border border-white/20 text-white"
                  />
                  <input
                    type="text"
                    value={catalogForm.date}
                    onChange={(e) =>
                      setCatalogForm({ ...catalogForm, date: e.target.value })
                    }
                    placeholder="2026.11"
                    className="px-3 py-2 rounded-lg bg-black border border-white/20 text-white"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-white/60 mb-1">
                  Título Principal del Proyecto o Producto SaaS *
                </label>
                <input
                  required
                  type="text"
                  value={catalogForm.title}
                  onChange={(e) =>
                    setCatalogForm({ ...catalogForm, title: e.target.value })
                  }
                  placeholder="Ej. Importadora TodoMax — Plataforma E-Commerce & Admin"
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/20 text-white"
                />
              </div>

              <div>
                <label className="block text-white/60 mb-1">
                  Identificador URL (Slug)
                </label>
                <input
                  type="text"
                  value={catalogForm.slug}
                  onChange={(e) =>
                    setCatalogForm({ ...catalogForm, slug: e.target.value })
                  }
                  placeholder="ej. todomax"
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/20 text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-white/60 mb-1">
                  Subtítulo Técnico
                </label>
                <input
                  type="text"
                  value={catalogForm.subtitle}
                  onChange={(e) =>
                    setCatalogForm({ ...catalogForm, subtitle: e.target.value })
                  }
                  placeholder="IMPORTADORA TODOMAX / SISTEMA MAESTRO DE COMERCIO"
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/20 text-white"
                />
              </div>

              <div>
                <label className="block text-white/60 mb-1">
                  Cintillo Destacado (Badge Verde)
                </label>
                <input
                  type="text"
                  value={catalogForm.highlight_badge}
                  onChange={(e) =>
                    setCatalogForm({
                      ...catalogForm,
                      highlight_badge: e.target.value,
                    })
                  }
                  placeholder="E-Commerce Mayorista & Detal con Redis"
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/20 text-white"
                />
              </div>

              {/* ENLACE "MÍRALO EN VIVO" Y PRECIO DE VENTA */}
              <div className="sm:col-span-2 p-3.5 rounded-xl bg-emerald-400/[0.06] border border-emerald-400/30">
                <label className="flex items-center gap-1.5 text-emerald-300 font-bold mb-1">
                  <Globe className="w-3.5 h-3.5" />
                  <span>
                    Enlace &ldquo;Míralo en Vivo&rdquo; (URL del Cliente o Demo
                    Interactivo)
                  </span>
                </label>
                <input
                  type="url"
                  value={catalogForm.demo_url || ""}
                  onChange={(e) =>
                    setCatalogForm({ ...catalogForm, demo_url: e.target.value })
                  }
                  placeholder="https://importadoratodomax.com  o  https://energykva.com"
                  className="w-full px-3 py-2 rounded-lg bg-black border border-emerald-400/40 text-white placeholder:text-white/35"
                />
                <p className="text-[10px] text-white/55 mt-1">
                  Si colocas un enlace aquí, aparecerá el botón &ldquo;Míralo en
                  vivo ↗&rdquo; en la web para que el visitante abra la página
                  real.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/15">
                <label className="block text-emerald-300 font-bold mb-1">
                  Precio en Mostrador (USDT)
                </label>
                <input
                  type="number"
                  step="1"
                  value={catalogForm.price_usd}
                  onChange={(e) =>
                    setCatalogForm({
                      ...catalogForm,
                      price_usd: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/20 text-white font-bold"
                />
                <input
                  type="text"
                  value={catalogForm.billing_type}
                  onChange={(e) =>
                    setCatalogForm({
                      ...catalogForm,
                      billing_type: e.target.value,
                    })
                  }
                  placeholder="Licencia Marca Blanca"
                  className="w-full mt-2 px-2.5 py-1.5 rounded bg-black border border-white/15 text-[10px] text-white/80"
                />
              </div>

              {/* RUTAS O URLS DE LAS 3 IMÁGENES */}
              <div className="sm:col-span-3 p-4 rounded-xl bg-black/60 border border-white/15 space-y-3">
                <p className="text-emerald-400 font-bold flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  <span>
                    Imágenes del Proyecto (Puedes usar rutas de `/projects/...`
                    o URLs externas `https://...`)
                  </span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-white/55 mb-1">
                      1. Imagen Ordenador (1920x1080)
                    </label>
                    <input
                      type="text"
                      value={catalogForm.desktop_img}
                      onChange={(e) =>
                        setCatalogForm({
                          ...catalogForm,
                          desktop_img: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-black border border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-white/55 mb-1">
                      2. Tarjeta Carrusel Móvil (1080x1425)
                    </label>
                    <input
                      type="text"
                      value={catalogForm.mobile_img}
                      onChange={(e) =>
                        setCatalogForm({
                          ...catalogForm,
                          mobile_img: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-black border border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-white/55 mb-1">
                      3. Modal Detalle Móvil MD (1080x1920)
                    </label>
                    <input
                      type="text"
                      value={catalogForm.modal_mobile_img}
                      onChange={(e) =>
                        setCatalogForm({
                          ...catalogForm,
                          modal_mobile_img: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-black border border-white/20 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-white/60 mb-1">
                  Descripción General del Proyecto *
                </label>
                <textarea
                  rows={3}
                  value={catalogForm.description}
                  onChange={(e) =>
                    setCatalogForm({
                      ...catalogForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/20 text-white leading-relaxed"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-white/60 mb-1">
                  Etiquetas / Tecnologías (Separadas por coma)
                </label>
                <input
                  type="text"
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  placeholder="Next.js, Supabase, Redis Cache, IA"
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/20 text-white"
                />
              </div>

              <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 mb-1">
                    Viñetas de Ingeniería & Arquitectura (1 por línea)
                  </label>
                  <textarea
                    rows={4}
                    value={architectureText}
                    onChange={(e) => setArchitectureText(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black border border-white/20 text-white leading-relaxed"
                  />
                </div>
                <div>
                  <label className="block text-emerald-400 mb-1">
                    ¿Qué incluye al comprar este Demo SaaS? (1 entregable por
                    línea)
                  </label>
                  <textarea
                    rows={4}
                    value={deliverablesText}
                    onChange={(e) => setDeliverablesText(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black border border-white/20 text-white leading-relaxed"
                  />
                </div>
              </div>

              <div className="sm:col-span-3 flex flex-wrap items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(catalogForm.in_3d_carousel)}
                    onChange={(e) =>
                      setCatalogForm({
                        ...catalogForm,
                        in_3d_carousel: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-emerald-400"
                  />
                  <span className="text-white">
                    Mostrar también en el Carrusel Curvo 3D Principal
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/15 font-mono text-xs">
              <button
                type="button"
                onClick={() => setShowCatalogModal(false)}
                className="px-4 py-2.5 rounded-xl border border-white/20 text-white/70 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {catalogForm.id
                    ? "Guardar Cambios en Vivo"
                    : "Publicar en Catálogo"}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================================
          MODAL: CREAR O EDITAR MÉTODO DE COBRO (BINANCE PAY / ZELLE / PAGO MÓVIL)
      ===================================================================== */}
      {showPaymentMethodModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleSavePaymentMethod}
            className="w-full max-w-lg rounded-2xl border border-white/20 bg-[#070b10] p-6 space-y-4 font-mono text-xs"
          >
            <h2 className="text-base font-extrabold text-white">
              {paymentMethodForm.id
                ? "Editar Cuenta de Cobro"
                : "Agregar Cuenta de Cobro (GuiporDI Pay)"}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-white/60 mb-1">
                  Tipo de Pasarela
                </label>
                <select
                  value={paymentMethodForm.method_type}
                  onChange={(e) =>
                    setPaymentMethodForm({
                      ...paymentMethodForm,
                      method_type: e.target
                        .value as PaymentMethodRecord["method_type"],
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/20 text-white"
                >
                  <option value="BINANCE_PAY">BINANCE PAY (USDT)</option>
                  <option value="ZELLE">ZELLE (USD)</option>
                  <option value="PAGO_MOVIL">PAGO MÓVIL (BS)</option>
                  <option value="TRANSFERENCIA">TRANSFERENCIA BANCARIA</option>
                </select>
              </div>
              <div>
                <label className="block text-white/60 mb-1">
                  Título Visible para el Cliente *
                </label>
                <input
                  required
                  type="text"
                  value={paymentMethodForm.label}
                  onChange={(e) =>
                    setPaymentMethodForm({
                      ...paymentMethodForm,
                      label: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/20 text-white"
                />
              </div>
              <div>
                <label className="block text-emerald-400 font-bold mb-1">
                  Pay ID / Correo Zelle / Teléfono y Cédula *
                </label>
                <input
                  required
                  type="text"
                  value={paymentMethodForm.account_identifier}
                  onChange={(e) =>
                    setPaymentMethodForm({
                      ...paymentMethodForm,
                      account_identifier: e.target.value,
                    })
                  }
                  placeholder="Ej. Pay ID: 123456789 o correo@gmail.com"
                  className="w-full px-3 py-2 rounded-lg bg-black border border-emerald-400/40 text-white"
                />
              </div>
              <div>
                <label className="block text-white/60 mb-1">
                  Nombre del Titular
                </label>
                <input
                  type="text"
                  value={paymentMethodForm.account_holder}
                  onChange={(e) =>
                    setPaymentMethodForm({
                      ...paymentMethodForm,
                      account_holder: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/20 text-white"
                />
              </div>
              <div>
                <label className="block text-white/60 mb-1">
                  Instrucciones al Pagar
                </label>
                <textarea
                  rows={2}
                  value={paymentMethodForm.instructions || ""}
                  onChange={(e) =>
                    setPaymentMethodForm({
                      ...paymentMethodForm,
                      instructions: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/20 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowPaymentMethodModal(false)}
                className="px-4 py-2 rounded-xl border border-white/20 text-white/70 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-400 text-black font-extrabold cursor-pointer"
              >
                Guardar Cuenta
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: NUEVA VENTA MANUAL */}
      {showNewSaleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSale}
            className="w-full max-w-xl rounded-2xl border border-white/20 bg-[#070b10] p-6 space-y-4 font-mono text-xs"
          >
            <h2 className="text-lg font-extrabold text-white">
              Registrar Venta de Sistema / Entorno Digital
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-white/60 mb-1">
                  Nombre del Cliente *
                </label>
                <input
                  required
                  type="text"
                  value={saleForm.client_name}
                  onChange={(e) =>
                    setSaleForm({ ...saleForm, client_name: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                />
              </div>
              <div>
                <label className="block text-white/60 mb-1">
                  WhatsApp / Contacto
                </label>
                <input
                  type="text"
                  value={saleForm.client_contact}
                  onChange={(e) =>
                    setSaleForm({ ...saleForm, client_contact: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-white/60 mb-1">
                  Proyecto / Sistema Vendido *
                </label>
                <input
                  required
                  type="text"
                  value={saleForm.project_name}
                  onChange={(e) =>
                    setSaleForm({ ...saleForm, project_name: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                />
              </div>
              <div>
                <label className="block text-white/60 mb-1">
                  Monto Total Contrato (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={saleForm.total_amount_usd}
                  onChange={(e) =>
                    setSaleForm({
                      ...saleForm,
                      total_amount_usd: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                />
              </div>
              <div>
                <label className="block text-white/60 mb-1">
                  Monto Cobrado (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={saleForm.paid_amount_usd}
                  onChange={(e) =>
                    setSaleForm({
                      ...saleForm,
                      paid_amount_usd: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowNewSaleModal(false)}
                className="px-4 py-2 rounded-xl border border-white/20 text-white/70 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-400 text-black font-extrabold cursor-pointer"
              >
                Guardar Venta
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: NUEVA RECARGA API */}
      {showNewRechargeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateRecharge}
            className="w-full max-w-xl rounded-2xl border border-white/20 bg-[#070b10] p-6 space-y-4 font-mono text-xs"
          >
            <h2 className="text-lg font-extrabold text-white">
              Registrar Recarga de Saldo API
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-white/60 mb-1">Cliente *</label>
                <input
                  required
                  type="text"
                  value={rechargeForm.client_name}
                  onChange={(e) =>
                    setRechargeForm({
                      ...rechargeForm,
                      client_name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                />
              </div>
              <div>
                <label className="block text-white/60 mb-1">Proveedor IA</label>
                <input
                  type="text"
                  value={rechargeForm.provider}
                  onChange={(e) =>
                    setRechargeForm({
                      ...rechargeForm,
                      provider: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                />
              </div>
              <div>
                <label className="block text-white/60 mb-1">
                  Tu Costo Base (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={rechargeForm.cost_usd}
                  onChange={(e) =>
                    setRechargeForm({
                      ...rechargeForm,
                      cost_usd: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                />
              </div>
              <div>
                <label className="block text-white/60 mb-1">
                  Precio Cobrado (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={rechargeForm.sale_price_usd}
                  onChange={(e) =>
                    setRechargeForm({
                      ...rechargeForm,
                      sale_price_usd: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowNewRechargeModal(false)}
                className="px-4 py-2 rounded-xl border border-white/20 text-white/70 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-400 text-black font-extrabold cursor-pointer"
              >
                Guardar Recarga
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}