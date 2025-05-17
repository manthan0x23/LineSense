import { Router } from "express";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";
import { authenticateAdmin } from "../middleware/admin-auth.js";
import { Env } from "../config/env.js";

const authRouter = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const usersFilePath = path.resolve(__dirname, "../data/users/users.json");

function readUsers() {
  try {
    const data = fs.readFileSync(usersFilePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

authRouter.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Username and password required" });

  const users = readUsers();

  if (users.find((u) => u.username === username)) {
    return res.status(400).json({ error: "Username already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: users.length ? users[users.length - 1].id + 1 : 1,
    username,
    password: hashedPassword,
  };

  users.push(newUser);
  writeUsers(users);

  const token = jwt.sign(
    { id: newUser.id, username: newUser.username },
    Env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 1000,
  });

  res
    .status(201)
    .json({ message: "User registered successfully", user: newUser.username });
});

authRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);

  if (!username || !password)
    return res.status(400).json({ error: "Username and password required" });

  const users = readUsers();

  const user = users.find((u) => u.username === username);
  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    Env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 1000,
  });

  res.json({ message: "Login successful", user: user.username });
});

authRouter.get("/verify", authenticateAdmin, (req, res) => {
  res.json({ message: "Token is valid", user: req.user });
});

export { authRouter };
