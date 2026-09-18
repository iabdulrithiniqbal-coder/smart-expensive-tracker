/**
 * SMART STUDENT EXPENSE & BUDGET TRACKER
 * Minimalist Claymorphism Edition with Real-Time Event-Driven Analysis
 */

// --- LOCAL STORAGE KEYS ---
const DB_KEYS = {
    USERS: 'smartspend_users_db',
    SESSION: 'smartspend_session',
    THEME: 'smartspend_theme'
};

// --- DEFAULT SEEDED USER FOR DEMO LOGINS ---
const DEFAULT_DEMO_USER = {
    id: 'usr_demo_1',
    name: 'Demo Student',
    email: 'student@bca.edu',
    password: 'student123',
    createdAt: new Date().toISOString()
};

// --- CATEGORY ICONS MAPPING ---
const CATEGORY_ICONS = {
    'Food': '🍔',
    'Transport': '🚌',
    'Education': '📚',
    'Shopping': '🛍️',
    'Entertainment': '🎬',
    'Health': '🏥',
    'Bills': '💡',
    'Other': '📦',
    'Pocket Money': '💵',
    'Scholarship': '🎓',
    'Part-time Job': '💼',
    'Freelance': '💻'
};

// --- GLOBAL STATE ---
let usersDB = [];
let currentUser = null; // Session
let transactions = []; // Pure real user data - starts EMPTY!
let monthlyBudget = 5000;
let pendingDeleteId = null;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initDatabase();
    initTheme();
    initLandingEvents();
    initAuthEvents();
    checkSession();
});

// --- DATABASE & USER AUTHENTICATION ---
function initDatabase() {
    const storedUsers = localStorage.getItem(DB_KEYS.USERS);
    if (storedUsers) {
        try {
            usersDB = JSON.parse(storedUsers);
            if (!Array.isArray(usersDB) || usersDB.length === 0) {
                usersDB = [DEFAULT_DEMO_USER];
                saveUsersDB();
            }
        } catch (e) {
            usersDB = [DEFAULT_DEMO_USER];
            saveUsersDB();
        }
    } else {
        usersDB = [DEFAULT_DEMO_USER];
        saveUsersDB();
    }

    if (!usersDB.some(u => u.email === DEFAULT_DEMO_USER.email)) {
        usersDB.push(DEFAULT_DEMO_USER);
        saveUsersDB();
    }
}

function saveUsersDB() {
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(usersDB));
}

function checkSession() {
    const sessionUser = localStorage.getItem(DB_KEYS.SESSION);
    if (sessionUser) {
        try {
            currentUser = JSON.parse(sessionUser);
            if (currentUser && currentUser.id) {
                showMainApp();
                loadUserData();
                return;
            }
        } catch (e) {
            console.error('Error parsing session user:', e);
        }
    }
    showLandingPage();
}

// VIEW SWITCHERS
function showLandingPage() {
    const landing = document.getElementById('landingPage');
    const auth = document.getElementById('authScreen');
    const app = document.getElementById('appMain');

    if (landing) landing.classList.remove('hidden');
    if (auth) auth.classList.add('hidden');
    if (app) app.classList.add('hidden');
}

function showAuthScreen(defaultTab = 'login') {
    const landing = document.getElementById('landingPage');
    const auth = document.getElementById('authScreen');
    const app = document.getElementById('appMain');

    if (landing) landing.classList.add('hidden');
    if (auth) auth.classList.remove('hidden');
    if (app) app.classList.add('hidden');

    const tabLoginBtn = document.getElementById('tabLoginBtn');
    const tabRegisterBtn = document.getElementById('tabRegisterBtn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (defaultTab === 'register') {
        if (tabRegisterBtn) tabRegisterBtn.classList.add('active');
        if (tabLoginBtn) tabLoginBtn.classList.remove('active');
        if (registerForm) registerForm.classList.add('active-form');
        if (loginForm) loginForm.classList.remove('active-form');
    } else {
        if (tabLoginBtn) tabLoginBtn.classList.add('active');
        if (tabRegisterBtn) tabRegisterBtn.classList.remove('active');
        if (loginForm) loginForm.classList.add('active-form');
        if (registerForm) registerForm.classList.remove('active-form');
    }
}

function showMainApp() {
    const landing = document.getElementById('landingPage');
    const auth = document.getElementById('authScreen');
    const app = document.getElementById('appMain');

    if (landing) landing.classList.add('hidden');
    if (auth) auth.classList.add('hidden');
    if (app) app.classList.remove('hidden');

    if (currentUser) {
        const userNameEl = document.getElementById('displayUserName');
        const userEmailEl = document.getElementById('displayUserEmail');
        if (userNameEl) userNameEl.textContent = currentUser.name || 'Student';
        if (userEmailEl) userEmailEl.textContent = currentUser.email || 'student@bca.edu';
    }

    initNavigation();
    initForms();
    initTableFilters();
    initModal();
    setDefaultDates();
}

