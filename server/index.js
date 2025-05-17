import express from "express";
import dotenv from "dotenv";
import { dataRouter } from "./api/data-routes.js";
import { authRouter } from "./api/auth-routes.js";
import bodyParser from "body-parser";
import cors from "cors";
import { Env } from "./config/env.js";
import cookieParser from "cookie-parser";
import { authenticateAdmin } from "./middleware/admin-auth.js";
import { updateRouter } from "./api/update-routes.js";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: Env.CLIENT_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());

app.use("/admin", authRouter);
app.use("/data", dataRouter);
app.use("/update", authenticateAdmin, updateRouter);

const PORT = Env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
