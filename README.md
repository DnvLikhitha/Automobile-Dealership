# Integrated Automobile Dealership and Service Management System

A comprehensive, modern web-based platform designed to digitize and streamline the end-to-end operations of an automobile dealership. This system provides an intuitive digital interface for vehicle sales, customer relationship management (CRM), service scheduling, and administrative reporting.

## Key Features

* **Role-Based Dashboards:** Specialized, secure interfaces for Customers, Sales Executives, Technicians, and Administrators.
* **Vehicle Inventory Management:** Browse, filter, and manage a digital catalog of vehicles, complete with detailed specifications and 3D car models.
* **Streamlined Sales Workflow:** End-to-end booking state machine tracking inquiries, test drives, bookings, and final deliveries.
* **Service & Maintenance:** Integrated calendar-based scheduling for service appointments, digital technician job cards, and full maintenance history tracking.
* **Secure Authentication:** JWT-based stateless authentication with strict Role-Based Access Control (RBAC).

## Technology Stack

### Frontend
* **Framework:** React.js (Vite)
* **Styling:** Tailwind CSS / Custom CSS
* **3D Rendering:** Three.js / React Three Fiber (for 3D vehicle showcases)
* **Routing:** React Router v6

### Backend
* **Framework:** FastAPI (Python 3.11+)
* **Database:** PostgreSQL
* **ORM:** SQLAlchemy with Alembic for migrations
* **Data Validation:** Pydantic v2
* **Security:** bcrypt password hashing, JSON Web Tokens (JWT)

---

## Getting Started

### Prerequisites
* Node.js (v16+)
* Python (3.11+)
* PostgreSQL (Running locally or via a cloud provider like Supabase/Render)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables (create a `.env` file based on your DB configuration).
5. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## User Roles

1. **Admin:** Full system oversight, user management, inventory control, and analytics reporting.
2. **Sales Executive:** Handles customer inquiries, test drive scheduling, and vehicle bookings.
3. **Technician:** Manages service floor operations, updates job cards, logs diagnostics, and tracks repair status.
4. **Customer:** Browses inventory, books test drives, schedules service appointments, and manages their profile/wishlist.

