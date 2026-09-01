import express from "express";

import {
  createReview,
  getBookingReview,
} from "../controllers/reviewController.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("customer"));

router.post("/", createReview);

router.get(
  "/booking/:bookingId",
  getBookingReview
);

export default router;