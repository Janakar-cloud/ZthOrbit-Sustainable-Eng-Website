import { Router } from "express";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { z } from "zod";
import { User } from "../models/User.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { PasswordReset } from "../models/PasswordReset.js";
import { EmailVerification } from "../models/EmailVerification.js";
import { signAccess } from "../utils/jwt.js";
import { sendMail } from "../utils/mailer.js";
import { env } from "../config/env.js";
import { AuthUser, requireAuth } from "../middleware/auth.js";
import { randomInt } from "crypto";

const router = Router();

const dashboardRoles: AuthUser["role"][] = ["superadmin", "admin", "editor"];

function stripTrailingSlash(url: string) {
  return url.replace(/\/+$/, "");
}

function shouldUseDashboard(role: AuthUser["role"]) {
  return dashboardRoles.includes(role);
}

function getPreferredAppUrl(role: AuthUser["role"], requestedApp?: "public" | "dashboard") {
  if (requestedApp === "dashboard") return stripTrailingSlash(env.dashboardUrl);
  if (requestedApp === "public") return stripTrailingSlash(env.appUrl);
  return shouldUseDashboard(role) ? stripTrailingSlash(env.dashboardUrl) : stripTrailingSlash(env.appUrl);
}

function buildAppTargets(role: AuthUser["role"], requestedApp?: "public" | "dashboard") {
  const publicUrl = stripTrailingSlash(env.appUrl);
  const dashboardUrl = stripTrailingSlash(env.dashboardUrl);
  const preferredUrl = getPreferredAppUrl(role, requestedApp);

  return {
    publicUrl,
    dashboardUrl,
    preferredUrl,
    shouldUseDashboard: preferredUrl === dashboardUrl,
    dashboardLoginUrl: `${dashboardUrl}/login`,
    publicLoginUrl: `${publicUrl}/login`,
  };
}

function toAuthUser(user: { _id?: { toString(): string }; id?: string; email: string; role: AuthUser["role"]; name?: string | null }) {
  const id = user.id ?? user._id?.toString();
  if (!id) throw new Error("User id is missing");

  return {
    id,
    email: user.email,
    role: user.role,
    name: user.name || null,
  };
}

function buildAuthResponse(user: { _id?: { toString(): string }; id?: string; email: string; role: AuthUser["role"]; name?: string | null }, refreshToken?: string) {
  const authUser = toAuthUser(user);
  const payload: AuthUser = { id: authUser.id, role: authUser.role, email: authUser.email };

  return {
    accessToken: signAccess(payload),
    ...(refreshToken ? { refreshToken } : {}),
    user: {
      id: authUser.id,
      email: authUser.email,
      role: authUser.role,
      name: authUser.name,
    },
    app: buildAppTargets(authUser.role),
  };
}

const registerSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8),
  name: z.string().max(100).optional(),
});

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email, password, name } = parsed.data;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: "Email already registered" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash, name, role: "viewer" });

  await issueVerificationCode(user.email, user.id);

  res.status(202).json({ message: "Verification code sent to email. Please verify before logging in." });
});

const loginSchema = z.object({ email: z.string().email(), password: z.string() });

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password } = parsed.data;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  if (!user.emailVerified) {
    return res.status(403).json({ error: "Email not verified. Please complete verification." });
  }

  const payload: AuthUser = { id: user.id, role: user.role, email: user.email };
  const refreshToken = await issueRefresh(user.id, payload);
  res.json(buildAuthResponse(user, refreshToken));
});

router.post("/refresh", async (req, res) => {
  const token = req.body.refreshToken as string | undefined;
  if (!token) return res.status(400).json({ error: "Missing refreshToken" });
  try {
    const stored = await RefreshToken.findOne({ token, revoked: false });
    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }
    const user = await User.findById(stored.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(buildAuthResponse(user));
  } catch (err) {
    res.status(401).json({ error: "Invalid refresh token" });
  }
});

