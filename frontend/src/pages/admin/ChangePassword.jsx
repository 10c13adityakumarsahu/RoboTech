import api from "../../api/axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const sendEmail = async () => {
    try {
      setLoading(true);
      await api.post("/auth/request-change-password");
      setMsg("Password change link sent to your email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto text-white">

      {/* ===== BACK NAV ===== */}
      <button
        onClick={() => navigate("/admin/dashboard")}
        className="text-sm text-cyan-400 hover:underline mb-4 w-fit"
      >
        ← Back to Dashboard
      </button>

      <h2 className="text-xl font-semibold mb-2">
        Change Password
      </h2>

      <p className="text-sm text-gray-400 mb-6">
        A secure password reset link will be sent to your registered email address.
      </p>

      <button
        onClick={sendEmail}
        disabled={loading}
        className={`
          px-4 py-2 rounded
          text-white
          ${loading ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
        `}
      >
        {loading ? "Sending…" : "Send Change Password Email"}
      </button>

      {msg && (
        <p className="text-green-500 mt-4 text-sm">
          {msg}
        </p>
      )}
    </div>
  );
}
