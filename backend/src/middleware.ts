import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev_jwt_secret_change_me";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function userMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.header("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : undefined;

  if (!token) {
    res.status(401).json({ message: "Missing authorization token" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id?: string };
    if (!decoded.id) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}
