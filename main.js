// main.js - handles age check and navigation


// --- User Account System ---
function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
}
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}
function hash(str) {
    // Simple hash for demo only (not secure)
    let h = 0; for (let i = 0; i < str.length; i++) h = ((h<<5)-h)+str.charCodeAt(i); return h.toString();
}
function getCurrentUser() {
    return sessionStorage.getItem('currentUser');
}
function setCurrentUser(username) {
    sessionStorage.setItem('currentUser', username);
}
function logoutUser() {
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('age_verified');
    sessionStorage.removeItem('balance');
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const ageForm = document.getElementById('ageForm');
    const loginMessage = document.getElementById('loginMessage');
    const ageMessage = document.getElementById('ageMessage');

    // Hide forms if already logged in
    if (getCurrentUser()) {
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'none';
        if (ageForm) ageForm.style.display = 'none';
        loginMessage.textContent = 'Logged in as ' + getCurrentUser();
        return;
    }

    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('registerUsername').value.trim();
            const password = document.getElementById('registerPassword').value;
            if (!username || !password) {
                loginMessage.textContent = 'Please enter a username and password.';
                return;
            }
            let users = getUsers();
            if (users.find(u => u.username === username)) {
                loginMessage.textContent = 'Username already exists.';
                return;
            }
            users.push({ username, passwordHash: hash(password), balance: 0 });
            saveUsers(users);
            loginMessage.textContent = 'Registration successful! Please log in.';
            registerForm.reset();
        });
    }
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value.trim();
            const password = document.getElementById('loginPassword').value;
            let users = getUsers();
            let user = users.find(u => u.username === username && u.passwordHash === hash(password));
            if (!user) {
                loginMessage.textContent = 'Invalid username or password.';
                return;
            }
            setCurrentUser(username);
            sessionStorage.setItem('age_verified', 'true');
            sessionStorage.setItem('balance', user.balance);
            loginMessage.textContent = 'Login successful! Redirecting...';
            setTimeout(() => { window.location.href = 'home.html'; }, 800);
        });
    }
    if (ageForm) {
        ageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const age = parseInt(document.getElementById('age').value, 10);
            if (isNaN(age) || age < 18) {
                ageMessage.textContent = 'You must be over 18 to play. Goodbye!';
                sessionStorage.setItem('age_verified', 'false');
            } else {
                sessionStorage.setItem('age_verified', 'true');
                window.location.href = 'enter_money.html';
            }
        });
    }
});

// Persistent balance logic

function getBalance() {
    const user = getCurrentUser();
    if (!user) return 0;
    let users = getUsers();
    let u = users.find(u => u.username === user);
    if (!u) return 0;
    return typeof u.balance === 'number' ? u.balance : 0;
}
function setBalance(val) {
    const user = getCurrentUser();
    if (!user) return;
    let users = getUsers();
    let u = users.find(u => u.username === user);
    if (!u) return;
    u.balance = parseFloat(val);
    saveUsers(users);
    sessionStorage.setItem('balance', val.toFixed(2));
}
function syncBalanceFromUser() {
    const user = getCurrentUser();
    if (!user) return;
    let users = getUsers();
    let u = users.find(u => u.username === user);
    if (u) sessionStorage.setItem('balance', (u.balance || 0).toFixed(2));
}
if (sessionStorage.getItem('age_verified') === 'true' && getCurrentUser()) {
    syncBalanceFromUser();
}
