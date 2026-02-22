// Utility Functions

// Date utilities
const dateUtils = {
    // Format date as readable string
    formatDate(date) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    },
    
    // Get current date
    getCurrentDate() {
        return new Date();
    },
    
    // Get date string in YYYY-MM-DD format
    getDateString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },
    
    // Parse date string
    parseDate(dateString) {
        return new Date(dateString);
    },
    
    // Get days in month
    getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    },
    
    // Get first day of month (0 = Sunday)
    getFirstDayOfMonth(year, month) {
        return new Date(year, month, 1).getDay();
    },
    
    // Check if date is today
    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    },
    
    // Get week number
    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    },
    
    // Get date range for week
    getWeekRange(date) {
        const day = date.getDay();
        const diff = date.getDate() - day;
        const sunday = new Date(date.setDate(diff));
        const saturday = new Date(date.setDate(diff + 6));
        return { start: sunday, end: saturday };
    },
    
    // Add days to date
    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },
    
    // Get month name
    getMonthName(monthIndex) {
        return CONFIG.MONTHS[monthIndex];
    }
};

// String utilities
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function truncate(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Toast notification system
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${escapeHtml(message)}</span>
    `;
    
    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after duration
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Modal system
function createModal({ title, content, confirmText = 'Save', cancelText = 'Cancel', onConfirm, onCancel }) {
    return {
        title,
        content,
        confirmText,
        cancelText,
        onConfirm: onConfirm || (() => true),
        onCancel: onCancel || (() => true)
    };
}

function showModal(modal) {
    const container = document.getElementById('modalContainer');
    
    const modalHTML = `
        <div class="modal-overlay" id="currentModal">
            <div class="modal">
                <div class="modal-header">
                    <h2 class="modal-title">${modal.title}</h2>
                </div>
                <div class="modal-body">
                    ${modal.content}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-ghost" onclick="closeModal(false)">
                        ${modal.cancelText}
                    </button>
                    <button class="btn btn-primary" onclick="closeModal(true)">
                        ${modal.confirmText}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = modalHTML;
    
    const overlay = document.getElementById('currentModal');
    overlay.style.display = 'flex';
    
    // Store callbacks
    window.currentModalCallbacks = {
        onConfirm: modal.onConfirm,
        onCancel: modal.onCancel
    };
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeModal(false);
        }
    });
}

function closeModal(confirmed) {
    const callbacks = window.currentModalCallbacks;
    
    if (confirmed && callbacks.onConfirm) {
        const result = callbacks.onConfirm();
        if (result === false) return; // Don't close if callback returns false
    } else if (!confirmed && callbacks.onCancel) {
        callbacks.onCancel();
    }
    
    const modal = document.getElementById('currentModal');
    if (modal) {
        modal.style.display = 'none';
        modal.remove();
    }
    
    window.currentModalCallbacks = null;
}

// Confirm dialog
function confirmDialog(message, onConfirm) {
    const modal = createModal({
        title: '⚠️ Confirm Action',
        content: `<p style="font-size: 1rem; line-height: 1.6;">${escapeHtml(message)}</p>`,
        confirmText: 'Yes, Continue',
        cancelText: 'Cancel',
        onConfirm
    });
    
    showModal(modal);
}

// File handling
async function handleImageUpload(file) {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            reject(new Error('File must be an image'));
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Export to PDF
async function exportToPDF() {
    showToast('PDF export is coming soon! 📄', 'info');
    // TODO: Implement PDF export using jsPDF or similar library
}

// Color utilities
function getColorForPriority(priority) {
    const priorities = CONFIG.GOAL_PRIORITIES;
    const found = priorities.find(p => p.value === priority);
    return found ? found.color : '#8b7fb8';
}

// Toggle sidebar (mobile)
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
    
    // Add overlay if needed
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.onclick = toggleSidebar;
        document.body.appendChild(overlay);
    }
    
    overlay.classList.toggle('active');
}

