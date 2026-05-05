import { createTransport } from 'nodemailer';

export function createMailer() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendReport({ transporter, to, subject, html }) {
  const from = process.env.SMTP_USER;

  const info = await transporter.sendMail({
    from: `"Flight Stalker" <${from}>`,
    to,
    subject,
    html,
  });

  return info.messageId;
}
