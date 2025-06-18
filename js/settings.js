// Settings Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const settingsTabBtns = document.querySelectorAll('.settings-tab-btn');
    const settingsSections = document.querySelectorAll('.settings-section');

    settingsTabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all tabs
            settingsTabBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all sections
            settingsSections.forEach(section => section.classList.remove('active'));
            
            // Show the corresponding section
            const tabName = this.getAttribute('data-tab');
            document.getElementById(`${tabName}Section`).classList.add('active');
        });
    });

    // Theme selection
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all options
            themeOptions.forEach(o => o.classList.remove('active'));
            // Add active class to clicked option
            this.classList.add('active');
            
            // Apply the theme using AppSettings
            const theme = this.getAttribute('data-theme');
            AppSettings.applyTheme(theme);
            AppSettings.updateSetting('theme', theme);
            showToast(`${theme.charAt(0).toUpperCase() + theme.slice(1)} theme applied`, 'success');
        });
    });

    // View preferences
    const viewRadios = document.querySelectorAll('input[name="defaultView"]');
    viewRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                AppSettings.updateSetting('defaultView', this.value);
            }
        });
    });

    const itemsPerPageSelect = document.querySelector('select.setting-select:first-of-type');
    if (itemsPerPageSelect) {
        itemsPerPageSelect.addEventListener('change', function() {
            AppSettings.updateSetting('itemsPerPage', parseInt(this.value));
        });
    }

    // Notification preferences
    const notificationCheckboxes = document.querySelectorAll('#userPreferencesSection .setting-checkbox input[type="checkbox"]');
    notificationCheckboxes.forEach((checkbox, index) => {
        checkbox.addEventListener('change', function() {
            const notificationTypes = ['fileUploads', 'fileShared', 'comments', 'securityAlerts'];
            if (index < notificationTypes.length) {
                AppSettings.updateSetting(`notifications.${notificationTypes[index]}`, this.checked);
            }
        });
    });

    // Language settings
    const languageSelect = document.querySelector('#userPreferencesSection .setting-group:nth-of-type(4) .setting-select:nth-of-type(1)');
    if (languageSelect) {
        languageSelect.addEventListener('change', function() {
            AppSettings.updateSetting('language', this.value);
        });
    }

    const dateFormatSelect = document.querySelector('#userPreferencesSection .setting-group:nth-of-type(4) .setting-select:nth-of-type(2)');
    if (dateFormatSelect) {
        dateFormatSelect.addEventListener('change', function() {
            AppSettings.updateSetting('dateFormat', this.value);
        });
    }

    const timeFormatSelect = document.querySelector('#userPreferencesSection .setting-group:nth-of-type(4) .setting-select:nth-of-type(3)');
    if (timeFormatSelect) {
        timeFormatSelect.addEventListener('change', function() {
            AppSettings.updateSetting('timeFormat', this.value);
        });
    }

    // System Configuration Settings
    const maxFileSizeSelect = document.querySelector('#systemConfigSection .setting-select:first-of-type');
    if (maxFileSizeSelect) {
        maxFileSizeSelect.addEventListener('change', function() {
            AppSettings.updateSetting('maxFileSize', parseInt(this.value));
        });
    }

    // Version Control Toggle
    const versionControlToggle = document.querySelector('#systemConfigSection .setting-toggle:first-of-type input');
    if (versionControlToggle) {
        versionControlToggle.addEventListener('change', function() {
            AppSettings.updateSetting('versionControl', this.checked);
        });
    }

    // Maximum Versions Select
    const maxVersionsSelect = document.querySelector('#systemConfigSection .setting-select:nth-of-type(2)');
    if (maxVersionsSelect) {
        maxVersionsSelect.addEventListener('change', function() {
            AppSettings.updateSetting('maxVersions', parseInt(this.value));
        });
    }

    // Version Retention Select
    const versionRetentionSelect = document.querySelector('#systemConfigSection .setting-select:nth-of-type(3)');
    if (versionRetentionSelect) {
        versionRetentionSelect.addEventListener('change', function() {
            AppSettings.updateSetting('versionRetention', parseInt(this.value));
        });
    }

    // Auto-Lock Toggle
    const autoLockToggle = document.querySelector('#systemConfigSection .setting-card:nth-of-type(3) .setting-toggle:first-of-type input');
    if (autoLockToggle) {
        autoLockToggle.addEventListener('change', function() {
            AppSettings.updateSetting('autoLock', this.checked);
        });
    }

    // Lock After Inactivity Select
    const lockAfterSelect = document.querySelector('#systemConfigSection .setting-card:nth-of-type(3) .setting-select:first-of-type');
    if (lockAfterSelect) {
        lockAfterSelect.addEventListener('change', function() {
            AppSettings.updateSetting('lockAfterInactivity', parseInt(this.value));
        });
    }

    // Auto-Archive Toggle
    const autoArchiveToggle = document.querySelector('#systemConfigSection .setting-card:nth-of-type(3) .setting-toggle:nth-of-type(2) input');
    if (autoArchiveToggle) {
        autoArchiveToggle.addEventListener('change', function() {
            AppSettings.updateSetting('autoArchive', this.checked);
        });
    }

    // Archive After Inactivity Select
    const archiveAfterSelect = document.querySelector('#systemConfigSection .setting-card:nth-of-type(3) .setting-select:nth-of-type(2)');
    if (archiveAfterSelect) {
        archiveAfterSelect.addEventListener('change', function() {
            AppSettings.updateSetting('archiveAfterInactivity', parseInt(this.value));
        });
    }

    // Default Access Level Select
    const defaultAccessSelect = document.querySelector('#systemConfigSection .setting-card:nth-of-type(4) .setting-select');
    if (defaultAccessSelect) {
        defaultAccessSelect.addEventListener('change', function() {
            AppSettings.updateSetting('defaultAccessLevel', this.value);
        });
    }

    // Security Settings
    // Password Length
    const passwordLengthSelect = document.querySelector('#securitySection .setting-select:first-of-type');
    if (passwordLengthSelect) {
        passwordLengthSelect.addEventListener('change', function() {
            AppSettings.updateSetting('minPasswordLength', parseInt(this.value));
        });
    }

    // Password Requirements Checkboxes
    const passwordReqCheckboxes = document.querySelectorAll('#securitySection .setting-card:first-of-type .setting-checkbox input');
    const passwordReqOptions = ['uppercase', 'lowercase', 'numbers', 'special'];
    passwordReqCheckboxes.forEach((checkbox, index) => {
        if (index < passwordReqOptions.length) {
            checkbox.addEventListener('change', function() {
                AppSettings.updateSetting(`passwordRequirements.${passwordReqOptions[index]}`, this.checked);
            });
        }
    });

    // Password Expiration
    const passwordExpirationSelect = document.querySelector('#securitySection .setting-card:first-of-type .setting-select:nth-of-type(2)');
    if (passwordExpirationSelect) {
        passwordExpirationSelect.addEventListener('change', function() {
            AppSettings.updateSetting('passwordExpiration', this.value === 'never' ? null : parseInt(this.value));
        });
    }

    // 2FA Toggle
    const require2FAToggle = document.querySelector('#securitySection .setting-card:nth-of-type(2) .setting-toggle input');
    if (require2FAToggle) {
        require2FAToggle.addEventListener('change', function() {
            AppSettings.updateSetting('require2FA', this.checked);
        });
    }

    // 2FA Method
    const twoFAMethodSelect = document.querySelector('#securitySection .setting-card:nth-of-type(2) .setting-select');
    if (twoFAMethodSelect) {
        twoFAMethodSelect.addEventListener('change', function() {
            AppSettings.updateSetting('twoFAMethod', this.value);
        });
    }

    // Session Timeout
    const sessionTimeoutSelect = document.querySelector('#securitySection .setting-card:nth-of-type(3) .setting-select:first-of-type');
    if (sessionTimeoutSelect) {
        sessionTimeoutSelect.addEventListener('change', function() {
            AppSettings.updateSetting('sessionTimeout', parseInt(this.value));
        });
    }

    // Max Concurrent Sessions
    const maxSessionsSelect = document.querySelector('#securitySection .setting-card:nth-of-type(3) .setting-select:nth-of-type(2)');
    if (maxSessionsSelect) {
        maxSessionsSelect.addEventListener('change', function() {
            AppSettings.updateSetting('maxConcurrentSessions', this.value === 'unlimited' ? null : parseInt(this.value));
        });
    }

    // Force Logout on Password Change
    const forceLogoutToggle = document.querySelector('#securitySection .setting-card:nth-of-type(3) .setting-toggle input');
    if (forceLogoutToggle) {
        forceLogoutToggle.addEventListener('change', function() {
            AppSettings.updateSetting('forceLogoutOnPasswordChange', this.checked);
        });
    }

    // Save all settings button
    const saveButton = document.querySelector('.btn-save-settings');
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            AppSettings.saveSettings();
            showToast('All settings saved successfully', 'success');
        });
    }

    // Load saved settings into UI
    loadSettingsIntoUI();
});

