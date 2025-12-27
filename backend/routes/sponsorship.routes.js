import express from "express";

import {
  submitSponsorship,
  listSponsorships,
  deleteSponsorship
} from "../controllers/sponsorship.controller.js";

import { sponsorshipRateLimiter } from "../middleware/sponsorshipRateLimiter.js"; // ✅ FIX
import { protectAdmin } from "../middleware/auth.middleware.js";                  // ✅ CONSISTENT

const router = express.Router();

/* ===== PUBLIC ===== */
router.post(
  "/sponsorship",
  sponsorshipRateLimiter,
  submitSponsorship
);

/* ===== ADMIN ===== */
router.get(
  "/admin/sponsorship",
  protectAdmin,
  listSponsorships
);

router.delete(
  "/admin/sponsorship/:id",
  protectAdmin,
  deleteSponsorship
);

export default router;
