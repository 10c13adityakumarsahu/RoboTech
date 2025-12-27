import { useEffect, useState } from "react";
import api from "../api/axios";
import Navigation from "../components/Navbar";
import Footer from "../components/Footer";
import { buildMediaUrl } from "../../utils/mediaUrl";

export default function TeamPage() {
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD YEARS ================= */

  useEffect(() => {
    async function loadYears() {
      const res = await api.get("/team/years");
      setYears(res.data);

      const active = res.data.find(y => y.is_active);
      if (active) setSelectedYear(active.label);
    }
    loadYears();
  }, []);

  /* ================= LOAD TEAM ================= */

  useEffect(() => {
    if (!selectedYear) return;

    async function loadTeam() {
      setLoading(true);
      try {
        const res = await api.get("/team", {
          params: { year: selectedYear }
        });
        setTeamData(res.data);
      } finally {
        setLoading(false);
      }
    }

    loadTeam();
  }, [selectedYear]);

  /* ================= GROUP BY TEAM ================= */

  const grouped = teamData.reduce((acc, m) => {
    acc[m.team] = acc[m.team] || [];
    acc[m.team].push(m);
    return acc;
  }, {});

  return (
    <>
      <Navigation />

      {/* ================= HERO ================= */}
      <section
        className="relative min-h-screen flex items-center justify-center text-center bg-cover bg-center"
        style={{
          backgroundImage: "url('/team-hero.jpg')" // 🔥 replace with your team image
        }}
      >
        {/* Strong dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />

        {/* Subtle tech noise (optional but recommended) */}
        <div className="absolute inset-0 opacity-[0.06] bg-[url('/noise.png')]" />

        {/* Content */}
        <div className="relative z-10 max-w-3xl px-6">
          <h1 className="text-4xl md:text-6xl font-bold text-cyan-400 neon-text mb-4">
            Meet Our Team
          </h1>

          <p className="text-gray-300 text-lg">
            The passionate minds behind Robotech NITK.
          </p>

          {/* Year Selector */}
          <div className="mt-6">
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="
                bg-black/70
                border border-cyan-400/40
                text-white px-4 py-2
                rounded-lg
                backdrop-blur
              "
            >
              {years.map(y => (
                <option key={y.id} value={y.label}>
                  {y.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ================= TEAM SECTIONS ================= */}
      <section className="relative px-6 md:px-20 lg:px-32 py-20 space-y-24 bg-gradient-to-b from-black via-[#020617] to-black">
        {/* Divider glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

        {loading ? (
          <div className="text-center text-gray-400">
            Loading team…
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center text-gray-400">
            No team data available
          </div>
        ) : (
          Object.entries(grouped).map(([teamName, members]) => (
            <TeamSection
              key={teamName}
              title={teamName}
              members={members}
            />
          ))
        )}
      </section>

      <Footer />
    </>
  );
}

/* ================= COMPONENTS ================= */

function TeamSection({ title, members }) {
  return (
    <div>
      <h2 className="text-3xl font-bold text-cyan-400 neon-text mb-10">
        {title}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {members.map(m => (
          <TeamCard key={m.id} member={m} />
        ))}
      </div>
    </div>
  );
}

function TeamCard({ member }) {
  const [active, setActive] = useState(false);

  return (
    <div
      className="
        group relative cursor-pointer rounded-2xl
        border border-cyan-400/20
        bg-white/5 backdrop-blur-xl
        p-6 text-center overflow-hidden
        transition-transform duration-300
        hover:-translate-y-2 hover:shadow-cyan-500/20
      "
      onClick={() => {
        if (window.innerWidth < 768) {
          setActive(p => !p);
        }
      }}
    >
      {/* NORMAL VIEW */}
      <div
        className={`transition-all duration-500 ${
          active ? "opacity-0 scale-95" : "opacity-100"
        }`}
      >
        {member.image_path ? (
          <img
            src={buildMediaUrl(member.image_path)}
            alt={member.name}
            loading="lazy"
            className="
              w-56 h-56 mx-auto rounded-full object-cover
              border-4 border-cyan-400 mb-4
              shadow-lg
            "
          />
        ) : (
          <div className="
            w-56 h-56 mx-auto mb-4 rounded-full
            border-4 border-cyan-400
            flex items-center justify-center
            bg-black/40 text-cyan-300 text-4xl font-bold
          ">
            {member.name.charAt(0).toUpperCase()}
          </div>
        )}

        <h3 className="text-xl font-semibold text-cyan-300">
          {member.name}
        </h3>
        <p className="text-gray-400 text-sm">
          {member.role}
        </p>
      </div>

      {/* HOVER / TAP VIEW */}
      <div
        className={`
          absolute inset-0 flex flex-col items-center justify-center
          text-center px-4 bg-black/95 text-cyan-300
          transition-transform duration-500
          ${
            active
              ? "translate-y-0"
              : "translate-y-full group-hover:translate-y-0"
          }
        `}
      >
        <p className="text-sm">
          {member.description}
        </p>

        <div className="flex gap-4 mt-4">
          {member.linkedin && (
            <a href={member.linkedin} target="_blank" rel="noreferrer">
              <i className="fab fa-linkedin text-xl" />
            </a>
          )}
          {member.instagram && (
            <a href={member.instagram} target="_blank" rel="noreferrer">
              <i className="fab fa-instagram text-xl" />
            </a>
          )}
          {member.github && (
            <a href={member.github} target="_blank" rel="noreferrer">
              <i className="fab fa-github text-xl" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
