import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";
import User from "../src/models/User.js";
import OrganizerProfile from "../src/models/OrganizerProfile.js";
import Event from "../src/models/Event.js";
import Registration from "../src/models/Registration.js";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongoServer) await mongoServer.stop();
});

describe("Ignite Enginow REST API Test Suite", () => {
  let studentUser;
  let organizerUser;
  let unapprovedOrganizerUser;
  let adminUser;
  let approvedEvent;
  let expiredEvent;
  let removedEvent;

  beforeEach(async () => {
    await Promise.all([
      User.deleteMany({}),
      OrganizerProfile.deleteMany({}),
      Event.deleteMany({}),
      Registration.deleteMany({}),
    ]);

    // Create users
    studentUser = await User.create({
      name: "Test Student",
      email: "student@test.com",
      role: "student",
      accountStatus: "active",
    });

    organizerUser = await User.create({
      name: "Test Organizer",
      email: "organizer@test.com",
      role: "organizer",
      accountStatus: "active",
    });

    unapprovedOrganizerUser = await User.create({
      name: "Pending Organizer",
      email: "pending.org@test.com",
      role: "organizer",
      accountStatus: "active",
    });

    adminUser = await User.create({
      name: "Super Admin",
      email: "admin@test.com",
      role: "admin",
      accountStatus: "active",
    });

    // Approved Organizer Profile
    await OrganizerProfile.create({
      user: organizerUser._id,
      organizationName: "Approved Club",
      verificationStatus: "APPROVED",
    });

    // Unapproved Organizer Profile
    await OrganizerProfile.create({
      user: unapprovedOrganizerUser._id,
      organizationName: "Pending Club",
      verificationStatus: "PENDING",
    });

    // Create Events
    approvedEvent = await Event.create({
      title: "Live Hackathon 2026",
      slug: "live-hackathon-2026",
      category: "Hackathon",
      eventDate: new Date("2026-12-01T10:00:00Z"),
      registrationDeadline: new Date("2026-11-28T23:59:59Z"),
      location: "Bengaluru",
      capacity: 50,
      seats: 50,
      registeredCount: 0,
      status: "APPROVED",
      organizer: organizerUser._id,
      organizerName: "Approved Club",
    });

    expiredEvent = await Event.create({
      title: "Past Deadline Workshop",
      slug: "past-deadline-workshop",
      category: "Workshop",
      eventDate: new Date("2026-08-01T10:00:00Z"),
      registrationDeadline: new Date("2026-07-28T23:59:59Z"),
      location: "Online",
      capacity: 50,
      seats: 50,
      registeredCount: 0,
      status: "APPROVED",
      organizer: organizerUser._id,
    });

    removedEvent = await Event.create({
      title: "Removed Spam Event",
      slug: "removed-spam-event",
      category: "Meetup",
      eventDate: new Date("2026-12-10T10:00:00Z"),
      location: "Online",
      capacity: 50,
      seats: 50,
      registeredCount: 0,
      status: "REMOVED",
      organizer: organizerUser._id,
    });
  });

  const getAuthToken = (user) => {
    return Buffer.from(JSON.stringify({ id: user._id.toString() })).toString("base64");
  };

  // Test 1: Health Check per Section 74
  test("GET /api/health should return 200 OK with success flag", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Ignite Enginow API is running");
  });

  // Test 2: Unauthorized request returns 401 per Section 79
  test("Unauthorized request to protected endpoint should return 401", async () => {
    const res = await request(app).get("/api/users/me");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe("UNAUTHORIZED");
  });

  // Test 3: Student attempting admin endpoint returns 403 per Section 79
  test("Student attempting admin endpoint should return 403 Forbidden", async () => {
    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${getAuthToken(studentUser)}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe("FORBIDDEN_ROLE");
  });

  // Test 4: Organizer attempting another organizer's event returns 403 per Section 79
  test("Organizer attempting another organizer's event should return 403", async () => {
    const res = await request(app)
      .patch(`/api/events/${approvedEvent._id}`)
      .set("Authorization", `Bearer ${getAuthToken(unapprovedOrganizerUser)}`)
      .send({ title: "Unauthorized Overwrite" });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // Test 5: Unapproved organizer attempting event submission returns 403 per Section 79
  test("Unapproved organizer attempting event submission should return 403", async () => {
    const draft = await Event.create({
      title: "Pending Organizer Draft",
      slug: "pending-draft",
      category: "Hackathon",
      eventDate: new Date("2026-12-15T10:00:00Z"),
      location: "Online",
      capacity: 50,
      seats: 50,
      status: "DRAFT",
      organizer: unapprovedOrganizerUser._id,
    });

    const res = await request(app)
      .post(`/api/events/${draft._id}/submit`)
      .set("Authorization", `Bearer ${getAuthToken(unapprovedOrganizerUser)}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // Test 6: Successful registration creates ticket & seat
  test("Student can register for approved event", async () => {
    const res = await request(app)
      .post(`/api/events/${approvedEvent._id}/register`)
      .set("Authorization", `Bearer ${getAuthToken(studentUser)}`)
      .send({ name: "Aarav Sharma", email: "student@test.com" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.ticketCode).toBeDefined();
    expect(res.body.data.seatNumber).toBeDefined();

    // Verify atomic capacity increment
    const refreshedEvent = await Event.findById(approvedEvent._id);
    expect(refreshedEvent.registeredCount).toBe(1);
  });

  // Test 7: Student registering twice returns 409 Conflict per Section 26 & 79
  test("Student registering twice for same event should return 409 Conflict", async () => {
    // First registration
    await request(app)
      .post(`/api/events/${approvedEvent._id}/register`)
      .set("Authorization", `Bearer ${getAuthToken(studentUser)}`)
      .send({ name: "Aarav Sharma" });

    // Second registration attempt
    const res = await request(app)
      .post(`/api/events/${approvedEvent._id}/register`)
      .set("Authorization", `Bearer ${getAuthToken(studentUser)}`)
      .send({ name: "Aarav Sharma" });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe("DUPLICATE_REGISTRATION");
  });

  // Test 8: Student registering after deadline returns 400 per Section 79
  test("Student registering after deadline should return 400 Bad Request", async () => {
    const res = await request(app)
      .post(`/api/events/${expiredEvent._id}/register`)
      .set("Authorization", `Bearer ${getAuthToken(studentUser)}`)
      .send({ name: "Aarav Sharma" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe("DEADLINE_PASSED");
  });

  // Test 9: Student registering for removed event returns 400/404 per Section 79
  test("Student registering for removed event should return 400", async () => {
    const res = await request(app)
      .post(`/api/events/${removedEvent._id}/register`)
      .set("Authorization", `Bearer ${getAuthToken(studentUser)}`)
      .send({ name: "Aarav Sharma" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe("EVENT_NOT_APPROVED");
  });

  // Test 10: Admin Approval & Audit Logging
  test("Admin can approve pending organizer and event", async () => {
    const profile = await OrganizerProfile.findOne({ user: unapprovedOrganizerUser._id });

    const approveRes = await request(app)
      .patch(`/api/admin/organizers/${profile._id}/approve`)
      .set("Authorization", `Bearer ${getAuthToken(adminUser)}`);

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.data.verificationStatus).toBe("APPROVED");
  });

  // Test 11: First-login role selection locks role
  test("First-time user can select role as participant or organizer", async () => {
    const newUser = await User.create({
      name: "New Google User",
      email: "new.google@test.com",
      role: "student",
      isRoleSelected: false,
      accountStatus: "active",
    });

    const res = await request(app)
      .post("/api/auth/select-role")
      .set("Authorization", `Bearer ${getAuthToken(newUser)}`)
      .send({ role: "organizer" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe("organizer");
    expect(res.body.data.isRoleSelected).toBe(true);

    // Test 12: Cannot select again once locked
    const retryRes = await request(app)
      .post("/api/auth/select-role")
      .set("Authorization", `Bearer ${getAuthToken(newUser)}`)
      .send({ role: "participant" });

    expect(retryRes.status).toBe(403);
    expect(retryRes.body.code).toBe("ROLE_LOCKED");
  });

  // Test 13: Request role change and Admin approval workflow
  test("User can request role change and Admin can approve it", async () => {
    const participant = await User.create({
      name: "Active Participant",
      email: "active.participant@test.com",
      role: "student",
      isRoleSelected: true,
      accountStatus: "active",
    });

    // Submit role change request
    const reqRes = await request(app)
      .post("/api/auth/request-role-change")
      .set("Authorization", `Bearer ${getAuthToken(participant)}`)
      .send({ requestedRole: "organizer", reason: "I am hosting a college hackathon." });

    expect(reqRes.status).toBe(200);
    expect(reqRes.body.data.roleChangeRequest.status).toBe("PENDING");

    // Admin views pending requests
    const listRes = await request(app)
      .get("/api/admin/role-requests")
      .set("Authorization", `Bearer ${getAuthToken(adminUser)}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.some((u) => u.email === participant.email)).toBe(true);

    // Admin approves request
    const approveRes = await request(app)
      .patch(`/api/admin/role-requests/${participant._id}/approve`)
      .set("Authorization", `Bearer ${getAuthToken(adminUser)}`);

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.data.role).toBe("organizer");
  });
});
