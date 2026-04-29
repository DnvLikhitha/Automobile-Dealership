# Product Requirements Document
## Integrated Automobile Dealership and Service Management System

| Field | Details |
|-------|---------|
| Document Type | Product Requirements Document (PRD) |
| Version | 1.0 |
| Date | April 2026 |
| Prepared By | DNV Likhitha (AP23110010469), Akmal (AP23110010471), Rahul (AP23110010467), Karthikeya (AP23110010465) |
| Tech Stack | React.js · FastAPI · PostgreSQL |
| Status | Draft |

---

## 1. Product Overview

The Integrated Automobile Dealership and Service Management System is a full-stack web platform designed to digitize and streamline end-to-end operations of an automobile dealership. It consolidates vehicle sales, customer management, service scheduling, and administrative reporting into a single unified platform.

### 1.1 Problem Statement

Automobile dealerships typically operate with disconnected tools for sales, service, and customer management — leading to data silos, poor customer experience, and operational inefficiency. This platform addresses these gaps by providing role-specific digital workflows for all stakeholders.

### 1.2 Goals

- Automate vehicle sales and booking workflows
- Enable online service appointment scheduling
- Provide real-time dashboards for all roles
- Maintain complete vehicle and customer history
- Reduce manual paperwork and improve data accuracy

### 1.3 Success Metrics

| Metric | Target |
|--------|--------|
| API Response Time | < 2 seconds |
| System Uptime | > 99.5% |
| User Roles Supported | 4 (Admin, Sales Executive, Technician, Customer) |
| Core Modules | 7 functional modules |
| Database Tables | 7+ relational tables |

---

## 2. User Roles & Personas

| Role | Key Responsibilities | Access Level |
|------|---------------------|--------------|
| Admin | System configuration, reports, user management, inventory oversight | Full access |
| Sales Executive | Handle inquiries, manage leads, process bookings and test drives | Sales + CRM modules |
| Technician | View job cards, update service status, log diagnostics and parts | Service module |
| Customer | Browse vehicles, book test drives, schedule services, view history | Self-service portal |

---

## 3. Functional Requirements

### FR-01: User Authentication & Authorization
- Users register and log in via secure credentials
- JWT tokens issued for all authenticated sessions
- Role-Based Access Control (RBAC) enforced across all modules
- Unauthorized access to protected routes is rejected

### FR-02: Vehicle Inventory Management
- Admin/Sales can add, edit, and delete vehicle listings
- Vehicle details include: make, model, year, price, availability, images
- Customers can browse and filter by brand, price, and type
- Inventory DB updated on each sale or booking

### FR-03: Sales & Booking Workflow

Booking lifecycle follows a defined state machine:

| Stage | Actor | Action |
|-------|-------|--------|
| Inquiry | Customer | Submits purchase inquiry via portal |
| Test Drive | Sales Executive | Schedules test drive appointment |
| Booking | Sales Executive | Confirms booking and collects deposit |
| Delivery | Admin / Sales | Finalizes sale and updates inventory |

### FR-04: Service Appointment Scheduling
- Customers select service type, date, and time slot
- System checks technician availability before confirming
- Service staff can approve, reschedule, or assign technicians
- Job cards created and tracked through service lifecycle

### FR-05: Maintenance Record Management
- System stores full repair history per vehicle
- Tracks: diagnostics, parts replaced, labour hours
- Automated next-service reminders triggered post-completion

### FR-06: CRM — Customer Relationship Management
- Customer profiles with full purchase and service history
- Sales lead tracking with status updates
- Automated follow-up reminders for sales and service

### FR-07: Dashboards & Reporting

| Role | Dashboard Contents |
|------|--------------------|
| Admin | Total sales, monthly revenue, stock availability, total appointments |
| Sales Executive | Active leads, pending bookings, inquiry pipeline |
| Technician | Assigned job cards, pending & completed tasks |
| Customer | My bookings, inquiry status, service history |

### FR-08: Notifications *(Optional / Phase 2)*
- Appointment confirmation alerts via email or in-app
- Service completion notifications to customers
- Low-stock alerts pushed to Admin

---

## 4. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Security | JWT auth + HTTPS mandatory; passwords hashed; SQL injection prevention |
| Performance | API response < 2s; supports concurrent users |
| Scalability | Modular architecture; cloud-hosted; easily extensible |
| Reliability | Accurate records; DB backup and recovery strategy in place |
| Usability | Mobile-responsive UI; minimal training needed; clean role dashboards |

---

## 5. Data Flow Summary

### Level 0 — Context Diagram

The system has four external entities interacting with the central Dealership Management System:

- **Customer** — sends booking/service requests; receives invoices and booking status
- **Sales Executive** — manages inventory lists, leads, and sales orders
- **Technician** — receives job card assignments; submits diagnosis and parts usage
- **Administrator** — receives reports and logs; manages user configuration

### Level 1 — Major Processes

| Process ID | Process Name | Data Stores |
|------------|-------------|-------------|
| 1.0 | Auth & Security — validate users and issue tokens | Users DB |
| 2.0 | Inventory Management — save and update vehicle data | Inventory DB |
| 3.0 | Sales and Booking — create orders, check availability | Sales DB |
| 4.0 | Service Filing & Maintenance — create job cards, fetch stats | Service DB |
| 5.0 | Reporting — fetch sales data, generate reports | Sales DB, Service DB |

### Level 2 — Service Appointment Sub-process

- Customer requests a slot → Check Availability → Slot confirmed
- Create Booking → Save Appointment
- Technician starts job → Execute Services → Deduct Parts from Inventory
- Job complete → Generate Invoice → Send Final Bill to Customer

---

## 6. System Structure (Module Hierarchy)

Based on the Structure Chart, the system decomposes into the following top-level modules:

| Module | Sub-Modules |
|--------|-------------|
| User Authentication | Register/User, Login/Logout, Generate JWT Token, Role-Based Access Control |
| Vehicle Inventory Management | Add Vehicle Listing, Update/Delete Vehicle, Browse and Filter Vehicles, Manage Availability Status |
| Sales and Booking Workflow | Submit Purchase Inquiry, Schedule Test Drive, Confirm Booking, Process Delivery, Validate Sales Staff |
| Service Appointment Scheduling | Select Service Type, Choose Date/Time Slot, Approve/Reschedule, Assign Technician, Track Service Progress |
| Maintenance Record Management | Record Repair History, Record Diagnostics, Track Parts Replaced, Set Next Service Reminder |
| Dashboard and Reports | Admin Dashboard, Technician Dashboard, Customer Dashboard, Generate Reports |
| Notifications | Appointment Confirmation Alert, Service Completion Message, Low Stock Alert |

---

## 7. Database Schema Overview

| Table | Key Columns |
|-------|-------------|
| users | user_id, name, email, password_hash, role, created_at |
| vehicles | vehicle_id, make, model, year, price, type, availability, image_url |
| bookings | booking_id, customer_id, vehicle_id, status, booking_date |
| inquiries | inquiry_id, customer_id, vehicle_id, message, status |
| appointments | appointment_id, customer_id, service_type, slot_date, status, technician_id |
| service_records | record_id, vehicle_id, appointment_id, diagnosis, parts_used, labour_hours |
| invoices | invoice_id, booking_or_appt_id, amount, paid_at, payment_method |

---

## 8. Future Enhancements

- AI-based service reminder prediction using vehicle usage patterns
- Customer chatbot support for inquiries and FAQs
- Online payment gateway integration (Razorpay / Stripe)
- Mobile application (React Native) for customers and technicians
- QR-based vehicle service scanning at service bay entry
