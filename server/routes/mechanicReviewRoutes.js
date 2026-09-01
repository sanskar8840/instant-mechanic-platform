import express from "express";

import {
  getMyReviewStats,
} from "../controllers/mechanicReviewController.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("mechanic"));

router.get("/reviews", getMyReviewStats);

export default router;