import { NextRequest, NextResponse } from "next/server";
import { profile } from "@/data/profile";
import { contactFormSchema } from "@/lib/validation/contact";

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

function isSameOriginRequest(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) {
    return true;
  }

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function applyRateLimit(clientKey: string) {
  const now = Date.now();
  const current = rateLimitStore.get(clientKey);

  if (!current || now > current.resetAt) {
    rateLimitStore.set(clientKey, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS
    });
    return true;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  current.count += 1;
  rateLimitStore.set(clientKey, current);
  return true;
}

function buildFromField() {
  const configuredFrom = (process.env.CONTACT_FROM_EMAIL || "").trim();
  const configuredName = (process.env.CONTACT_FROM_NAME || "Portfolio Contact").trim();

  // Valid `Name <email@example.com>` format.
  const displayWithEmailPattern = /^.+<[^<>\s@]+@[^<>\s@]+\.[^<>\s@]+>$/;
  if (displayWithEmailPattern.test(configuredFrom)) {
    return configuredFrom;
  }

  // Valid bare email format.
  const bareEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (bareEmailPattern.test(configuredFrom)) {
    return `${configuredName} <${configuredFrom}>`;
  }

  // If only a display name was provided, fallback to Resend default sender.
  const fallbackName = configuredFrom || configuredName;
  return `${fallbackName} <onboarding@resend.dev>`;
}

async function sendWithResend({
  name,
  email,
  message
}: {
  name: string;
  email: string;
  message: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const toEmail = (process.env.CONTACT_TO_EMAIL || profile.email).trim();
  const fromEmail = buildFromField();

  if (!resendApiKey) {
    throw new Error("Missing RESEND_API_KEY.");
  }

  const parsedRecipient = contactFormSchema.shape.email.safeParse(toEmail);
  if (!parsedRecipient.success) {
    throw new Error("Invalid CONTACT_TO_EMAIL value.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      subject: `Portfolio contact from ${name}`,
      reply_to: email,
      text: `New portfolio contact message\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Resend request failed: ${response.status} ${errorBody}`);
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }

  const ip = getClientIp(request);
  if (!applyRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = contactFormSchema.safeParse(payload);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || "Invalid form data.";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  // Honeypot field: bots often fill hidden fields. Return success to reduce retries.
  if (parsed.data.company && parsed.data.company.length > 0) {
    return NextResponse.json(
      { success: true, message: "Message sent successfully." },
      { status: 200 }
    );
  }

  try {
    await sendWithResend(parsed.data);
    return NextResponse.json(
      { success: true, message: "Message sent successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form delivery failed:", error);
    return NextResponse.json(
      { error: "Could not send your message right now. Please try again later." },
      { status: 503 }
    );
  }
}
