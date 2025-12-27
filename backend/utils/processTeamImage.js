import sharp from "sharp";
import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";

export async function processTeamImage(buffer) {
  const filename = `${uuid()}.jpg`;
  const outputPath = path.join("uploads/team", filename);

  await sharp(buffer)
    .resize(512, 512, {
      fit: "cover",
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 75,
      mozjpeg: true,
    })
    .toFile(outputPath);

  return `/uploads/team/${filename}`;
}
