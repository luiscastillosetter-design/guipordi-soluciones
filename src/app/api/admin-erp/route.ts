import { NextRequest, NextResponse } from "next/server";
import {
  supabaseRestRequest,
  QuoteLeadRecord,
  SystemSaleRecord,
  ApiRechargeRecord,
  CatalogItemRecord,
  PaymentMethodRecord,
  OrganicOrderRecord,
  IncomingPaymentVaultRecord,
} from "@/lib/supabase";
import {
  ALL_INITIAL_CATALOG,
  mapDbRecordToProjectItem,
} from "@/data/projects";

function isAuthorizedAdmin(req: NextRequest): boolean {
  const pinHeader = req.headers.get("x-admin-pin") || "";
  const expectedPin = process.env.ADMIN_SECRET_PIN || "2026";
  return pinHeader === expectedPin;
}

const DEFAULT_PAYMENT_METHODS: PaymentMethodRecord[] = [
  {
    method_type: "BINANCE_PAY",
    label: "Binance Pay (USDT - Instantáneo 0% Comisión)",
    account_holder: "Luis Antonio Castillo / GuiporDI Soluciones",
    account_identifier: "solicitar-pay-id-o-correo@guipordy.com",
    bank_or_network: "Binance Pay / Red USDT",
    instructions:
      "Envía el monto exacto con los céntimos únicos indicados en tu orden y coloca el Order ID o los últimos 6 dígitos de la transacción.",
    is_active: true,
  },
  {
    method_type: "ZELLE",
    label: "Zelle (USD Directo)",
    account_holder: "GuiporDI Soluciones",
    account_identifier: "pagos@guipordy.com",
    bank_or_network: "Zelle USA",
    instructions:
      "Transfiere el monto exacto indicado en tu orden y escribe el código de confirmación de Zelle para validación automática.",
    is_active: true,
  },
];

// ============================================================================
// GET: MODO PÚBLICO (CATÁLOGO DINÁMICO + MÉTODOS DE PAGO) O MODO ADMIN COMPLETO
// ============================================================================
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode");

  // 1. Modo Público: Alimenta el Front-End con el Catálogo Dinámico y Métodos de Cobro
  if (mode === "public_catalog") {
    const [catalogRes, methodsRes] = await Promise.all([
      supabaseRestRequest<CatalogItemRecord[]>("guipordi_catalog_items", {
        query: "select=*&is_active=eq.true&order=code_id.asc",
      }),
      supabaseRestRequest<PaymentMethodRecord[]>("guipordi_payment_methods", {
        query: "select=*&is_active=eq.true&order=created_at.asc",
      }),
    ]);

    const dynamicCatalog =
      catalogRes.data && catalogRes.data.length > 0
        ? catalogRes.data.map(mapDbRecordToProjectItem)
        : ALL_INITIAL_CATALOG;

    const activePaymentMethods =
      methodsRes.data && methodsRes.data.length > 0
        ? methodsRes.data
        : DEFAULT_PAYMENT_METHODS;

    return NextResponse.json({
      catalog: dynamicCatalog,
      paymentMethods: activePaymentMethods,
      source:
        catalogRes.data && catalogRes.data.length > 0
          ? "supabase_dynamic"
          : "static_fallback",
    });
  }

  // 2. Modo Privado Admin (/admin): Requiere PIN Maestro
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json(
      { error: "PIN de administrador inválido o no autorizado." },
      { status: 401 }
    );
  }

  const [
    leadsRes,
    salesRes,
    rechargesRes,
    catalogRes,
    methodsRes,
    ordersRes,
    vaultRes,
  ] = await Promise.all([
    supabaseRestRequest<QuoteLeadRecord[]>("guipordi_quotes_leads", {
      query: "select=*&order=created_at.desc",
    }),
    supabaseRestRequest<SystemSaleRecord[]>("guipordi_system_sales", {
      query: "select=*&order=created_at.desc",
    }),
    supabaseRestRequest<ApiRechargeRecord[]>("guipordi_api_recharges", {
      query: "select=*&order=created_at.desc",
    }),
    supabaseRestRequest<CatalogItemRecord[]>("guipordi_catalog_items", {
      query: "select=*&order=code_id.asc",
    }),
    supabaseRestRequest<PaymentMethodRecord[]>("guipordi_payment_methods", {
      query: "select=*&order=created_at.asc",
    }),
    supabaseRestRequest<OrganicOrderRecord[]>("guipordi_organic_orders", {
      query: "select=*&order=created_at.desc",
    }),
    supabaseRestRequest<IncomingPaymentVaultRecord[]>(
      "guipordi_incoming_payments_vault",
      {
        query: "select=*&order=created_at.desc",
      }
    ),
  ]);

  return NextResponse.json({
    leads: leadsRes.data || [],
    sales: salesRes.data || [],
    recharges: rechargesRes.data || [],
    catalog: catalogRes.data || [],
    paymentMethods: methodsRes.data || [],
    organicOrders: ordersRes.data || [],
    paymentsVault: vaultRes.data || [],
    dbWarning:
      leadsRes.error ||
      salesRes.error ||
      catalogRes.error ||
      ordersRes.error ||
      null,
  });
}

