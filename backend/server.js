import "./env.js";

import path from "path";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

/* ===== ROUTES ===== */
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import adminAuditRoutes from "./routes/admin.audit.routes.js";

import contactRoutes from "./routes/contact.routes.js";
import adminContactRoutes from "./routes/admin.contact.routes.js";

import teamRoutes from "./routes/team.routes.js";
import adminTeamRoutes from "./routes/admin.team.routes.js";

import projectRoutes from "./routes/projects.routes.js";
import adminProjectRoutes from "./routes/admin.project.routes.js";

import galleryRoutes from "./routes/gallery.routes.js";
import adminGalleryRoutes from "./routes/admin.gallery.routes.js";

import announcementRoutes from "./routes/announcement.routes.js";
import adminAnnouncementRoutes from "./routes/admin.announcement.routes.js";

import adminEventRoutes from "./routes/admin.event.routes.js"
import publicEventRoutes from "./routes/public.event.routes.js"

import sponsorshipRoutes from "./routes/sponsorship.routes.js";

/* ===== APP INIT ===== */
const __dirname = path.resolve();
const app = express();

/* ===== MIDDLEWARE ===== */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

/* ===== STATIC FILES ===== */
app.use("/uploads/team", express.static(path.join(__dirname, "uploads/team")));
app.use("/media/projects", express.static("uploads/projects"));
app.use("/media/gallery", express.static("uploads/gallery"));
app.use("/media/announcements", express.static("uploads/announcements"));
app.use(
  "/media/events",
  express.static(path.join(__dirname, "uploads/events"))
);

/* =========================================================
   ADMIN ROUTES (ORDER MATTERS)
   ========================================================= */

/* --- Announcements (Admin) --- */
app.use("/api/admin/announcements", adminAnnouncementRoutes);

/* --- Audit Logs (Admin) --- */
app.use("/api/admin", adminAuditRoutes);

/* --- Other Admin CMS --- */
app.use("/api/admin/events", adminEventRoutes);
app.use("/api/admin/projects", adminProjectRoutes);
app.use("/api/admin/gallery", adminGalleryRoutes);
app.use("/api/admin/team", adminTeamRoutes);
app.use("/api/admin/contactMessages", adminContactRoutes);

/* --- Admin Auth (login, logout, check) --- */
app.use("/api/admin", adminRoutes);

/* =========================================================
   PUBLIC ROUTES
   ========================================================= */
app.use("/api/events", publicEventRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/gallery", galleryRoutes);

app.use("/api", sponsorshipRoutes);

/* ===== START SERVER ===== */
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
