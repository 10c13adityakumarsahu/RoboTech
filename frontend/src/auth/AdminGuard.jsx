import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";

export default function AdminGuard({ children }) {
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    api
      .get("/auth/check")
      .then(() => setAllowed(true))
      .catch(() => setAllowed(false));
  }, []);

  if (allowed === null) return null;
  return allowed ? children : <Navigate to="/admin/login" />;
}
