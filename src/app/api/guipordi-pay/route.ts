import { NextRequest, NextResponse } from "next/server";
import {
  supabaseRestRequest,
  OrganicOrderRecord,
  IncomingPaymentVaultRecord,
  SystemSaleRecord,
} from "@/lib/supabase";

// ============================================================================
// 1. PARSER NATIVO REGEX PARA CORREOS DE BINANCE PAY, ZELLE Y BANCOS (0% TERCEROS)
// ============================================================================
export function parseIncomingPaymentEmail(subject: string, bodyText: string) {
  const fullText = `${subject}\n${bodyText}`;
  const cleanText = fullText.replace(/\s+/g, " ").trim();

  // Detectar proveedor
  let provider = "BINANCE_PAY";
  if (/zelle/i.test(cleanText)) {
    provider = "ZELLE";
  } else if (/pago\s*m[oó]vil|banesco|mercantil|venezuela|bnc/i.test(cleanText)) {
    provider = "PAGO_MOVIL";
  }

  // Extraer monto (ej: "100.24 USDT", "$450.18", "USD 50.09", "Bs. 1500,25")
  let amountDetected = 0;
  let currency = provider === "PAGO_MOVIL" ? "VES" : "USDT";

  const amountPatterns = [
    /(?:recibido|received|sent you|envi[oó]|monto|amount|por|de)\s*(?:USD|USDT|\$|Bs\.?)?\s*([0-9]{1,6}(?:[.,][0-9]{1,2})?)\s*(USDT|USD|BUSD|USDC|Bs)?/i,
    /\$\s*([0-9]{1,6}(?:\.[0-9]{1,2})?)/i,
    /([0-9]{1,6}(?:\.[0-9]{1,2})?)\s*(USDT|USD)/i,
  ];

  for (const regex of amountPatterns) {
    const match = cleanText.match(regex);
    if (match && match[1]) {
      const normalized = match[1].replace(",", ".");
      const val = parseFloat(normalized);
      if (!isNaN(val) && val > 0) {
        amountDetected = val;
        if (match[2]) currency = match[2].toUpperCase();
        break;
      }
    }
  }

  // Extraer Order ID / Referencia / Confirmation Number
  let referenceId = "";
  const refPatterns = [
    /(?:Order\s*ID|ID\s*de\s*orden|Referencia|Reference|Confirmation|Confirmaci[oó]n|Transacci[oó]n|Transaction\s*ID)[:\s#-]*([A-Z0-9-]{5,32})/i,
    /\b(GP-[0-9]{4,6})\b/i,
    /\b([0-9]{6,22})\b/,
  ];

  for (const regex of refPatterns) {
    const match = cleanText.match(regex);
    if (match && match[1]) {
      referenceId = match[1].trim();
      break;
    }
  }

  if (!referenceId) {
    referenceId = `AUTO-${Date.now().toString().slice(-6)}`;
  }

  // Extraer remitente
  let senderInfo = "";
  const senderMatch = cleanText.match(
    /(?:from|de parte de|remitente|enviado por)\s+([A-Za-z0-9@_.\s]{3,40}?)(?:\s+por|\s+el|\s+con|\.|$)/i
  );
  if (senderMatch && senderMatch[1]) {
    senderInfo = senderMatch[1].trim();
  }

  return {
    provider,
    amount_detected: amountDetected,
    currency,
    reference_or_order_id: referenceId,
    sender_info: senderInfo,
  };
}

// ============================================================================
// 2. MOTOR DE CONCILIACIÓN CRUZADA (MATCH POR MONTO ÚNICO O SUFIJO DE REFERENCIA)
// ============================================================================
async function attemptOrderReconciliation(
  order: OrganicOrderRecord,
  availableVaultItems: IncomingPaymentVaultRecord[]
): Promise<IncomingPaymentVaultRecord | null> {
  const cleanOrderRef = (order.payment_reference || "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();
  const orderSuffix =
    cleanOrderRef.length >= 4 ? cleanOrderRef.slice(-5) : cleanOrderRef;

  for (const vault of availableVaultItems) {
    if (vault.status !== "DISPONIBLE") continue;

    const cleanVaultRef = (vault.reference_or_order_id || "")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase();

    // Criterio A: Coincidencia exacta de los últimos dígitos de la referencia / Order ID
    const refMatched =
      orderSuffix.length >= 4 &&
      cleanVaultRef.length >= 4 &&
      (cleanVaultRef.endsWith(orderSuffix) ||
        cleanOrderRef.endsWith(cleanVaultRef.slice(-5)));

    // Criterio B: Coincidencia exacta con el monto único con céntimos asignado a la orden (ej. 50.23 === 50.23)
    const exactUniqueAmountMatched =
      Number(vault.amount_detected) > 0 &&
      Math.abs(
        Number(vault.amount_detected) -
          Number(order.unique_validation_amount_usd)
      ) < 0.009;

    // Si coincide la referencia + monto base aproximado, o coincide el monto único con céntimos
    if (
      exactUniqueAmountMatched ||
      (refMatched &&
        Math.abs(
          Number(vault.amount_detected) - Number(order.base_amount_usd)
        ) <= 1.0)
    ) {
      return vault;
    }
  }

  return null;
}

// ============================================================================
// POST: ENDPOINT PRINCIPAL DE GUIPORDI PAY
// ============================================================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    // ------------------------------------------------------------------------
    // ACCIÓN 1: CREAR ORDEN DE COMPRA CON CÉNTIMOS ÚNICOS DE VALIDACIÓN
    // ------------------------------------------------------------------------
    if (action === "create_order") {
      const baseAmount = Math.max(1, Number(payload?.baseAmountUsd || 50));
      // Generamos céntimos únicos entre .01 y .89 para identificar el pago al instante
      const randomCents = Math.floor(Math.random() * 89 + 1) / 100;
      const uniqueAmount = Number((Math.floor(baseAmount) + randomCents).toFixed(2));
      const orderCode = `GP-${Math.floor(1000 + Math.random() * 9000)}`;

      const newOrder: OrganicOrderRecord = {
        order_code: orderCode,
        client_name: payload?.clientName?.trim() || "Cliente GuiporDI",
        client_contact: payload?.clientContact?.trim() || "",
        item_slug: payload?.itemSlug || "custom-pack",
        item_title: payload?.itemTitle || "Producto SaaS / Servicio GuiporDI",
        base_amount_usd: baseAmount,
        unique_validation_amount_usd: uniqueAmount,
        payment_method: payload?.paymentMethod || "BINANCE_PAY",
        payment_reference: "",
        sender_identifier: "",
        status: "PENDIENTE_PAGO",
        notes: payload?.notes || "",
      };

      const { data, error } = await supabaseRestRequest<OrganicOrderRecord[]>(
        "guipordi_organic_orders",
        {
          method: "POST",
          body: newOrder,
        }
      );

      return NextResponse.json({
        ok: true,
        order: data?.[0] || newOrder,
        dbWarning: error,
      });
    }

    // ------------------------------------------------------------------------
    // ACCIÓN 2: CLIENTE REPORTA SU REFERENCIA Y SOLICITA VALIDACIÓN EN VIVO
    // ------------------------------------------------------------------------
    if (action === "verify_order_payment") {
      const { orderCode, paymentReference, senderIdentifier } = payload;

      const ordersRes = await supabaseRestRequest<OrganicOrderRecord[]>(
        "guipordi_organic_orders",
        {
          query: `select=*&order_code=eq.${encodeURIComponent(orderCode)}`,
        }
      );

      const currentOrder = ordersRes.data?.[0];
      if (!currentOrder) {
        return NextResponse.json(
          { error: "No se encontró el código de orden indicado." },
          { status: 404 }
        );
      }

      const updatedOrderCandidate: OrganicOrderRecord = {
        ...currentOrder,
        payment_reference: paymentReference?.trim() || currentOrder.payment_reference,
        sender_identifier: senderIdentifier?.trim() || currentOrder.sender_identifier,
      };

      // Buscamos pagos disponibles en la bóveda de correos entrantes
      const vaultRes = await supabaseRestRequest<IncomingPaymentVaultRecord[]>(
        "guipordi_incoming_payments_vault",
        {
          query: "select=*&status=eq.DISPONIBLE&order=created_at.desc",
        }
      );

      const matchedVault = await attemptOrderReconciliation(
        updatedOrderCandidate,
        vaultRes.data || []
      );

      if (matchedVault && matchedVault.id && currentOrder.id) {
        // 1. Marcar el pago de la bóveda como CONSUMIDO
        await supabaseRestRequest("guipordi_incoming_payments_vault", {
          method: "PATCH",
          query: `id=eq.${encodeURIComponent(matchedVault.id)}`,
          body: { status: "CONSUMIDO" },
        });

        // 2. Marcar la orden como PAGADO_VALIDADO
        const updatedRes = await supabaseRestRequest<OrganicOrderRecord[]>(
          "guipordi_organic_orders",
          {
            method: "PATCH",
            query: `id=eq.${encodeURIComponent(currentOrder.id)}`,
            body: {
              payment_reference: updatedOrderCandidate.payment_reference,
              sender_identifier: updatedOrderCandidate.sender_identifier,
              status: "PAGADO_VALIDADO",
              matched_vault_id: matchedVault.id,
            },
          }
        );

        // 3. Registrar automáticamente la venta en el Libro Mayor del ERP (guipordi_system_sales)
        const autoSale: SystemSaleRecord = {
          client_name: currentOrder.client_name,
          client_contact: currentOrder.client_contact,
          project_name: `[GuiporDI Pay #${currentOrder.order_code}] ${currentOrder.item_title}`,
          category: "Mostrador SaaS / Compra Directa",
          total_amount_usd: Number(matchedVault.amount_detected),
          paid_amount_usd: Number(matchedVault.amount_detected),
          payment_method: `${matchedVault.provider} (Ref: ${matchedVault.reference_or_order_id})`,
          payment_status: "PAGADO",
          delivery_status: "EN DESARROLLO",
          notes: `Validado automáticamente por GuiporDI Pay. Orden ${currentOrder.order_code}`,
        };

        await supabaseRestRequest("guipordi_system_sales", {
          method: "POST",
          body: autoSale,
        });

        return NextResponse.json({
          ok: true,
          verified: true,
          status: "PAGADO_VALIDADO",
          order: updatedRes.data?.[0] || {
            ...updatedOrderCandidate,
            status: "PAGADO_VALIDADO",
          },
          matchedVault,
        });
      }

      // Si el correo de Binance/Zelle tarda unos segundos más en llegar, dejamos la orden en VERIFICANDO
      if (currentOrder.id) {
        await supabaseRestRequest("guipordi_organic_orders", {
          method: "PATCH",
          query: `id=eq.${encodeURIComponent(currentOrder.id)}`,
          body: {
            payment_reference: updatedOrderCandidate.payment_reference,
            sender_identifier: updatedOrderCandidate.sender_identifier,
            status: "VERIFICANDO",
          },
        });
      }

      return NextResponse.json({
        ok: true,
        verified: false,
        status: "VERIFICANDO",
        message:
          "Referencia registrada. Nuestro lector de correos está esperando el acuse oficial de Binance/Zelle (tarda entre 5 y 25 segundos). Puedes volver a pulsar Verificar o enviarnos el comprobante directo a WhatsApp.",
      });
    }

    // ------------------------------------------------------------------------
    // ACCIÓN 3: WEBHOOK RECEPTOR DE CORREOS (CLOUDFLARE EMAIL WORKER O TEST ADMIN)
    // ------------------------------------------------------------------------
    if (action === "ingest_email_webhook") {
      const webhookSecret = req.headers.get("x-guipordi-webhook-secret") || "";
      const adminPin = req.headers.get("x-admin-pin") || "";
      const expectedPin = process.env.ADMIN_SECRET_PIN || "2026";
      const expectedSecret = process.env.GUIPORDI_PAY_WEBHOOK_SECRET || expectedPin;

      if (webhookSecret !== expectedSecret && adminPin !== expectedPin) {
        return NextResponse.json(
          { error: "No autorizado para inyectar acuses de pago." },
          { status: 401 }
        );
      }

      const subject = payload?.subject || "Binance Pay: You have received USDT";
      const bodyText = payload?.bodyText || "";

      const parsed = parseIncomingPaymentEmail(subject, bodyText);

      const finalAmount =
        payload?.overrideAmount !== undefined
          ? Number(payload.overrideAmount)
          : parsed.amount_detected;
      const finalRef =
        payload?.overrideReference || parsed.reference_or_order_id;
      const finalProvider = payload?.overrideProvider || parsed.provider;

      const newVaultRecord: IncomingPaymentVaultRecord = {
        provider: finalProvider,
        amount_detected: finalAmount,
        currency: parsed.currency,
        reference_or_order_id: finalRef,
        sender_info: parsed.sender_info,
        raw_subject: subject.slice(0, 180),
        raw_excerpt: bodyText.slice(0, 320),
        status: "DISPONIBLE",
      };

      const vaultInsert = await supabaseRestRequest<
        IncomingPaymentVaultRecord[]
      >("guipordi_incoming_payments_vault", {
        method: "POST",
        body: newVaultRecord,
      });

      const createdVault = vaultInsert.data?.[0];

      // Revisar inmediatamente si hay una orden esperando este pago para auto-aprobarla
      let autoMatchedOrder: OrganicOrderRecord | null = null;
      if (createdVault) {
        const pendingOrders = await supabaseRestRequest<OrganicOrderRecord[]>(
          "guipordi_organic_orders",
          {
            query:
              "select=*&status=in.(PENDIENTE_PAGO,VERIFICANDO)&order=created_at.desc",
          }
        );

        for (const ord of pendingOrders.data || []) {
          const match = await attemptOrderReconciliation(ord, [createdVault]);
          if (match && ord.id && createdVault.id) {
            await supabaseRestRequest("guipordi_incoming_payments_vault", {
              method: "PATCH",
              query: `id=eq.${encodeURIComponent(createdVault.id)}`,
              body: { status: "CONSUMIDO" },
            });

            await supabaseRestRequest("guipordi_organic_orders", {
              method: "PATCH",
              query: `id=eq.${encodeURIComponent(ord.id)}`,
              body: {
                status: "PAGADO_VALIDADO",
                matched_vault_id: createdVault.id,
              },
            });

            await supabaseRestRequest("guipordi_system_sales", {
              method: "POST",
              body: {
                client_name: ord.client_name,
                client_contact: ord.client_contact,
                project_name: `[GuiporDI Pay #${ord.order_code}] ${ord.item_title}`,
                category: "Mostrador SaaS / Compra Directa",
                total_amount_usd: Number(createdVault.amount_detected),
                paid_amount_usd: Number(createdVault.amount_detected),
                payment_method: `${createdVault.provider} (Ref: ${createdVault.reference_or_order_id})`,
                payment_status: "PAGADO",
                delivery_status: "EN DESARROLLO",
                notes: `Auto-conciliado al entrar el correo de confirmación.`,
              },
            });

            autoMatchedOrder = ord;
            break;
          }
        }
      }

      return NextResponse.json({
        ok: true,
        vaultRecord: createdVault,
        autoMatchedOrder,
      });
    }

    return NextResponse.json(
      { error: "Acción no válida en GuiporDI Pay" },
      { status: 400 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Error interno en /api/guipordi-pay",
      },
      { status: 500 }
    );
  }
}