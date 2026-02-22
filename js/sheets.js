// Google Sheets Integration

class SheetsManager {
    constructor() {
        this.spreadsheetId = CONFIG.SHEETS.SPREADSHEET_ID;
        this.apiKey = CONFIG.SHEETS.API_KEY;
        this.lastSync = null;
    }
    
    async syncAll() {
        if (!this.spreadsheetId || !this.apiKey) {
            throw new Error('Google Sheets not configured. Please set up in Google Sheets Scripts folder.');
        }
        
        try {
            await this.syncHabits();
            await this.syncGoals();
            await this.syncPlanner();
            
            this.lastSync = new Date().toISOString();
            storage.set(CONFIG.STORAGE_KEYS.LAST_SYNC, this.lastSync);
            
            this.updateSyncStatus();
        } catch (error) {
            console.error('Sync error:', error);
            throw error;
        }
    }
    
    async syncHabits() {
        // Sync habits data with Google Sheets
        const habits = storage.get(CONFIG.STORAGE_KEYS.HABITS) || [];
        // TODO: Implement actual Google Sheets API calls
        console.log('Syncing habits:', habits.length, 'items');
    }
    
    async syncGoals() {
        // Sync goals data with Google Sheets
        const goals = storage.get(CONFIG.STORAGE_KEYS.GOALS) || [];
        // TODO: Implement actual Google Sheets API calls
        console.log('Syncing goals:', goals.length, 'items');
    }
    
    async syncPlanner() {
        // Sync planner data with Google Sheets
        const planner = storage.get(CONFIG.STORAGE_KEYS.PLANNER) || {};
        // TODO: Implement actual Google Sheets API calls
        console.log('Syncing planner data');
    }
    
    updateSyncStatus() {
        const statusEl = document.getElementById('syncStatus');
        if (statusEl && this.lastSync) {
            const date = new Date(this.lastSync);
            statusEl.innerHTML = `
                <i class="fas fa-cloud-check"></i>
                <span>Synced ${dateUtils.formatDate(date)}</span>
            `;
        }
    }
}

const sheetsManager = new SheetsManager();
