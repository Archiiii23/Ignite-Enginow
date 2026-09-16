import { db } from "../db";
import type { CategoryItem } from "@/lib/platform-store";
import { requireRole } from "../auth";

export async function handleCategoriesApi(
  request: Request,
  pathParts: string[],
): Promise<Response> {
  const method = request.method;
  const id = pathParts[2]; // e.g. /api/categories/c1

  if (method === "GET") {
    const categories = await db.getCategories();
    if (id) {
      const item = categories.find((c) => c.id === id);
      if (!item) return Response.json({ error: "Category not found" }, { status: 404 });
      return Response.json(item);
    }
    return Response.json(categories);
  }

  if (method === "POST") {
    const auth = await requireRole(request, ["admin"]);
    if (auth.response) return auth.response;
    const body = (await request.json()) as { name: string; description: string };
    if (!body.name) return Response.json({ error: "Category name is required" }, { status: 400 });

    const categories = await db.getCategories();
    const newCategory: CategoryItem = {
      id: `c_${Date.now()}`,
      name: body.name,
      description: body.description || "",
      active: true,
    };

    const updated = [...categories, newCategory];
    await db.setCategories(updated);
    return Response.json(newCategory, { status: 201 });
  }

  if (method === "PATCH") {
    const auth = await requireRole(request, ["admin"]);
    if (auth.response) return auth.response;
    if (!id) return Response.json({ error: "Missing category ID" }, { status: 400 });

    const body = (await request.json()) as Partial<CategoryItem>;
    const categories = await db.getCategories();
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) return Response.json({ error: "Category not found" }, { status: 404 });

    categories[index] = { ...categories[index], ...body };
    await db.setCategories(categories);
    return Response.json(categories[index]);
  }

  if (method === "DELETE") {
    const auth = await requireRole(request, ["admin"]);
    if (auth.response) return auth.response;
    if (!id) return Response.json({ error: "Missing category ID" }, { status: 400 });

    const categories = await db.getCategories();
    const filtered = categories.filter((c) => c.id !== id);
    if (filtered.length === categories.length) {
      return Response.json({ error: "Category not found" }, { status: 404 });
    }

    await db.setCategories(filtered);
    return Response.json({ success: true, removedId: id });
  }

  if (method === "PUT") {
    const auth = await requireRole(request, ["admin"]);
    if (auth.response) return auth.response;
    const body = await request.json();
    if (Array.isArray(body)) {
      const saved = await db.setCategories(body as CategoryItem[]);
      return Response.json(saved);
    }
    return Response.json({ error: "Expected array of categories" }, { status: 400 });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
}