// ============================================================================
// POST: OPERACIONES PÚBLICAS Y GESTIÓN COMPLETA DEL ERP DESDE /admin
// ============================================================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    // 1. Acción pública: Guardar cotización/lead desde el modal de IA de la web
    if (action === "create_public_lead") {
      const newLead: QuoteLeadRecord = {
        client_name: payload?.clientName?.trim() || "Visitante Web",
        client_contact: payload?.clientContact?.trim() || "",
        business_niche: payload?.businessNiche?.trim() || "General",
        environment_type:
          payload?.environmentType || "Entorno de Ventas Digital Completo",
        ai_module: payload?.aiModule || "Sin integración de IA",
        api_recharge: payload?.apiRecharge || "No requiero recarga API",
        media_pack: payload?.mediaPack || "Sin activos para redes",
        ai_recommendation: payload?.aiRecommendation || "",
        estimated_value_usd: Number(payload?.estimatedValueUsd || 0),
        status: "NUEVO",
      };

      const { data, error } = await supabaseRestRequest<QuoteLeadRecord[]>(
        "guipordi_quotes_leads",
        {
          method: "POST",
          body: newLead,
        }
      );

      return NextResponse.json({
        ok: !error,
        lead: data?.[0] || null,
        error,
      });
    }

    // Todas las demás acciones requieren PIN de Administrador
    if (!isAuthorizedAdmin(req)) {
      return NextResponse.json(
        { error: "No autorizado. Verifica tu PIN de administrador." },
        { status: 401 }
      );
    }

    // 2. Poblar el Catálogo Inicial (Los 9 proyectos + GuiporDI Pay + Evenpass QR + Media Pack) en Supabase
    if (action === "seed_initial_catalog") {
      const recordsToInsert: CatalogItemRecord[] = ALL_INITIAL_CATALOG.map(
        (item) => ({
          code_id: item.id,
          slug: item.slug,
          date: item.date,
          catalog_type: item.catalogType,
          category: item.category,
          highlight_badge: item.highlightBadge,
          title: item.title,
          subtitle: item.subtitle,
          description: item.description,
          tags: item.tags,
          architecture: item.architecture,
          deliverables: item.deliverables,
          desktop_img: item.desktopImg,
          mobile_img: item.mobileImg,
          modal_mobile_img: item.modalMobileImg,
          accent_rgb: item.accentRGB,
          price_usd: item.priceUsd,
          billing_type: item.billingType,
          demo_url: item.demoUrl || "",
          in_3d_carousel: Boolean(item.in3dCarousel),
          is_active: true,
        })
      );

      const { data, error } = await supabaseRestRequest<CatalogItemRecord[]>(
        "guipordi_catalog_items",
        {
          method: "POST",
          query: "on_conflict=slug",
          body: recordsToInsert,
        }
      );

      // Si no hay métodos de cobro aún, sembramos los 2 métodos base
      const existingMethods = await supabaseRestRequest<PaymentMethodRecord[]>(
        "guipordi_payment_methods",
        { query: "select=id" }
      );
      if (!existingMethods.data || existingMethods.data.length === 0) {
        await supabaseRestRequest("guipordi_payment_methods", {
          method: "POST",
          body: DEFAULT_PAYMENT_METHODS,
        });
      }

      return NextResponse.json({
        ok: !error,
        inserted: data?.length || 0,
        error,
      });
    }

    // 3. Crear un nuevo Proyecto de Portafolio o Producto Demo SaaS desde /admin
    if (action === "create_catalog_item") {
      const { data, error } = await supabaseRestRequest<CatalogItemRecord[]>(
        "guipordi_catalog_items",
        {
          method: "POST",
          body: payload,
        }
      );
      return NextResponse.json({
        ok: !error,
        record: data?.[0] || null,
        error,
      });
    }

    // 4. Crear un nuevo Método de Cobro (Binance Pay, Zelle, Pago Móvil, Transferencia)
    if (action === "create_payment_method") {
      const { data, error } = await supabaseRestRequest<PaymentMethodRecord[]>(
        "guipordi_payment_methods",
        {
          method: "POST",
          body: payload,
        }
      );
      return NextResponse.json({
        ok: !error,
        record: data?.[0] || null,
        error,
      });
    }

    // 5. Registrar una nueva venta de sistema / entorno / bot / pack
    if (action === "create_system_sale") {
      const { data, error } = await supabaseRestRequest<SystemSaleRecord[]>(
        "guipordi_system_sales",
        {
          method: "POST",
          body: payload,
        }
      );
      return NextResponse.json({
        ok: !error,
        record: data?.[0] || null,
        error,
      });
    }

    // 6. Registrar una nueva recarga de saldo API (Anthropic / OpenAI)
    if (action === "create_api_recharge") {
      const { data, error } = await supabaseRestRequest<ApiRechargeRecord[]>(
        "guipordi_api_recharges",
        {
          method: "POST",
          body: payload,
        }
      );
      return NextResponse.json({
        ok: !error,
        record: data?.[0] || null,
        error,
      });
    }

    // 7. Actualizar cualquier registro de las 7 tablas
    if (action === "update_record") {
      const { table, id, updates } = payload;
      const allowedTables = [
        "guipordi_quotes_leads",
        "guipordi_system_sales",
        "guipordi_api_recharges",
        "guipordi_catalog_items",
        "guipordi_payment_methods",
        "guipordi_organic_orders",
        "guipordi_incoming_payments_vault",
      ];
      if (!allowedTables.includes(table) || !id) {
        return NextResponse.json(
          { error: "Tabla o ID inválido" },
          { status: 400 }
        );
      }

      const { data, error } = await supabaseRestRequest(table, {
        method: "PATCH",
        query: `id=eq.${encodeURIComponent(id)}`,
        body: updates,
      });

      return NextResponse.json({ ok: !error, record: data, error });
    }

    // 8. Eliminar un registro de cualquiera de las 7 tablas
    if (action === "delete_record") {
      const { table, id } = payload;
      const allowedTables = [
        "guipordi_quotes_leads",
        "guipordi_system_sales",
        "guipordi_api_recharges",
        "guipordi_catalog_items",
        "guipordi_payment_methods",
        "guipordi_organic_orders",
        "guipordi_incoming_payments_vault",
      ];
      if (!allowedTables.includes(table) || !id) {
        return NextResponse.json(
          { error: "Tabla o ID inválido" },
          { status: 400 }
        );
      }

      const { error } = await supabaseRestRequest(table, {
        method: "DELETE",
        query: `id=eq.${encodeURIComponent(id)}`,
      });

      return NextResponse.json({ ok: !error, error });
    }

    return NextResponse.json(
      { error: "Acción no reconocida" },
      { status: 400 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Error interno en /api/admin-erp",
      },
      { status: 500 }
    );
  }
}