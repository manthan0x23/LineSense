import express from "express";
import dotenv from "dotenv";
import { dataRouter } from "./api/data-routes.js";
import { authRouter } from "./api/auth-routes.js";
import bodyParser from "body-parser";
import cors from "cors";
import { Env } from "./config/env.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use("/admin", authRouter);
app.use("/data", dataRouter);

const PORT = Env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
