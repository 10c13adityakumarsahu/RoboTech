import { useEffect, useState } from "react";
import api from "../api/axios";
import { buildMediaUrl } from "../../utils/mediaUrl";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const res = await api.get("/events");
      setEvents(res.data);
    } finally {
      setLoading(false);
    }
  }

  function toggleExpand(id) {
    setExpanded(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center text-gray-400">
          Loading events…
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* ================= BACKGROUND VIDEO ================= */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="fixed inset-0 w-full h-full object-cover -z-20"
        poster="/eventsBgPoster.png"
      >
        <source src="/eventsBg.mp4" type="video/mp4" />
      </video>

      {/* ================= OVERLAY ================= */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-[1px] -z-10" />

      {/* ================= CONTENT ================= */}
      <main className="text-white pt-28  relative z-10">
        <div className="max-w-6xl mx-auto px-6 space-y-24">
          {events.map(event => {
            const isOpen = expanded[event.id];

            return (
              <article
                key={event.id}
                className="
                  rounded-2xl overflow-hidden
                  bg-neutral-950/90
                 
                  shadow-xl
                "
              >
                {/* ================= BANNER ================= */}
                {event.banner_image && (
                  <div className="relative h-[460px]">
                    <img
                      src={buildMediaUrl(
                        `/media/events/${event.banner_image}`
                      )}
                      alt={event.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60" />

                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h2 className="text-3xl sm:text-4xl font-bold text-cyan-400">
                        {event.title}
                      </h2>

                      {event.venue && (
                        <p className="text-sm text-gray-300 mt-1">
                          📍 {event.venue}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* ================= CONTENT ================= */}
                <div className="p-6 sm:p-10 space-y-6">
                  {/* SHORT DESCRIPTION + REGISTER CTA */}
                  {event.short_description && (
                    <div className="flex flex-col sm:flex-row sm:items-start sm:gap-6">
                      <p className="text-lg text-gray-300 flex-1">
                        {event.short_description}
                      </p>

                      {event.registration_open &&
                        event.external_registration_link && (
                          <a
                            href={event.external_registration_link}
                            target="_blank"
                            rel="noreferrer"
                            className="
                              shrink-0
                              inline-flex items-center justify-center
                              bg-cyan-500 hover:bg-cyan-600
                              text-black font-semibold
                              px-6 py-3
                              rounded-xl
                              transition
                              mt-4 sm:mt-0
                            "
                          >
                            Register Now
                          </a>
                        )}
                    </div>
                  )}

                  {/* READ MORE BUTTON */}
                  {(event.full_description ||
                    event.external_links?.length > 0) && (
                    <button
                      onClick={() => toggleExpand(event.id)}
                      className="text-cyan-400 hover:underline text-sm"
                    >
                      {isOpen ? "Show less ↑" : "Read more ↓"}
                    </button>
                  )}

                  {/* ================= EXPANDABLE SECTION ================= */}
                  <div
                    className={`
                      transition-all duration-300 ease-in-out
                      overflow-hidden
                      ${isOpen ? "max-h-[6000px] opacity-100" : "max-h-0 opacity-0"}
                    `}
                  >
                    <div className="pt-6 space-y-8">
                      {/* Full description */}
                      {event.full_description && (
                        <div
                          className="
                            prose prose-invert max-w-none
                            prose-p:text-gray-300
                            prose-a:text-cyan-400
                            prose-strong:text-white
                          "
                          dangerouslySetInnerHTML={{
                            __html: event.full_description
                          }}
                        />
                      )}

                      {/* External Links */}
                      {event.external_links?.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3">
                            Related Links
                          </h3>
                          <ul className="space-y-2">
                            {event.external_links.map((link, i) => (
                              <li key={i}>
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-cyan-400 hover:underline"
                                >
                                  🔗 {link.label}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}

          {!events.length && (
            <p className="text-center text-gray-500">
              No events available.
            </p>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
