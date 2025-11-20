import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Missing Authorization header" });

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Invalid Authorization header format" });
  }

  const token = parts[1];
  try {
    const payload = verifyAccessToken(token);
    // attach user minimal fields
    req.user = { id: Number(payload.id), email: String(payload.email) };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired access token" });
  }
}
