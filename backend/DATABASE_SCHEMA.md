# Ignite Enginow — Database Schema & Architecture

This document specifies the MongoDB collections, fields, types, indexes, and relationships for the Ignite Enginow backend platform.

---

## 1. Collections Overview

| Collection Name | Model Name | Primary Responsibility |
| :--- | :--- | :--- |
| `users` | `User` | User identity, authentication, profile metadata, roles, and suspension states |
| `organizerprofiles` | `OrganizerProfile` | Organization KYC verification records, status transitions, review notes |
| `events` | `Event` | Comprehensive event metadata, lifecycle status, capacity, schedule, speakers |
| `registrations` | `Registration` | Student registrations, generated tickets, seat numbers, attendance status |
| `savedevents` | `SavedEvent` | Bookmarks / saved favorites per student |
| `notifications` | `Notification` | User alerts for registration, review approvals, reminders |
| `categories` | `Category` | Event categorizations (Hackathon, Workshop, Bootcamp, etc.) |
| `reports` | `Report` | Moderation flags submitted against inappropriate events, organizers, or users |
| `announcements` | `Announcement` | Broadcast messages visible on dashboard and site |
| `banners` | `Banner` | Dynamic promotional hero banners on the homepage |
| `auditlogs` | `AuditLog` | Tamper-evident admin audit history of platform actions |

---

## 2. Relationships & ER Diagram

```
User (1) ──────── (1) OrganizerProfile
User (1) ──────── (*) Event (as Organizer)
User (1) ──────── (*) Registration (as Student)
User (1) ──────── (*) SavedEvent (as Student)
User (1) ──────── (*) Notification
User (1) ──────── (*) AuditLog (as Admin / Actor)

Event (1) ─────── (*) Registration
Event (1) ─────── (*) SavedEvent
```

---

## 3. Detailed Collection Schemas

### `users`
- `_id`: ObjectId (PK)
- `name`: String (Required, trimmed)
- `email`: String (Required, unique, trimmed, indexed)
- `googleId`: String (Sparse indexed)
- `profileImage`: String (Default avatar)
- `role`: String (Enum: `student`, `organizer`, `admin`; default: `student`, indexed)
- `accountStatus`: String (Enum: `active`, `suspended`; default: `active`, indexed)
- `headline`: String
- `college`: String
- `bio`: String
- `skills`: Array of Strings
- `github`: String
- `linkedin`: String
- `lastLoginAt`: Date
- `createdAt`: Date (Auto timestamp)
- `updatedAt`: Date (Auto timestamp)

### `organizerprofiles`
- `_id`: ObjectId (PK)
- `user`: ObjectId (Ref `User`, unique, indexed)
- `organizationName`: String (Required, trimmed)
- `organizationType`: String
- `description`: String
- `logo`: String
- `website`: String
- `contactEmail`: String
- `contactPhone`: String
- `documentsSubmitted`: String
- `verificationStatus`: String (Enum: `NOT_REQUESTED`, `PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED`; indexed)
- `submittedAt`: Date
- `reviewedAt`: Date
- `reviewedBy`: ObjectId (Ref `User`)
- `rejectionReason`: String
- `suspensionReason`: String
- `eventsCount`: Number (Default: 0)

### `events`
- `_id`: ObjectId (PK)
- `title`: String (Required, indexed)
- `slug`: String (Required, unique, indexed)
- `tagline`: String
- `description`: String
- `about`: String
- `category`: String (Required, indexed)
- `eventType`: String
- `organizer`: ObjectId (Ref `User`, required, indexed)
- `organizerName`: String
- `coverImage`: String
- `eventDate`: Date (Required, indexed)
- `dateLabel`: String
- `startTime`: String
- `endTime`: String
- `durationLabel`: String
- `registrationDeadline`: Date (Indexed)
- `location`: String (Required)
- `city`: String (Indexed)
- `college`: String
- `mode`: String (Enum: `Online`, `In-person`, `Hybrid`; indexed)
- `registrationFee`: String (Default: 'Free')
- `price`: String (Default: 'Free')
- `prize`: String
- `capacity`: Number (Required, min: 1, default: 100)
- `registeredCount`: Number (Default: 0, min: 0)
- `tags`: Array of Strings (Indexed)
- `timeline` / `agenda`: Array of `{ time, title, description }`
- `perks`: Array of Strings
- `speakers`: Array of `{ name, role, avatar }`
- `sponsors`: Array of `{ name, logoText }`
- `faqs`: Array of `{ q, a }`
- `contactDetails`: `{ email, phone }`
- `status`: String (Enum: `DRAFT`, `PENDING_REVIEW`, `APPROVED`, `REJECTED`, `REGISTRATION_CLOSED`, `COMPLETED`, `REMOVED`; indexed)
- `rejectionReason`: String
- `approvedBy`: ObjectId (Ref `User`)
- `approvedAt`: Date
- `publishedAt`: Date
- `isFeatured`: Boolean (Default: false, indexed)
- `registrationsOpen`: Boolean (Default: true)
- `viewsCount`: Number (Default: 0)
- `clicksCount`: Number (Default: 0)

### `registrations`
- `_id`: ObjectId (PK)
- `user`: ObjectId (Ref `User`, required, indexed)
- `event`: ObjectId (Ref `Event`, required, indexed)
- `status`: String (Enum: `REGISTERED`, `CANCELLED`, `ATTENDED`; indexed)
- `registeredAt`: Date (Default: now)
- `cancelledAt`: Date
- `ticketCode`: String (Unique, indexed)
- `seatNumber`: String (Required)
- `userName`: String
- `userEmail`: String
- `college`: String
- `phone`: String
- `eventTitle`: String
- `eventDate`: String
- `eventLocation`: String
- **Unique Compound Index**: `{ user: 1, event: 1 }` (Enforces duplicate registration protection per Section 26)

### `savedevents`
- `_id`: ObjectId (PK)
- `user`: ObjectId (Ref `User`, required, indexed)
- `event`: ObjectId (Ref `Event`, required, indexed)
- **Unique Compound Index**: `{ user: 1, event: 1 }` (Prevents duplicate bookmarks per Section 29)

### `notifications`
- `_id`: ObjectId (PK)
- `recipient`: ObjectId (Ref `User`, required, indexed)
- `type`: String (Enum: `REGISTRATION_SUCCESS`, `APPROVAL_STATUS`, `EVENT_PUBLISHED`, `EVENT_REJECTED`, `REGISTRATION_CLOSING`, `EVENT_REMINDER`, `ORGANIZER_APPROVED`, `ORGANIZER_REJECTED`, `SYSTEM`)
- `title`: String
- `message`: String
- `relatedEntity`: ObjectId
- `relatedEntityType`: String
- `read`: Boolean (Default: false, indexed)
- **Compound Index**: `{ recipient: 1, read: 1, createdAt: -1 }`

### `auditlogs`
- `_id`: ObjectId (PK)
- `actor`: ObjectId (Ref `User`, required, indexed)
- `actorName`: String
- `actorEmail`: String
- `action`: String (Required, indexed)
- `entityType`: String (Required, indexed)
- `entityId`: ObjectId (Indexed)
- `metadata`: Mixed
- `timestamp`: Date (Default: now, indexed)