// LANDING PAGE EVENTS
function initLandingEvents() {
    const landingLoginNavBtn = document.getElementById('landingLoginNavBtn');
    const heroGetStartedBtn = document.getElementById('heroGetStartedBtn');
    const heroLoginBtn = document.getElementById('heroLoginBtn');
    const authBackToLandingBtn = document.getElementById('authBackToLandingBtn');
    const landingThemeBtn = document.getElementById('landingThemeBtn');

    if (landingLoginNavBtn) landingLoginNavBtn.onclick = () => showAuthScreen('login');
    if (heroGetStartedBtn) heroGetStartedBtn.onclick = () => showAuthScreen('register');
    if (heroLoginBtn) heroLoginBtn.onclick = () => showAuthScreen('login');
    if (authBackToLandingBtn) authBackToLandingBtn.onclick = () => showLandingPage();
    if (landingThemeBtn) {
        landingThemeBtn.onclick = () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            setTheme(currentTheme === 'dark' ? 'light' : 'dark');
        };
    }
}

// AUTHENTICATION EVENTS
function initAuthEvents() {
    const tabLoginBtn = document.getElementById('tabLoginBtn');
    const tabRegisterBtn = document.getElementById('tabRegisterBtn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const demoLoginBtn = document.getElementById('demoLoginBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (tabLoginBtn) {
        tabLoginBtn.onclick = () => {
            tabLoginBtn.classList.add('active');
            if (tabRegisterBtn) tabRegisterBtn.classList.remove('active');
            if (loginForm) loginForm.classList.add('active-form');
            if (registerForm) registerForm.classList.remove('active-form');
        };
    }

    if (tabRegisterBtn) {
        tabRegisterBtn.onclick = () => {
            tabRegisterBtn.classList.add('active');
            if (tabLoginBtn) tabLoginBtn.classList.remove('active');
            if (registerForm) registerForm.classList.add('active-form');
            if (loginForm) loginForm.classList.remove('active-form');
        };
    }

    // LOGIN SUBMISSION
    if (loginForm) {
        loginForm.onsubmit = (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('loginEmail');
            const passInput = document.getElementById('loginPassword');

            const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
            const pass = passInput ? passInput.value.trim() : '';

            if (!email) { setError('loginEmail'); return; } else { clearError('loginEmail'); }
            if (!pass) { setError('loginPassword'); return; } else { clearError('loginPassword'); }

            const foundUser = usersDB.find(u => u.email.toLowerCase() === email && u.password === pass);
            if (foundUser) {
                currentUser = foundUser;
                localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(currentUser));
                showToast(`Welcome back, ${currentUser.name}!`, 'success');
                showMainApp();
                loadUserData();
            } else {
                showToast('Invalid student email or password', 'error');
                setError('loginEmail');
                setError('loginPassword');
            }
        };
    }

    // QUICK DEMO LOGIN BUTTON HANDLER
    if (demoLoginBtn) {
        demoLoginBtn.onclick = () => {
            let demoUser = usersDB.find(u => u.email === DEFAULT_DEMO_USER.email);
            if (!demoUser) {
                demoUser = DEFAULT_DEMO_USER;
                usersDB.push(demoUser);
                saveUsersDB();
            }
            currentUser = demoUser;
            localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(currentUser));
            showToast('Logged in as Demo Student Account!', 'success');
            showMainApp();
            loadUserData();
        };
    }

    // REGISTER SUBMISSION
    if (registerForm) {
        registerForm.onsubmit = (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('regName');
            const emailInput = document.getElementById('regEmail');
            const passInput = document.getElementById('regPassword');

            const name = nameInput ? nameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
            const pass = passInput ? passInput.value.trim() : '';

            let isValid = true;
            if (!name) { setError('regName'); isValid = false; } else { clearError('regName'); }
            if (!email || !email.includes('@')) { setError('regEmail'); isValid = false; } else { clearError('regEmail'); }
            if (!pass || pass.length < 4) { setError('regPassword'); isValid = false; } else { clearError('regPassword'); }

            if (!isValid) return;

            const exists = usersDB.some(u => u.email.toLowerCase() === email);
            if (exists) {
                showToast('Student email already registered! Please Login.', 'error');
                setError('regEmail');
                return;
            }

            const newUser = {
                id: 'usr_' + Date.now(),
                name: name,
                email: email,
                password: pass,
                createdAt: new Date().toISOString()
            };

            usersDB.push(newUser);
            saveUsersDB();

            currentUser = newUser;
            localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(currentUser));
            showToast('Registration complete!', 'success');

            // Clean real dataset for new student
            transactions = [];
            monthlyBudget = 5000;
            saveUserData();

            showMainApp();
            loadUserData();
        };
    }

    if (logoutBtn) {
        logoutBtn.onclick = () => {
            currentUser = null;
            localStorage.removeItem(DB_KEYS.SESSION);
            showToast('Logged out of account', 'info');
            showLandingPage();
        };
    }
}

