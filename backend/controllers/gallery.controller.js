import db from "../db.js";
import path from "path";
import fs from "fs/promises";
import { processAndSaveImage } from "../utils/imageProcessor.js";



export async function getAdminGallery(req, res) {
  try {
    const { rows } = await db.query(`
      SELECT
        id,
        image_path,
        caption,
        is_active,
        created_at
      FROM gallery
      WHERE is_deleted = FALSE
      ORDER BY created_at DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("Fetch admin gallery error:", err);
    res.status(500).json({ message: "Failed to load gallery" });
  }
}
/* ================= UPLOAD GALLERY IMAGES ================= */
export async function uploadGalleryImages(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const savedImages = [];

    for (const file of req.files) {
      const filename = await processAndSaveImage({
        buffer: file.buffer,
        outputDir: path.resolve("uploads/gallery"),
        filenameBase: `gallery_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2)}`,
        width: 1600,
        quality: 80,
      });

      const imagePath = `/media/gallery/${filename}`;

      const { rows } = await db.query(
        `
        INSERT INTO gallery (image_path)
        VALUES ($1)
        RETURNING *
        `,
        [imagePath]
      );

      savedImages.push(rows[0]);
    }

    res.json({
      message: "Gallery images uploaded successfully",
      images: savedImages,
    });
  } catch (err) {
    console.error("Gallery upload error:", err);
    res.status(500).json({ message: "Failed to upload gallery images" });
  }
}


/* ================= DELETE GALLERY IMAGE ================= */
export async function deleteGalleryImage(req, res) {
  try {
    await db.query(
      `UPDATE gallery SET is_deleted = TRUE WHERE id = $1`,
      [req.params.id]
    );
    res.json({ message: "Gallery image deleted" });
  } catch (err) {
    console.error("Delete gallery image error:", err);
    res.status(500).json({ message: "Failed to delete image" });
  }
}