router.get("/me", requireAuth(), async (req, res) => {
  const user = await User.findById(req.user?.id).select("email name role emailVerified");
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name || null,
      role: user.role,
      emailVerified: user.emailVerified,
    },
    app: buildAppTargets(user.role),
  });
});

router.post("/logout", async (req, res) => {
  const token = req.body.refreshToken as string | undefined;
  if (!token) return res.status(400).json({ error: "Missing refreshToken" });
  await RefreshToken.findOneAndUpdate({ token }, { revoked: true });
  res.json({ success: true });
});

const resetRequestSchema = z.object({
  email: z.string().email().max(320),
  app: z.enum(["public", "dashboard"]).optional(),
});

router.post("/request-reset", async (req, res) => {
  const parsed = resetRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const user = await User.findOne({ email: parsed.data.email });
  if (user) {
    const token = randomBytes(32).toString("hex");
    await PasswordReset.create({
      userId: user._id,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 30),
      used: false,
    });
    const appBaseUrl = getPreferredAppUrl(user.role, parsed.data.app);
    const resetLink = `${appBaseUrl}/reset?token=${token}`;
    try {
      await sendMail(
        user.email,
        "Reset your password",
        `<p>Hi ${user.name || "there"},</p><p>Click the link below to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>This link expires in 30 minutes.</p>`
      );
    } catch (mailErr) {
      console.warn("[mailer] failed to send reset email", mailErr);
    }
    return res.json({ success: true });
  }
  res.json({ success: true });
});

const resetSchema = z.object({ token: z.string(), password: z.string().min(8) });

router.post("/reset", async (req, res) => {
  const parsed = resetSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const entry = await PasswordReset.findOne({ token: parsed.data.token, used: false });
  if (!entry || entry.expiresAt < new Date()) return res.status(400).json({ error: "Invalid or expired token" });
  const user = await User.findById(entry.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  user.passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await user.save();
  entry.used = true;
  await entry.save();
  res.json({ success: true });
});

const verificationSchema = z.object({ email: z.string().email(), code: z.string().length(6) });

router.post("/verify-email", async (req, res) => {
  const parsed = verificationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, code } = parsed.data;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });
  if (user.emailVerified) return res.json({ message: "Email already verified" });

  const record = await EmailVerification.findOne({ userId: user._id, code, used: false }).sort({ createdAt: -1 });
  if (!record || record.expiresAt < new Date()) {
    return res.status(400).json({ error: "Invalid or expired code" });
  }

  user.emailVerified = true;
  await user.save();
  record.used = true;
  await record.save();

  const payload: AuthUser = { id: user.id, role: user.role, email: user.email };
  const refreshToken = await issueRefresh(user.id, payload);
  res.json(buildAuthResponse(user, refreshToken));
});

router.post("/resend-verification", async (req, res) => {
  const parsed = z.object({ email: z.string().email() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const user = await User.findOne({ email: parsed.data.email });
  if (!user) return res.status(404).json({ error: "User not found" });
  if (user.emailVerified) return res.json({ message: "Email already verified" });

  await issueVerificationCode(user.email, user.id);
  res.json({ message: "Verification code resent" });
});

async function issueRefresh(userId: string, payload: AuthUser) {
  const token = randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
  await RefreshToken.create({ userId, token, expiresAt, revoked: false });
  // Return JWT-based refresh for verification plus stored token for revocation
  return token;
}

async function issueVerificationCode(email: string, userId: string) {
  const code = randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 15);
  await EmailVerification.deleteMany({ userId, used: false });
  await EmailVerification.create({ userId, code, expiresAt, used: false });

  const html = `
    <p>Hi,</p>
    <p>Your verification code is <strong>${code}</strong>.</p>
    <p>This code expires in 15 minutes.</p>
  `;

  try {
    await sendMail(email, "Verify your email", html);
  } catch (err) {
    console.warn("[mailer] failed to send verification email", err);
  }
}

export default router;
