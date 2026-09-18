/**
 * SMART STUDENT EXPENSE & BUDGET TRACKER
 * Admin Portal JavaScript - User Database Management System
 */

const DB_KEYS = {
    USERS: 'smartspend_users_db',
    ADMIN_SESSION: 'smartspend_admin_session',
    THEME: 'smartspend_theme'
};

const DEFAULT_ADMIN = {
    email: 'admin@bca.edu',
    password: 'vlbjcas'
};

let usersDB = [];
let isAdminLoggedIn = false;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initAdminDatabase();
    initAdminTheme();
    initAdminAuth();
    checkAdminSession();
});

function initAdminDatabase() {
    const storedUsers = localStorage.getItem(DB_KEYS.USERS);
    if (storedUsers) {
        try {
            usersDB = JSON.parse(storedUsers);
        } catch (e) {
            usersDB = [];
        }
    } else {
        usersDB = [
            {
                id: 'usr_demo_1',
                name: 'Demo Student',
                email: 'student@bca.edu',
                password: 'student123',
                createdAt: new Date().toISOString()
            }
        ];
        saveUsersDB();
    }
}

function saveUsersDB() {
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(usersDB));
    if (isAdminLoggedIn) {
        renderAdminDashboard();
    }
}

function checkAdminSession() {
    const session = localStorage.getItem(DB_KEYS.ADMIN_SESSION);
    if (session === 'true') {
        isAdminLoggedIn = true;
        showAdminMainApp();
    } else {
        showAdminAuthScreen();
    }
}

function showAdminAuthScreen() {
    isAdminLoggedIn = false;
    document.getElementById('adminAuthScreen').classList.remove('hidden');
    document.getElementById('adminMainApp').classList.add('hidden');
}

function showAdminMainApp() {
    isAdminLoggedIn = true;
    document.getElementById('adminAuthScreen').classList.add('hidden');
    document.getElementById('adminMainApp').classList.remove('hidden');

    initAdminNav();
    renderAdminDashboard();
}

function initAdminAuth() {
    const form = document.getElementById('adminLoginForm');
    const quickBtn = document.getElementById('adminQuickLoginBtn');
    const logoutBtn = document.getElementById('adminLogoutBtn');

    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            const email = document.getElementById('adminEmail').value.trim().toLowerCase();
            const pass = document.getElementById('adminPassword').value.trim();

            if (email === DEFAULT_ADMIN.email && pass === DEFAULT_ADMIN.password) {
                localStorage.setItem(DB_KEYS.ADMIN_SESSION, 'true');
                showToast('Admin Login Successful!', 'success');
                showAdminMainApp();
            } else {
                showToast('Invalid Admin Credentials (admin@bca.edu / vlbjcas)', 'error');
            }
        };
    }

    if (quickBtn) {
        quickBtn.onclick = () => {
            document.getElementById('adminEmail').value = DEFAULT_ADMIN.email;
            document.getElementById('adminPassword').value = DEFAULT_ADMIN.password;
            localStorage.setItem(DB_KEYS.ADMIN_SESSION, 'true');
            showToast('Logged in as System Admin!', 'success');
            showAdminMainApp();
        };
    }

    if (logoutBtn) {
        logoutBtn.onclick = () => {
            localStorage.removeItem(DB_KEYS.ADMIN_SESSION);
            showToast('Admin Logged Out', 'info');
            showAdminAuthScreen();
        };
    }

    // System Tools Buttons
    const exportBtn = document.getElementById('exportJsonDbBtn');
    const clearSessionBtn = document.getElementById('clearSessionsBtn');
    const resetDbBtn = document.getElementById('resetAllDbBtn');
    const addDemoUserBtn = document.getElementById('adminAddDemoUserBtn');
    const refreshUsersBtn = document.getElementById('adminRefreshUsersBtn');
    const userSearchInput = document.getElementById('adminUserSearch');

    if (exportBtn) exportBtn.onclick = exportDatabaseJson;
    if (clearSessionBtn) clearSessionBtn.onclick = clearAllSessions;
    if (resetDbBtn) resetDbBtn.onclick = resetDatabaseFactory;
    if (addDemoUserBtn) addDemoUserBtn.onclick = addTestStudentAccount;
    if (refreshUsersBtn) refreshUsersBtn.onclick = () => {
        initAdminDatabase();
        renderAdminDashboard();
        showToast('Database view refreshed!', 'info');
    };
    if (userSearchInput) userSearchInput.oninput = () => renderAdminUserTable();
}

