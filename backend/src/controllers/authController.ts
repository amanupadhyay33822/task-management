import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { prisma } from "../prisma";

const SALT_ROUNDS = 10;

export async function register(req: Request, res: Response) {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ message: "User already exists" });

  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { email, passwordHash: hash, name },
  });

  return res.status(201).json({ id: user.id, email: user.email, name: user.name });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const payload = { id: user.id, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // store refresh token server-side (simple approach)
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

  // For simplicity we return both tokens in the body.
  // In production it's recommended to return refresh token as httpOnly cookie.
  return res.json({ accessToken, refreshToken });
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: "Refresh token required" });

  try {
    const payload = verifyRefreshToken(refreshToken) as any;
    // check user and stored refresh token
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const newAccess = signAccessToken({ id: user.id, email: user.email });
    const newRefresh = signRefreshToken({ id: user.id, email: user.email });

    // rotate refresh token
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: newRefresh } });

    return res.json({ accessToken: newAccess, refreshToken: newRefresh });
  } catch (err) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
}

export async function logout(req: Request, res: Response) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: "Refresh token required" });

  try {
    const payload = verifyRefreshToken(refreshToken) as any;
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return res.status(200).json({ message: "Logged out" });

    // clear refresh token server-side
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: null } });
    return res.status(200).json({ message: "Logged out" });
  } catch (err) {
    // still respond 200 to avoid token probing
    return res.status(200).json({ message: "Logged out" });
  }
}
