// Authentication Module

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }
    
    init() {
        // Initialize passwords if not exists
        const passwords = storage.get(CONFIG.STORAGE_KEYS.PASSWORDS);
        if (!passwords) {
            storage.set(CONFIG.STORAGE_KEYS.PASSWORDS, CONFIG.DEFAULT_PASSWORDS);
        }
        
        // Check if user is already logged in
        const savedUser = storage.get(CONFIG.STORAGE_KEYS.CURRENT_USER);
        if (savedUser) {
            this.currentUser = savedUser;
            this.showApp();
        }
    }
    
    login(username, password) {
        const passwords = storage.get(CONFIG.STORAGE_KEYS.PASSWORDS);
        
        if (passwords[username] === password) {
            this.currentUser = username;
            storage.set(CONFIG.STORAGE_KEYS.CURRENT_USER, username);
            this.showApp();
            showToast('Welcome back, ' + username + '! ✨', 'success');
            return true;
        } else {
            showToast('Invalid username or password', 'error');
            return false;
        }
    }
    
    logout() {
        this.currentUser = null;
        storage.remove(CONFIG.STORAGE_KEYS.CURRENT_USER);
        this.showLogin();
        showToast('Logged out successfully', 'info');
    }
    
    changePassword(username, oldPassword, newPassword) {
        const passwords = storage.get(CONFIG.STORAGE_KEYS.PASSWORDS);
        
        if (passwords[username] === oldPassword) {
            passwords[username] = newPassword;
            storage.set(CONFIG.STORAGE_KEYS.PASSWORDS, passwords);
            showToast('Password changed successfully! 🎉', 'success');
            return true;
        } else {
            showToast('Current password is incorrect', 'error');
            return false;
        }
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
    
    getUserColor() {
        return CONFIG.USER_COLORS[this.currentUser] || CONFIG.USER_COLORS['Satish'];
    }
    
    getUserInitial() {
        return this.currentUser ? this.currentUser.charAt(0).toUpperCase() : 'U';
    }
    
    showLogin() {
        document.getElementById('loginScreen').classList.add('active');
        document.getElementById('mainApp').classList.remove('active');
    }
    
    showApp() {
        document.getElementById('loginScreen').classList.remove('active');
        document.getElementById('mainApp').classList.add('active');
        
        // Update user info in sidebar
        document.getElementById('userName').textContent = this.currentUser;
        document.getElementById('userAvatar').textContent = this.getUserInitial();
        document.getElementById('userAvatar').style.background = this.getUserColor();
        
        // Load app data
        if (typeof app !== 'undefined' && app.loadData) {
            app.loadData();
        }
    }
}

// Initialize auth manager
const auth = new AuthManager();

// Login form handler
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            auth.login(username, password);
        });
    }
});

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.toggle-password i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.classList.remove('fa-eye');
        toggleBtn.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleBtn.classList.remove('fa-eye-slash');
        toggleBtn.classList.add('fa-eye');
    }
}

// Show change password modal
function showChangePassword() {
    const modal = createModal({
        title: '🔑 Change Password',
        content: `
            <div class="form-group">
                <label for="cpUser">
                    <i class="fas fa-user"></i> User
                </label>
                <select id="cpUser" required>
                    <option value="">Select User</option>
                    <option value="Satish">Satish</option>
                    <option value="Keerthi">Keerthi</option>
                    <option value="Geetanath">Geetanath (Mom's Account)</option>
                </select>
            </div>
            <div class="form-group">
                <label for="cpOldPassword">
                    <i class="fas fa-lock"></i> Current Password
                </label>
                <input type="password" id="cpOldPassword" placeholder="Enter current password" required>
            </div>
            <div class="form-group">
                <label for="cpNewPassword">
                    <i class="fas fa-key"></i> New Password
                </label>
                <input type="password" id="cpNewPassword" placeholder="Enter new password" required>
            </div>
            <div class="form-group">
                <label for="cpConfirmPassword">
                    <i class="fas fa-check-circle"></i> Confirm Password
                </label>
                <input type="password" id="cpConfirmPassword" placeholder="Confirm new password" required>
            </div>
        `,
        onConfirm: () => {
            const user = document.getElementById('cpUser').value;
            const oldPassword = document.getElementById('cpOldPassword').value;
            const newPassword = document.getElementById('cpNewPassword').value;
            const confirmPassword = document.getElementById('cpConfirmPassword').value;
            
            if (!user) {
                showToast('Please select a user', 'error');
                return false;
            }
            
            if (newPassword !== confirmPassword) {
                showToast('New passwords do not match', 'error');
                return false;
            }
            
            if (newPassword.length < 6) {
                showToast('Password must be at least 6 characters long', 'error');
                return false;
            }
            
            return auth.changePassword(user, oldPassword, newPassword);
        }
    });
    
    showModal(modal);
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        auth.logout();
    }
}
