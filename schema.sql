-- ==========================================================================
-- SMART STUDENT EXPENSE & BUDGET TRACKER
-- MySQL / Relational Database Schema (BCA Minor Project Database)
-- ==========================================================================

-- 1. Create Database
CREATE DATABASE IF NOT EXISTS smartspend_db;
USE smartspend_db;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Monthly Budgets Table
CREATE TABLE IF NOT EXISTS budgets (
    budget_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    monthly_budget DECIMAL(10, 2) NOT NULL DEFAULT 5000.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 4. Transactions Table (Incomes & Expenses)
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    type ENUM('INCOME', 'EXPENSE') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ==========================================================================
-- SAMPLE DEMO SEED DATA FOR BCA VIVA EVALUATION
-- ==========================================================================

-- Insert Default Student Account
INSERT INTO users (user_id, full_name, email, password, created_at)
VALUES ('usr_demo_1', 'Demo Student', 'student@bca.edu', 'student123', NOW())
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- Insert Default Monthly Budget Goal
INSERT INTO budgets (user_id, monthly_budget)
VALUES ('usr_demo_1', 5000.00);

-- Insert Sample Real Student Transactions
INSERT INTO transactions (transaction_id, user_id, type, amount, category, date, description)
VALUES 
('tx_101', 'usr_demo_1', 'INCOME', 8000.00, 'Pocket Money', CURDATE() - INTERVAL 10 DAY, 'Monthly allowance from parents'),
('tx_102', 'usr_demo_1', 'EXPENSE', 1500.00, 'Education', CURDATE() - INTERVAL 8 DAY, 'BCA Semester 5 textbooks'),
('tx_103', 'usr_demo_1', 'EXPENSE', 2200.00, 'Food', CURDATE() - INTERVAL 5 DAY, 'College canteen & hostel mess fee'),
('tx_104', 'usr_demo_1', 'INCOME', 2500.00, 'Freelance', CURDATE() - INTERVAL 3 DAY, 'Web development freelance task');

-- ==========================================================================
-- USEFUL QUERIES FOR VIVA DEMONSTRATION
-- ==========================================================================

-- Query 1: Calculate Total Income, Total Expenses and Balance per User
SELECT 
    u.full_name,
    u.email,
    b.monthly_budget,
    COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END), 0) AS total_income,
    COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) AS total_expense,
    (COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END), 0) - 
     COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0)) AS balance
FROM users u
LEFT JOIN budgets b ON u.user_id = b.user_id
LEFT JOIN transactions t ON u.user_id = t.user_id
GROUP BY u.user_id, b.monthly_budget;

-- Query 2: Expense Breakdown by Category for a Specific User
SELECT 
    category,
    SUM(amount) AS total_spent,
    COUNT(*) AS transaction_count
FROM transactions
WHERE user_id = 'usr_demo_1' AND type = 'EXPENSE'
GROUP BY category
ORDER BY total_spent DESC;
