# Ignite Enginow — Complete Backend Architecture

Ignite Enginow is an event discovery, management, and governance platform built for hackathons, workshops, bootcamps, and technical summits.

---

## 1. Technology Stack

- **Runtime**: Node.js (v20+ / v24+)
- **Framework**: Express.js
- **Database**: MongoDB (Atlas for Production, MongoDB Memory Server / local Mongo for Development & Testing)
- **ODM**: Mongoose
- **Authentication**: Passport.js with Google OAuth 2.0 (`passport-google-oauth20`) & express-session (`connect-mongo`)
- **Media Storage**: Cloudinary SDK & Multer
- **API Style**: RESTful JSON API with unified response structure

---

## 2. Folder Structure

```
backend/
├── src/
│   ├── config/             # DB, Cloudinary, and Passport configs
│   ├── controllers/        # REST route handlers
│   ├── middleware/         # Auth, RBAC, Validation, Error Handling, Rate Limiting, Uploads
│   ├── models/             # Mongoose schemas & indexes
│   ├── routes/             # Express API routing
│   ├── services/           # Domain business logic & MongoDB aggregations
│   ├── utils/              # Response formatters, logger, CSV exporter, async wrapper
│   ├── validators/         # Input validation rules
│   ├── scripts/            # Database seed script
│   ├── app.js              # Express app definition
│   └── server.js           # Server bootstrap & graceful shutdown
├── tests/                  # Automated integration tests
├── .env.example            # Environment variable template
├── package.json            # Scripts and dependencies
├── API_DOCUMENTATION.md    # Complete API endpoint reference
├── DATABASE_SCHEMA.md      # Collection schemas and indexes
└── README.md
```

---

## 3. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your environment variables:
- `PORT`: Default `5000`
- `NODE_ENV`: `development` | `production`
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `CLIENT_URL`: URL of the frontend (e.g. `http://localhost:3000`)
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: OAuth credentials from Google Cloud Console
- `SESSION_SECRET`: Random 32+ character string
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Media upload credentials

---

## 4. Running Locally

### Install dependencies
```bash
npm install
```

### Seed initial data
```bash
npm run seed
```

### Start development server (with nodemon)
```bash
npm run dev
```

### Start production server
```bash
npm start
```

### Run automated tests
```bash
npm test
```

---

## 5. Authentication & Demo Personas

In addition to Google OAuth, the backend provides an instant persona switcher (`POST /api/auth/demo-login`) so you can test all 3 roles immediately without waiting for Google OAuth credentials:
1. **Student Persona**: `Aarav Sharma` (`student`)
2. **Organizer Persona**: `DevSphere Foundation` (`organizer` - approved)
3. **Admin Persona**: `Sarah Chen` (`admin`)

---

## 6. Security Features

- **RBAC Enforcement**: `requireRole` and `requireApprovedOrganizer` middleware guarantees unauthorized users cannot access privileged resources.
- **Ownership Verification**: Organizers can only edit their own draft/rejected events and inspect their own participants.
- **Duplicate Prevention**: Compound unique database index on `{ user: 1, event: 1 }` prevents double registrations.
- **Atomic Capacity Checks**: Concurrency safe registration with atomic capacity decrement.
- **Sanitized Logging**: Passwords, OAuth secrets, and session secrets are automatically scrubbed from server logs.
