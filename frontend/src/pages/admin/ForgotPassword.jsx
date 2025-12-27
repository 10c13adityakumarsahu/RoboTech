import { useState } from "react";
import api from "../../api/axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async () => {
    await api.post("/auth/forgot-password", { email });
    setMsg("If email exists, a reset link has been sent.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded w-96">
        <h2 className="text-white text-xl mb-4">Forgot Password</h2>

        <input
          className="w-full p-2 mb-4 rounded"
          placeholder="Admin Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={submit}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Send Reset Link
        </button>

        {msg && <p className="text-green-400 mt-4">{msg}</p>}
      </div>
    </div>
  );
}
