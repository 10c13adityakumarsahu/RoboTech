import express from "express";
import path from "path";
import db from "../db.js";
import { protectAdmin } from "../middleware/auth.middleware.js";
import { uploadProjectMedia } from "../middleware/uploadProjectMedia.js";
import { processAndSaveImage } from "../utils/imageProcessor.js";

const router = express.Router();
const PROJECTS_DIR = path.resolve("uploads/projects");

/* =====================================================
   GET – Admin Projects (with cover image)
===================================================== */
router.get("/", protectAdmin, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT
        p.id,
        p.title,
        p.project_lead,
        p.description,
        p.is_open_source,
        p.github_url,
        p.display_order,
        pm.image_path
      FROM projects p
      LEFT JOIN LATERAL (
        SELECT image_path
        FROM project_media
        WHERE project_id = p.id
        ORDER BY is_primary DESC, created_at ASC
        LIMIT 1
      ) pm ON true
      WHERE p.is_deleted = FALSE
      ORDER BY p.display_order ASC, p.created_at DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("Fetch admin projects error:", err);
    res.status(500).json({ message: "Failed to load admin projects" });
  }
});


/* =====================================================
   POST – Create Project + Images
===================================================== */
/* ================= CREATE PROJECT ================= */
router.post(
  "/",
  protectAdmin,
  uploadProjectMedia.array("images", 5),
  async (req, res) => {
    const {
      title,
      project_lead,
      description,
      is_open_source,
      github_url,
    } = req.body;

    try {
      const { rows } = await db.query(
        `
        INSERT INTO projects
          (title, project_lead, description, is_open_source, github_url)
        VALUES ($1,$2,$3,$4,$5)
        RETURNING id
        `,
        [title, project_lead, description, is_open_source, github_url]
      );

      const projectId = rows[0].id;

      /* Save images */
      if (req.files?.length) {
        for (let i = 0; i < req.files.length; i++) {
          const filename = await processAndSaveImage({
            buffer: req.files[i].buffer,
            outputDir: path.join("uploads/projects"),
            filenameBase: `${projectId}-${Date.now()}-${i}`,
          });

          await db.query(
            `
            INSERT INTO project_media (project_id, image_path, is_primary)
            VALUES ($1,$2,$3)
            `,
            [
              projectId,
              `/media/projects/${filename}`,
              i === 0, // first image = primary
            ]
          );
        }
      }

      res.json({ message: "Project created successfully" });
    } catch (err) {
      console.error("Create project error:", err);
      res.status(500).json({ message: "Failed to create project" });
    }
  }
);

/* =====================================================
   PUT – Update Project + Replace Images
===================================================== */
router.put(
  "/:id",
  protectAdmin,
  uploadProjectMedia.array("images", 5),
  async (req, res) => {
    const { id } = req.params;
    const {
      title,
      project_lead,
      description,
      is_open_source,
      github_url,
    } = req.body;

    try {
      await db.query(
        `
        UPDATE projects
        SET
          title=$1,
          project_lead=$2,
          description=$3,
          is_open_source=$4,
          github_url=$5,
          updated_at=now()
        WHERE id=$6
        `,
        [title, project_lead, description, is_open_source, github_url, id]
      );

      if (req.files?.length) {
        for (let i = 0; i < req.files.length; i++) {
          const filename = await processAndSaveImage({
            buffer: req.files[i].buffer,
            outputDir: path.join("uploads/projects"),
            filenameBase: `${id}-${Date.now()}-${i}`,
          });

          await db.query(
            `
            INSERT INTO project_media (project_id, image_path)
            VALUES ($1,$2)
            `,
            [id, `/media/projects/${filename}`]
          );
        }
      }

      res.json({ message: "Project updated successfully" });
    } catch (err) {
      console.error("Update project error:", err);
      res.status(500).json({ message: "Failed to update project" });
    }
  }
);


/* =====================================================
   DELETE – Project
===================================================== */
router.delete("/:id", protectAdmin, async (req, res) => {
  try {
    await db.query(`DELETE FROM projects WHERE id = $1`, [req.params.id]);
    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;
