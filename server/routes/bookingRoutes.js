import express from "express";

import {
  createBooking,
  getMyBookings,
  getMyBookingById,
  cancelBooking,
} from "../controllers/bookingController.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("customer"));

router.post("/", createBooking);

router.get("/", getMyBookings);

router.get("/:id", getMyBookingById);

router.patch("/:id/cancel", cancelBooking);

export default router;