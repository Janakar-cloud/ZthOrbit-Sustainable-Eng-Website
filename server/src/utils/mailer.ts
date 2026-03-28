import nodemailer from "nodemailer";
import { env } from "../config/env.js";

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
