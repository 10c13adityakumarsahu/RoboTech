export default function AnnouncementStatusBadge({ announcement }) {
  const now = new Date();

  let label = "Draft";
  let color = "gray";

  if (announcement.is_archived) {
    label = "Archived";
    color = "red";
  } else if (announcement.published_at) {
    if (announcement.expires_at && new Date(announcement.expires_at) <= now) {
      label = "Expired";
      color = "yellow";
    } else {
      label = "Active";
      color = "green";
    }
  }

  return (
    <span className={`text-${color}-600 text-sm`}>
      {label}
    </span>
  );
}
