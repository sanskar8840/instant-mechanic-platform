import express from "express";

import {
  addVehicle,
  getMyVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} from "../controllers/vehicleController.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("customer"));

router.post("/", addVehicle);

router.get("/", getMyVehicles);

router.get("/:id", getVehicleById);

router.put("/:id", updateVehicle);

router.delete("/:id", deleteVehicle);

export default router;