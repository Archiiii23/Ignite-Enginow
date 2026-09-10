import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE } from "@/lib/seo";
import type { EventItem } from "@/data/events";

const abs = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`;

/** Helper: wrap an object for a route head() scripts entry. */
export function ldScript(data: unknown) {
  return { type: "application/ld+json", children: JSON.stringify(data) };
}

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.png`,
    image: DEFAULT_OG_IMAGE,
    description:
      "A premium platform to discover and host hackathons, workshops, webinars, bootcamps and community events.",
    slogan: "Ignite Ideas. Build Communities.",
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/events?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

function eventStatus(_event: EventItem) {
  return "https://schema.org/EventScheduled";
}

function attendanceMode(mode: EventItem["mode"]) {
  if (mode === "Online") return "https://schema.org/OnlineEventAttendanceMode";
  if (mode === "Hybrid") return "https://schema.org/MixedEventAttendanceMode";
  return "https://schema.org/OfflineEventAttendanceMode";
}

function eventLocation(event: EventItem) {
  const place = {
    "@type": "Place",
    name: event.location,
    address: { "@type": "PostalAddress", addressLocality: event.location },
  };
  const virtual = { "@type": "VirtualLocation", url: abs(`/events/${event.slug}`) };
  if (event.mode === "Online") return virtual;
  if (event.mode === "Hybrid") return [place, virtual];
  return place;
}

/** Full Event entity for an event detail page. */
export function eventLd(event: EventItem) {
  const url = abs(`/events/${event.slug}`);
  const isFree = event.price === "Free";
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": `${url}#event`,
    name: event.title,
    description: event.about || event.tagline,
    url,
    image: [DEFAULT_OG_IMAGE],
    startDate: event.dateISO,
    eventStatus: eventStatus(event),
    eventAttendanceMode: attendanceMode(event.mode),
    location: eventLocation(event),
    maximumAttendeeCapacity: event.seats,
    remainingAttendeeCapacity: Math.max(0, event.seats - event.registered),
    organizer: {
      "@type": "Organization",
      name: event.host.name,
      url: SITE_URL,
    },
    performer: { "@type": "Organization", name: event.host.name },
    offers: {
      "@type": "Offer",
      name: isFree ? "Free registration" : event.price,
      url,
      price: isFree ? "0" : undefined,
      priceCurrency: "INR",
      availability:
        event.registered >= event.seats
          ? "https://schema.org/SoldOut"
          : "https://schema.org/InStock",
      category: isFree ? "Free" : "Paid",
    },
    isAccessibleForFree: isFree,
    superEvent: { "@id": `${SITE_URL}/#organization` },
  };
}

/** Condensed Event entity used inside the listing ItemList. */
export function eventListItemLd(event: EventItem, position: number) {
  const url = abs(`/events/${event.slug}`);
  return {
    "@type": "ListItem",
    position,
    url,
    item: {
      "@type": "Event",
      "@id": `${url}#event`,
      name: event.title,
      description: event.tagline,
      url,
      image: DEFAULT_OG_IMAGE,
      startDate: event.dateISO,
      eventAttendanceMode: attendanceMode(event.mode),
      eventStatus: eventStatus(event),
      location: eventLocation(event),
      organizer: { "@type": "Organization", name: event.host.name },
      offers: {
        "@type": "Offer",
        url,
        price: event.price === "Free" ? "0" : undefined,
        priceCurrency: "INR",
        availability:
          event.registered >= event.seats
            ? "https://schema.org/SoldOut"
            : "https://schema.org/InStock",
      },
    },
  };
}

export function eventListLd(items: EventItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Events on ${SITE_NAME}`,
    url: abs("/events"),
    numberOfItems: items.length,
    itemListElement: items.map((e, i) => eventListItemLd(e, i + 1)),
  };
}

export function breadcrumbLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: abs(t.path),
    })),
  };
}
