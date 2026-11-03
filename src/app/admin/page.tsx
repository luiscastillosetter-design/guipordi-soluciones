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
} from "lucide-react";
import {
  QuoteLeadRecord,
  SystemSaleRecord,
  ApiRechargeRecord,
} from "@/lib/supabase";

type AdminTab = "leads" | "sales" | "recharges";

export default function GuiporDIAdminPage() {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dbWarning, setDbWarning] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<AdminTab>("leads");
  const [searchQuery, setSearchQuery] = useState("");

  // Datos de las 3 tablas en Supabase
  const [leads, setLeads] = useState<QuoteLeadRecord[]>([]);
  const [sales, setSales] = useState<SystemSaleRecord[]>([]);
  const [recharges, setRecharges] = useState<ApiRechargeRecord[]>([]);

  // Modales de creación
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [showNewRechargeModal, setShowNewRechargeModal] = useState(false);

  // Estado formulario Nueva Venta de Sistema
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

  // Estado formulario Nueva Recarga de Saldo API
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

    const newLeadsCount = leads.filter((l) => l.status === "NUEVO").length;

    return {
      totalSalesContracted,
      totalCashCollected: totalSalesCollected + totalRechargesRevenue,
      pendingReceivables,
      netRechargesProfit,
      newLeadsCount,
    };
  }, [leads, sales, recharges]);

  // ==========================================================================
  // ACCIONES CRUD CONTRA /api/admin-erp
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
        setRechargeForm({
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
        await fetchAllAdminData(pin);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRecord = async (
    table:
      | "guipordi_quotes_leads"
      | "guipordi_system_sales"
      | "guipordi_api_recharges",
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

  const handleDeleteRecord = async (
    table:
      | "guipordi_quotes_leads"
      | "guipordi_system_sales"
      | "guipordi_api_recharges",
    id: string | undefined
  ) => {
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

  // Convierte un Lead del Cotizador IA en una Venta de Sistema con 1 clic
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
                  GuiporDI ERP Admin
                </h1>
                <p className="font-mono text-[10px] tracking-[0.25em] text-white/50 uppercase">
                  CONTROL DE VENTAS & LIQUIDEZ IA
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
    <div className="min-h-screen bg-[#030508] text-white font-sans pb-20">
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
                  GuiporDI Soluciones — ERP & Admin
                </h1>
                <span className="px-2 py-0.5 rounded bg-emerald-400/15 border border-emerald-400/40 font-mono text-[10px] text-emerald-300">
                  EN VIVO
                </span>
              </div>
              <p className="font-mono text-[10px] text-white/50">
                Gestión de Entornos Digitales, Agentes IA y Liquidez API
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
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
              onClick={() => setShowNewSaleModal(true)}
              className="px-3.5 py-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-black font-mono text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Venta</span>
            </button>

            <button
              onClick={() => setShowNewRechargeModal(true)}
              className="px-3.5 py-2 rounded-lg border border-emerald-400/50 bg-emerald-400/10 hover:bg-emerald-400 hover:text-black text-emerald-300 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Recarga API</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* AVISO SI FALTA CONFIGURAR SUPABASE */}
        {dbWarning && (
          <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-4 flex items-start gap-3 font-mono text-xs text-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-300">
                Aviso de Conexión a Base de Datos:
              </p>
              <p className="mt-0.5 text-white/80">{dbWarning}</p>
              <p className="mt-1 text-white/60">
                Verifica que hayas agregado `NEXT_PUBLIC_SUPABASE_URL` y
                `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local` y en Vercel.
              </p>
            </div>
          </div>
        )}

        {/* TARJETAS DE KPIS FINANCIEROS Y OPERATIVOS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="rounded-xl border border-white/10 bg-[#070b10] p-4 space-y-1">
            <div className="flex items-center justify-between text-white/50 font-mono text-[10px] uppercase">
              <span>Ventas Contratadas</span>
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-white">
              ${kpis.totalSalesContracted.toFixed(2)}
            </p>
            <p className="font-mono text-[10px] text-white/45">
              {sales.length} sistemas registrados
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
              Sistemas + Recargas API
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#070b10] p-4 space-y-1">
            <div className="flex items-center justify-between text-white/50 font-mono text-[10px] uppercase">
              <span>Por Cobrar (Abonos)</span>
              <TrendingUp className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-2xl font-black text-sky-400">
              ${kpis.pendingReceivables.toFixed(2)}
            </p>
            <p className="font-mono text-[10px] text-white/45">
              Saldo pendiente clientes
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
              {recharges.length} recargas Anthropic/GPT
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#070b10] p-4 space-y-1">
            <div className="flex items-center justify-between text-white/50 font-mono text-[10px] uppercase">
              <span>Cotizaciones IA Web</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-white">{leads.length}</p>
            <p className="font-mono text-[10px] text-emerald-400">
              {kpis.newLeadsCount} nuevos por atender
            </p>
          </div>
        </section>

        {/* BARRA DE PESTAÑAS Y BUSCADOR */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <button
              onClick={() => setActiveTab("leads")}
              className={`px-4 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "leads"
                  ? "border-emerald-400 bg-emerald-400 text-black font-extrabold"
                  : "border-white/15 bg-white/5 text-white/70 hover:text-white"
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>1. Cotizaciones IA ({leads.length})</span>
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
              <span>2. Ventas de Sistemas ({sales.length})</span>
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
              <span>3. Recargas Saldo API ({recharges.length})</span>
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar cliente, rubro, sistema..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/15 text-xs text-white placeholder:text-white/35 focus:outline-none focus:border-emerald-400"
            />
          </div>
        </div>

        {/* ===================================================================
            PESTAÑA 1: COTIZACIONES Y LEADS DEL ARQUITECTO IA
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
                  className="rounded-2xl border border-white/15 bg-[#070b10] p-5 space-y-4 hover:border-white/30 transition-all"
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
                        className="px-3 py-1.5 rounded-lg bg-black border border-white/20 text-xs text-emerald-400 font-bold focus:outline-none"
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
                        title="Pasar este cliente al libro de Ventas de Sistemas"
                      >
                        <span>Convertir en Venta</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() =>
                          handleDeleteRecord("guipordi_quotes_leads", lead.id)
                        }
                        className="p-1.5 rounded-lg border border-white/15 text-white/40 hover:text-rose-400 hover:border-rose-400/40 cursor-pointer"
                        title="Eliminar cotización"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Módulos elegidos por el cliente */}
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
                        Módulo IA (Jarvis/Sofía)
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
                        Activos Redes (Video/Img)
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
            PESTAÑA 2: LIBRO MAYOR DE VENTAS DE SISTEMAS, ENTORNOS Y BOTS
        =================================================================== */}
        {activeTab === "sales" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setShowNewSaleModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-400 text-black font-mono text-xs font-extrabold flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Venta de Sistema / Entorno</span>
              </button>
            </div>

            {filteredSales.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center font-mono text-xs text-white/50">
                Aún no has registrado ventas en esta tabla. Pulsa &ldquo;Nueva
                Venta&rdquo; para cargar tus proyectos activos.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredSales.map((sale) => {
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
                          {sale.client_contact
                            ? `(${sale.client_contact})`
                            : ""}
                        </p>
                        {sale.notes && (
                          <p className="font-mono text-[11px] text-white/50 pt-1">
                            Nota: {sale.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 font-mono text-xs">
                        <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-right min-w-[120px]">
                          <p className="text-[10px] text-white/45">
                            Total Contrato
                          </p>
                          <p className="text-base font-black text-white">
                            ${Number(sale.total_amount_usd).toFixed(2)}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-emerald-400/10 border border-emerald-400/30 text-right min-w-[120px]">
                          <p className="text-[10px] text-emerald-300">
                            Cobrado
                          </p>
                          <p className="text-base font-black text-emerald-400">
                            ${Number(sale.paid_amount_usd).toFixed(2)}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-right min-w-[120px]">
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
                          className="p-2 rounded-lg border border-white/15 text-white/40 hover:text-rose-400 hover:border-rose-400/40 cursor-pointer"
                          title="Eliminar venta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            PESTAÑA 3: CONTROL DE RECARGAS DE SALDO API (ANTHROPIC / OPENAI)
        =================================================================== */}
        {activeTab === "recharges" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setShowNewRechargeModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-400 text-black font-mono text-xs font-extrabold flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Recarga de Saldo API</span>
              </button>
            </div>

            {filteredRecharges.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center font-mono text-xs text-white/50">
                No hay recargas de saldo API registradas. Pulsa &ldquo;Registrar
                Recarga de Saldo API&rdquo; para llevar el control de tus
                clientes de Anthropic Claude y OpenAI.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredRecharges.map((rec) => {
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
                          Método: {rec.payment_method}{" "}
                          {rec.notes ? `• ${rec.notes}` : ""}
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
                          <p className="text-[10px] text-white/45">Tu Costo</p>
                          <p className="text-sm font-bold text-white/75">
                            ${Number(rec.cost_usd).toFixed(2)}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-right">
                          <p className="text-[10px] text-white/45">
                            Precio Venta
                          </p>
                          <p className="text-sm font-bold text-emerald-400">
                            ${Number(rec.sale_price_usd).toFixed(2)}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-emerald-400/10 border border-emerald-400/30 text-right">
                          <p className="text-[10px] text-emerald-300">
                            Ganancia
                          </p>
                          <p className="text-sm font-black text-emerald-400">
                            +${profit.toFixed(2)}
                          </p>
                        </div>

                        <select
                          value={rec.status}
                          onChange={(e) =>
                            handleUpdateRecord(
                              "guipordi_api_recharges",
                              rec.id,
                              { status: e.target.value }
                            )
                          }
                          className="px-3 py-2 rounded-lg bg-black border border-white/20 text-xs text-emerald-400 font-bold"
                        >
                          <option value="ACTIVO">ACTIVO</option>
                          <option value="CONSUMIDO">CONSUMIDO</option>
                          <option value="PENDIENTE">PENDIENTE</option>
                        </select>

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
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* =====================================================================
          MODAL 1: REGISTRAR NUEVA VENTA DE SISTEMA / ENTORNO / BOT
      ===================================================================== */}
      {showNewSaleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSale}
            className="w-full max-w-xl rounded-2xl border border-white/20 bg-[#070b10] p-6 space-y-4"
          >
            <h2 className="text-lg font-extrabold text-white">
              Registrar Venta de Sistema / Entorno Digital
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
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
                  Nombre del Proyecto / Sistema Vendido *
                </label>
                <input
                  required
                  type="text"
                  value={saleForm.project_name}
                  onChange={(e) =>
                    setSaleForm({ ...saleForm, project_name: e.target.value })
                  }
                  placeholder="Ej. E-Commerce Ferretería + Bot Sofía"
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                />
              </div>
              <div>
                <label className="block text-white/60 mb-1">Categoría</label>
                <select
                  value={saleForm.category}
                  onChange={(e) =>
                    setSaleForm({ ...saleForm, category: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                >
                  <option value="Entorno Digital / E-Commerce">
                    Entorno Digital / E-Commerce
                  </option>
                  <option value="Entorno Digital + Agente IA">
                    Entorno Digital + Agente IA
                  </option>
                  <option value="Agente IA (Jarvis / Sofía)">
                    Agente IA (Jarvis / Sofía)
                  </option>
                  <option value="App Móvil / SaaS a Medida">
                    App Móvil / SaaS a Medida
                  </option>
                  <option value="Pack Videos / Imágenes Redes">
                    Pack Videos / Imágenes Redes
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-white/60 mb-1">
                  Método de Pago
                </label>
                <input
                  type="text"
                  value={saleForm.payment_method}
                  onChange={(e) =>
                    setSaleForm({ ...saleForm, payment_method: e.target.value })
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
                  Monto Cobrado / Abonado (USD)
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
              <div className="sm:col-span-2">
                <label className="block text-white/60 mb-1">
                  Notas Técnicas / Detalles
                </label>
                <input
                  type="text"
                  value={saleForm.notes}
                  onChange={(e) =>
                    setSaleForm({ ...saleForm, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 font-mono text-xs">
              <button
                type="button"
                onClick={() => setShowNewSaleModal(false)}
                className="px-4 py-2 rounded-xl border border-white/20 text-white/70 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-400 text-black font-extrabold cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Guardar Venta</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: REGISTRAR NUEVA RECARGA DE SALDO API (ANTHROPIC / OPENAI)
      ===================================================================== */}
      {showNewRechargeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateRecharge}
            className="w-full max-w-xl rounded-2xl border border-white/20 bg-[#070b10] p-6 space-y-4"
          >
            <h2 className="text-lg font-extrabold text-white">
              Registrar Recarga de Saldo API (Anthropic / OpenAI)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <label className="block text-white/60 mb-1">
                  Cliente / Desarrollador *
                </label>
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
                <label className="block text-white/60 mb-1">
                  WhatsApp / Contacto
                </label>
                <input
                  type="text"
                  value={rechargeForm.client_contact}
                  onChange={(e) =>
                    setRechargeForm({
                      ...rechargeForm,
                      client_contact: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                />
              </div>
              <div>
                <label className="block text-white/60 mb-1">
                  Proveedor de IA
                </label>
                <select
                  value={rechargeForm.provider}
                  onChange={(e) =>
                    setRechargeForm({
                      ...rechargeForm,
                      provider: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                >
                  <option value="Anthropic (Claude API)">
                    Anthropic (Claude API)
                  </option>
                  <option value="OpenAI (ChatGPT API)">
                    OpenAI (ChatGPT API)
                  </option>
                  <option value="Pool Multi-Modelo (Claude + GPT)">
                    Pool Multi-Modelo (Claude + GPT)
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-white/60 mb-1">
                  Plataforma Proveedora (Mayorista)
                </label>
                <input
                  type="text"
                  value={rechargeForm.platform_source}
                  onChange={(e) =>
                    setRechargeForm({
                      ...rechargeForm,
                      platform_source: e.target.value,
                    })
                  }
                  placeholder="OpenRouter / Codedhub / Shofapro"
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                />
              </div>
              <div>
                <label className="block text-white/60 mb-1">
                  Créditos Cargados (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={rechargeForm.credits_loaded_usd}
                  onChange={(e) =>
                    setRechargeForm({
                      ...rechargeForm,
                      credits_loaded_usd: Number(e.target.value),
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
                  Precio Cobrado al Cliente (USD)
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
              <div>
                <label className="block text-white/60 mb-1">
                  Método de Pago
                </label>
                <input
                  type="text"
                  value={rechargeForm.payment_method}
                  onChange={(e) =>
                    setRechargeForm({
                      ...rechargeForm,
                      payment_method: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 font-mono text-xs">
              <button
                type="button"
                onClick={() => setShowNewRechargeModal(false)}
                className="px-4 py-2 rounded-xl border border-white/20 text-white/70 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-400 text-black font-extrabold cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Guardar Recarga API</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}