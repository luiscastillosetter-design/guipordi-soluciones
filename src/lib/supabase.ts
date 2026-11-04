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

export type CatalogItemType = "PORTAFOLIO" | "DEMO_VENTA_SAAS" | "AMBOS";

export interface CatalogItemRecord {
  id?: string;
  created_at?: string;
  code_id: string;
  slug: string;
  date: string;
  catalog_type: CatalogItemType;
  category: string;
  highlight_badge: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  architecture: string[];
  deliverables: string[];
  desktop_img: string;
  mobile_img: string;
  modal_mobile_img: string;
  accent_rgb: [number, number, number];
  price_usd: number;
  billing_type: string;
  demo_url?: string;
  in_3d_carousel?: boolean;
  is_active?: boolean;
}

export interface PaymentMethodRecord {
  id?: string;
  created_at?: string;
  method_type: "BINANCE_PAY" | "ZELLE" | "PAGO_MOVIL" | "TRANSFERENCIA";
  label: string;
  account_holder: string;
  account_identifier: string;
  bank_or_network?: string;
  qr_image_url?: string;
  instructions?: string;
  is_active: boolean;
}

export interface OrganicOrderRecord {
  id?: string;
  created_at?: string;
  order_code: string;
  client_name: string;
  client_contact: string;
  item_slug: string;
  item_title: string;
  base_amount_usd: number;
  unique_validation_amount_usd: number;
  payment_method: string;
  payment_reference: string;
  sender_identifier?: string;
  status:
    | "PENDIENTE_PAGO"
    | "VERIFICANDO"
    | "PAGADO_VALIDADO"
    | "REVISION_MANUAL"
    | "ENTREGADO";
  matched_vault_id?: string | null;
  notes?: string;
}

export interface IncomingPaymentVaultRecord {
  id?: string;
  created_at?: string;
  provider: string;
  amount_detected: number;
  currency: string;
  reference_or_order_id: string;
  sender_info?: string;
  raw_subject?: string;
  raw_excerpt?: string;
  status: "DISPONIBLE" | "CONSUMIDO";
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
      error:
        err instanceof Error ? err.message : "Error de conexión a Supabase",
    };
  }
}