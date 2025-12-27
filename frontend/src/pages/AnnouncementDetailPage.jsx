import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import ShareButtons from "../components/ShareButtons";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function AnnouncementDetailPage() {
  const { id } = useParams();
  const [announcement, setAnnouncement] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/announcements/${id}`)
      .then(res => setAnnouncement(res.data))
      .catch(() => setError("Announcement not found"));
  }, [id]);

  if (error) {
    return <p className="p-6">{error}</p>;
  }

  if (!announcement) {
    return <p className="p-6">Loading...</p>;
  }

  return (
    <>
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 py-10 pt-24">
        <h1 className="text-3xl font-bold mb-2">
          {announcement.title}
        </h1>

        <p className="text-sm text-gray-500 mb-6">
          Published on{" "}
          {new Date(announcement.published_at).toLocaleDateString()}
        </p>

        <div
          className="prose max-w-none mb-6"
          dangerouslySetInnerHTML={{ __html: announcement.body_html }}
        />
        {announcement.files && announcement.files.length > 0 && (
        <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">
            Attachments
            </h3>

            <ul className="space-y-2">
            {announcement.files.map(file => (
                <li key={file.id}>
                <a
                    href={`/api/announcements/files/${file.id}`}
                    className="text-blue-600 underline"
                >
                    {file.original_name || "Download file"}
                </a>
                </li>
            ))}
            </ul>
        </div>
        )}

        {announcement.external_link && (
          <a
            href={announcement.external_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 block mb-4"
          >
            External Link →
          </a>
        )}

        <ShareButtons />

      </main>

      <Footer />
    </>
  );
}
