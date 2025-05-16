import { Router } from "express";
import { metroLines } from "../data/lines/metro-lines.js";

const dataRouter = new Router();

dataRouter.get("/ladder-data", (_, res) => {
  try {
    res.json(metroLines);
  } catch (error) {
    console.error(error);
    res.status(500).json("Inernal Server error");
  }
});

dataRouter.get("/line-info/:lineId", (req, res) => {
  try {
    const { lineId } = req.params;
    const Line = metroLines.find((l) => l.id == lineId);
    res.json(Line);
  } catch (error) {
    console.error(error);
    res.status(500).json("Inernal Server error");
  }
});

export { dataRouter };
