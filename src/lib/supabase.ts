export interface QuoteLeadRecord {
  id?: string;
  created_at?: string;
  client_name: string;
  client_contact: string;
  business_niche: string;
  environment_type: string;
  ai_module: string;
  api_recharge: string;
  media_pack: string;
  ai_recommendation?: string;
  estimated_value_usd?: number;
  status?: "NUEVO" | "CONTACTADO" | "EN NEGOCIACION" | "CERRADO" | "DESCARTADO";
  notes?: string;
}

export interface SystemSaleRecord {
  id?: string;
  created_at?: string;
  client_name: string;
  client_contact?: string;
  project_name: string;
  category: string;
  total_amount_usd: number;
  paid_amount_usd: number;
  payment_method: string;
  payment_status: "PAGADO" | "ABONADO" | "PENDIENTE";
  delivery_status: "EN DESARROLLO" | "ENTREGADO" | "MANTENIMIENTO";
  notes?: string;
}

export interface ApiRechargeRecord {
  id?: string;
  created_at?: string;
  client_name: string;
  client_contact?: string;
  provider: string;
  platform_source: string;
  credits_loaded_usd: number;
  cost_usd: number;
  sale_price_usd: number;
  payment_method: string;
  status: "ACTIVO" | "CONSUMIDO" | "PENDIENTE";
  notes?: string;
}

function getSupabaseConfig() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";
  return { url, key, isConfigured: Boolean(url && key) };
}

export async function supabaseRestRequest<T = unknown>(
  table: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    query?: string;
    body?: unknown;
  } = {}
): Promise<{ data: T | null; error: string | null }> {
  const { url, key, isConfigured } = getSupabaseConfig();

  if (!isConfigured) {
    return {
      data: null,
      error: "Variables de Supabase no configuradas aún en el entorno.",
    };
  }

  const method = options.method || "GET";
  const queryString = options.query ? `?${options.query}` : "";
  const endpoint = `${url}/rest/v1/${table}${queryString}`;

  try {
    const res = await fetch(endpoint, {
      method,
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text();
      return { data: null, error: `Supabase (${res.status}): ${errText}` };
    }

    const data = (await res.json()) as T;
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Error de conexión a Supabase",
    };
  }
}