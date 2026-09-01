import express from "express";

import {
  getServices,
  getServiceById,
} from "../controllers/serviceController.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("customer"));

router.get("/", getServices);

router.get("/:id", getServiceById);

export default router;