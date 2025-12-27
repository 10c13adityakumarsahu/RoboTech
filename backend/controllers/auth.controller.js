import bcrypt from "bcrypt";
import crypto from "crypto";
import pool from "../db.js";
import { generateToken } from "../utils/jwt.js";
import { sendPasswordEmail } from "../utils/mailer.js";
import { logAdminEvent } from "../utils/auditLogger.js";

/* ================= LOGIN ================= */
export const login = async (req, res) => {
  const { email, password } = req.body;

  const { rows } = await pool.query(
    "SELECT * FROM admins WHERE email=$1",
    [email]
  );

  if (!rows.length) return res.status(401).json({ message: "Invalid credentials" });

  const admin = rows[0];
  const match = await bcrypt.compare(password, admin.password_hash);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  const token = generateToken({ id: admin.id, role: admin.role });

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: false,
  }).json({ message: "Login successful" });
};

/* ================= LOGOUT ================= */
export const logout = (req, res) => {
  res.clearCookie("token").json({ message: "Logged out" });
};

/* ================= SEND PASSWORD EMAIL (COMMON) ================= */
const sendResetFlow = async (email, type) => {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashed = crypto.createHash("sha256").update(resetToken).digest("hex");
  const expiry = new Date(Date.now() + 15 * 60 * 1000);

  await pool.query(
    `UPDATE admins
     SET reset_token=$1, reset_token_expiry=$2
     WHERE email=$3`,
    [hashed, expiry, email]
  );

  const link =
    `${process.env.CLIENT_URL}/admin/reset-password/${resetToken}`;

  await sendPasswordEmail(email, link, type);
};

/* ================= FORGOT PASSWORD ================= */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const { rows } = await pool.query(
    "SELECT id FROM admins WHERE email=$1",
    [email]
  );

  if (rows.length) {
    await sendResetFlow(email, "FORGOT");

    await logAdminEvent({
      eventType: "FORGOT_PASSWORD_REQUEST",
      adminId: rows[0].id,
      email,
      req,
      success: true,
    });
  } else {
    await logAdminEvent({
      eventType: "FORGOT_PASSWORD_REQUEST",
      email,
      req,
      success: false,
      reason: "Email not found",
    });
  }

  res.json({ message: "If email exists, a link has been sent" });
};

/* ================= CHANGE PASSWORD (EMAIL-BASED) ================= */
export const requestChangePassword = async (req, res) => {
  const { rows } = await pool.query(
    "SELECT email FROM admins WHERE id=$1",
    [req.admin.id]
  );

  await sendResetFlow(rows[0].email, "CHANGE");

  await logAdminEvent({
    eventType: "CHANGE_PASSWORD_REQUEST",
    adminId: req.admin.id,
    email: rows[0].email,
    req,
    success: true,
  });

  res.json({ message: "Password change link sent to email" });
};


/* ================= RESET PASSWORD (FINAL STEP) ================= */
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashed = crypto.createHash("sha256").update(token).digest("hex");

  const { rows } = await pool.query(
    `SELECT id, email FROM admins
     WHERE reset_token=$1 AND reset_token_expiry > NOW()`,
    [hashed]
  );

  if (!rows.length) {
    await logAdminEvent({
      eventType: "RESET_PASSWORD_FAILED",
      req,
      success: false,
      reason: "Invalid or expired token",
    });

    return res.status(400).json({ message: "Invalid or expired link" });
  }

  const newHash = await bcrypt.hash(password, 10);

  await pool.query(
    `UPDATE admins
     SET password_hash=$1,
         reset_token=NULL,
         reset_token_expiry=NULL,
         admin_sessions_invalid_before=NOW()`,
    [newHash]
  );

  await logAdminEvent({
    eventType: "RESET_PASSWORD_SUCCESS",
    adminId: rows[0].id,
    email: rows[0].email,
    req,
    success: true,
  });

  res.json({ message: "Password updated successfully" });
};


//check admin auth
export const checkAuth = (req, res) => {
  res.json({ authenticated: true });
};