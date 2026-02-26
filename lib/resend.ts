import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const APP_URL = process.env.NEXTAUTH_URL || "https://anycode.it";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getWelcomeEmailHtml(displayName: string, verifyLink?: string): string {
  const safeName = escapeHtml(displayName);
  const dashboardUrl = APP_URL.replace(/\/$/, "");
  if (verifyLink) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Anycode</title>
</head>
<body style="margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f1f5f9;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #135bec 0%, #0d47c2 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin:0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Anycode</h1>
              <p style="margin: 6px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Productivity tools</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 40px 32px;">
              <p style="margin:0 0 20px; color: #0f172a; font-size: 18px; font-weight: 600;">Hi ${safeName},</p>
              <p style="margin:0 0 16px; color: #475569; font-size: 16px; line-height: 1.6;">Welcome to <strong style="color: #135bec;">Anycode</strong> — productivity tools. Sign and merge PDFs, convert to Word, summarize with AI, image to prompt, and more.</p>
              <p style="margin:0 0 16px; color: #475569; font-size: 16px; line-height: 1.6;">You get <strong style="color: #0f172a;">one day of free subscription</strong> after you verify your email. Click the button below to verify your email and activate it.</p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 28px auto 0;">
                <tr>
                  <td style="border-radius: 12px; background: linear-gradient(135deg, #059669 0%, #047857 100%); box-shadow: 0 2px 8px rgba(5, 150, 105, 0.35);">
                    <a href="${escapeHtml(verifyLink)}" target="_blank" rel="noopener" style="display: inline-block; padding: 14px 28px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none;">Verify email</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0; color: #94a3b8; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:<br/><a href="${escapeHtml(verifyLink)}" style="color: #135bec; word-break: break-all;">${escapeHtml(verifyLink)}</a></p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px 32px; border-top: 1px solid #e2e8f0;">
              <p style="margin:0; color: #94a3b8; font-size: 14px;">Thanks for joining us,<br/><strong style="color: #64748b;">The Anycode team</strong></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Anycode</title>
</head>
<body style="margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f1f5f9;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #135bec 0%, #0d47c2 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin:0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Anycode</h1>
              <p style="margin: 6px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Productivity tools</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 40px 32px;">
              <p style="margin:0 0 20px; color: #0f172a; font-size: 18px; font-weight: 600;">Hi ${safeName},</p>
              <p style="margin:0 0 16px; color: #475569; font-size: 16px; line-height: 1.6;">Welcome to <strong style="color: #135bec;">Anycode</strong>! Your account is ready. Use our productivity tools — PDFs, summarization, image to prompt, and more.</p>
              <p style="margin:0 0 28px; color: #475569; font-size: 16px; line-height: 1.6;">Subscribe when you're ready for full access to all tools.</p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 12px; background: linear-gradient(135deg, #135bec 0%, #0d47c2 100%); box-shadow: 0 2px 8px rgba(19, 91, 236, 0.35);">
                    <a href="${dashboardUrl}" target="_blank" rel="noopener" style="display: inline-block; padding: 14px 28px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none;">Go to Dashboard</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px 32px; border-top: 1px solid #e2e8f0;">
              <p style="margin:0; color: #94a3b8; font-size: 14px;">Thanks for joining us,<br/><strong style="color: #64748b;">The Anycode team</strong></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function getFreeSubscriptionEmailHtml(displayName: string): string {
  const safeName = escapeHtml(displayName);
  const dashboardUrl = APP_URL.replace(/\/$/, "");
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You won 10 days free subscription</title>
</head>
<body style="margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f1f5f9;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin:0; color: #ffffff; font-size: 24px; font-weight: 700;">You won!</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.95); font-size: 18px; font-weight: 600;">10 days free subscription</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 40px 32px;">
              <p style="margin:0 0 20px; color: #0f172a; font-size: 18px; font-weight: 600;">Hi ${safeName},</p>
              <p style="margin:0 0 16px; color: #475569; font-size: 16px; line-height: 1.6;">We've added <strong style="color: #059669;">10 days of free subscription</strong> to your Anycode account. Enjoy full access to all productivity tools.</p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 28px auto 0;">
                <tr>
                  <td style="border-radius: 12px; background: linear-gradient(135deg, #135bec 0%, #0d47c2 100%); box-shadow: 0 2px 8px rgba(19, 91, 236, 0.35);">
                    <a href="${dashboardUrl}" target="_blank" rel="noopener" style="display: inline-block; padding: 14px 28px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none;">Go to Dashboard</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px 32px; border-top: 1px solid #e2e8f0;">
              <p style="margin:0; color: #94a3b8; font-size: 14px;">Enjoy,<br/><strong style="color: #64748b;">The Anycode team</strong></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function getPaymentSuccessEmailHtml(
  displayName: string,
  planLabel: string,
  newExpiresAt: Date
): string {
  const safeName = escapeHtml(displayName);
  const dashboardUrl = APP_URL.replace(/\/$/, "");
  const planText = planLabel === "annual" ? "Annual" : "Monthly";
  const expiresFormatted = newExpiresAt.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment successful — Anycode</title>
</head>
<body style="margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f1f5f9;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin:0; color: #ffffff; font-size: 24px; font-weight: 700;">Payment successful</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.95); font-size: 16px;">Your subscription is active</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 40px 32px;">
              <p style="margin:0 0 20px; color: #0f172a; font-size: 18px; font-weight: 600;">Hi ${safeName},</p>
              <p style="margin:0 0 16px; color: #475569; font-size: 16px; line-height: 1.6;">Thank you for your payment. Your <strong style="color: #059669;">${escapeHtml(planText)}</strong> subscription to Anycode is now active.</p>
              <p style="margin:0 0 8px; color: #475569; font-size: 14px;">Access runs until <strong style="color: #0f172a;">${escapeHtml(expiresFormatted)}</strong>.</p>
              <p style="margin:0 0 28px; color: #475569; font-size: 16px; line-height: 1.6;">You have full access to all productivity tools on anycode.it.</p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 12px; background: linear-gradient(135deg, #135bec 0%, #0d47c2 100%); box-shadow: 0 2px 8px rgba(19, 91, 236, 0.35);">
                    <a href="${dashboardUrl}" target="_blank" rel="noopener" style="display: inline-block; padding: 14px 28px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none;">Go to Dashboard</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px 32px; border-top: 1px solid #e2e8f0;">
              <p style="margin:0; color: #94a3b8; font-size: 14px;">Thanks,<br/><strong style="color: #64748b;">The Anycode team</strong></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function sendPaymentSuccessEmail(
  to: string,
  name: string | null | undefined,
  planLabel: string,
  newExpiresAt: Date
): Promise<void> {
  if (!resend) return;

  const displayName = name?.trim() || "there";
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Payment successful — Your Anycode subscription is active",
      html: getPaymentSuccessEmailHtml(displayName, planLabel, newExpiresAt),
    });
  } catch (err) {
    console.error("Resend payment success email error:", err);
    throw err;
  }
}

export async function sendFreeSubscriptionEmail(to: string, name?: string | null): Promise<void> {
  if (!resend) return;

  const displayName = name?.trim() || "there";
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "You won 10 days free subscription — Anycode",
      html: getFreeSubscriptionEmailHtml(displayName),
    });
  } catch (err) {
    console.error("Resend free subscription email error:", err);
    throw err;
  }
}

export async function sendWelcomeEmail(
  to: string,
  name?: string | null,
  verifyToken?: string
): Promise<void> {
  if (!resend) return;

  const displayName = name?.trim() || "there";
  const verifyLink =
    verifyToken &&
    `${APP_URL.replace(/\/$/, "")}/api/auth/verify-email?token=${encodeURIComponent(verifyToken)}`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: verifyLink
        ? "Welcome to Anycode — Verify your email to get 1 day free"
        : "Welcome to Anycode",
      html: getWelcomeEmailHtml(displayName, verifyLink),
    });
  } catch (err) {
    console.error("Resend welcome email error:", err);
  }
}
