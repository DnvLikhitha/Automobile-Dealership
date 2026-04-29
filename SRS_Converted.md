# Software Requirements Specification (SRS)

## Project Name
**Integrated Automobile Dealership and Service Management System**

**Prepared For:** Academic Project  
**Prepared By:**  
- DNV Likhitha - AP23110010469  
- Akmal - AP23110010471  
- Rahul - AP23110010467  
- Karthikeya - AP23110010465  

**Technology Stack:** React.js, FastAPI, PostgreSQL  

---

## 1. Introduction

### 1.1 Purpose
The purpose of this Software Requirements Specification (SRS) document is to define the functional and non-functional requirements of the system.

The system automates:
- Vehicle sales management  
- Customer handling  
- Service appointment scheduling  
- Maintenance record tracking  
- Administrative monitoring  

### 1.2 Scope
The system provides:
1. Vehicle Sales Management  
2. Service & Maintenance Management  

Key capabilities:
- Manage vehicle inventory and bookings  
- Handle purchase inquiries  
- Schedule service appointments  
- Maintain service history  
- Provide role-based dashboards  

### 1.3 Definitions
- **Admin** – System administrator  
- **JWT** – JSON Web Token  
- **CRM** – Customer Relationship Management  
- **UI** – User Interface  
- **API** – Application Programming Interface  
- **DBMS** – Database Management System  

### 1.4 References
- IEEE 830-1998 SRS Standard  
- FastAPI Docs  
- React.js Docs  
- PostgreSQL Guide  

---

## 2. Overall Description

### 2.1 Product Perspective
- Frontend: React.js  
- Backend: FastAPI  
- Database: PostgreSQL  
- Security: JWT + Role-Based Access  

### 2.2 Product Functions
- User authentication  
- Role-based dashboards  
- Vehicle inventory management  
- Booking workflow  
- Appointment scheduling  
- Maintenance tracking  
- Reports & analytics  

### 2.3 User Roles
- **Admin** – Full control  
- **Sales Executive** – Handles sales  
- **Technician** – Service management  
- **Customer** – Browsing & booking  

### 2.4 Operating Environment
- Browsers: Chrome, Edge, Firefox  
- Backend: Render  
- Frontend: Netlify  
- DB: PostgreSQL Cloud  

### 2.5 Constraints
- JWT authentication required  
- PostgreSQL mandatory  
- REST API architecture  
- Role-based restrictions  

---

## 3. Specific Requirements

### 3.1 Interface Requirements
- Responsive UI  
- Vehicle browsing system  
- Appointment calendar  
- Admin dashboard  

### 3.2 Functional Requirements

#### FR1: Authentication
- User login/register  
- JWT token generation  

#### FR2: Role-Based Access
- Restricted access based on role  

#### FR3: Inventory Management
- Add/update/delete vehicles  
- Filter and browse  

#### FR4: Sales Workflow
Inquiry → Test Drive → Booking → Delivery  

#### FR5: Appointment Scheduling
- Select service  
- Choose date/time  
- Track progress  

#### FR6: Maintenance Records
- Repair history  
- Diagnostics  
- Parts replaced  

#### FR7: CRM
- Customer profiles  
- History tracking  

#### FR8: Dashboards
- Sales stats  
- Service stats  
- User dashboards  

---

### 3.3 Non-Functional Requirements
- Security via JWT  
- API response < 2 sec  
- Scalable architecture  
- Reliable data storage  
- User-friendly UI  

### 3.4 Database
Tables:
- Users  
- Vehicles  
- Bookings  
- Appointments  
- ServiceRecords  
- Payments  

Relationships:
- One customer → many bookings  
- One vehicle → many records  

### 3.5 Security
- HTTPS required  
- Token expiration  
- Input validation  
- Admin-only controls  

---

## 4. Future Enhancements
- AI service reminders  
- Chatbot support  
- Online payments  
- Mobile app  
- QR-based service tracking  
