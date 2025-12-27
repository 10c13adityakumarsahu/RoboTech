import multer from "multer";
import fs from "fs";
import path from "path";

const uploadDir = "uploads/announcements";

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    // 🔒 Sanitize filename
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safeName}`);
  }
});

export const uploadAnnouncementFiles = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB
  },

  fileFilter(req, file, cb) {
    const allowedMimeTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new Error("Unsupported file type. Only PDF, PNG, JPG, and DOCX allowed."),
        false
      );
    }

    cb(null, true);
  }
});
