// Utility functions to handle localStorage
function getDashboardData() {
    const data = localStorage.getItem('dashboardData');
    return data ? JSON.parse(data) : [];
}
function saveDashboardData(items) {
    localStorage.setItem('dashboardData', JSON.stringify(items));
}

// Render dashboard items as frames (title only, click to open details)
function renderDashboard() {
    const list = document.getElementById('dashboard-list');
    list.innerHTML = '';
    const items = getDashboardData();
    items.forEach((item, idx) => {
        const frame = document.createElement('div');
        frame.className = 'dashboard-item-frame';
        // Only title is visible
        const title = document.createElement('div');
        title.className = 'item-title';
        title.textContent = item.title;
        frame.appendChild(title);

        // Delete button (do not open modal when clicked)
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

        // Click to open item details modal
        frame.onclick = () => {
            openItemModal(item.title, item.description);
        };

        list.appendChild(frame);
    });
}

// Add item modal form handling
const modalOverlay = document.getElementById('modal-overlay');
const createNewBtn = document.getElementById('create-new-btn');
const cancelBtn = document.getElementById('cancel-btn');
const dashboardForm = document.getElementById('dashboard-form');
const titleInput = document.getElementById('dashboard-title');
const descInput = document.getElementById('dashboard-description');

function openModal() {
    modalOverlay.classList.remove('hidden');
    titleInput.value = '';
    descInput.value = '';
    setTimeout(() => titleInput.focus(), 50);
}
function closeModal() {
    modalOverlay.classList.add('hidden');
}

// Show modal on button click
createNewBtn.addEventListener('click', openModal);
// Cancel button hides modal
cancelBtn.addEventListener('click', closeModal);
// Hide modal when clicking outside the modal box
modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

// Add new item via modal
dashboardForm.addEventListener('submit', function(e) {
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
closeItemModalBtn.addEventListener('click', closeItemModal);
itemModalOverlay.addEventListener('click', function(e) {
    if (e.target === itemModalOverlay) {
        closeItemModal();
    }
});

// Initial render
renderDashboard();
