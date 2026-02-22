// Local Storage Manager

class StorageManager {
    constructor() {
        this.storage = window.localStorage;
    }
    
    // Get item from storage
    get(key) {
        try {
            const item = this.storage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error getting item from storage:', error);
            return null;
        }
    }
    
    // Set item in storage
    set(key, value) {
        try {
            this.storage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error setting item in storage:', error);
            return false;
        }
    }
    
    // Remove item from storage
    remove(key) {
        try {
            this.storage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing item from storage:', error);
            return false;
        }
    }
    
    // Clear all storage
    clear() {
        try {
            this.storage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }
    
    // Check if key exists
    has(key) {
        return this.storage.getItem(key) !== null;
    }
    
    // Get all keys
    keys() {
        return Object.keys(this.storage);
    }
}

// Initialize storage manager
const storage = new StorageManager();
