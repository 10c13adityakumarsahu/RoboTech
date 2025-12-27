import db from "../db.js";
import fs from "fs";
import path from "path";

export async function downloadAnnouncementFile(req, res) {
  const { fileId } = req.params;

  // 1️⃣ Fetch file + announcement (security check)
  const { rows } = await db.query(
    `
    SELECT
      af.file_path,
      af.original_name,
      af.mime_type,
      a.published_at,
      a.expires_at,
      a.is_archived
    FROM announcement_files af
    JOIN announcements a ON a.id = af.announcement_id
    WHERE af.id = $1
    `,
    [fileId]
  );

  if (!rows.length) {
    return res.status(404).json({ message: "File not found" });
  }

  const file = rows[0];

  // 2️⃣ Security rules
  if (!file.published_at || file.is_archived) {
    return res.status(403).json({ message: "File not available" });
  }

  if (file.expires_at && new Date(file.expires_at) < new Date()) {
    return res.status(403).json({ message: "Announcement expired" });
  }

  // 3️⃣ Resolve absolute file path
  const absolutePath = path.resolve(
    "uploads",
    file.file_path.replace("/media/", "")
  );

  if (!fs.existsSync(absolutePath)) {
    return res.status(404).json({ message: "File missing on server" });
  }

  // 4️⃣ FORCE DOWNLOAD (THIS IS THE FIX)
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${encodeURIComponent(file.original_name)}"`
  );
  res.setHeader("Content-Type", file.mime_type);

  return res.download(absolutePath);
}