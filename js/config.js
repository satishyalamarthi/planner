// Configuration for the Life Planner Application

const CONFIG = {
    // App Info
    APP_NAME: 'Life Planner',
    VERSION: '1.0.0',
    
    // Default Passwords (should be changed by users)
    DEFAULT_PASSWORDS: {
        'Satish': 'satish123',
        'Keerthi': 'keerthi123',
        'Geetanath': 'keerthi123' // Managed by mom
    },
    
    // User Colors for Avatars
    USER_COLORS: {
        'Satish': 'linear-gradient(135deg, #4da3ff 0%, #9b6dff 100%)',
        'Keerthi': 'linear-gradient(135deg, #ff6bc5 0%, #9b6dff 100%)',
        'Geetanath': 'linear-gradient(135deg, #ffd93d 0%, #ff9a5a 100%)'
    },
    
    // Google Sheets Configuration
    SHEETS: {
        SPREADSHEET_ID: '', // Will be set up by user
        API_KEY: '', // Will be set up by user
        SHEETS: {
            HABITS: 'Habits',
            GOALS: 'Goals',
            PLANNER: 'Planner',
            REFLECTIONS: 'Reflections',
            VISION_BOARD: 'VisionBoard'
        }
    },
    
    // Storage Keys
    STORAGE_KEYS: {
        CURRENT_USER: 'lifeplanner_current_user',
        PASSWORDS: 'lifeplanner_passwords',
        HABITS: 'lifeplanner_habits',
        GOALS: 'lifeplanner_goals',
        PLANNER: 'lifeplanner_planner',
        REFLECTIONS: 'lifeplanner_reflections',
        VISION_BOARD: 'lifeplanner_vision_board',
        LAST_SYNC: 'lifeplanner_last_sync'
    },
    
    // Date Configuration
    YEARS_RANGE: {
        START: 2020,
        END: 2050
    },
    
    MONTHS: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ],
    
    DAYS_OF_WEEK: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    
    // Habit Frequencies
    HABIT_FREQUENCIES: [
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'custom', label: 'Custom' }
    ],
    
    // Goal Categories
    GOAL_CATEGORIES: [
        'Health & Fitness',
        'Career & Finance',
        'Personal Growth',
        'Relationships',
        'Education',
        'Hobbies',
        'Travel',
        'Home & Living',
        'Spiritual',
        'Other'
    ],
    
    // Goal Priorities
    GOAL_PRIORITIES: [
        { value: 'I_U', label: 'Important & Urgent', color: '#ff6bc5' },
        { value: 'I_NU', label: 'Important, Not Urgent', color: '#9b6dff' },
        { value: 'NI_U', label: 'Not Important, Urgent', color: '#ffd93d' },
        { value: 'NI_NU', label: 'Not Important, Not Urgent', color: '#8b7fb8' }
    ],
    
    // Emojis and Stickers for Journaling
    JOURNAL_EMOJIS: [
        '😊', '😄', '🥰', '😍', '🤗', '😌', '🙏', '✨',
        '💖', '💕', '💫', '🌟', '⭐', '🎉', '🎊', '🎈',
        '🌸', '🌺', '🌻', '🌼', '🌷', '🌹', '💐', '🌈',
        '☀️', '🌙', '⛅', '🌤️', '☁️', '💧', '❄️', '🔥',
        '📚', '📖', '✍️', '📝', '💡', '🎯', '🏆', '🎨',
        '🎵', '🎶', '☕', '🍕', '🍰', '🎂', '🏋️', '🧘'
    ],
    
    // Doodle Icons for decorative purposes
    DOODLES: [
        'fa-heart', 'fa-star', 'fa-circle', 'fa-square',
        'fa-sun', 'fa-moon', 'fa-cloud', 'fa-rainbow',
        'fa-leaf', 'fa-seedling', 'fa-tree', 'fa-flower',
        'fa-butterfly', 'fa-bird', 'fa-paw', 'fa-fish'
    ]
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
