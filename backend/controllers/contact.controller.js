import pool from "../db.js";
import { sendContactNotificationEmail } from "../services/mail.service.js";

export async function submitContactForm(req, res) {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: "Invalid input" });
    }

    const result = await pool.query(
      `
      INSERT INTO contact_messages
      (name, email, subject, message, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
      `,
      [
        name.trim(),
        email.trim().toLowerCase(),
        subject?.trim() || null,
        message.trim(),
        req.ip,
        req.headers["user-agent"] || null,
      ]
    );

    console.log("Contact message inserted with ID:", result.rows[0].id);

    await sendContactNotificationEmail({
      name,
      email,
      subject,
      message,
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("❌ Contact form DB error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to save contact message",
    });
  }
}
