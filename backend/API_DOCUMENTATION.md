# Ignite Enginow — Complete REST API Documentation

This document describes all REST API endpoints available on the Ignite Enginow platform.

Base Path: `/api`

All standard JSON responses adhere to the unified format:
- **Success**: `{ "success": true, "message": "...", "data": { ... } }`
- **Error**: `{ "success": false, "message": "...", "code": "ERROR_CODE" }`
- **Paginated**: `{ "success": true, "data": [...], "pagination": { "page": 1, "limit": 12, "total": 100, "totalPages": 9 } }`

---

## 1. System & Health

### `GET /api/health`
- **Auth**: Public
- **Description**: Verifies backend server availability.
- **Example Response**:
```json
{
  "success": true,
  "message": "Ignite Enginow API is running"
}
```

---

## 2. Authentication (`/api/auth`)

### `GET /api/auth/google`
- **Auth**: Public
- **Query Parameters**: `role` (`student` | `organizer`)
- **Description**: Initiates the Google OAuth flow.

### `GET /api/auth/google/callback`
- **Auth**: Public
- **Description**: Google OAuth callback handler. Establishes session and redirects to frontend.

### `GET /api/auth/me`
- **Auth**: Required (`requireAuth`)
- **Description**: Retrieves current authenticated session user.
- **Example Response (200 OK)**:
```json
{
  "success": true,
  "message": "Current authenticated user profile",
  "data": {
    "id": "60d0fe4f5311236168a109ca",
    "name": "Aarav Sharma",
    "email": "aarav.sharma@campus.edu",
    "role": "student",
    "accountStatus": "active"
  }
}
```

### `POST /api/auth/logout`
- **Auth**: Required
- **Description**: Destroys session and clears cookies.
- **Example Response**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### `POST /api/auth/demo-login`
- **Auth**: Public (Development & Testing)
- **Body**: `{ "role": "student" | "organizer" | "admin" }`
- **Example Response (200 OK)**:
```json
{
  "success": true,
  "message": "Successfully signed in as student persona",
  "data": {
    "name": "Aarav Sharma",
    "email": "aarav.sharma@campus.edu",
    "role": "student"
  }
}
```

---

## 3. Users (`/api/users`)

### `GET /api/users/me`
- **Auth**: Required
- **Description**: Returns authenticated user profile.

### `PATCH /api/users/me`
- **Auth**: Required
- **Body**:
```json
{
  "headline": "Full-Stack Builder",
  "bio": "Building scalable platforms.",
  "college": "IIT",
  "skills": ["React", "Node.js"]
}
```
- **Description**: Updates profile metadata. Note: roles cannot be altered through this endpoint.

---

## 4. Events (`/api/events`)

### `GET /api/events`
- **Auth**: Public
- **Description**: Queries public events. Only returns `APPROVED` events.
- **Query Parameters**:
  - `search`: Searches title, organizer, category, tags.
  - `category`: Filters by category name.
  - `mode`: `Online` | `In-person` | `Hybrid`.
  - `isFree`: `true` | `false`.
  - `city`: City name regex.
  - `date`: YYYY-MM-DD.
  - `sortBy`: `upcoming` | `latest` | `popular` | `registration closing soon`.
  - `page`: Page number (default: 1).
  - `limit`: Items per page (default: 12).