// USER SPECIFIC STORAGE KEYS
function getUserTxKey() {
    return `smartspend_tx_${currentUser ? currentUser.id : 'guest'}`;
}

function getUserBudgetKey() {
    return `smartspend_budget_${currentUser ? currentUser.id : 'guest'}`;
}

function loadUserData() {
    if (!currentUser) return;

    const storedTx = localStorage.getItem(getUserTxKey());
    if (storedTx) {
        try {
            transactions = JSON.parse(storedTx);
        } catch (e) {
            transactions = [];
        }
    } else {
        transactions = [];
    }

    const storedBudget = localStorage.getItem(getUserBudgetKey());
    if (storedBudget !== null) {
        monthlyBudget = parseFloat(storedBudget) || 0;
    } else {
        monthlyBudget = 5000;
    }

    renderAll();
}

function saveUserData() {
    if (!currentUser) return;
    localStorage.setItem(getUserTxKey(), JSON.stringify(transactions));
    localStorage.setItem(getUserBudgetKey(), monthlyBudget);
}

// THEME MANAGEMENT
function initTheme() {
    const themeBtn = document.getElementById('themeToggleBtn');
    const storedTheme = localStorage.getItem(DB_KEYS.THEME) || 'light';

    setTheme(storedTheme);

    if (themeBtn) {
        themeBtn.onclick = () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            setTheme(currentTheme === 'dark' ? 'light' : 'dark');
        };
    }
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(DB_KEYS.THEME, theme);
    const themeText = document.getElementById('themeToggleText');
    if (themeText) {
        themeText.textContent = theme === 'dark' ? '🌙 Dark' : '☀️ Light';
    }
}

// NAVIGATION & TABS
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileCloseBtn = document.getElementById('mobileCloseBtn');
    const sidebar = document.getElementById('sidebar');
    const quickAddBtn = document.getElementById('quickAddExpenseBtn');

    navLinks.forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            const targetSection = link.getAttribute('data-target');
            navigateToSection(targetSection);

            if (window.innerWidth <= 768 && sidebar) {
                sidebar.classList.remove('open');
            }
        };
    });

    if (mobileMenuBtn && sidebar) mobileMenuBtn.onclick = () => sidebar.classList.add('open');
    if (mobileCloseBtn && sidebar) mobileCloseBtn.onclick = () => sidebar.classList.remove('open');
    if (quickAddBtn) quickAddBtn.onclick = () => navigateToSection('add-expense');
}

function navigateToSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    const navLinks = document.querySelectorAll('.nav-link');
    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');

    sections.forEach(sec => {
        if (sec.id === sectionId) sec.classList.add('active');
        else sec.classList.remove('active');
    });

    navLinks.forEach(link => {
        if (link.getAttribute('data-target') === sectionId) link.classList.add('active');
        else link.classList.remove('active');
    });

    const titlesMap = {
        'dashboard': { title: 'Dashboard Overview', sub: 'Real-time student expense tracker with claymorphic UI.' },
        'add-income': { title: 'Add Real Income', sub: 'Record money received from pocket money, jobs, or freelance work.' },
        'add-expense': { title: 'Add Real Expense', sub: 'Log daily student expenses to trigger live smart suggestions.' },
        'budget': { title: 'Monthly Budget Goal', sub: 'Set and adjust your spending limits with warning alerts.' },
        'history': { title: 'Transaction History', sub: 'Search, filter, and review your real expense records.' },
        'analysis': { title: 'Expense Analysis', sub: 'Detailed visual breakdown of category spending and savings ratio.' },
        'insights': { title: 'Smart Suggestions', sub: 'Calculated strictly whenever real expenses are entered.' }
    };

    if (titlesMap[sectionId] && pageTitle && pageSubtitle) {
        pageTitle.textContent = titlesMap[sectionId].title;
        pageSubtitle.textContent = titlesMap[sectionId].sub;
    }

    renderAll();
}

function setDefaultDates() {
    const today = getTodayDateStr();
    const incDate = document.getElementById('incomeDate');
    const expDate = document.getElementById('expenseDate');
    if (incDate) incDate.value = today;
    if (expDate) expDate.value = today;
}

