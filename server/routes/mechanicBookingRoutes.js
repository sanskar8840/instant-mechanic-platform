import express from "express";

import {
  getMyAssignedBookings,
  getMechanicBookingById,
  updateBookingStatus,
  updateMechanicLocation,
} from "../controllers/mechanicBookingController.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("mechanic"));

router.get("/bookings", getMyAssignedBookings);

router.get(
  "/bookings/:id",
  getMechanicBookingById
);

router.patch(
  "/bookings/:id/status",
  updateBookingStatus
);

router.patch(
  "/bookings/:id/location",
  updateMechanicLocation
);

export default router;