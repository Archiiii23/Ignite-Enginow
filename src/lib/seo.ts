export const SITE_NAME = "Enginow Ignite";
export const SITE_URL = "https://enginow-ignite.com";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

type PageMetaInput = {
  /** Page name only — " | Enginow Ignite" is appended automatically. */
  title: string;
  description: string;
  /** Absolute path, e.g. "/events" */
  path: string;
  /** Optional distinct description for social cards. */
  socialDescription?: string;
  image?: string;
  type?: "website" | "article" | "profile";
  noindex?: boolean;
};

export function pageTitle(title: string) {
  return `${title} | ${SITE_NAME}`;
}

/** Builds the full meta array (title + description + OG + Twitter) for a route head(). */
export function pageMeta({
  title,
  description,
  path,
  socialDescription,
  image = DEFAULT_OG_IMAGE,
  type = "website",
  noindex = false,
}: PageMetaInput) {
  const fullTitle = pageTitle(title);
  const social = socialDescription ?? description;
  const url = `${SITE_URL}${path === "/" ? "" : path}`;

  const meta: Array<Record<string, string>> = [
    { title: fullTitle },
    { name: "description", content: description },

    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: social },
    { property: "og:type", content: type },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: fullTitle },
    { property: "og:locale", content: "en_US" },

    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: social },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: fullTitle },
  ];

  if (noindex) meta.push({ name: "robots", content: "noindex, nofollow" });

  return meta;
}

/** Canonical link entry for a route head(). */
export function canonical(path: string) {
  return [{ rel: "canonical", href: path }];
}
