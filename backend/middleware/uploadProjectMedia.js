import multer from "multer";

export const uploadProjectMedia = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 800 * 1024, // 800 KB per image
    files: 5,            // max 5 images
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files are allowed"));
    } else {
      cb(null, true);
    }
  },
});
