import validateSponsorship from "../utils/sponsorship.validator.js";
import service from "../services/sponsorship.service.js";
import { sendSponsorshipNotificationEmail } from "../services/mail.service.js";

export async function submitSponsorship(req, res) {
  const valid = validateSponsorship(req.body);
  if (!valid) {
    return res.status(400).json({ error: "Invalid input" });
  }

  await service.createInquiry(valid);
   await sendSponsorshipNotificationEmail(valid);
  res.status(201).json({ success: true });
}

export async function listSponsorships(req, res) {
  const data = await service.getAllInquiries();
  res.json(data);
}

export async function deleteSponsorship(req, res) {
  await service.softDeleteInquiry(req.params.id);
  res.json({ success: true });
}
