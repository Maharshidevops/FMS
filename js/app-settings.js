// Application-wide settings management
const AppSettings = {
    // Default settings
    defaults: {
        theme: 'default',
        defaultView: 'list',
        itemsPerPage: 25,
        notifications: {
            fileUploads: true,
            fileShared: true,
            comments: false,
            securityAlerts: true
        },
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12',
        maxFileSize: 50,
        versionControl: true,
        maxVersions: 10,
        versionRetention: 90,
        autoLock: true,
        lockAfterInactivity: 60,
        autoArchive: true,
        archiveAfterInactivity: 365,
        defaultAccessLevel: 'private',
        minPasswordLength: 10,
        passwordRequirements: {
            uppercase: true,
            lowercase: true,
            numbers: true,
            special: true
        },
        passwordExpiration: 90,
        require2FA: true,
        twoFAMethod: 'app',
        sessionTimeout: 30,
        maxConcurrentSessions: 2,
        forceLogoutOnPasswordChange: true
    },
    
    // Initialize settings
    init() {
        // Load settings from localStorage
        this.loadSettings();
        
        // Apply theme and other immediate settings
        this.applySettings();
        
        // Add event listeners for settings changes
        document.addEventListener('settings:updated', () => {
            this.applySettings();
        });
    },
    
    // Load settings from localStorage
    loadSettings() {
        try {
            const savedSettings = JSON.parse(localStorage.getItem('appSettings'));
            if (savedSettings) {
                this.settings = this.mergeSettings(this.defaults, savedSettings);
            } else {
                this.settings = {...this.defaults};
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            this.settings = {...this.defaults};
        }
        return this.settings;
    },
    
    // Save settings to localStorage
    saveSettings(settings = this.settings) {
        try {
            localStorage.setItem('appSettings', JSON.stringify(settings));
            this.settings = settings;
            
            // Dispatch event to notify of settings change
            document.dispatchEvent(new CustomEvent('settings:updated'));
            
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    },
    
    // Merge default settings with saved settings
    mergeSettings(defaults, saved) {
        // Deep merge object properties
        const merged = {...defaults};
        
        for (const key in saved) {
            if (typeof saved[key] === 'object' && !Array.isArray(saved[key]) && saved[key] !== null) {
                merged[key] = this.mergeSettings(defaults[key] || {}, saved[key]);
            } else {
                merged[key] = saved[key];
            }
        }
        
        return merged;
    },
    
    // Apply current settings to the application
    applySettings() {
        // Apply theme
        this.applyTheme(this.settings.theme);
        
        // Apply other settings as needed
        // (These would be implemented based on specific requirements)
    },
    
    // Apply theme to the document
    applyTheme(theme = this.settings.theme) {
        // Remove any existing theme
        document.documentElement.removeAttribute('data-theme');
        
        // Add the selected theme
        if (theme !== 'default') {
            document.documentElement.setAttribute('data-theme', theme);
        }
        
        // Update theme in settings
        this.settings.theme = theme;
    },
    
    // Get a specific setting
    getSetting(path) {
        try {
            return path.split('.').reduce((obj, key) => obj[key], this.settings);
        } catch (error) {
            console.error(`Error getting setting at path: ${path}`, error);
            return null;
        }
    },
    
    // Update a specific setting
    updateSetting(path, value) {
        try {
            const parts = path.split('.');
            const lastKey = parts.pop();
            const object = parts.reduce((obj, key) => obj[key], this.settings);
            object[lastKey] = value;
            
            // Save the updated settings
            this.saveSettings();
            
            return true;
        } catch (error) {
            console.error(`Error updating setting at path: ${path}`, error);
            return false;
        }
    }
};

// Initialize settings when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    AppSettings.init();
});

// Make AppSettings available globally
window.AppSettings = AppSettings;