// FORM HANDLING
function initForms() {
    const incomeForm = document.getElementById('incomeForm');
    const expenseForm = document.getElementById('expenseForm');
    const budgetForm = document.getElementById('budgetForm');

    // Income Form
    if (incomeForm) {
        incomeForm.onsubmit = (e) => {
            e.preventDefault();
            if (validateIncomeForm()) {
                const amount = parseFloat(document.getElementById('incomeAmount').value);
                const source = document.getElementById('incomeSource').value;
                const date = document.getElementById('incomeDate').value;
                const desc = document.getElementById('incomeDesc').value.trim() || source;

                const newRecord = {
                    id: 'tx_' + Date.now(),
                    type: 'INCOME',
                    amount: amount,
                    category: source,
                    date: date,
                    description: desc
                };

                transactions.unshift(newRecord);
                saveUserData();
                showToast('Real income added successfully!', 'success');
                resetForm('incomeForm');
                setDefaultDates();
                navigateToSection('dashboard');
            }
        };
    }

    // Expense Form -> EVENT DRIVEN ANALYSIS TRIGGER
    if (expenseForm) {
        expenseForm.onsubmit = (e) => {
            e.preventDefault();
            if (validateExpenseForm()) {
                const amount = parseFloat(document.getElementById('expenseAmount').value);
                const category = document.getElementById('expenseCategory').value;
                const date = document.getElementById('expenseDate').value;
                const desc = document.getElementById('expenseDesc').value.trim() || category;

                const newRecord = {
                    id: 'tx_' + Date.now(),
                    type: 'EXPENSE',
                    amount: amount,
                    category: category,
                    date: date,
                    description: desc
                };

                transactions.unshift(newRecord);
                saveUserData();
                
                showToast(`Expense logged! Live analysis updated for ${category}.`, 'success');
                resetForm('expenseForm');
                setDefaultDates();
                navigateToSection('dashboard');
            }
        };
    }

    // Budget Form
    if (budgetForm) {
        budgetForm.onsubmit = (e) => {
            e.preventDefault();
            if (validateBudgetForm()) {
                const amount = parseFloat(document.getElementById('budgetAmount').value);
                monthlyBudget = amount;
                saveUserData();
                showToast('Monthly budget updated!', 'success');
                renderAll();
            }
        };
    }
}

function validateIncomeForm() {
    let isValid = true;
    const amountInput = document.getElementById('incomeAmount');
    const sourceSelect = document.getElementById('incomeSource');
    const dateInput = document.getElementById('incomeDate');

    if (!amountInput || !amountInput.value || parseFloat(amountInput.value) <= 0) {
        setError('incomeAmount'); isValid = false;
    } else { clearError('incomeAmount'); }

    if (!sourceSelect || !sourceSelect.value) {
        setError('incomeSource'); isValid = false;
    } else { clearError('incomeSource'); }

    if (!dateInput || !dateInput.value) {
        setError('incomeDate'); isValid = false;
    } else { clearError('incomeDate'); }

    return isValid;
}

function validateExpenseForm() {
    let isValid = true;
    const amountInput = document.getElementById('expenseAmount');
    const catSelect = document.getElementById('expenseCategory');
    const dateInput = document.getElementById('expenseDate');

    if (!amountInput || !amountInput.value || parseFloat(amountInput.value) <= 0) {
        setError('expenseAmount'); isValid = false;
    } else { clearError('expenseAmount'); }

    if (!catSelect || !catSelect.value) {
        setError('expenseCategory'); isValid = false;
    } else { clearError('expenseCategory'); }

    if (!dateInput || !dateInput.value) {
        setError('expenseDate'); isValid = false;
    } else { clearError('expenseDate'); }

    return isValid;
}

function validateBudgetForm() {
    const input = document.getElementById('budgetAmount');
    if (!input || !input.value || parseFloat(input.value) < 0) {
        setError('budgetAmount');
        return false;
    }
    clearError('budgetAmount');
    return true;
}

function setError(fieldId) {
    const inputEl = document.getElementById(fieldId);
    if (inputEl && inputEl.closest('.form-group')) {
        inputEl.closest('.form-group').classList.add('has-error');
    }
}

function clearError(fieldId) {
    const inputEl = document.getElementById(fieldId);
    if (inputEl && inputEl.closest('.form-group')) {
        inputEl.closest('.form-group').classList.remove('has-error');
    }
}

function resetForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
        const groups = form.querySelectorAll('.form-group');
        groups.forEach(g => g.classList.remove('has-error'));
    }
}

// GLOBAL RENDER COORDINATOR
function renderAll() {
    if (!currentUser) return;
    renderDashboard();
    renderBudgetSection();
    renderHistoryTable();
    renderAnalysisSection();
    renderSmartInsights();
    renderGlobalBanner();
}

