import express from "express";
import { protectAdmin } from "../middleware/auth.middleware.js";

/* ===== CONTROLLERS ===== */
import {
  createEvent,
  updateEvent,
  deleteEvent,
  getAdminEvents,
  getAdminEventById
} from "../controllers/event.controller.js";

/* ===== MULTER ===== */
import { uploadEventBanner } from "../middleware/eventBannerUpload.js";

const router = express.Router();
router.use(protectAdmin);

/* ================= EVENTS CRUD ================= */

// ✅ CREATE EVENT (FormData + banner REQUIRED)
router.post(
  "/",
  uploadEventBanner.single("banner"), // 🔥 REQUIRED
  createEvent
);

// ✅ READ
router.get("/", getAdminEvents);
router.get("/:id", getAdminEventById);

// ✅ UPDATE EVENT (FormData, banner optional)
router.put(
  "/:id",
  uploadEventBanner.single("banner"),
  updateEvent
);

// ✅ DELETE
router.delete("/:id", deleteEvent);

export default router;
