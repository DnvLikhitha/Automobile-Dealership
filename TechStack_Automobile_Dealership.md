# Technology Stack Document
## Integrated Automobile Dealership and Service Management System

| Field | Details |
|-------|---------|
| Document Type | Technology Stack Reference |
| Version | 1.0 |
| Date | April 2026 |
| Architecture | 3-Tier: Client / Server / Database |

---

## 1. Architecture Overview

The system follows a 3-tier client-server architecture with a clear separation of concerns between the presentation layer (React.js), application logic layer (FastAPI), and data layer (PostgreSQL). All communication between tiers occurs over HTTPS using RESTful JSON APIs with JWT-based authentication.

| Layer | Technology | Hosting |
|-------|-----------|---------|
| Frontend (Client) | React.js | Netlify |
| Backend (Server) | FastAPI (Python) | Render |
| Database | PostgreSQL | PostgreSQL Cloud (Supabase / Render DB) |
| Auth | JWT (JSON Web Tokens) | Handled in FastAPI middleware |

---

## 2. Frontend — React.js

### 2.1 Technology

| Item | Detail |
|------|--------|
| Framework | React.js (v18+) |
| Language | JavaScript / JSX |
| Routing | React Router v6 |
| State Management | React Context API or Redux Toolkit |
| HTTP Client | Axios |
| Styling | Tailwind CSS or Material UI |
| Build Tool | Vite or Create React App |
| Hosting | Netlify (CI/CD via GitHub) |

### 2.2 Key Components

- Role-based dashboard views (Admin, Sales, Technician, Customer)
- Vehicle browsing with filter/search UI
- Booking and appointment calendar widget
- Protected routes gated by JWT role check
- Responsive layout — mobile-first design

### 2.3 Design Patterns

- Component-based architecture — reusable UI components
- Container/Presenter separation
- React hooks for lifecycle and side effects
- API calls abstracted into a service layer

---

## 3. Backend — FastAPI (Python)

### 3.1 Technology

| Item | Detail |
|------|--------|
| Framework | FastAPI (v0.100+) |
| Language | Python 3.11+ |
| ORM | SQLAlchemy (with Alembic for migrations) |
| Auth | JWT via python-jose / passlib (bcrypt hashing) |
| Validation | Pydantic v2 models |
| API Style | RESTful — JSON over HTTPS |
| Docs | Auto-generated Swagger UI at /docs |
| Hosting | Render (auto-deploy from GitHub) |

### 3.2 Key API Modules

| Module | Endpoints (Summary) |
|--------|---------------------|
| Auth | POST /register, POST /login, GET /me |
| Vehicles | GET /vehicles, POST /vehicles, PUT /vehicles/{id}, DELETE /vehicles/{id} |
| Bookings | POST /bookings, GET /bookings/{id}, PATCH /bookings/{id}/status |
| Inquiries | POST /inquiries, GET /inquiries, PATCH /inquiries/{id} |
| Appointments | POST /appointments, GET /appointments, PATCH /appointments/{id} |
| Service Records | POST /service-records, GET /service-records/{vehicle_id} |
| Reports | GET /reports/sales, GET /reports/appointments, GET /reports/inventory |

### 3.3 Security Middleware

- JWT Bearer token validation on all protected routes
- Role dependency injection — checks `user.role` per route via FastAPI `Depends()`
- CORS middleware configured to allow React frontend origin only
- Input validated via Pydantic — prevents malformed or malicious data
- Password hashing with bcrypt (never stored in plain text)

---

## 4. Database — PostgreSQL

### 4.1 Technology

| Item | Detail |
|------|--------|
| Database | PostgreSQL 15+ |
| ORM | SQLAlchemy (Python) |
| Migrations | Alembic |
| Hosting | Cloud PostgreSQL (Render / Supabase / ElephantSQL) |
| Connection Pooling | SQLAlchemy connection pool |
| Backup | Daily automated snapshots via cloud provider |

### 4.2 Schema & Relationships

| Table | Relationships |
|-------|--------------|
| users | One user → many bookings, many appointments, many inquiries |
| vehicles | One vehicle → many bookings, many service_records |
| bookings | Belongs to user + vehicle; has status enum |
| inquiries | Belongs to user + vehicle; has status enum |
| appointments | Belongs to user; assigned to one technician (user) |
| service_records | Belongs to vehicle + appointment |
| invoices | Belongs to booking or appointment |

---

## 5. Authentication & Security

| Layer | Mechanism |
|-------|-----------|
| Transport | HTTPS enforced end-to-end |
| Authentication | JWT (HS256) — token issued at login, sent in Authorization header |
| Authorization | RBAC — each route checks `user.role` via FastAPI `Depends()` |
| Password Security | bcrypt hashing with salt; minimum 8-character policy |
| Token Expiry | Access token: 30 min; Refresh token: 7 days |
| SQL Injection | Prevented by SQLAlchemy ORM parameterized queries |
| XSS / CSRF | React sanitization + SameSite cookie policy |

---

## 6. DevOps & Deployment

| Component | Tool / Platform |
|-----------|----------------|
| Version Control | Git + GitHub |
| Frontend Hosting | Netlify (auto-deploy on push to main) |
| Backend Hosting | Render (auto-deploy from GitHub) |
| Database Hosting | Render PostgreSQL / Supabase |
| CI/CD | GitHub Actions or Netlify/Render native pipelines |
| Environment Variables | .env files; secrets stored in Render/Netlify settings |
| API Documentation | FastAPI auto-generated Swagger UI (/docs) |

---

## 7. Tech Stack at a Glance

| Category | Technology | Purpose |
|----------|-----------|---------|
| Frontend | React.js | SPA UI; role dashboards; booking forms |
| Styling | Tailwind CSS / MUI | Responsive, mobile-first design |
| Backend | FastAPI (Python) | REST API; business logic; auth middleware |
| ORM | SQLAlchemy + Alembic | DB interaction + schema migrations |
| Database | PostgreSQL | Relational data storage |
| Auth | JWT + bcrypt | Secure login and role enforcement |
| Hosting — Frontend | Netlify | Static hosting + CDN |
| Hosting — Backend | Render | Container-based server hosting |
| Hosting — DB | Render / Supabase | Managed PostgreSQL cloud DB |
| VCS / CI | GitHub + Actions | Source control and automated deploys |
