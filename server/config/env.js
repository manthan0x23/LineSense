import { config } from "dotenv";

config();

export const Env = {
  PORT: Number(process.env.PORT),
  JWT_SECRET: String(process.env.JWT_SECRET),
  CLIENT_URL: String(process.env.CLIENT_URL),
};