// Save all settings
function saveSettings() {
    // Get all settings values
    const settings = {
        userPreferences: {
            theme: document.querySelector('.theme-option.active')?.getAttribute('data-theme') || 'default',
            defaultView: document.querySelector('input[name="defaultView"]:checked')?.value || 'list',
            itemsPerPage: document.querySelector('.setting-select')?.value || '25',
            notifications: {
                fileUploads: document.querySelector('.setting-checkbox:nth-child(1) input').checked,
                fileShared: document.querySelector('.setting-checkbox:nth-child(2) input').checked,
                comments: document.querySelector('.setting-checkbox:nth-child(3) input').checked,
                securityAlerts: document.querySelector('.setting-checkbox:nth-child(4) input').checked
            },
            language: document.querySelector('#userPreferencesSection .setting-select:nth-child(1)')?.value || 'en',
            dateFormat: document.querySelector('#userPreferencesSection .setting-select:nth-child(2)')?.value || 'MM/DD/YYYY',
            timeFormat: document.querySelector('#userPreferencesSection .setting-select:nth-child(3)')?.value || '12'
        },
        systemConfig: {
            maxFileSize: document.querySelector('#systemConfigSection .setting-select:nth-child(1)')?.value || '50',
            versionControl: document.querySelector('#systemConfigSection .setting-toggle input')?.checked || true,
            maxVersions: document.querySelector('#systemConfigSection .setting-select:nth-child(2)')?.value || '10',
            versionRetention: document.querySelector('#systemConfigSection .setting-select:nth-child(3)')?.value || '90',
            autoLock: document.querySelector('#systemConfigSection .setting-toggle:nth-child(1) input')?.checked || true,
            lockAfterInactivity: document.querySelector('#systemConfigSection .setting-select:nth-child(4)')?.value || '60',
            autoArchive: document.querySelector('#systemConfigSection .setting-toggle:nth-child(2) input')?.checked || true,
            archiveAfterInactivity: document.querySelector('#systemConfigSection .setting-select:nth-child(5)')?.value || '365',
            defaultAccessLevel: document.querySelector('#systemConfigSection .setting-select:nth-child(6)')?.value || 'private'
        },
        security: {
            minPasswordLength: document.querySelector('#securitySection .setting-select:nth-child(1)')?.value || '10',
            passwordRequirements: {
                uppercase: document.querySelector('#securitySection .setting-checkbox:nth-child(1) input')?.checked || true,
                lowercase: document.querySelector('#securitySection .setting-checkbox:nth-child(2) input')?.checked || true,
                numbers: document.querySelector('#securitySection .setting-checkbox:nth-child(3) input')?.checked || true,
                special: document.querySelector('#securitySection .setting-checkbox:nth-child(4) input')?.checked || true
            },
            passwordExpiration: document.querySelector('#securitySection .setting-select:nth-child(2)')?.value || '90',
            require2FA: document.querySelector('#securitySection .setting-toggle:nth-child(1) input')?.checked || true,
            twoFAMethod: document.querySelector('#securitySection .setting-select:nth-child(3)')?.value || 'app',
            sessionTimeout: document.querySelector('#securitySection .setting-select:nth-child(4)')?.value || '30',
            maxConcurrentSessions: document.querySelector('#securitySection .setting-select:nth-child(5)')?.value || '2',
            forceLogoutOnPasswordChange: document.querySelector('#securitySection .setting-toggle:nth-child(2) input')?.checked || true
        }
    };

    // Save to localStorage (in a real app, this would be sent to a server)
    localStorage.setItem('appSettings', JSON.stringify(settings));
    
    // Show success message
    showToast('Settings saved successfully!', 'success');
}

