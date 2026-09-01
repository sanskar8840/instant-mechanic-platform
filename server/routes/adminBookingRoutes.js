import express from "express";

import {
  getAllBookings,
  getAvailableMechanics,
  assignMechanic,
  getAdminBookingById,
} from "../controllers/adminBookingController.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("admin"));

router.get("/bookings", getAllBookings);

router.get("/bookings/:id", getAdminBookingById);

router.get("/mechanics", getAvailableMechanics);

router.patch("/bookings/:id/assign", assignMechanic);

export default router;