import express from "express";
import { protectAdmin } from "../middleware/auth.middleware.js";
import { uploadGalleryImage } from "../middleware/uploadGalleryImage.js";
import {
  uploadGalleryImages,
  deleteGalleryImage,
  getAdminGallery, // 👈 ADD THIS
} from "../controllers/gallery.controller.js";

const router = express.Router();

router.use(protectAdmin);

/* ================= ADMIN GALLERY ================= */

// ✅ GET all gallery images (ADMIN)
router.get("/", getAdminGallery);

// ✅ Upload images
router.post(
  "/upload",
  uploadGalleryImage.array("images", 10),
  uploadGalleryImages
);

// ✅ Delete image
router.delete("/image/:id", deleteGalleryImage);

export default router;
