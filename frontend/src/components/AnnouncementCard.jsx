export default function AnnouncementCard({ announcement, onReadMore }) {
  return (
    <div className="border rounded-lg p-4 bg-white/5 border-white/10">
      <h2 className="text-xl font-semibold mb-1">
        {announcement.title}
      </h2>

      {announcement.published_at && (
        <p className="text-sm text-gray-500 mb-2">
          Published{" "}
          {new Date(announcement.published_at).toLocaleDateString()}
        </p>
      )}

      <p className="text-gray-300 line-clamp-3">
        {announcement.body_html
          .replace(/<[^>]+>/g, "")
          .slice(0, 200)}
        …
      </p>

      {/* ✅ CORRECT: use onClick */}
      <button
        onClick={onReadMore}
        className="inline-block mt-3 text-cyan-400 hover:text-cyan-300"
      >
        Read more →
      </button>
    </div>
  );
}
