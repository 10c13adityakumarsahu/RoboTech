import jwt from "jsonwebtoken";
import pool from "../db.js";

export const protectAdmin = async (req, res, next) => {
  const token =
    req.cookies.token ||
    req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔐 Fetch global invalidation time
    const { rows } = await pool.query(
      "SELECT admin_sessions_invalid_before FROM admins LIMIT 1"
    );

    const invalidBefore = rows[0]?.admin_sessions_invalid_before;

    if (invalidBefore) {
      const tokenIssuedAt = new Date(decoded.iat * 1000);

      if (tokenIssuedAt < invalidBefore) {
        return res.status(401).json({
          message: "Session expired. Please login again.",
        });
      }
    }

    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
