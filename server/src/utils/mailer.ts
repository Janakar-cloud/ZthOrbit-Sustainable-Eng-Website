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

export async function sendMail(to: string, subject: string, html: string) {
  if (!enabled || !transporter) {
    console.warn("[mailer] SMTP not configured; email skipped");
    return;
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

  try {
    await sendMail(email, "Verify your email", html);
  } catch (err) {
    console.warn("[mailer] failed to send verification email", err);
  }
}
