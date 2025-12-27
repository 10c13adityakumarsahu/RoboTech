export function validateAnnouncement(req, res, next) {
  const { title, body_html, expires_at } = req.body;

  if (!title || !body_html) {
    return res.status(400).json({ message: "Title and content are required" });
  }

  if (expires_at) {
    const expires = new Date(expires_at);
    const maxExpiry = new Date();
    maxExpiry.setMonth(maxExpiry.getMonth() + 5);

    if (expires > maxExpiry) {
      return res
        .status(400)
        .json({ message: "Expiry cannot exceed 5 months" });
    }
  }

  next();
}
