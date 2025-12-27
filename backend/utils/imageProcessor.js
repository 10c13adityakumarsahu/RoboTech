import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

export async function processAndSaveImage({
  buffer,
  outputDir,
  filenameBase,
  width = 1200,
  quality = 80,
}) {
  await fs.mkdir(outputDir, { recursive: true });

  const filename = `${filenameBase}.webp`;
  const outputPath = path.join(outputDir, filename);

  await sharp(buffer)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality })
    .toFile(outputPath);

  return filename;
}
