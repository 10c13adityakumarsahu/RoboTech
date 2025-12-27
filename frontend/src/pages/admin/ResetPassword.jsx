import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../api/axios";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const submit = async () => {
    await api.post(`/auth/reset-password/${token}`, { password });
    setMsg("Password updated. Redirecting to login...");
    setTimeout(() => navigate("/admin/login"), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded w-96">
        <h2 className="text-white text-xl mb-4">Reset Password</h2>

        <input
          type="password"
          className="w-full p-2 mb-4 rounded"
          placeholder="New Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={submit}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Update Password
        </button>

        {msg && <p className="text-green-400 mt-4">{msg}</p>}
      </div>
    </div>
  );
}