// RENDER DASHBOARD
function renderDashboard() {
    const totalIncome = getSumByType('INCOME');
    const totalExpense = getSumByType('EXPENSE');
    const balance = totalIncome - totalExpense;
    const remainingBudget = monthlyBudget - totalExpense;
    const budgetUsedPercent = monthlyBudget > 0 ? Math.min(Math.round((totalExpense / monthlyBudget) * 100), 999) : 0;

    const setTxt = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    setTxt('dashTotalIncome', formatCurrency(totalIncome));
    setTxt('dashTotalExpense', formatCurrency(totalExpense));
    setTxt('dashBalance', formatCurrency(balance));
    setTxt('dashBudgetLimit', formatCurrency(monthlyBudget));
    setTxt('heroCardBalance', formatCurrency(balance));

    const balSub = document.getElementById('dashBalanceSubtext');
    if (balSub) {
        if (balance < 0) {
            balSub.textContent = '⚠️ Deficit (Expenses exceed income)';
            balSub.className = 'metric-footer red-text';
        } else {
            balSub.textContent = 'Income minus total expenses';
            balSub.className = 'metric-footer green-text';
        }
    }

    setTxt('dashBudgetSpent', formatCurrency(totalExpense));
    setTxt('dashBudgetCap', formatCurrency(monthlyBudget));
    setTxt('dashBudgetPercentText', `${budgetUsedPercent}% Used`);
    setTxt('dashBudgetRemainingText', `${formatCurrency(remainingBudget)} left`);
    setTxt('dashBudgetRemainingSub', `Remaining: ${formatCurrency(remainingBudget)}`);

    const progressBar = document.getElementById('dashProgressBar');
    const statusPill = document.getElementById('dashBudgetStatusPill');

    const fillPercent = Math.min(budgetUsedPercent, 100);
    if (progressBar) progressBar.style.width = `${fillPercent}%`;

    if (statusPill && progressBar) {
        if (budgetUsedPercent >= 100) {
            progressBar.style.backgroundColor = 'var(--color-red)';
            statusPill.textContent = 'Exceeded';
        } else if (budgetUsedPercent >= 80) {
            progressBar.style.backgroundColor = 'var(--color-amber)';
            statusPill.textContent = 'Warning';
        } else {
            progressBar.style.backgroundColor = 'var(--color-green)';
            statusPill.textContent = 'Healthy';
        }
    }

    renderDashboardQuickInsight(totalIncome, totalExpense, budgetUsedPercent, balance);
    renderRecentTransactionsList();
    renderDashboardCategoryBars(totalExpense);
}

function renderDashboardQuickInsight(income, expense, budgetPercent, balance) {
    const container = document.getElementById('dashQuickInsight');
    if (!container) return;
    const expensesCount = transactions.filter(t => t.type === 'EXPENSE').length;

    let message = '';

    if (expensesCount === 0) {
        message = '📌 <em>No expenses entered yet. Add your first real expense using the <strong>+ Add Expense</strong> button to generate live event suggestions!</em>';
    } else if (budgetPercent >= 100) {
        message = `⚠️ <strong>Live Expense Triggered Alert:</strong> Budget limit of ${formatCurrency(monthlyBudget)} exceeded! Stop non-essential expenses.`;
    } else if (budgetPercent >= 80) {
        message = `⚡ <strong>Live Expense Triggered Warning:</strong> You have consumed ${budgetPercent}% of your set budget limit.`;
    } else {
        message = `✅ <strong>Live Expense Triggered Update:</strong> Real expense logged. Remaining budget: ${formatCurrency(monthlyBudget - expense)}.`;
    }

    container.innerHTML = `<p class="insight-text">${message}</p>`;
}

function renderRecentTransactionsList() {
    const container = document.getElementById('dashRecentList');
    if (!container) return;
    const recent = transactions.slice(0, 5);

    if (recent.length === 0) {
        container.innerHTML = `<div class="empty-state" style="padding: 20px;"><p>No real transactions logged yet.</p></div>`;
        return;
    }

    container.innerHTML = recent.map(tx => {
        const icon = CATEGORY_ICONS[tx.category] || (tx.type === 'INCOME' ? '💵' : '💸');
        const isInc = tx.type === 'INCOME';
        const sign = isInc ? '+' : '-';
        const colorClass = isInc ? 'green-text' : 'red-text';

        return `
            <div class="recent-item clay-card-mini">
                <div class="recent-left">
                    <div class="cat-icon-badge">${icon}</div>
                    <div class="recent-details">
                        <div class="r-title">${escapeHTML(tx.description)}</div>
                        <div class="r-date">${tx.category} • ${formatDate(tx.date)}</div>
                    </div>
                </div>
                <div class="recent-amount ${colorClass}">${sign}${formatCurrency(tx.amount)}</div>
            </div>
        `;
    }).join('');
}

function renderDashboardCategoryBars(totalExpense) {
    const container = document.getElementById('dashCategoryBars');
    if (!container) return;
    const categoryTotals = getCategoryExpenseTotals();

    const categories = Object.keys(categoryTotals);
    if (categories.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">No expense data entered yet.</p>`;
        return;
    }

    categories.sort((a, b) => categoryTotals[b] - categoryTotals[a]);

    container.innerHTML = categories.slice(0, 4).map(cat => {
        const amt = categoryTotals[cat];
        const pct = totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0;
        const icon = CATEGORY_ICONS[cat] || '📦';

        return `
            <div class="cat-bar-item">
                <div class="cat-bar-label">
                    <span>${icon} ${cat}</span>
                    <span>${formatCurrency(amt)} (${pct}%)</span>
                </div>
                <div class="progress-bar-track clay-inset">
                    <div class="progress-bar-fill" style="width: ${pct}%; background-color: var(--accent-primary);"></div>
                </div>
            </div>
        `;
    }).join('');
}