// Load saved settings into UI elements
function loadSettingsIntoUI() {
    const settings = AppSettings.loadSettings();
    
    // Set the active theme
    const activeTheme = settings.theme || 'default';
    document.querySelectorAll('.theme-option').forEach(option => {
        if (option.getAttribute('data-theme') === activeTheme) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
    
    // Set view preferences
    const viewRadios = document.querySelectorAll('input[name="defaultView"]');
    viewRadios.forEach(radio => {
        if (radio.value === settings.defaultView) {
            radio.checked = true;
        }
    });
    
    // Set items per page
    const itemsPerPageSelect = document.querySelector('select.setting-select:first-of-type');
    if (itemsPerPageSelect) {
        itemsPerPageSelect.value = settings.itemsPerPage;
    }
    
    // Set notification checkboxes
    const notificationCheckboxes = document.querySelectorAll('#userPreferencesSection .setting-checkbox input[type="checkbox"]');
    const notificationTypes = ['fileUploads', 'fileShared', 'comments', 'securityAlerts'];
    notificationCheckboxes.forEach((checkbox, index) => {
        if (index < notificationTypes.length) {
            checkbox.checked = settings.notifications[notificationTypes[index]];
        }
    });
    
    // Set language preferences
    const languageSelect = document.querySelector('#userPreferencesSection .setting-group:nth-of-type(4) .setting-select:nth-of-type(1)');
    if (languageSelect) {
        languageSelect.value = settings.language;
    }
    
    const dateFormatSelect = document.querySelector('#userPreferencesSection .setting-group:nth-of-type(4) .setting-select:nth-of-type(2)');
    if (dateFormatSelect) {
        dateFormatSelect.value = settings.dateFormat;
    }
    
    const timeFormatSelect = document.querySelector('#userPreferencesSection .setting-group:nth-of-type(4) .setting-select:nth-of-type(3)');
    if (timeFormatSelect) {
        timeFormatSelect.value = settings.timeFormat;
    }
    
    // System Configuration Settings
    const maxFileSizeSelect = document.querySelector('#systemConfigSection .setting-select:first-of-type');
    if (maxFileSizeSelect) {
        maxFileSizeSelect.value = settings.maxFileSize;
    }
    
    // Version Control Toggle
    const versionControlToggle = document.querySelector('#systemConfigSection .setting-toggle:first-of-type input');
    if (versionControlToggle) {
        versionControlToggle.checked = settings.versionControl;
    }
    
    // Maximum Versions Select
    const maxVersionsSelect = document.querySelector('#systemConfigSection .setting-select:nth-of-type(2)');
    if (maxVersionsSelect) {
        maxVersionsSelect.value = settings.maxVersions;
    }
    
    // Other settings...
    console.log('Settings loaded into UI');
}

// Show toast notification
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <i class="fas fa-times toast-close"></i>
    `;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Add close functionality
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        toast.classList.add('toast-hiding');
        setTimeout(() => {
            toast.remove();
        }, 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add('toast-hiding');
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, 300);
        }
    }, 5000);
    
    // Show toast with animation
    setTimeout(() => {
        toast.classList.add('toast-visible');
    }, 10);
}
