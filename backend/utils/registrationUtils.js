export function isRegistrationOpen(event) {
  if (!event.registration_enabled) return false;

  const now = new Date();

  if (!event.registration_start || !event.registration_end) return false;

  return (
    now >= new Date(event.registration_start) &&
    now <= new Date(event.registration_end)
  );
}

