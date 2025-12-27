import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";

const uploadDir = "uploads/events";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = ".jpg"; // force jpg
    cb(null, `event-${req.params.id}-${Date.now()}${ext}`);
  }
});

function fileFilter(req, file, cb) {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files allowed"));
  }
  cb(null, true);
}

export const uploadEventBanner = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});
