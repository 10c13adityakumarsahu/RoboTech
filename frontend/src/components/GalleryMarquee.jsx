import { buildMediaUrl } from "../../utils/mediaUrl";

export default function GalleryMarquee({ images, onOpen }) {
  if (!images || images.length === 0) return null;

  return (
    <div className="overflow-hidden">
      <div className="flex gap-6 animate-marquee">
        {images.map((img) => (
          <img
            key={img.id}
            src={buildMediaUrl(img.image_path)}
            alt={img.caption || "Gallery image"}
            onClick={() => onOpen(img)}
            loading="lazy"
            className="h-60 w-80 object-cover rounded-lg cursor-pointer hover:scale-105 transition"
          />
        ))}
      </div>
    </div>
  );
}
