import { useEffect, useState } from "react";
import api from "../api/axios";
import AnnouncementCard from "../components/AnnouncementCard";
import AnnouncementDetailModal from "../components/AnnouncementDetailModal";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeAnnouncement, setActiveAnnouncement] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // ===== FETCH ANNOUNCEMENTS =====
  useEffect(() => {
    api
      .get("/announcements")
      .then(res => setAnnouncements(res.data))
      .finally(() => setLoading(false));
  }, []);

  // ===== PAUSE VIDEO WHEN TAB IS INACTIVE (CCC OPTIMIZATION) =====
  useEffect(() => {
    const video = document.querySelector("video");

    const handleVisibility = () => {
      if (!video) return;
      document.hidden ? video.pause() : video.play();
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // ===== OPEN ANNOUNCEMENT MODAL =====
  async function openAnnouncement(id) {
    try {
      setLoadingDetail(true);
      const res = await api.get(`/announcements/${id}`);
      setActiveAnnouncement(res.data);
    } finally {
      setLoadingDetail(false);
    }
  }

  return (
    <>
      <Navbar />

      {/* ===== BACKGROUND VIDEO SECTION (NO FOOTER) ===== */}
      <div className="relative min-h-screen overflow-hidden">

        {/* BACKGROUND VIDEO */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        >
          <source src="\annoucementBg.mp4" type="video/mp4" />
        </video>
{/* 
        {/* DARK OVERLAY */}
        {/* <div className="absolute inset-0 bg-black/70" /> */}

        {/* PAGE CONTENT */}
        <main className="relative z-10 min-h-screen px-6 pt-24 max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-cyan-400">
            Announcements
          </h1>

          {loading ? (
            <p className="text-gray-300">Loading…</p>
          ) : announcements.length === 0 ? (
            <p className="text-gray-400">No announcements available.</p>
          ) : (
            <div className="space-y-4">
              {announcements.map(a => (
                <AnnouncementCard
                  key={a.id}
                  announcement={a}
                  onReadMore={() => openAnnouncement(a.id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ===== FOOTER (NO VIDEO) ===== */}
      <Footer />

      {/* ===== ANNOUNCEMENT DETAIL MODAL ===== */}
      {activeAnnouncement && (
        <AnnouncementDetailModal
          announcement={activeAnnouncement}
          loading={loadingDetail}
          onClose={() => setActiveAnnouncement(null)}
        />
      )}
    </>
  );
}