function initAdminNav() {
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    navLinks.forEach(link => {
        link.onclick = (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = link.getAttribute('data-target');
                adminNavigateToSection(target);
            }
        };
    });
}

function adminNavigateToSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');

    sections.forEach(sec => {
        if (sec.id === sectionId) sec.classList.add('active');
        else sec.classList.remove('active');
    });

    navLinks.forEach(link => {
        if (link.getAttribute('data-target') === sectionId) link.classList.add('active');
        else link.classList.remove('active');
    });
}

function renderAdminDashboard() {
    renderAdminMetrics();
    renderAdminRecentActivity();
    renderAdminUserTable();
}

function renderAdminMetrics() {
    document.getElementById('statTotalUsers').textContent = usersDB.length;

    let totalInc = 0;
    let totalExp = 0;
    let totalTxCount = 0;

    usersDB.forEach(u => {
        const uTx = JSON.parse(localStorage.getItem(`smartspend_tx_${u.id}`) || '[]');
        totalTxCount += uTx.length;
        uTx.forEach(t => {
            if (t.type === 'INCOME') totalInc += (parseFloat(t.amount) || 0);
            if (t.type === 'EXPENSE') totalExp += (parseFloat(t.amount) || 0);
        });
    });

    document.getElementById('statTotalIncome').textContent = formatCurrency(totalInc);
    document.getElementById('statTotalExpense').textContent = formatCurrency(totalExp);
    document.getElementById('statTotalTxCount').textContent = totalTxCount;
}

function renderAdminRecentActivity() {
    const container = document.getElementById('adminRecentActivity');
    if (!container) return;

    if (usersDB.length === 0) {
        container.innerHTML = `<div class="empty-state"><p>No users in Database.</p></div>`;
        return;
    }

    container.innerHTML = usersDB.slice(0, 5).map(u => {
        const uTx = JSON.parse(localStorage.getItem(`smartspend_tx_${u.id}`) || '[]');
        return `
            <div class="recent-item clay-card-mini">
                <div class="recent-left">
                    <div class="cat-icon-badge">👤</div>
                    <div class="recent-details">
                        <div class="r-title">${escapeHTML(u.name)} (${escapeHTML(u.email)})</div>
                        <div class="r-date">ID: ${u.id} • Registered ${formatDate(u.createdAt)}</div>
                    </div>
                </div>
                <div class="recent-amount green-text">${uTx.length} Entries</div>
            </div>
        `;
    }).join('');
}

