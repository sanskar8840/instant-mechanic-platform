import express from "express";

import {
  getAdminFinanceSummary,
  markMechanicPayoutPaid,
} from "../controllers/adminFinanceController.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("admin"));

router.get(
  "/summary",
  getAdminFinanceSummary
);

router.patch(
  "/bookings/:bookingId/payout-paid",
  markMechanicPayoutPaid
);

export default router;