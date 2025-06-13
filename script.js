// --- Auth Functions ---
function getUser() {
    const user = localStorage.getItem('gothamUser');
    return user ? JSON.parse(user) : null;
}
function setUser(username) {
    localStorage.setItem('gothamUser', JSON.stringify({ username }));
}
function clearUser() {
    localStorage.removeItem('gothamUser');
}
function getRegisteredUsers() {
    // Format: { username: password }
    return JSON.parse(localStorage.getItem('gothamUsers') || '{}');
}
function registerUser(username, password) {
    const users = getRegisteredUsers();
    users[username] = password;
    localStorage.setItem('gothamUsers', JSON.stringify(users));
}
function checkUser(username, password) {
    const users = getRegisteredUsers();
    return users[username] && users[username] === password;
}
function userExists(username) {
    const users = getRegisteredUsers();
    return !!users[username];
}

// --- Section switching helpers ---
function showSection(sectionId) {
    ["landing", "login-section", "signup-section", "dashboard-section"].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
}

// --- Navbar Login/Logout ---
const navLoginBtn = document.getElementById('nav-login-btn');
function updateNavLoginBtn() {
    const user = getUser();
    navLoginBtn.textContent = user ? `Hi, ${user.username} (Logout)` : "Login";
}
navLoginBtn.addEventListener('click', () => {
    const user = getUser();
    if (user) {
        clearUser();
        updateNavLoginBtn();
        showSection('landing');
    } else {
        showSection('login-section');
        clearLoginForm();
    }
});
updateNavLoginBtn();

// --- Landing page logic ---
document.getElementById('landing-dashboard-btn').addEventListener('click', () => {
    const user = getUser();
    if (user) {
        showSection('dashboard-section');
        renderDashboard();
    } else {
        showSection('login-section');
        clearLoginForm();
    }
});
document.getElementById('landing-signup-btn').addEventListener('click', () => {
    showSection('signup-section');
    clearSignupForm();
});

// --- Auth forms logic ---
const loginForm = document.getElementById('login-form');
const loginCancelBtn = document.getElementById('login-cancel-btn');
const toSignupBtn = document.getElementById('to-signup-btn');
const loginError = document.getElementById('login-error');
function clearLoginForm() {
    loginForm.reset();
    loginError.textContent = "";
}
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    if (!username || !password) {
        loginError.textContent = "Please fill in all fields.";
        return;
    }
    if (checkUser(username, password)) {
        setUser(username);
        updateNavLoginBtn();
        showSection('dashboard-section');
        renderDashboard();
        clearLoginForm();
    } else {
        loginError.textContent = "Invalid username or password.";
    }
});
loginCancelBtn.addEventListener('click', () => {
    showSection('landing');
    clearLoginForm();
});
toSignupBtn.addEventListener('click', () => {
    showSection('signup-section');
    clearSignupForm();
});

// Signup
const signupForm = document.getElementById('signup-form');
const signupCancelBtn = document.getElementById('signup-cancel-btn');
const toLoginBtn = document.getElementById('to-login-btn');
const signupError = document.getElementById('signup-error');
function clearSignupForm() {
    signupForm.reset();
    signupError.textContent = "";
}
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value;
    if (!username || !password) {
        signupError.textContent = "Please fill in all fields.";
        return;
    }
    if (userExists(username)) {
        signupError.textContent = "Username already exists.";
        return;
    }
    registerUser(username, password);
    setUser(username);
    updateNavLoginBtn();
    showSection('dashboard-section');
    renderDashboard();
    clearSignupForm();
});
signupCancelBtn.addEventListener('click', () => {
    showSection('landing');
    clearSignupForm();
});
toLoginBtn.addEventListener('click', () => {
    showSection('login-section');
    clearLoginForm();
});

// --- Dashboard logic (per-user data) ---
function getDashboardData() {
    const user = getUser();
    if (!user) return [];
    const allData = JSON.parse(localStorage.getItem('dashboardData') || '{}');
    return allData[user.username] || [];
}
function saveDashboardData(items) {
    const user = getUser();
    if (!user) return;
    const allData = JSON.parse(localStorage.getItem('dashboardData') || '{}');
    allData[user.username] = items;
    localStorage.setItem('dashboardData', JSON.stringify(allData));
}
function renderDashboard() {
    const list = document.getElementById('dashboard-list');
    if (!list) return;
    list.innerHTML = '';
    const items = getDashboardData();
    items.forEach((item, idx) => {
        const frame = document.createElement('div');
        frame.className = 'dashboard-item-frame';
        const title = document.createElement('div');
        title.className = 'item-title';
        title.textContent = item.title;
        frame.appendChild(title);

        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.className = 'delete-btn';
        delBtn.onclick = (e) => {
            e.stopPropagation();
            items.splice(idx, 1);
            saveDashboardData(items);
            renderDashboard();
        };
        frame.appendChild(delBtn);

        frame.onclick = () => {
            openItemModal(item.title, item.description);
        };

        list.appendChild(frame);
    });
}

// Dashboard modal logic
const modalOverlay = document.getElementById('modal-overlay');
const createNewBtn = document.getElementById('create-new-btn');
const cancelBtn = document.getElementById('cancel-btn');
const dashboardForm = document.getElementById('dashboard-form');
const titleInput = document.getElementById('dashboard-title');
const descInput = document.getElementById('dashboard-description');
if (createNewBtn) createNewBtn.addEventListener('click', openModal);
if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
if (modalOverlay) modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay) closeModal();
});
if (dashboardForm) dashboardForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    if (!title || !description) return;
    const items = getDashboardData();
    items.push({ title, description });
    saveDashboardData(items);
    renderDashboard();
    closeModal();
});
function openModal() {
    modalOverlay.classList.remove('hidden');
    titleInput.value = '';
    descInput.value = '';
    setTimeout(() => titleInput.focus(), 50);
}
function closeModal() {
    modalOverlay.classList.add('hidden');
}

// Item details modal
const itemModalOverlay = document.getElementById('item-modal-overlay');
const itemModalTitle = document.getElementById('item-modal-title');
const itemModalDescription = document.getElementById('item-modal-description');
const closeItemModalBtn = document.getElementById('close-item-modal-btn');
function openItemModal(title, description) {
    itemModalTitle.textContent = title;
    itemModalDescription.textContent = description;
    itemModalOverlay.classList.remove('hidden');
}
function closeItemModal() {
    itemModalOverlay.classList.add('hidden');
}
if (closeItemModalBtn) closeItemModalBtn.addEventListener('click', closeItemModal);
if (itemModalOverlay) itemModalOverlay.addEventListener('click', function(e) {
    if (e.target === itemModalOverlay) closeItemModal();
});

// --- On page load, show landing or dashboard if already logged in ---
(function() {
    if (getUser()) {
        showSection('dashboard-section');
        renderDashboard();
    } else {
        showSection('landing');
    }
})();
