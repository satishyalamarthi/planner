// Main Application Controller

class LifePlannerApp {
    constructor() {
        this.currentView = 'planner';
        this.currentYear = new Date().getFullYear();
        this.currentMonth = new Date().getMonth();
        
        this.init();
    }
    
    init() {
        // Initialize navigation
        this.setupNavigation();
        
        // Update page date
        this.updatePageDate();
        
        // Initialize modules
        if (typeof habitsManager !== 'undefined') {
            habitsManager.init();
        }
        
        if (typeof goalsManager !== 'undefined') {
            goalsManager.init();
        }
        
        if (typeof plannerManager !== 'undefined') {
            plannerManager.init();
        }
        
        if (typeof visionBoardManager !== 'undefined') {
            visionBoardManager.init();
        }
        
        if (typeof reflectionsManager !== 'undefined') {
            reflectionsManager.init();
        }
    }
    
    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                this.switchView(view);
                
                // Update active state
                navButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Close sidebar on mobile
                if (window.innerWidth <= 1024) {
                    toggleSidebar();
                }
            });
        });
    }
    
    switchView(viewName) {
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        
        // Show selected view
        const view = document.getElementById(`view-${viewName}`);
        if (view) {
            view.classList.add('active');
        }
        
        // Update page title
        const titles = {
            'planner': '📅 Planner',
            'habits': '✅ Habit Tracker',
            'goals': '🎯 Goal Manager',
            'vision-board': '✨ Vision Board',
            'reflections': '📖 Reflections'
        };
        
        document.getElementById('pageTitle').textContent = titles[viewName] || 'Planner';
        
        this.currentView = viewName;
        
        // Load view data
        this.loadViewData(viewName);
    }
    
    loadViewData(viewName) {
        switch (viewName) {
            case 'planner':
                if (typeof plannerManager !== 'undefined') {
                    plannerManager.render();
                }
                break;
            case 'habits':
                if (typeof habitsManager !== 'undefined') {
                    habitsManager.render();
                }
                break;
            case 'goals':
                if (typeof goalsManager !== 'undefined') {
                    goalsManager.render();
                }
                break;
            case 'vision-board':
                if (typeof visionBoardManager !== 'undefined') {
                    visionBoardManager.render();
                }
                break;
            case 'reflections':
                if (typeof reflectionsManager !== 'undefined') {
                    reflectionsManager.render();
                }
                break;
        }
    }
    
    updatePageDate() {
        const dateElement = document.getElementById('pageDate');
        const now = new Date();
        dateElement.textContent = dateUtils.formatDate(now);
        
        // Update every minute
        setInterval(() => {
            const now = new Date();
            dateElement.textContent = dateUtils.formatDate(now);
        }, 60000);
    }
    
    loadData() {
        // Load all data from storage
        console.log('Loading app data...');
        
        // Trigger render for current view
        this.loadViewData(this.currentView);
    }
}

// Initialize app after DOM is loaded
let app;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize app
    app = new LifePlannerApp();
    
    console.log('✨ Life Planner initialized!');
});

// Year and month navigation for planner
function changeYear(delta) {
    app.currentYear += delta;
    document.getElementById('yearSelect').value = app.currentYear;
    loadYear();
}

function loadYear() {
    const yearSelect = document.getElementById('yearSelect');
    app.currentYear = parseInt(yearSelect.value);
    
    if (typeof plannerManager !== 'undefined') {
        plannerManager.loadYear(app.currentYear);
    }
}
