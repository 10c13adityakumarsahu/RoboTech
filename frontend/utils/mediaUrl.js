export function buildMediaUrl(path) {
  if (!path) return null;

  const base = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${base}${cleanPath}`;
}
