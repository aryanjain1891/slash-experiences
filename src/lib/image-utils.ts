export const FALLBACK_IMAGE = "/assets/placeholder.jpg";

/**
 * Resolves a single image source value to a valid URL string.
 * Handles arrays (takes first element), objects with url/path keys,
 * and /lovable-uploads/ legacy paths.
 */
export function getValidImgSrc(src: unknown): string {
  if (!src) return FALLBACK_IMAGE;
  if (Array.isArray(src)) return getValidImgSrc(src[0]);
  if (typeof src === "object" && src !== null) {
    const obj = src as Record<string, unknown>;
    if (typeof obj.url === "string") return obj.url;
    if (typeof obj.path === "string") return obj.path;
    return FALLBACK_IMAGE;
  }
  if (typeof src !== "string") return FALLBACK_IMAGE;
  if (!src.trim()) return FALLBACK_IMAGE;
  return src.replace("/lovable-uploads/", "/assets/");
}

/**
 * Parses an image_url field (which may be a JSON array string, a plain URL,
 * a comma-separated list, or an actual JS array) into an array of valid URL strings.
 */
export function parseImageUrls(imageUrl: unknown): string[] {
  if (imageUrl == null) return [];
  if (Array.isArray(imageUrl)) return imageUrl.map(getValidImgSrc).filter((u) => u !== FALLBACK_IMAGE || imageUrl.length === 1);
  if (typeof imageUrl !== "string") return [];
  const trimmed = imageUrl.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.map(getValidImgSrc);
    } catch {
      // fall through to comma-split
    }
  }
  if (trimmed.includes(",") && !trimmed.startsWith("data:")) {
    return trimmed.split(",").map((u) => getValidImgSrc(u.trim()));
  }
  return [getValidImgSrc(trimmed)];
}

/**
 * Returns the first valid image URL from an image_url field.
 * Safe to use in non-React contexts (server components, scripts).
 */
export function getFirstImageUrl(imageUrl: unknown): string {
  const urls = parseImageUrls(imageUrl);
  return urls[0] ?? FALLBACK_IMAGE;
}
