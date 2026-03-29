import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AuthUser {
  id: string;
  role: "superadmin" | "admin" | "editor" | "viewer";
  email: string;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}

function parseToken(req: Request) {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    return header.substring(7);
  }
  return null;
}

export function requireAuth(roles?: AuthUser["role"][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = parseToken(req);
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
      const decoded = jwt.verify(token, env.jwtSecret) as AuthUser;
      req.user = decoded;
      if (roles && roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: "Forbidden" });
      }
      next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
  };
}
