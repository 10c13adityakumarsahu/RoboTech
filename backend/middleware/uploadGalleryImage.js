import multer from "multer";

export const uploadGalleryImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2*1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only images allowed"));
    } else {
      cb(null, true);
    }
  },
});
