# Project File Structure Guide

## Overview

This document defines how files should be structured in this project.
The goal is to ensure clarity, scalability, and a clear separation of concerns
between frontend UI, backend logic, and shared resources.

This structure is suitable for modern full-stack web applications.

---

## 1. Core Principles

- Separate frontend and backend responsibilities
- Group files by **responsibility**, not by technology
- Make file locations predictable for humans and AI tools
- Avoid mixing UI logic with backend or infrastructure code

---

## 2. Root Directory Structure

The root of the repository should only contain configuration,
documentation, and top-level application folders.

/
├── frontend/
├── backend/
├── shared/
├── docs/
├── scripts/
├── .env.example
├── package.json
├── README.md

---

## 3. Frontend Directory (`/frontend`)

The `frontend` folder contains all user interface code.
This includes components, styles, assets, and frontend-specific logic.

### Responsibilities

- UI rendering
- User interaction
- Client-side state
- API calls to the backend

### Structure

frontend/
├── src/
│ ├── components/
│ ├── pages/
│ ├── layouts/
│ ├── hooks/
│ ├── services/
│ ├── styles/
│ ├── assets/
│ ├── utils/
│ └── main.tsx
├── public/
│ └── index.html
├── tests/
└── package.json

---

### 3.1 Components (`/components`)

Reusable UI building blocks.

components/
├── Button/
│ ├── Button.tsx
│ ├── Button.styles.ts
│ └── Button.test.tsx
├── Table/
└── Modal/

Rules:

- One folder per component
- Component logic, styles, and tests live together

---

### 3.2 Pages (`/pages`)

Top-level views that map directly to routes.

pages/
├── Home/
├── Upload/
└── Results/

Rules:

- Pages compose components
- Pages should not contain reusable UI logic

---

### 3.3 Services (`/services`)

Handles communication with the backend.

services/
├── apiClient.ts
├── uploadService.ts
└── resultsService.ts

Rules:

- No UI code
- All HTTP calls go here

---

### 3.4 Styles (`/styles`)

Global and shared styling.

styles/
├── globals.css
├── variables.css
└── themes.css

---

## 4. Backend Directory (`/backend`)

The `backend` folder contains all server-side logic.

### Responsibilities

- Business logic
- Data processing
- API endpoints
- Database access
- Authentication and validation

### Structure

backend/
├── src/
│ ├── api/
│ ├── controllers/
│ ├── services/
│ ├── models/
│ ├── routes/
│ ├── middleware/
│ ├── utils/
│ └── server.ts
├── tests/
├── config/
└── package.json

---

### 4.1 API / Routes (`/routes`)

Defines HTTP endpoints.

routes/
├── upload.routes.ts
├── results.routes.ts
└── health.routes.ts

Rules:

- Routes only define paths and HTTP methods
- No business logic inside routes

---

### 4.2 Controllers (`/controllers`)

Handle request/response logic.

controllers/
├── upload.controller.ts
└── results.controller.ts

Rules:

- Parse input
- Call services
- Return responses

---

### 4.3 Services (`/services`)

Core business logic.

services/
├── fileProcessing.service.ts
├── a9bChecker.service.ts
└── bomMatcher.service.ts

Rules:

- No HTTP logic
- Reusable and testable

---

### 4.4 Models (`/models`)

Data definitions and schemas.

models/
├── FileResult.model.ts
├── User.model.ts
└── BomEntry.model.ts

Rules:

- Database schemas
- Domain objects

---

## 5. Shared Directory (`/shared`)

Contains code shared between frontend and backend.

### Examples

shared/
├── types/
│ ├── Result.ts
│ └── UploadPayload.ts
├── constants/
└── validators/

Rules:

- No framework-specific code
- Must be usable by both frontend and backend

---

## 6. Docs Directory (`/docs`)

Project documentation.

docs/
├── PROJECT_STRUCTURE.md
├── API_SPEC.md
└── UI_ARCHITECTURE.md

---

## 7. Environment & Configuration

Environment variables should never be committed.

.env.example
.env

Rules:

- `.env.example` documents required variables
- `.env` is ignored by git

---

## 8. Naming Conventions

- Folders: `kebab-case`
- Files: `camelCase` or `PascalCase` (consistent per layer)
- Components: `PascalCase`
- Services: `*.service.ts`
- Controllers: `*.controller.ts`

---

## 9. Frontend ↔ Backend Relationship

- Frontend **never** accesses the database
- Backend **never** renders UI
- Communication happens via HTTP APIs
- Shared types live in `/shared`

Frontend → API → Controller → Service → Model

---

## 10. AI IDE Guidance

To work effectively with AI tools:

- Keep files small and focused
- Avoid circular dependencies
- Prefer explicit imports
- Maintain consistent naming patterns

This structure allows AI IDEs to:

- Understand intent
- Generate new files correctly
- Refactor safely

---

## 11. Final Notes

This structure is a guideline, not a restriction.
Deviations are allowed when justified, but consistency must be maintained.

When in doubt:

- Ask where responsibility belongs
- Choose clarity over cleverness
