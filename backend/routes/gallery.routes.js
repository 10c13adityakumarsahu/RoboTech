import express from "express";
import db from "../db.js";

const router = express.Router();

/* ================= PUBLIC GALLERY ================= */
router.get("/", async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT
        id,
        image_path,
        caption
      FROM gallery
      WHERE is_deleted = FALSE
      ORDER BY created_at DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("Fetch gallery error:", err);
    res.status(500).json({ message: "Failed to load gallery" });
  }
});

export default router;
