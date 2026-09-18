# 💰 Smart Student Expense & Budget Tracker

A modern, minimalist **Claymorphic 3D** personal finance and student budget tracking web application built using **HTML5, CSS3, and Vanilla JavaScript (ES6+)**. Includes a standalone **Admin Management Portal** and a relational **MySQL Schema (`schema.sql`)**.

---

## 🌟 Key Features

### 🎓 Student Expense & Budget App (`index.html`)
- **3D Animated Levitation Hero**: Floating clay card and levitating status badges.
- **Minimalist Claymorphism Theme**: Soft 3D inflated cards, dual inset/outset clay shadows, and pastel accents. Supports **Light & Dark Mode**.
- **Real-Time Student Dashboard**: Track total income, total expenses, available balance, and monthly budget remaining.
- **100% Real Data Only**: Starts with clean zero-state data (no pre-filled fake transactions).
- **Event-Driven Smart Analysis**: Suggestions and category breakdown trigger strictly when a real expense is logged.
- **Transaction History**: Search by description/category, filter by Type/Category, and sort by Date/Amount.
- **Budget Guard Alerts**: Real-time progress bar with warning alerts at 80% and 100% budget limit.

### 🛡️ Standalone Admin Database Portal (`admin.html`)
- **Independent Admin Access**: Password-protected Admin login portal (`admin@bca.edu` / `vlbjcas`).
- **Database System Overview**: Real-time metrics for total registered student accounts, monetary cashflow, and total transaction rows.
- **Student User Management**: Inspect student accounts, search by name/email, view user financial summaries, delete accounts, or add test student accounts.
- **Database Backup Tools**: One-click **JSON Database Export** and **MySQL `schema.sql`** download.

### 📜 MySQL Database Script (`schema.sql`)
- Complete relational database schema (`users`, `budgets`, `transactions` tables) with foreign keys, constraints, and sample INSERT demo data ready for BCA project viva submission.

---

## 📁 File Structure

```text
Smart-Student-Expense-Tracker/
│
├── index.html     # Student Web Application & 3D Claymorphic Dashboard
├── style.css      # Minimalist Claymorphism 3D Styling & Design Tokens
├── script.js      # Student App Event-Driven Logic & LocalStorage Session
├── admin.html     # Standalone Admin Database Management Portal
├── admin.js       # Admin Portal Logic & User Database Management
├── schema.sql     # MySQL Database Creation Script & Demo Queries
└── README.md      # Documentation
```

---

## 🚀 How to Run Locally

1. Clone or download this repository.
2. Open `index.html` in any browser to launch the **Student Web App**:
   - URL: `http://localhost:3000/index.html`
3. Open `admin.html` in any browser to launch the **Admin Portal**:
   - URL: `http://localhost:3000/admin.html`
   - **Admin Email**: `admin@bca.edu`
   - **Admin Password**: `vlbjcas`

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3 (Vanilla CSS variables & clay shadows), Vanilla JavaScript (ES6+)
- **Storage**: Browser `LocalStorage` (Client-side JSON Database)
- **Database Script**: MySQL / Relational Database SQL (`schema.sql`)
- **Zero External Dependencies**: Pure native web code ready for BCA minor project submission!