function renderAdminUserTable() {
    const tbody = document.getElementById('adminUserTableBody');
    if (!tbody) return;

    const searchVal = (document.getElementById('adminUserSearch')?.value || '').toLowerCase();

    const filteredUsers = usersDB.filter(u => 
        u.name.toLowerCase().includes(searchVal) ||
        u.email.toLowerCase().includes(searchVal) ||
        u.id.toLowerCase().includes(searchVal)
    );

    if (filteredUsers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding: 30px;">No matching users found in Database.</td></tr>`;
        return;
    }

    tbody.innerHTML = filteredUsers.map(u => {
        const uTx = JSON.parse(localStorage.getItem(`smartspend_tx_${u.id}`) || '[]');

        return `
            <tr>
                <td><code>${u.id}</code></td>
                <td><strong>${escapeHTML(u.name)}</strong></td>
                <td>${escapeHTML(u.email)}</td>
                <td><code>${escapeHTML(u.password)}</code></td>
                <td>${formatDate(u.createdAt)}</td>
                <td class="text-center"><strong>${uTx.length}</strong> records</td>
                <td class="text-center">
                    <button class="clay-btn mini-btn primary-btn" onclick="viewUserDetails('${u.id}')">Details</button>
                    <button class="clay-btn mini-btn danger-clay" onclick="deleteUserAccount('${u.id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

function viewUserDetails(userId) {
    const user = usersDB.find(u => u.id === userId);
    if (!user) return;

    const uTx = JSON.parse(localStorage.getItem(`smartspend_tx_${user.id}`) || '[]');
    let inc = 0;
    let exp = 0;

    uTx.forEach(t => {
        if (t.type === 'INCOME') inc += (parseFloat(t.amount) || 0);
        if (t.type === 'EXPENSE') exp += (parseFloat(t.amount) || 0);
    });

    document.getElementById('mUserName').textContent = user.name;
    document.getElementById('mUserEmail').textContent = user.email;
    document.getElementById('mUserId').textContent = user.id;
    document.getElementById('mUserPass').textContent = user.password;
    document.getElementById('mUserInc').textContent = formatCurrency(inc);
    document.getElementById('mUserExp').textContent = formatCurrency(exp);

    document.getElementById('userDetailModal').classList.remove('hidden');
}

function closeAdminModal() {
    document.getElementById('userDetailModal').classList.add('hidden');
}

function deleteUserAccount(userId) {
    if (confirm(`Are you sure you want to delete user ID ${userId} from the Database?`)) {
        usersDB = usersDB.filter(u => u.id !== userId);
        localStorage.removeItem(`smartspend_tx_${userId}`);
        localStorage.removeItem(`smartspend_budget_${userId}`);
        saveUsersDB();
        showToast(`User ${userId} deleted from database`, 'info');
    }
}

function addTestStudentAccount() {
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const newStudent = {
        id: `usr_test_${randomId}`,
        name: `Test Student ${randomId}`,
        email: `student${randomId}@bca.edu`,
        password: `pass${randomId}`,
        createdAt: new Date().toISOString()
    };

    usersDB.push(newStudent);
    saveUsersDB();
    showToast(`Test student added: ${newStudent.email}`, 'success');
}

function exportDatabaseJson() {
    const fullBackup = {
        exportedAt: new Date().toISOString(),
        users: usersDB,
        userData: {}
    };

    usersDB.forEach(u => {
        fullBackup.userData[u.id] = {
            transactions: JSON.parse(localStorage.getItem(`smartspend_tx_${u.id}`) || '[]'),
            budget: localStorage.getItem(`smartspend_budget_${u.id}`) || 5000
        };
    });

    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartspend_database_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Database backup downloaded!', 'success');
}

function clearAllSessions() {
    localStorage.removeItem('smartspend_session');
    showToast('All active user sessions cleared!', 'info');
}

function resetDatabaseFactory() {
    if (confirm('⚠️ FACTORY RESET: Delete all registered users and transactions?')) {
        localStorage.clear();
        initAdminDatabase();
        renderAdminDashboard();
        showToast('Database restored to factory default', 'info');
    }
}

function initAdminTheme() {
    const themeBtn = document.getElementById('adminThemeToggleBtn');
    const storedTheme = localStorage.getItem(DB_KEYS.THEME) || 'dark';

    setAdminTheme(storedTheme);

    if (themeBtn) {
        themeBtn.onclick = () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            setAdminTheme(currentTheme === 'dark' ? 'light' : 'dark');
        };
    }
}

function setAdminTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(DB_KEYS.THEME, theme);
    const themeText = document.getElementById('adminThemeToggleBtn');
    if (themeText) {
        themeText.textContent = theme === 'dark' ? '🌙 Dark' : '☀️ Light';
    }
}

// UTILITIES
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
