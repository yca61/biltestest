import sanitizeHtml from "sanitize-html";

export const cleanHtml = (html: string) =>
  sanitizeHtml(html, {
    allowedTags: ["p", "br", "h2", "h3", "h4", "strong", "em", "u", "s", "ul", "ol", "li", "blockquote", "a", "img", "hr", "figure", "figcaption", "table", "thead", "tbody", "tr", "th", "td"],
    allowedAttributes: { a: ["href", "target", "rel"], img: ["src", "alt", "width", "height", "loading"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: { a: (tag, a) => ({ tagName: tag, attribs: { ...a, ...(a.target === "_blank" ? { rel: "noopener noreferrer" } : {}) } }) },
  });
export const cleanText = (s: string) => sanitizeHtml(s, { allowedTags: [], allowedAttributes: {} }).trim();
