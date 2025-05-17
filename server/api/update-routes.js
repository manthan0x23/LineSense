import { Router } from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { metroLines } from "../data/lines/metro-lines.js";

const updateRouter = new Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function haversineDistance(a, b) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const aVal =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
  return R * c;
}

function insertPointSorted(polyline, point) {
  let minDiff = Infinity;
  let insertIndex = polyline.length;

  for (let i = 0; i < polyline.length - 1; i++) {
    const a = polyline[i];
    const b = polyline[i + 1];
    const distToA = haversineDistance(point, a);
    const distToB = haversineDistance(point, b);
    const ab = haversineDistance(a, b);
    const total = distToA + distToB;
    const diff = Math.abs(total - ab);

    if (diff < minDiff) {
      minDiff = diff;
      insertIndex = i + 1;
    }
  }

  return [
    ...polyline.slice(0, insertIndex),
    point,
    ...polyline.slice(insertIndex),
  ];
}

updateRouter.put("/add-point", async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      message,
      speed: { min, max },
      type,
      lineId,
    } = req.body;

    const line = metroLines.find((line) => line.id === lineId);
    if (!line) return res.status(404).json({ error: "Line not found" });

    const filePath = path.join(__dirname, `../data/lines/${line.fs}`);
    const content = await fs.readFile(filePath, "utf-8");
    const polyline = JSON.parse(content);

    if (!Array.isArray(polyline)) {
      return res.status(500).json({ error: "File data is not an array" });
    }

    const newPoint = {
      latitude,
      longitude,
      speed: { min, max },
      isTurn: 0,
      isStation: false,
      isAlert: true,
      isFixed: false,
      alert: {
        message,
        type,
      },
    };

    const updatedPolyline = insertPointSorted(polyline, newPoint);

    await fs.writeFile(
      filePath,
      JSON.stringify(updatedPolyline, null, 2),
      "utf-8"
    );

    res.status(200).json({
      message: "Point inserted and JSON file updated",
      insertedPoint: newPoint,
    });
  } catch (error) {
    console.error("Error in /add-point:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

updateRouter.delete("/delete-point", async (req, res) => {
  try {
    const { latitude, longitude, lineId } = req.body;

    const line = metroLines.find((line) => line.id === lineId);
    if (!line) return res.status(404).json({ error: "Line not found" });

    const filePath = path.join(__dirname, `../data/lines/${line.fs}`);
    const content = await fs.readFile(filePath, "utf-8");
    const polyline = JSON.parse(content);

    if (!Array.isArray(polyline)) {
      return res.status(500).json({ error: "File data is not an array" });
    }

    const filteredPolyline = polyline.filter((point) => {
      const samePosition =
        point.latitude === latitude && point.longitude === longitude;
      return !(samePosition && point.isFixed === false);
    });

    const deletedCount = polyline.length - filteredPolyline.length;
    if (deletedCount === 0) {
      return res
        .status(404)
        .json({ error: "Point not found or cannot be deleted (fixed)" });
    }

    await fs.writeFile(
      filePath,
      JSON.stringify(filteredPolyline, null, 2),
      "utf-8"
    );

    res.status(200).json({
      message: "Point deleted successfully",
      deletedAt: { latitude, longitude },
    });
  } catch (error) {
    console.error("Error in /delete-point:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

updateRouter.put("/update-point", async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      message,
      type,
      speed: { min, max },
      lineId,
    } = req.body;

    const line = metroLines.find((line) => line.id === lineId);
    if (!line) return res.status(404).json({ error: "Line not found" });

    const filePath = path.join(__dirname, `../data/lines/${line.fs}`);
    const content = await fs.readFile(filePath, "utf-8");
    const polyline = JSON.parse(content);

    if (!Array.isArray(polyline)) {
      return res.status(500).json({ error: "File data is not an array" });
    }

    let found = false;
    const updatedPolyline = polyline.map((point) => {
      const samePosition =
        point.latitude.toString() === latitude.toString() &&
        point.longitude.toString() === longitude.toString();

      if (samePosition) {
        found = true;
        return {
          ...point,
          message,
          speed: { min, max },
          isAlert: type !== "none",
          alert: type !== "none" ? { message, type } : undefined,
        };
      }
      return point;
    });

    if (!found) {
      return res
        .status(404)
        .json({ error: "Point not found or cannot be updated (fixed)" });
    }

    await fs.writeFile(
      filePath,
      JSON.stringify(updatedPolyline, null, 2),
      "utf-8"
    );

    res.status(200).json({
      message: "Point updated successfully",
      updatedAt: { latitude, longitude },
    });
  } catch (error) {
    console.error("Error in /update-point:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { updateRouter };
