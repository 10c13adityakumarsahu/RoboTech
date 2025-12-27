export default function validateSponsorship(body) {
  let { name, organization, phone, email, message } = body;

  // Normalize empty strings
  organization = organization?.trim() || undefined;
  phone = phone?.trim() || undefined;

  if (!name || name.trim().length < 2 || name.trim().length > 120) return false;
  if (organization && organization.length > 150) return false;
  if (phone && phone.length > 20) return false;
  if (!email || !email.includes("@") || email.length > 150) return false;
  if (!message || message.trim().length < 10 || message.length > 2000) return false;

  return {
    name: name.trim(),
    organization,
    phone,
    email: email.trim(),
    message: message.trim()
  };
}
