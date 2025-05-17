import jwt from "jsonwebtoken";
import { Env } from "../config/env.js";

export function authenticateAdmin(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: "Access token missing" });
  }

  try {
    const decoded = jwt.verify(token, Env.JWT_SECRET);
    req.user = decoded;
    console.log(decoded);
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}
