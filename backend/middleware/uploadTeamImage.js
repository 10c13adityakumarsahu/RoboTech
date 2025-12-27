import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/team";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage(); // IMPORTANT

export const uploadTeamImage = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 1 MB buffer (important)
  },
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});
