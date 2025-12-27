import sanitize from "sanitize-html";

export function sanitizeAnnouncementHtml(html) {
  return sanitize(html, {
    allowedTags: [
      "p", "br", "b", "strong", "i", "em",
      "ul", "ol", "li",
      "h1", "h2", "h3",
      "a"
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"]
    },
    transformTags: {
      a: sanitize.simpleTransform("a", {
        target: "_blank",
        rel: "noopener noreferrer"
      })
    }
  });
}
