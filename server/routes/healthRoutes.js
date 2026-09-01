import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

router.get("/", (req, res) => {
  const dbStates = ["disconnected", "connected", "connecting", "disconnecting"];

  res.status(200).json({
    success: true,
    service: "instant-mechanic-api",
    database: dbStates[mongoose.connection.readyState] || "unknown",
    timestamp: new Date().toISOString()
  });
});

export default router;
