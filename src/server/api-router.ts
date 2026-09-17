import { handleEventsApi } from "./api/events";
import { handleRegistrationsApi } from "./api/registrations";
import { handleOrganizersApi } from "./api/organizers";
import { handleCategoriesApi } from "./api/categories";
import { handleAnnouncementsApi } from "./api/announcements";
import { handleAuthApi } from "./api/auth";
import { handleContactApi } from "./api/contact";
import { handleAdminApi } from "./api/admin";
import { handleUsersApi } from "./api/users";

export async function handleApiRequest(request: Request): Promise<Response | undefined> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/")) return undefined;

  const pathParts = url.pathname.split("/").filter(Boolean); // ["api", "events", ...]
  const resource = pathParts[1];

  try {
    switch (resource) {
      case "health":
        return Response.json({
          status: "ok",
          timestamp: new Date().toISOString(),
          service: "enginow-ignite-api",
        });
      case "events":
        return await handleEventsApi(request, pathParts);
      case "registrations":
        return await handleRegistrationsApi(request, pathParts);
      case "organizers":
        return await handleOrganizersApi(request, pathParts);
      case "categories":
        return await handleCategoriesApi(request, pathParts);
      case "announcements":
        return await handleAnnouncementsApi(request, pathParts);
      case "auth":
        return await handleAuthApi(request, pathParts);
      case "contact":
        return await handleContactApi(request);
      case "admin":
        return await handleAdminApi(request, pathParts);
      case "users":
        return await handleUsersApi(request, pathParts);
      default:
        return Response.json({ error: `API route /api/${resource} not found` }, { status: 404 });
    }
  } catch (error) {
    console.error(`[API Error] ${request.method} ${url.pathname}:`, error);
    return Response.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
