import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const TO_EMAIL = "reservas@paolocar.cl";
const FROM_EMAIL = "reservas@paolocar.cl";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ALLOWED_SERVICES = new Set(["Arriendo", "Lavado", "Estacionamiento"]);
const ALLOWED_WASH_TYPES = new Set([
  "Lavado Interior y Exterior",
  "Lavado de Tapiz",
  "Lavado de Motor",
  "Lavado 360\u00b0",
  "Lavado Bajada de Faena",
]);

const ipRequestMap = new Map();
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;

const isRateLimited = (ip) => {
  const now = Date.now();
  const timestamps = (ipRequestMap.get(ip) ?? []).filter(t => now - t < RATE_WINDOW_MS);
  if (timestamps.length >= RATE_MAX) return true;
  timestamps.push(now);
  ipRequestMap.set(ip, timestamps);
  return false;
};

const isValidEmail = (e) => /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(e);
const isValidDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && !isNaN(Date.parse(d));
const isValidTime = (t) => /^\d{2}:\d{2}$/.test(t);

const sanitize = (val, maxLen = 300) => {
  if (val === null || val === undefined) return "";
  return String(val)
    .replace(/<[^>]*>/g, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim()
    .slice(0, maxLen);
};

const row = (label, value) =>
  value
    ? `<tr><td style="padding:8px 12px;color:#6b7280;font-size:14px;width:160px;vertical-align:top">${label}</td><td style="padding:8px 12px;color:#111827;font-size:14px;font-weight:600">${value}</td></tr>`
    : "";

const buildBaseHtml = (title, rows, extraNote) => `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:#0f0f0f;padding:28px 32px;text-align:center">
      <p style="margin:0;color:#d4a843;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;font-weight:600">Paolo Rent a Car</p>
      <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:700">${title}</h1>
    </div>
    <div style="padding:32px">
      <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:8px;overflow:hidden">
        ${rows}
      </table>
      ${extraNote ? `<p style="margin:20px 0 0;color:#6b7280;font-size:13px;line-height:1.6">${extraNote}</p>` : ""}
    </div>
    <div style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #e5e7eb">
      <p style="margin:0;color:#9ca3af;font-size:12px">Paolo Rent a Car &mdash; Iquique, Chile</p>
    </div>
  </div>
</body>
</html>`;

const buildRentalHtml = (d) =>
  buildBaseHtml(
    "Nueva Reserva de Arriendo",
    row("Nombre", d.from_name) +
    row("Email", d.from_email) +
    row("Tel\u00e9fono", d.phone) +
    row("Lugar de retiro", d.pickup_location) +
    row("Fecha de retiro", `${d.pickup_date} a las ${d.pickup_time}`) +
    row("Fecha de devoluci\u00f3n", `${d.return_date} a las ${d.return_time}`) +
    row("Veh\u00edculo", d.car_type) +
    row("D\u00edas de arriendo", d.rental_days) +
    row("Precio por d\u00eda", d.daily_price) +
    row("Total", d.total) +
    row("Mensaje", d.message)
  );

const buildWashHtml = (d) =>
  buildBaseHtml(
    "Nueva Solicitud de Lavado",
    row("Nombre", d.from_name) +
    row("Email", d.from_email) +
    row("Tel\u00e9fono", d.phone) +
    row("Fecha", `${d.wash_date} a las ${d.wash_time}`) +
    row("Servicio", d.wash_type) +
    row("Veh\u00edculo", d.vehicle_description) +
    row("Notas", d.message)
  );

const buildParkingHtml = (d) =>
  buildBaseHtml(
    "Nueva Reserva de Estacionamiento",
    row("Nombre", d.from_name) +
    row("Email", d.from_email) +
    row("Tel\u00e9fono", d.phone) +
    row("Fecha de ingreso", `${d.wash_date} a las ${d.wash_time}`) +
    row("Fecha de salida", d.wash_type) +
    row("Veh\u00edculo / Patente", d.vehicle_description) +
    row("Notas", d.message)
  );

const buildClientConfirmationHtml = (d) =>
  buildBaseHtml(
    "\u00a1Tu reserva fue recibida!",
    row("Nombre", d.from_name) +
    row("Veh\u00edculo", d.car_type) +
    row("Lugar de retiro", d.pickup_location) +
    row("Fecha de retiro", `${d.pickup_date} a las ${d.pickup_time}`) +
    row("Fecha de devoluci\u00f3n", `${d.return_date} a las ${d.return_time}`) +
    row("Total estimado", d.total),
    "Nos pondremos en contacto contigo a la brevedad para confirmar tu reserva. Si tienes alguna consulta, responde este correo o escr\u00edbenos por WhatsApp."
  );

const jsonReply = (body, status, extraHeaders = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonReply({ error: "M\u00e9todo no permitido" }, 405, corsHeaders);
  }

  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  if (isRateLimited(clientIp)) {
    return jsonReply({ error: "Demasiadas solicitudes. Intenta m\u00e1s tarde." }, 429, corsHeaders);
  }

  try {
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY no configurada");

    const contentLength = Number(req.headers.get("content-length") ?? 0);
    if (contentLength > 10000) {
      return jsonReply({ error: "Payload demasiado grande" }, 413, corsHeaders);
    }

    const raw = await req.text();
    if (raw.length > 10000) {
      return jsonReply({ error: "Payload demasiado grande" }, 413, corsHeaders);
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return jsonReply({ error: "JSON inv\u00e1lido" }, 400, corsHeaders);
    }

    const data = {
      service_type: sanitize(parsed.service_type, 30),
      from_name:    sanitize(parsed.from_name, 100),
      from_email:   sanitize(parsed.from_email, 254),
      phone:        sanitize(parsed.phone, 20),
      message:      sanitize(parsed.message, 1000),
      pickup_location: sanitize(parsed.pickup_location, 100),
      pickup_date:  sanitize(parsed.pickup_date, 10),
      pickup_time:  sanitize(parsed.pickup_time, 5),
      return_date:  sanitize(parsed.return_date, 10),
      return_time:  sanitize(parsed.return_time, 5),
      car_type:     sanitize(parsed.car_type, 100),
      rental_days:  sanitize(parsed.rental_days, 10),
      daily_price:  sanitize(parsed.daily_price, 20),
      total:        sanitize(parsed.total, 20),
      wash_date:    sanitize(parsed.wash_date, 10),
      wash_time:    sanitize(parsed.wash_time, 5),
      wash_type:    sanitize(parsed.wash_type, 100),
      vehicle_description: sanitize(parsed.vehicle_description, 200),
    };

    if (!ALLOWED_SERVICES.has(data.service_type)) {
      return jsonReply({ error: "Tipo de servicio no v\u00e1lido" }, 400, corsHeaders);
    }
    if (!data.from_name || data.from_name.length < 3) {
      return jsonReply({ error: "Nombre requerido" }, 400, corsHeaders);
    }
    if (!data.phone || data.phone.replace(/\D/g, "").length < 8) {
      return jsonReply({ error: "Tel\u00e9fono requerido" }, 400, corsHeaders);
    }
    if (data.service_type === "Arriendo") {
      if (!data.from_email || !isValidEmail(data.from_email)) {
        return jsonReply({ error: "Email requerido para arriendo" }, 400, corsHeaders);
      }
      if (!isValidDate(data.pickup_date) || !isValidDate(data.return_date)) {
        return jsonReply({ error: "Fechas inv\u00e1lidas" }, 400, corsHeaders);
      }
      if (!isValidTime(data.pickup_time) || !isValidTime(data.return_time)) {
        return jsonReply({ error: "Horarios inv\u00e1lidos" }, 400, corsHeaders);
      }
    }
    if (data.service_type === "Lavado") {
      if (!ALLOWED_WASH_TYPES.has(data.wash_type)) {
        return jsonReply({ error: "Tipo de lavado no v\u00e1lido" }, 400, corsHeaders);
      }
      if (!isValidDate(data.wash_date)) {
        return jsonReply({ error: "Fecha de lavado inv\u00e1lida" }, 400, corsHeaders);
      }
    }
    if (data.service_type === "Estacionamiento") {
      if (!isValidDate(data.wash_date)) {
        return jsonReply({ error: "Fecha de ingreso inv\u00e1lida" }, 400, corsHeaders);
      }
    }

    const { service_type, from_email } = data;
    let subject = "";
    let html = "";

    if (service_type === "Estacionamiento") {
      subject = `Nueva Reserva Estacionamiento \u2014 ${data.from_name}`;
      html = buildParkingHtml(data);
    } else if (service_type === "Lavado") {
      subject = `Nueva Reserva Lavado \u2014 ${data.from_name}`;
      html = buildWashHtml(data);
    } else {
      subject = `Nueva Reserva Arriendo \u2014 ${data.from_name}`;
      html = buildRentalHtml(data);
    }

    const emailPayload = {
      from: `Paolo Rent a Car <${FROM_EMAIL}>`,
      to: [TO_EMAIL],
      subject,
      html,
    };
    if (from_email && isValidEmail(from_email)) {
      emailPayload.reply_to = from_email;
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error response:", err);
      throw new Error(`Resend error: ${err}`);
    }

    if (service_type === "Arriendo" && from_email && isValidEmail(from_email)) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `Paolo Rent a Car <${FROM_EMAIL}>`,
          to: [from_email],
          subject: "Tu reserva fue recibida \u2014 Paolo Rent a Car",
          html: buildClientConfirmationHtml(data),
        }),
      }).catch((e) => console.error("Error correo cliente:", e));
    }

    return jsonReply({ success: true }, 200, corsHeaders);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    console.error("send-email error:", message);
    return jsonReply({ error: "Error interno del servidor" }, 500, corsHeaders);
  }
});
