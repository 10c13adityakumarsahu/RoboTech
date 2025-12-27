export default function ShareButtons() {
  const url = window.location.href;

  function copyLink() {
    navigator.clipboard.writeText(url);
    alert("Link copied");
  }

  return (
    <div className="flex gap-3 mt-6">
      <button
        onClick={copyLink}
        className="border px-3 py-1 rounded"
      >
        Copy Link
      </button>

      <a
        href={`https://wa.me/?text=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="border px-3 py-1 rounded"
      >
        WhatsApp
      </a>

      <a
        href={`https://t.me/share/url?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="border px-3 py-1 rounded"
      >
        Telegram
      </a>
    </div>
  );
}
