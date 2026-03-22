import { NextResponse } from "next/server";
import { sendSmtpTestEmail } from "@/lib/smtp";

const DEFAULT_TEST_RECIPIENT = "adil.abbadi.1996@gmail.com";

function isAuthorized(secret: string | null): boolean {
  if (!secret) return false;
  const expected =
    process.env.SMTP_TEST_SECRET || process.env.NEXTAUTH_SECRET || "";
  return Boolean(expected && secret === expected);
}

/**
 * GET or POST /api/test-smtp
 * Sends a test email to verify SMTP. Protected by secret (SMTP_TEST_SECRET or NEXTAUTH_SECRET).
 *
 * GET:  ?secret=YOUR_SECRET
 * POST: { "secret": "YOUR_SECRET" }
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");
  return handleTestSmtp(secret);
}

export async function POST(request: Request) {
  let secret: string | null = null;
  try {
    const body = (await request.json()) as { secret?: string };
    secret = body.secret ?? null;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body. Send { \"secret\": \"...\" }." },
      { status: 400 }
    );
  }
  return handleTestSmtp(secret);
}

async function handleTestSmtp(secret: string | null) {
  if (!isAuthorized(secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const to =
    process.env.SMTP_TEST_TO_EMAIL?.trim() || DEFAULT_TEST_RECIPIENT;

  try {
    await sendSmtpTestEmail(to);
    return NextResponse.json({
      ok: true,
      message: "Test email sent successfully.",
      to,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("SMTP test error:", err);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
