import { events } from "@/data/events";

/** Trim a description to a search-snippet-friendly length (~155 chars). */
export function snippet(text: string, max = 155) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 60 ? cut.slice(0, lastSpace) : cut).replace(/[,.;:—-]$/, "")}…`;
}

function plural(n: number, one: string, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`;
}

function listCategories() {
  const unique = Array.from(new Set(events.map((e) => e.category.toLowerCase())));
  if (unique.length <= 1) return unique[0] ?? "events";
  return `${unique.slice(0, -1).join(", ")} and ${unique[unique.length - 1]}`;
}

/** Home — reflects the live catalogue so the snippet stays accurate as events change. */
export function homeDescription() {
  const open = events.filter((e) => e.status !== "upcoming").length;
  const free = events.filter((e) => e.price === "Free").length;
  return snippet(
    `Discover ${plural(events.length, "premium tech event")} on Enginow Ignite — ${listCategories()}. ${open} open for registration, ${free} free to join. Host your own in minutes.`,
  );
}

/** Resources — built from the library counts shown on the page. */
export function resourcesDescription(counts: { label: string; count: number }[]) {
  const total = counts.reduce((sum, c) => sum + c.count, 0);
  const parts = counts.map((c) => `${c.count} ${c.label.toLowerCase()}`).join(", ");
  return snippet(
    `${total} free event-organizing resources from Enginow Ignite: ${parts}. Practical playbooks for planning, sponsoring and running technical events.`,
  );
}

/** Careers — built from the open roles listed on the page. */
export function careersDescription(roles: { team: string; location: string }[]) {
  const teams = Array.from(new Set(roles.map((r) => r.team.toLowerCase())));
  const remote = roles.filter((r) => /remote/i.test(r.location)).length;
  return snippet(
    `${plural(roles.length, "open role")} at Enginow Ignite across ${teams.join(", ")} — ${remote} remote-friendly. Join a small senior team building the platform for technical communities.`,
  );
}

/** Event detail — composed from that event's own data for a rich SERP snippet. */
export function eventDescription(event: (typeof events)[number]) {
  const seatsLeft = Math.max(0, event.seats - event.registered);
  const bits = [
    `${event.category} · ${event.dateLabel} · ${event.mode}, ${event.location}`,
    event.tagline,
    event.price === "Free" ? "Free to attend" : event.price,
    event.prize,
    seatsLeft > 0 ? `${seatsLeft} seats left` : "Waitlist open",
  ].filter(Boolean);
  return snippet(bits.map((b) => String(b).replace(/\.$/, "")).join(". "));
}
