import jwt from "jsonwebtoken";
import { Env } from "../config/env.js";

export function authenticateAdmin(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token missing" });
  }

  jwt.verify(token, Env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });

    req.user = user; // attach decoded token payload to request object
    next();
  });
}
