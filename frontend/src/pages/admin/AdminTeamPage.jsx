import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

/* ================= PAGE ================= */

export default function AdminTeamPage() {
  const navigate = useNavigate();

  const [years, setYears] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* ================= LOAD META ================= */

  useEffect(() => {
    async function loadMeta() {
      const yearsRes = await api.get("/team/years");
      setYears(yearsRes.data);

      const active = yearsRes.data.find((y) => y.is_active);
      if (active) setSelectedYear(active.label);

      const teamRes = await api.get("/admin/team/team-groups");
      setTeams(teamRes.data);
    }
    loadMeta();
  }, []);

  /* ================= LOAD MEMBERS ================= */

  useEffect(() => {
    if (!selectedYear) return;

    async function loadMembers() {
      setLoading(true);
      try {
        const res = await api.get("/admin/team", {
          params: { year: selectedYear },
        });
        setMembers(res.data);
      } finally {
        setLoading(false);
      }
    }

    loadMembers();
  }, [selectedYear]);

  const refresh = async () => {
    const res = await api.get("/admin/team", {
      params: { year: selectedYear },
    });
    setMembers(res.data);
  };

  /* ================= DELETE ================= */

  const confirmDelete = async () => {
    setDeleting(true);
    await api.delete(`/admin/team/member/${deleteTarget.id}`);
    setDeleting(false);
    setDeleteTarget(null);
    refresh();
  };

  return (
    <div className="p-4 sm:p-6 text-white max-w-6xl mx-auto">

      {/* ===== BACK NAV ===== */}
      <button
        onClick={() => navigate("/admin/dashboard")}
        className="text-sm text-cyan-400 hover:underline mb-4 w-fit"
      >
        ← Back to Dashboard
      </button>

      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400">
            Team Management
          </h1>
          <p className="text-sm text-gray-400">
            Manage members dynamically for all years
          </p>
        </div>

        <button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="bg-cyan-500 px-4 py-2 rounded-lg text-black font-semibold w-full sm:w-auto"
        >
          + Add Member
        </button>
      </div>

      {/* ===== YEAR SELECT ===== */}
      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(e.target.value)}
        className="mb-6 w-full sm:w-64 bg-gray-900 border border-cyan-500/30 rounded px-4 py-2"
      >
        {years.map((y) => (
          <option key={y.id} value={y.label}>
            {y.label}
          </option>
        ))}
      </select>

      {/* ===== MEMBERS LIST ===== */}
      {loading ? (
        <SkeletonList />
      ) : members.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {members.map((m) => (
            <div
              key={m.id}
              className="glass p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div>
                <p className="font-semibold">{m.name}</p>
                <p className="text-xs text-gray-400">
                  {m.role} • {m.team}
                </p>
              </div>

              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => {
                    setEditing(m);
                    setFormOpen(true);
                  }}
                  className="text-cyan-400 text-sm hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteTarget(m)}
                  className="text-red-400 text-sm hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== MODALS ===== */}
      {formOpen && (
        <MemberForm
          editing={editing}
          years={years}
          teams={teams}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            refresh();
          }}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.name}
          deleting={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

/* ================= SKELETON ================= */

function SkeletonList() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="h-16 rounded-xl bg-white/5 animate-pulse"
        />
      ))}
    </div>
  );
}

/* ================= EMPTY ================= */

function EmptyState() {
  return (
    <div className="text-center text-gray-400 py-16">
      No team members for this year yet.
    </div>
  );
}

/* ================= FORM ================= */

function MemberForm({ editing, years, teams, onClose, onSaved }) {
  const [imageError, setImageError] = useState(false);
  const [preview, setPreview] = useState(null);

  const [form, setForm] = useState({
    name: editing?.name || "",
    role: editing?.role || "",
    description: editing?.description || "",
    year_id: editing?.year_id || "",
    team_id: editing?.team_id || "",
    linkedin: editing?.linkedin || "",
    instagram: editing?.instagram || "",
    github: editing?.github || "",
  });

  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const resizeImage = (file) =>
    new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target.result;
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 512;
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, size, size);

        canvas.toBlob(
          (blob) => {
            resolve(
              new File([blob], "upload.jpg", {
                type: "image/jpeg",
              })
            );
          },
          "image/jpeg",
          1.5
        );
      };

      reader.readAsDataURL(file);
    });

  const submit = async () => {
    if (!form.name || !form.role || !form.year_id || !form.team_id) {
      setError("Please fill all required fields.");
      return;
    }

    setSaving(true);
    setError("");

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (image) fd.append("image", image);

    if (editing) {
      await api.put(`/admin/team/member/${editing.id}`, fd);
    } else {
      await api.post("/admin/team/member", fd);
    }

    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass w-full max-w-lg p-6 space-y-4">
        <h3 className="text-xl font-semibold text-cyan-400">
          {editing ? "Edit Member" : "Add Member"}
        </h3>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {["name", "role"].map((f) => (
          <input
            key={f}
            placeholder={f.toUpperCase()}
            value={form[f]}
            onChange={(e) =>
              setForm({ ...form, [f]: e.target.value })
            }
            className="w-full bg-black/40 border border-cyan-400/30 rounded px-3 py-2"
          />
        ))}

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          className="w-full bg-black/40 border border-cyan-400/30 rounded px-3 py-2"
        />

        <select
          value={form.year_id}
          onChange={(e) =>
            setForm({ ...form, year_id: e.target.value })
          }
          className="w-full bg-black/40 border border-cyan-400/30 rounded px-3 py-2"
        >
          <option value="">Select Year</option>
          {years.map((y) => (
            <option key={y.id} value={y.id}>
              {y.label}
            </option>
          ))}
        </select>

        <select
          value={form.team_id}
          onChange={(e) =>
            setForm({ ...form, team_id: e.target.value })
          }
          className="w-full bg-black/40 border border-cyan-400/30 rounded px-3 py-2"
        >
          <option value="">Select Team</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        {["linkedin", "instagram", "github"].map((f) => (
          <input
            key={f}
            placeholder={f}
            value={form[f]}
            onChange={(e) =>
              setForm({ ...form, [f]: e.target.value })
            }
            className="w-full bg-black/40 border border-cyan-400/30 rounded px-3 py-2"
          />
        ))}

        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (file.size > 2 * 1024 * 1024) {
              setError("Image too large. Max 2 MB allowed.");
              setImageError(true);
              return;
            }

            const resized = await resizeImage(file);
            setImage(resized);
            setPreview(URL.createObjectURL(resized));
            setImageError(false);
            setError("");
          }}
        />

        {imageError && (
          <p className="text-xs text-red-400">
            Selected image exceeds size limit.
          </p>
        )}

        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="w-24 h-24 rounded-full object-cover border border-cyan-400 mx-auto"
          />
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 rounded"
            disabled={saving}
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={saving || imageError}
            className={`px-4 py-2 rounded text-black ${
              saving || imageError
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-cyan-500 hover:bg-cyan-400"
            }`}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= DELETE ================= */

function DeleteModal({ name, deleting, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass p-6 max-w-sm w-full">
        <h3 className="text-lg font-semibold text-red-400 mb-2">
          Confirm Delete
        </h3>
        <p className="text-sm text-gray-300 mb-6">
          Delete <b>{name}</b> permanently?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="px-4 py-2 bg-gray-700 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 rounded"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
