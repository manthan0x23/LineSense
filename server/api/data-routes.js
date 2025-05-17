import { Router } from "express";
import { readJsonArrayFile, metroLines } from "../data/lines/metro-lines.js";

const dataRouter = new Router();

dataRouter.get("/ladder-data", (_, res) => {
  try {
    res.json(metroLines);
  } catch (error) {
    console.error(error);
    res.status(500).json("Inernal Server error");
  }
});

dataRouter.get("/line-info/:lineId", async (req, res) => {
  try {
    const { lineId } = req.params;
    const line = metroLines.find((l) => l.id == lineId);
    if (!line) {
      return res.status(404).json({ error: "Line not found" });
    }
    const polyline = await readJsonArrayFile(line.fs);

    res.json({ ...line, polyline });
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal Server error");
  }
});

export { dataRouter };
