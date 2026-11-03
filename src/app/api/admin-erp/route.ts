import { NextRequest, NextResponse } from "next/server";
import {
  supabaseRestRequest,
  QuoteLeadRecord,
  SystemSaleRecord,
  ApiRechargeRecord,
} from "@/lib/supabase";

function isAuthorizedAdmin(req: NextRequest): boolean {
  const pinHeader = req.headers.get("x-admin-pin") || "";
  const expectedPin = process.env.ADMIN_SECRET_PIN || "2026";
  return pinHeader === expectedPin;
}

// ============================================================================
// GET: OBTENER TODAS LAS TABLAS PARA EL PANEL ADMINISTRATIVO (/admin)
// ============================================================================
export async function GET(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json(
      { error: "PIN de administrador inválido o no autorizado." },
      { status: 401 }
    );
  }

  const [leadsRes, salesRes, rechargesRes] = await Promise.all([
    supabaseRestRequest<QuoteLeadRecord[]>("guipordi_quotes_leads", {
      query: "select=*&order=created_at.desc",
    }),
    supabaseRestRequest<SystemSaleRecord[]>("guipordi_system_sales", {
      query: "select=*&order=created_at.desc",
    }),
    supabaseRestRequest<ApiRechargeRecord[]>("guipordi_api_recharges", {
      query: "select=*&order=created_at.desc",
    }),
  ]);

  return NextResponse.json({
    leads: leadsRes.data || [],
    sales: salesRes.data || [],
    recharges: rechargesRes.data || [],
    dbWarning: leadsRes.error || salesRes.error || rechargesRes.error || null,
  });
}

// ============================================================================
// POST: GUARDAR NUEVO LEAD DESDE EL COTIZADOR PÚBLICO O CREAR VENTAS/RECARGAS
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

    // A partir de aquí, todas las acciones requieren el PIN de Administrador
    if (!isAuthorizedAdmin(req)) {
      return NextResponse.json(
        { error: "No autorizado. Verifica tu PIN de administrador." },
        { status: 401 }
      );
    }

    // 2. Registrar una nueva venta de sistema / entorno / bot / pack
    if (action === "create_system_sale") {
      const { data, error } = await supabaseRestRequest<SystemSaleRecord[]>(
        "guipordi_system_sales",
        {
          method: "POST",
          body: payload,
        }
      );
      return NextResponse.json({ ok: !error, record: data?.[0] || null, error });
    }

    // 3. Registrar una nueva recarga de saldo API (Anthropic / OpenAI)
    if (action === "create_api_recharge") {
      const { data, error } = await supabaseRestRequest<ApiRechargeRecord[]>(
        "guipordi_api_recharges",
        {
          method: "POST",
          body: payload,
        }
      );
      return NextResponse.json({ ok: !error, record: data?.[0] || null, error });
    }

    // 4. Actualizar estado o montos de cualquier registro en las 3 tablas
    if (action === "update_record") {
      const { table, id, updates } = payload;
      const allowedTables = [
        "guipordi_quotes_leads",
        "guipordi_system_sales",
        "guipordi_api_recharges",
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

    // 5. Eliminar un registro
    if (action === "delete_record") {
      const { table, id } = payload;
      const allowedTables = [
        "guipordi_quotes_leads",
        "guipordi_system_sales",
        "guipordi_api_recharges",
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