import nodemailer from "nodemailer";
import { randomInt } from "crypto";
import { env } from "../config/env.js";
import { EmailVerification } from "../models/EmailVerification.js";

const enabled = Boolean(env.smtp.host && env.smtp.user && env.smtp.pass && env.smtp.from);

const transporter = enabled
  ? nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: {
        user: env.smtp.user,
        pass: env.smtp.pass,
      },
    })
  : null;

/** Returns SMTP config status (masked) and tests the live connection. */
export async function verifySmtp(): Promise<{ configured: boolean; host: string; port: number; secure: boolean; user: string; connectionOk: boolean; error?: string }> {
  const config = {
    configured: enabled,
    host: env.smtp.host || "(not set)",
    port: env.smtp.port,
    secure: env.smtp.secure,
    user: env.smtp.user
      ? env.smtp.user.replace(/(.).+(@.+)/, "$1***$2")
      : "(not set)",
    connectionOk: false,
    error: undefined as string | undefined,
  };
  if (!enabled || !transporter) {
    config.error = "SMTP not configured — check SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM in .env";
    return config;
  }
  try {
    await transporter.verify();
    config.connectionOk = true;
  } catch (err: any) {
    config.error = err?.message || "Unknown connection error";
  }
  return config;
}

export async function sendMail(to: string, subject: string, html: string) {
  if (!enabled || !transporter) {
    throw new Error(
      "SMTP is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS and SMTP_FROM in the server .env file."
    );
  }
  await transporter.sendMail({
    from: env.smtp.from,
    to,
    subject,
    html,
  });
}

/**
 * Generate a 6-digit verification code, persist it, and email it to the user.
 * Safe to call from any route — silently logs if SMTP is not configured.
 */
export async function issueVerificationCode(email: string, userId: string) {
  const code = randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 15);
  await EmailVerification.deleteMany({ userId, used: false });
  await EmailVerification.create({ userId, code, expiresAt, used: false });

  const html = `
    <p>Hi,</p>
    <p>Your email verification code is <strong>${code}</strong>.</p>
    <p>This code expires in 15 minutes.</p>
  `;

  // Let errors propagate so callers can surface them properly
  await sendMail(email, "Verify your email", html);
}