// RENDER BUDGET SECTION
function renderBudgetSection() {
    const totalExpense = getSumByType('EXPENSE');
    const remaining = monthlyBudget - totalExpense;
    const usagePercent = monthlyBudget > 0 ? Math.min(Math.round((totalExpense / monthlyBudget) * 100), 999) : 0;

    const bInput = document.getElementById('budgetAmount');
    if (bInput && document.activeElement !== bInput) {
        bInput.value = monthlyBudget || '';
    }

    const setTxt = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    setTxt('bStatLimit', formatCurrency(monthlyBudget));
    setTxt('bStatSpent', formatCurrency(totalExpense));
    setTxt('bStatRemaining', formatCurrency(remaining));
    setTxt('bStatPercent', `${usagePercent}%`);

    const progressBar = document.getElementById('bStatProgressBar');
    if (progressBar) progressBar.style.width = `${Math.min(usagePercent, 100)}%`;

    const alertBox = document.getElementById('budgetAlertBox');
    const alertText = document.getElementById('budgetAlertText');

    if (alertText && progressBar) {
        if (usagePercent >= 100) {
            progressBar.style.backgroundColor = 'var(--color-red)';
            alertText.innerHTML = `⚠️ <strong>Budget Exceeded!</strong> Real spent: <strong>${formatCurrency(totalExpense)}</strong> against budget limit: <strong>${formatCurrency(monthlyBudget)}</strong>.`;
        } else if (usagePercent >= 80) {
            progressBar.style.backgroundColor = 'var(--color-amber)';
            alertText.innerHTML = `⚡ <strong>Budget Warning:</strong> ${usagePercent}% used. Remaining: <strong>${formatCurrency(remaining)}</strong>.`;
        } else {
            progressBar.style.backgroundColor = 'var(--color-green)';
            alertText.innerHTML = `✅ <strong>Budget Healthy:</strong> Remaining available: <strong>${formatCurrency(remaining)}</strong>.`;
        }
    }
}

// RENDER TRANSACTION HISTORY
function initTableFilters() {
    const searchInput = document.getElementById('searchInput');
    const filterType = document.getElementById('filterType');
    const filterCategory = document.getElementById('filterCategory');
    const sortBy = document.getElementById('sortBy');

    const triggerRender = () => renderHistoryTable();

    if (searchInput) searchInput.oninput = triggerRender;
    if (filterType) filterType.onchange = triggerRender;
    if (filterCategory) filterCategory.onchange = triggerRender;
    if (sortBy) sortBy.onchange = triggerRender;
}

