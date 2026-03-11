import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AuthUser } from "../middleware/auth.js";

export function signAccess(user: AuthUser) {
  return jwt.sign(user, env.jwtSecret, { expiresIn: "30m" });
}

export function signRefresh(user: AuthUser) {
  return jwt.sign(user, env.jwtRefreshSecret, { expiresIn: "7d" });
}

export function verifyRefresh(token: string): AuthUser {
  return jwt.verify(token, env.jwtRefreshSecret) as AuthUser;
}
