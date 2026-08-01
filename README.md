# Centralized Resource Allocation and Event Management System (CRAEMS)

CRAEMS is an enterprise-grade web application built for universities and large institutions to streamline facility reservations, equipment loans, event organization, and attendance tracking using QR verification.

---

## 🏛️ System Architecture

- **Backend**: FastAPI (Python 3.10+ / 3.14), SQLAlchemy 2.0 Async Engine, Pydantic v2, PyJWT.
- **Frontend**: React 18, Vite, React Router 6, Axios, Lucide Icons, Custom Glassmorphism CSS Design System.
- **Database**: Dual-engine support (MySQL 8.0+ / SQLite 3 auto-fallback with seed data).
- **Security**: Double-Token JWT (Access & Refresh), Bcrypt hashing, Role-Based Access Control (RBAC).

---

## 🚀 Quick Start (Single Command)

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher (`py` launcher recommended on Windows)

### 1. Unified One-Command Launch
Open your terminal in the project root directory (`d:\Programming\CREMS\CRAEMS`) and execute:

```bash
npm start
```

This single command will automatically:
1. Start the **FastAPI Backend Server** on `http://127.0.0.1:8000`
2. Initialize database tables & seed demo data automatically (SQLite / MySQL)
3. Start the **Vite React Frontend Server** on `http://localhost:5173` or `http://localhost:5174`

---

## 🔑 Demo Login Credentials

The application is pre-seeded with 3 demo accounts across different institutional roles:

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@craems.edu` | `admin123` | Full system governance, audit logs, department & user management |
| **Faculty** | `faculty@craems.edu` | `faculty123` | Auto-approved facility booking, event creation, equipment reservation |
| **Student** | `student@craems.edu` | `student123` | Room booking requests (pending review), event ticket registration |

---

## 💻 Instructions for Running in Different IDEs

### 1. VS Code (Visual Studio Code)

1. Open VS Code and select **File -> Open Folder...**, then select `d:\Programming\CREMS\CRAEMS`.
2. Open an integrated terminal in VS Code (`Ctrl + ~` or `Terminal -> New Terminal`).
3. Ensure dependencies are installed:
   ```bash
   npm install
   npm run install-all  # or cd frontend && npm install
   cd backend && py -3 -m pip install -r requirements.txt
   ```
4. Press `Ctrl + ~` to run:
   ```bash
   npm start
   ```
5. *(Optional debugging)*: Create a `.vscode/launch.json` configuration for Python debugging pointing to `backend/app/main.py`.

---

### 2. PyCharm / WebStorm (JetBrains IDEs)

#### Running via PyCharm / WebStorm Terminal:
1. Open the project root `CRAEMS` in JetBrains IDE.
2. Open the built-in **Terminal** tab (`Alt + F12`).
3. Run `npm start`.

#### Running via IDE Run Configurations:
1. **Backend Configuration**:
   - Go to **Run -> Edit Configurations... -> Add New -> Python**.
   - **Script path**: Select `uvicorn` module or set **Module name** to `uvicorn`.
   - **Parameters**: `app.main:app --reload --port 8000`.
   - **Working directory**: `d:\Programming\CREMS\CRAEMS\backend`.
   - Select your Python 3.x Interpreter.
2. **Frontend Configuration**:
   - **Add New -> npm**.
   - **package.json**: `d:\Programming\CREMS\CRAEMS\frontend\package.json`.
   - **Command**: `run`.
   - **Scripts**: `dev`.

---

### 3. Visual Studio / Eclipse / Other IDEs

1. Open the project directory in your IDE.
2. Open a standard terminal window inside the root `CRAEMS` folder.
3. Run `npm start`.

---

## ⚙️ Project Structure

```
CRAEMS/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # Modular API routers (auth, rooms, bookings, equipment, events, reports, admin)
│   │   ├── core/            # Database configuration, Security (JWT/Bcrypt), Settings
│   │   ├── models/          # 3NF SQLAlchemy Domain Models
│   │   ├── schemas/         # Pydantic v2 validation schemas
│   │   ├── services/        # Business logic (Booking Conflict Engine, QR Service)
│   │   └── main.py          # FastAPI application entry & startup seed script
│   └── requirements.txt     # Backend Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components (DataTable, Modal, StatusBadge, QRScanner)
│   │   ├── context/         # AuthContext & ThemeContext
│   │   ├── layouts/         # MainLayout, DashboardLayout, AuthLayout
│   │   ├── pages/           # Student, Faculty, Manager, Admin Dashboards & Module pages
│   │   └── App.jsx          # React Router 6 configuration & Protected Route Guards
│   └── package.json         # Frontend Node dependencies & scripts
├── package.json             # Root orchestration scripts (concurrently launcher)
└── README.md
```