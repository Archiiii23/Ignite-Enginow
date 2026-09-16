import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const dataPath = join(process.cwd(), "data", "contact-messages.json");
const topics = new Set(["Partnership", "Press", "Platform support", "Careers"]);

type ContactMessage = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  topic: string;
  message: string;
  createdAt: string;
};

async function readMessages() {
  try {
    return JSON.parse(await readFile(dataPath, "utf8")) as ContactMessage[];
  } catch {
    await mkdir(dirname(dataPath), { recursive: true });
    await writeFile(dataPath, "[]", "utf8");
    return [];
  }
}

export async function handleContactApi(request: Request): Promise<Response> {
  if (request.method !== "POST")
    return Response.json({ error: "Method not allowed" }, { status: 405 });

  const body = (await request.json()) as Partial<ContactMessage>;
  const firstName = body.firstName?.trim();
  const lastName = body.lastName?.trim();
  const email = body.email?.trim().toLowerCase();
  const topic = body.topic?.trim();
  const message = body.message?.trim();

  if (!firstName || !lastName || !email || !topic || !message) {
    return Response.json({ error: "All fields are required" }, { status: 400 });
  }
  if (
    firstName.length > 100 ||
    lastName.length > 100 ||
    email.length > 254 ||
    message.length > 5000
  ) {
    return Response.json({ error: "One or more fields are too long" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Enter a valid email address" }, { status: 400 });
  }
  if (!topics.has(topic)) return Response.json({ error: "Invalid topic" }, { status: 400 });

  const messages = await readMessages();
  const submission: ContactMessage = {
    id: `contact_${crypto.randomUUID()}`,
    firstName,
    lastName,
    email,
    topic,
    message,
    createdAt: new Date().toISOString(),
  };
  messages.push(submission);
  await mkdir(dirname(dataPath), { recursive: true });
  await writeFile(dataPath, JSON.stringify(messages, null, 2), "utf8");
  return Response.json({ success: true }, { status: 201 });
}