- **Example Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "60d0fe4f5311236168a109cc",
      "title": "Quantum Hack 2026",
      "slug": "quantum-hack-2026",
      "category": "Hackathon",
      "mode": "Hybrid",
      "status": "APPROVED",
      "seats": 250,
      "registered": 42
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 1,
    "totalPages": 1
  }
}
```

### `GET /api/events/:id`
- **Auth**: Optional (if signed in, contextual data `isRegistered` and `isSaved` are returned).
- **Description**: Fetches single event by ID or slug.

### `POST /api/events`
- **Auth**: Required (`organizer`, `admin`) + `requireApprovedOrganizer`
- **Description**: Creates a new event draft in `DRAFT` status.
- **Body**:
```json
{
  "title": "Distributed Systems Summit",
  "category": "Conference",
  "eventDate": "2026-12-10T10:00:00Z",
  "location": "Virtual",
  "capacity": 200,
  "mode": "Online"
}
```

### `PATCH /api/events/:id`
- **Auth**: Required (`organizer`, `admin`)
- **Description**: Modifies an organizer's own event (only if in `DRAFT` or `REJECTED` status).

### `DELETE /api/events/:id`
- **Auth**: Required (`organizer`, `admin`)
- **Description**: Deletes an organizer's draft.

### `POST /api/events/:id/submit`
- **Auth**: Required (`organizer`, `admin`) + `requireApprovedOrganizer`
- **Description**: Submits draft for admin approval (`DRAFT` -> `PENDING_REVIEW`).

### `POST /api/events/:id/save` & `DELETE /api/events/:id/save`
- **Auth**: Required
- **Description**: Adds or removes an event from saved favorites.

### `POST /api/events/:id/view`
- **Auth**: Public
- **Description**: Records an event view count.

### `POST /api/events/:id/register`
- **Auth**: Required (`student`)
- **Description**: Registers a student for an approved event.
- **Enforcements**:
  - Event must exist and be `APPROVED`.
  - Registration deadline not passed.
  - Event must have available capacity (atomic concurrency safe).
  - Student not registered already (returns `409 Conflict` on duplicate).
- **Example Response (201 Created)**:
```json
{
  "success": true,
  "message": "Registered successfully for event!",
  "data": {
    "ticketCode": "IGN-HAC-8812-4011",
    "seatNumber": "HAC-42",
    "status": "confirmed"
  }
}
```

---

## 5. Registrations (`/api/registrations`)

### `GET /api/registrations/me`
- **Auth**: Required (`student`)
- **Description**: Returns all tickets and registrations for the signed in student.

### `DELETE /api/registrations/:id`
- **Auth**: Required (`student`)
- **Description**: Cancels a registration and decrements the event registered count.

---

## 6. Organizer Operations (`/api/organizers` & `/api/organizer`)

### `POST /api/organizers/request`
- **Auth**: Required (`organizer`)
- **Description**: Submits organizer verification request (`NOT_REQUESTED` -> `PENDING`).

### `GET /api/organizers/me` & `PATCH /api/organizers/me`
- **Auth**: Required (`organizer`)
- **Description**: Fetches or updates organizer organization profile.

### `GET /api/organizer/events`
- **Auth**: Required (`organizer`)
- **Description**: Returns all events created by the logged in organizer.

### `GET /api/organizer/events/:eventId/registrations`
- **Auth**: Required (`organizer` + ownership check)
- **Description**: Lists participants registered for the organizer's event.

### `GET /api/organizer/events/:eventId/registrations/export`
- **Auth**: Required (`organizer` + ownership check)
- **Description**: Downloads attendee roster as a CSV file.

### `GET /api/organizer/analytics`
- **Auth**: Required (`organizer`)
- **Description**: Calculates total registrations, views, clicks, conversion rate, and top events.

---

## 7. Admin Platform Governance (`/api/admin`)

All `/api/admin/*` endpoints require `requireAuth` + `requireRole("admin")`. Unauthorized access returns `403 Forbidden`.

- `GET /api/admin/users`: List users with search and pagination.
- `PATCH /api/admin/users/:id/suspend`: Suspend or reinstate user.
- `GET /api/admin/organizers`: Review queue of organizers.
- `PATCH /api/admin/organizers/:id/approve`: Approve organizer.
- `PATCH /api/admin/organizers/:id/reject`: Reject organizer with `rejectionReason`.
- `PATCH /api/admin/organizers/:id/suspend`: Suspend organizer.
- `GET /api/admin/events`: All events across all statuses.
- `GET /api/admin/events/pending`: Pending review queue.
- `PATCH /api/admin/events/:id/approve`: Approve event (`PENDING_REVIEW` -> `APPROVED`).
- `PATCH /api/admin/events/:id/reject`: Reject event with `rejectionReason`.
- `PATCH /api/admin/events/:id/remove`: Moderation removal of inappropriate event.
- `PATCH /api/admin/events/:id/feature`: Feature or unfeature an event.
- `GET /api/admin/registrations`: Platform-wide registrations.
- `GET /api/admin/analytics`: Real-time aggregations (active users, total events, pending queues, registration trends).
- Categories CRUD: `POST`, `PATCH`, `DELETE` at `/api/admin/categories/:id`.
- Reports: `GET /api/admin/reports`, `PATCH /api/admin/reports/:id`.
- Announcements & Banners: CRUD at `/api/admin/announcements` and `/api/admin/banners`.

---

## 8. Uploads (`/api/upload`)

### `POST /api/upload`
- **Auth**: Required
- **Body**: `multipart/form-data` with `file` (Max 5MB; JPEG, PNG, WEBP, GIF).
- **Description**: Validates image, uploads to Cloudinary, and returns URL.
- **Example Response (200 OK)**:
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/.../image.jpg"
  }
}
```
