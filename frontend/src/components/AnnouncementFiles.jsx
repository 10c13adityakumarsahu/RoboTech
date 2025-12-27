import api from "../api/axios";

/* ===== FRONTEND VALIDATION RULES (MUST MATCH BACKEND) ===== */
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

const ALLOWED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export default function AnnouncementFiles({ announcementId, onError }) {

  async function uploadFiles(e) {
    const files = Array.from(e.target.files);

    if (!files.length) return;

    /* ===== VALIDATE BEFORE SENDING ===== */
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        onError?.(
          `"${file.name}" is not supported. Allowed formats: PDF, PNG, JPG, DOCX.`
        );
        e.target.value = ""; // 🔥 CRITICAL: reset input
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        onError?.(
          `"${file.name}" exceeds the maximum allowed size of 2 MB.`
        );
        e.target.value = ""; // 🔥 CRITICAL: reset input
        return;
      }
    }

    /* ===== SAFE TO UPLOAD ===== */
    const fd = new FormData();
    files.forEach((file) => fd.append("files", file));

    try {
      await api.post(
        `/admin/announcements/${announcementId}/files`,
        fd
      );
    } catch (err) {
      console.error(err);
      onError?.("Failed to upload attachment(s). Please try again.");
    } finally {
      e.target.value = ""; // reset after success too
    }
  }

  return (
    <div>
      <input
        type="file"
        multiple
        accept=".pdf,.png,.jpg,.jpeg,.docx"
        onChange={uploadFiles}
        className="text-sm"
      />
      <p className="text-xs text-gray-500 mt-1">
        Allowed: PDF, PNG, JPG, DOCX (max 2 MB each)
      </p>
    </div>
  );
}
