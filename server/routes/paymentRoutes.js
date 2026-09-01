import express from "express";

import {
  createPaymentOrder,
  verifyPayment,
} from "../controllers/paymentController.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("customer"));

router.post(
  "/:bookingId/create-order",
  createPaymentOrder
);

router.post(
  "/:bookingId/verify",
  verifyPayment
);

export default router;