// Settings
function showSettings() {
    const modal = createModal({
        title: '⚙️ Settings',
        content: `
            <div class="settings-section">
                <h3><i class="fas fa-palette"></i> Theme</h3>
                <p style="color: var(--text-muted); margin-top: 0.5rem;">
                    Currently using Dark Theme (default)
                </p>
            </div>
            
            <div class="settings-section" style="margin-top: 1.5rem;">
                <h3><i class="fas fa-cloud"></i> Google Sheets Integration</h3>
                <p style="color: var(--text-muted); margin-top: 0.5rem;">
                    Configure in the Google Sheets scripts folder
                </p>
                <button class="btn btn-ghost mt-2" onclick="syncWithSheets()">
                    <i class="fas fa-sync"></i> Sync Now
                </button>
            </div>
            
            <div class="settings-section" style="margin-top: 1.5rem;">
                <h3><i class="fas fa-database"></i> Data</h3>
                <div style="display: flex; gap: 0.75rem; margin-top: 0.75rem; flex-wrap: wrap;">
                    <button class="btn btn-ghost" onclick="exportData()">
                        <i class="fas fa-download"></i> Export Data
                    </button>
                    <button class="btn btn-ghost" onclick="importData()">
                        <i class="fas fa-upload"></i> Import Data
                    </button>
                </div>
            </div>
        `,
        confirmText: 'Close',
        onConfirm: () => true
    });
    
    showModal(modal);
}

// Data export
function exportData() {
    const data = {
        habits: storage.get(CONFIG.STORAGE_KEYS.HABITS) || [],
        goals: storage.get(CONFIG.STORAGE_KEYS.GOALS) || [],
        planner: storage.get(CONFIG.STORAGE_KEYS.PLANNER) || {},
        reflections: storage.get(CONFIG.STORAGE_KEYS.REFLECTIONS) || {},
        visionBoard: storage.get(CONFIG.STORAGE_KEYS.VISION_BOARD) || {}
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lifeplanner-backup-${dateUtils.getDateString(new Date())}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showToast('Data exported successfully! 📦', 'success');
}

// Data import
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.habits) storage.set(CONFIG.STORAGE_KEYS.HABITS, data.habits);
                if (data.goals) storage.set(CONFIG.STORAGE_KEYS.GOALS, data.goals);
                if (data.planner) storage.set(CONFIG.STORAGE_KEYS.PLANNER, data.planner);
                if (data.reflections) storage.set(CONFIG.STORAGE_KEYS.REFLECTIONS, data.reflections);
                if (data.visionBoard) storage.set(CONFIG.STORAGE_KEYS.VISION_BOARD, data.visionBoard);
                
                showToast('Data imported successfully! 🎉', 'success');
                
                // Reload the app
                setTimeout(() => window.location.reload(), 1000);
            } catch (error) {
                showToast('Error importing data: Invalid file format', 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Sync with Google Sheets
async function syncWithSheets() {
    showToast('Syncing with Google Sheets...', 'info');
    
    try {
        // This will be implemented in sheets.js
        if (typeof sheetsManager !== 'undefined') {
            await sheetsManager.syncAll();
            showToast('Sync completed successfully! ✅', 'success');
        } else {
            showToast('Google Sheets not configured yet', 'info');
        }
    } catch (error) {
        showToast('Sync failed: ' + error.message, 'error');
    }
}

// Array utilities
function groupBy(array, key) {
    return array.reduce((result, item) => {
        const group = item[key];
        if (!result[group]) {
            result[group] = [];
        }
        result[group].push(item);
        return result;
    }, {});
}

function sortBy(array, key, order = 'asc') {
    return array.sort((a, b) => {
        if (order === 'asc') {
            return a[key] > b[key] ? 1 : -1;
        } else {
            return a[key] < b[key] ? 1 : -1;
        }
    });
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