function renderHistoryTable() {
    populateCategoryDropdownFilter();

    const searchVal = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const typeVal = document.getElementById('filterType')?.value || 'ALL';
    const catVal = document.getElementById('filterCategory')?.value || 'ALL';
    const sortVal = document.getElementById('sortBy')?.value || 'date-desc';

    let filtered = transactions.filter(tx => {
        const matchesSearch = tx.description.toLowerCase().includes(searchVal) || 
                              tx.category.toLowerCase().includes(searchVal);
        const matchesType = typeVal === 'ALL' || tx.type === typeVal;
        const matchesCat = catVal === 'ALL' || tx.category === catVal;
        return matchesSearch && matchesType && matchesCat;
    });

    filtered.sort((a, b) => {
        if (sortVal === 'date-desc') return new Date(b.date) - new Date(a.date);
        if (sortVal === 'date-asc') return new Date(a.date) - new Date(b.date);
        if (sortVal === 'amount-desc') return b.amount - a.amount;
        if (sortVal === 'amount-asc') return a.amount - b.amount;
        return 0;
    });

    const tbody = document.getElementById('transactionsTableBody');
    const emptyState = document.getElementById('emptyState');

    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');
    tbody.innerHTML = filtered.map(tx => {
        const icon = CATEGORY_ICONS[tx.category] || (tx.type === 'INCOME' ? '💵' : '💸');
        const badgeClass = tx.type === 'INCOME' ? 'income' : 'expense';
        const sign = tx.type === 'INCOME' ? '+' : '-';
        const colorClass = tx.type === 'INCOME' ? 'green-text' : 'red-text';

        return `
            <tr>
                <td>${formatDate(tx.date)}</td>
                <td><span class="badge-type ${badgeClass}">${tx.type}</span></td>
                <td>${icon} ${escapeHTML(tx.category)}</td>
                <td>${escapeHTML(tx.description)}</td>
                <td class="text-right ${colorClass} font-weight-bold">${sign}${formatCurrency(tx.amount)}</td>
                <td class="text-center">
                    <button class="clay-btn mini-btn danger-clay" onclick="promptDelete('${tx.id}')" title="Delete record">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
}

function populateCategoryDropdownFilter() {
    const select = document.getElementById('filterCategory');
    if (!select) return;

    const currentVal = select.value;
    const categoriesSet = new Set(transactions.map(t => t.category));

    let optionsHTML = `<option value="ALL">All Categories</option>`;
    categoriesSet.forEach(cat => {
        optionsHTML += `<option value="${cat}">${cat}</option>`;
    });

    select.innerHTML = optionsHTML;
    select.value = currentVal || 'ALL';
}

// RENDER EXPENSE ANALYSIS
function renderAnalysisSection() {
    const expenses = transactions.filter(t => t.type === 'EXPENSE');
    const incomes = transactions.filter(t => t.type === 'INCOME');
    const totalExp = getSumByType('EXPENSE');
    const totalInc = getSumByType('INCOME');

    const categoryTotals = getCategoryExpenseTotals();
    let topCatName = '-';
    let topCatAmt = 0;

    Object.keys(categoryTotals).forEach(cat => {
        if (categoryTotals[cat] > topCatAmt) {
            topCatAmt = categoryTotals[cat];
            topCatName = cat;
        }
    });

    const setTxt = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    setTxt('anTopCategory', topCatName !== '-' ? `${CATEGORY_ICONS[topCatName] || ''} ${topCatName}` : '-');
    setTxt('anTopCategoryAmount', `${formatCurrency(topCatAmt)} spent`);

    const now = new Date();
    const currentDay = now.getDate() || 1;
    const avgDaily = totalExp / currentDay;
    setTxt('anAvgDaily', formatCurrency(avgDaily));

    setTxt('anTotalCount', transactions.length);
    setTxt('anIncExpCount', `${incomes.length} Incomes | ${expenses.length} Expenses`);

    let maxExp = 0;
    let maxExpDesc = '-';
    expenses.forEach(e => {
        if (e.amount > maxExp) {
            maxExp = e.amount;
            maxExpDesc = e.description;
        }
    });
    setTxt('anMaxExpense', formatCurrency(maxExp));
    setTxt('anMaxExpenseName', maxExpDesc);

    renderAnalysisCategoryChart(categoryTotals, totalExp);

    const grandTotal = totalInc + totalExp;
    const incPct = grandTotal > 0 ? Math.round((totalInc / grandTotal) * 100) : 50;
    const expPct = grandTotal > 0 ? (100 - incPct) : 50;

    setTxt('ratioIncText', formatCurrency(totalInc));
    setTxt('ratioExpText', formatCurrency(totalExp));
    
    const incBar = document.getElementById('ratioIncBar');
    const expBar = document.getElementById('ratioExpBar');
    if (incBar) incBar.style.width = `${incPct}%`;
    if (expBar) expBar.style.width = `${expPct}%`;

    const savingsRate = totalInc > 0 ? Math.round(((totalInc - totalExp) / totalInc) * 100) : 0;
    setTxt('ratioSavingsText', `Savings Rate: ${savingsRate}% of Total Income`);
}

function renderAnalysisCategoryChart(categoryTotals, totalExp) {
    const container = document.getElementById('anCategoryBarsContainer');
    if (!container) return;
    const categories = Object.keys(categoryTotals);

    if (categories.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted);">No expense entries logged yet.</p>`;
        return;
    }

    categories.sort((a, b) => categoryTotals[b] - categoryTotals[a]);

    container.innerHTML = categories.map(cat => {
        const amt = categoryTotals[cat];
        const pct = totalExp > 0 ? Math.round((amt / totalExp) * 100) : 0;
        const icon = CATEGORY_ICONS[cat] || '📦';

        return `
            <div class="cat-bar-item">
                <div class="cat-bar-label">
                    <span>${icon} <strong>${cat}</strong></span>
                    <span>${formatCurrency(amt)} (${pct}%)</span>
                </div>
                <div class="progress-bar-track large clay-inset">
                    <div class="progress-bar-fill" style="width: ${pct}%; background: linear-gradient(90deg, #6366f1, #8b5cf6);"></div>
                </div>
            </div>
        `;
    }).join('');
}

// RENDER SMART SUGGESTIONS (EVENT DRIVEN)
function renderSmartInsights() {
    const container = document.getElementById('smartInsightsGrid');
    if (!container) return;
    const expenses = transactions.filter(t => t.type === 'EXPENSE');
    const totalExp = getSumByType('EXPENSE');
    const categoryTotals = getCategoryExpenseTotals();

    const insights = [];

    if (expenses.length === 0) {
        container.innerHTML = `
            <div class="clay-card insight-card tip" style="grid-column: 1 / -1;">
                <span class="insight-badge">📌 Event Suggestions Waiting</span>
                <p>No expenses entered yet! Whenever you log a real expense, Smart Suggestions will analyze your category patterns and budget thresholds live.</p>
            </div>
        `;
        return;
    }

    let topCat = null;
    let topAmt = 0;
    Object.keys(categoryTotals).forEach(c => {
        if (categoryTotals[c] > topAmt) {
            topAmt = categoryTotals[c];
            topCat = c;
        }
    });

    if (topCat && totalExp > 0) {
        const pct = Math.round((topAmt / totalExp) * 100);
        insights.push({
            type: pct >= 40 ? 'warning' : 'tip',
            badge: '⚡ Category Triggered Analysis',
            text: `You have spent <strong>${formatCurrency(topAmt)} (${pct}%)</strong> on <strong>${topCat}</strong> out of total expenses.`
        });
    }

    const budgetPct = monthlyBudget > 0 ? Math.round((totalExp / monthlyBudget) * 100) : 0;
    if (budgetPct >= 100) {
        insights.push({
            type: 'alert',
            badge: '🚨 Expense Triggered Overrun',
            text: `Recent expense pushed you over your monthly limit by <strong>${formatCurrency(totalExp - monthlyBudget)}</strong>!`
        });
    } else if (budgetPct >= 80) {
        insights.push({
            type: 'warning',
            badge: '⚡ Expense Triggered Warning',
            text: `You have consumed <strong>${budgetPct}%</strong> of your monthly limit after logging recent expenses.`
        });
    }

    if (categoryTotals['Food'] && categoryTotals['Food'] > 1500) {
        insights.push({
            type: 'warning',
            badge: '🍔 Canteen Expense Insight',
            text: `Food expenses reached <strong>${formatCurrency(categoryTotals['Food'])}</strong> across ${expenses.filter(e=>e.category==='Food').length} entries.`
        });
    }

    container.innerHTML = insights.map(i => `
        <div class="clay-card insight-card ${i.type}">
            <span class="insight-badge">${i.badge}</span>
            <p>${i.text}</p>
        </div>
    `).join('');
}

// GLOBAL BANNER
function renderGlobalBanner() {
    const banner = document.getElementById('globalBudgetBanner');
    const message = document.getElementById('bannerMessage');
    const icon = document.getElementById('bannerIcon');
    if (!banner || !message || !icon) return;

    const totalExp = getSumByType('EXPENSE');
    const pct = monthlyBudget > 0 ? (totalExp / monthlyBudget) * 100 : 0;

    if (pct >= 100) {
        banner.className = 'alert-banner danger';
        icon.textContent = '🚨';
        message.innerHTML = `<strong>Over Budget Alert!</strong> Real spent ${formatCurrency(totalExp)} exceeds limit ${formatCurrency(monthlyBudget)}`;
    } else if (pct >= 80) {
        banner.className = 'alert-banner warning';
        icon.textContent = '⚠️';
        message.innerHTML = `<strong>Budget Warning!</strong> ${Math.round(pct)}% used. Remaining: ${formatCurrency(monthlyBudget - totalExp)}`;
    } else {
        banner.className = 'alert-banner hidden';
    }
}

// MODAL
function initModal() {
    const cancelBtn = document.getElementById('cancelDeleteBtn');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    const modal = document.getElementById('deleteModal');

    if (cancelBtn) cancelBtn.onclick = closeModal;

    if (confirmBtn) {
        confirmBtn.onclick = () => {
            if (pendingDeleteId) {
                transactions = transactions.filter(t => t.id !== pendingDeleteId);
                saveUserData();
                showToast('Transaction deleted', 'info');
                closeModal();
                renderAll();
            }
        };
    }

    if (modal) {
        modal.onclick = (e) => {
            if (e.target === modal) closeModal();
        };
    }
}

function promptDelete(id) {
    pendingDeleteId = id;
    const modal = document.getElementById('deleteModal');
    if (modal) modal.classList.remove('hidden');
}

function closeModal() {
    pendingDeleteId = null;
    const modal = document.getElementById('deleteModal');
    if (modal) modal.classList.add('hidden');
}

// TOAST
function showToast(msg, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    toast.innerHTML = `<span>${icon}</span> <span>${msg}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// HELPERS
function getSumByType(type) {
    return transactions
        .filter(t => t.type === type)
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
}

function getCategoryExpenseTotals() {
    const totals = {};
    transactions
        .filter(t => t.type === 'EXPENSE')
        .forEach(t => {
            totals[t.category] = (totals[t.category] || 0) + (parseFloat(t.amount) || 0);
        });
    return totals;
}

function formatCurrency(amount) {
    const num = parseFloat(amount) || 0;
    return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}
