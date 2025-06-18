// Global Variables
let files = JSON.parse(localStorage.getItem('files')) || [];
let notes = JSON.parse(localStorage.getItem('notes')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let currentViewingFile = null;

// File types
const FILE_TYPE = {
    NOTING: 'noting',
    CORRESPONDING: 'corresponding'
};

// DOM Elements based on current page
document.addEventListener('DOMContentLoaded', function() {
    // Check for login status
    if (!currentUser && !window.location.href.includes('index.html')) {
        window.location.href = 'index.html';
    }

    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Upload Tab Switching
    const tabNotingBtn = document.getElementById('tabNotingBtn');
    const tabCorrespondingBtn = document.getElementById('tabCorrespondingBtn');
    const notingSideSection = document.getElementById('notingSideSection');
    const correspondingSideSection = document.getElementById('correspondingSideSection');
    
    if (tabNotingBtn && tabCorrespondingBtn) {
        tabNotingBtn.addEventListener('click', function() {
            tabNotingBtn.classList.add('active');
            tabCorrespondingBtn.classList.remove('active');
            notingSideSection.classList.remove('hidden');
            correspondingSideSection.classList.add('hidden');
        });
        
        tabCorrespondingBtn.addEventListener('click', function() {
            tabCorrespondingBtn.classList.add('active');
            tabNotingBtn.classList.remove('active');
            correspondingSideSection.classList.remove('hidden');
            notingSideSection.classList.add('hidden');
        });
    }

    // Noting Upload Form
    const notingUploadForm = document.getElementById('notingUploadForm');
    if (notingUploadForm) {
        console.log('Noting upload form found, setting up event listener');
        notingUploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Noting form submitted');
            handleFileUpload(e, FILE_TYPE.NOTING);
        });
        setupFileDropArea('noting');
        loadRecentFiles('noting');
        
        // Set current date for creation date field by default
        const notingCreationDate = document.getElementById('notingCreationDate');
        if (notingCreationDate) {
            notingCreationDate.valueAsDate = new Date();
        }
    } else {
        console.log('Noting upload form not found');
    }

    // Corresponding Upload Form
    const correspondingUploadForm = document.getElementById('correspondingUploadForm');
    if (correspondingUploadForm) {
        console.log('Corresponding upload form found, setting up event listener');
        correspondingUploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Corresponding form submitted');
            handleFileUpload(e, FILE_TYPE.CORRESPONDING);
        });
        setupFileDropArea('corresponding');
        loadRecentFiles('corresponding');
        
        // Set current date for creation date field by default
        const correspondingCreationDate = document.getElementById('correspondingCreationDate');
        if (correspondingCreationDate) {
            correspondingCreationDate.valueAsDate = new Date();
        }
    } else {
        console.log('Corresponding upload form not found');
    }

    // Dashboard
    const fileTableBody = document.getElementById('fileTableBody');
    if (fileTableBody) {
        loadDashboardStats();
        loadFileTable();
    }

    // Search functionality
    const searchFiles = document.getElementById('searchFiles');
    if (searchFiles) {
        searchFiles.addEventListener('input', function() {
            loadFileTable(this.value);
        });
    }

        // Logout functionality
    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    });

    // File Viewer Event Listeners
    const closeViewerBtn = document.getElementById('closeViewerBtn');
    const downloadFileBtn = document.getElementById('downloadFileBtn');
    
    if (closeViewerBtn) {
        closeViewerBtn.addEventListener('click', closeFileViewerModal);
    }
    
    if (downloadFileBtn) {
        downloadFileBtn.addEventListener('click', downloadCurrentFile);
    }
    
    // Define fileViewerModal
    const fileViewerModal = document.getElementById('fileViewerModal');
    
    // Close modal when clicking outside the content
    if (fileViewerModal) {
        window.addEventListener('click', (e) => {
            if (e.target === fileViewerModal) {
                closeFileViewerModal();
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && fileViewerModal.style.display === 'block') {
                closeFileViewerModal();
            }
        });
    }
});

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'admin' && password === 'admin') {
        localStorage.setItem('currentUser', JSON.stringify({ username }));
        window.location.href = 'dashboard.html';
    } else {
        alert('Login failed. Please use username: admin and password: admin');
    }
}

// Handle Registration
async function handleRegister() {
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;

    if (username && password) {
        try {
            const { authAPI } = await import('./api.js');
            await authAPI.register(username, password);
            localStorage.setItem('currentUser', JSON.stringify({ username }));
            alert('Registration successful! You can now log in.');
            showLoginForm();
            document.getElementById('username').value = username;
        } catch (error) {
            console.error('Registration failed:', error);
            alert(`Registration failed: ${error.message || 'Unknown error'}. Please check the console for more details.`);
        }
    } else {
        alert('Please enter username and password');
    }
}

// Toggle between login and register forms
function showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function showLoginForm() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

// Constants
const MAX_UPLOAD_SIZE = 1024 * 1024 * 1024 * 1024; // 1TB in bytes

// Format file size
function formatFileSize(bytes) {
    if (!bytes) return '0 Bytes';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Store file in IndexedDB
function storeFileInIndexedDB(fileId, file) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('FileManagerDB', 1);

        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('files')) {
                db.createObjectStore('files', { keyPath: 'id' });
            }
        };

        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction(['files'], 'readwrite');
            const store = transaction.objectStore('files');
            
            const fileRecord = { id: fileId, file: file };
            const putRequest = store.put(fileRecord);

            putRequest.onsuccess = function() {
                console.log('File stored in IndexedDB with ID:', fileId);
                resolve();
            };
            
            putRequest.onerror = function(error) {
                console.error('Error storing file in IndexedDB:', error);
                reject(error);
            };
        };

        request.onerror = function(error) {
            console.error('Error opening IndexedDB:', error);
            reject(error);
        };
    });
}

// Get file from IndexedDB
function getFileFromIndexedDB(fileId) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('FileManagerDB', 1);
        
        request.onsuccess = function(event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('files')) {
                return reject(new Error("Object store 'files' not found."));
            }
            const transaction = db.transaction(['files'], 'readonly');
            const store = transaction.objectStore('files');
            const getRequest = store.get(fileId);
            
            getRequest.onsuccess = function() {
                if (getRequest.result) {
                    resolve(getRequest.result.file); // Resolve with the file object itself
                } else {
                    reject(new Error(`File with ID ${fileId} not found in IndexedDB.`));
                }
            };
            
            getRequest.onerror = function(error) {
                reject(error);
            };
        };
        
        request.onerror = function(error) {
            reject(error);
        };
    });
}

 // Handle File Upload
async function handleFileUpload(e, type) {
    console.log(`Handling ${type} file upload`);
    e.preventDefault();

    const form = e.target;
    const fileInput = document.getElementById(`${type}FileInput`);
    const file = fileInput.files[0];

    if (!file) {
        showToast('Please select a file to upload', 'error');
        return;
    }

    // Check file size (max 10MB for local storage limitation)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        showToast('File is too large. Maximum size is 10MB.', 'error');
        return;
    }

    // Gather metadata from form fields
    let fileNumber, department, subject, creationDate, closingDate, classification, disposalYear, referenceNumber, source, notes;
    
    if (type === FILE_TYPE.NOTING) {
        fileNumber = document.getElementById('notingFileNumber')?.value || '';
        department = document.getElementById('notingDepartment')?.value || '';
        subject = document.getElementById('notingFileSubject')?.value || '';
        creationDate = document.getElementById('notingCreationDate')?.value || '';
        closingDate = document.getElementById('notingClosingDate')?.value || '';
        classification = document.getElementById('notingClassification')?.value || '';
        disposalYear = document.getElementById('notingDisposalYear')?.value || '';
        referenceNumber = document.getElementById('notingReferenceNumber')?.value || '';
        source = document.getElementById('notingSource')?.value || '';
        notes = document.getElementById('notingNotes')?.value || '';
    } else {
        fileNumber = document.getElementById('correspondingFileNumber')?.value || '';
        department = document.getElementById('correspondingDepartment')?.value || '';
        subject = document.getElementById('correspondingFileSubject')?.value || '';
        creationDate = document.getElementById('correspondingCreationDate')?.value || '';
        closingDate = document.getElementById('correspondingClosingDate')?.value || '';
        classification = document.getElementById('correspondingClassification')?.value || '';
        disposalYear = document.getElementById('correspondingDisposalYear')?.value || '';
        referenceNumber = document.getElementById('correspondingReferenceNumber')?.value || '';
        source = document.getElementById('correspondingSource')?.value || '';
        notes = document.getElementById('correspondingNotes')?.value || '';
    }

    // Validate required fields
    if (!fileNumber || !department || !subject || !creationDate || !classification) {
        showToast('Please fill all required fields.', 'error');
        return;
    }

    // Create file metadata
    const fileId = Date.now().toString();
    const fileMeta = {
        id: fileId,
        name: file.name,
        type: type,
        fileType: file.type,
        size: file.size,
        uploadDate: new Date().toISOString(),
        fileNumber: fileNumber,
        department: department,
        subject: subject,
        creationDate: creationDate,
        closingDate: closingDate || null,
        classification: classification,
        disposalYear: disposalYear || null,
        referenceNumber: referenceNumber || '',
        source: source || '',
        notes: notes || ''
    };

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
    }

    try {
        // Store file content in IndexedDB
        await storeFileInIndexedDB(fileId, file);
        
        // Update local files list with metadata
        const existingFiles = JSON.parse(localStorage.getItem('files') || '[]');
        existingFiles.unshift(fileMeta);
        localStorage.setItem('files', JSON.stringify(existingFiles));
        files = existingFiles; // Update global files array
        
        console.log('File uploaded locally and metadata saved:', fileMeta);
        
        // Reset form
        form.reset();
        if (fileInput) fileInput.value = '';
        
        // Show success message
        showToast('File uploaded successfully!', 'success');
        
        // Update UI
        loadRecentFiles(type);
        
        // Update dashboard if we're on that page
        if (document.getElementById('fileTableBody')) {
            loadFileTable();
            loadDashboardStats();
        }
        
        // If on upload page, redirect to dashboard after a short delay
        if (window.location.pathname.includes('upload.html')) {
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        }
        
    } catch (error) {
        console.error('Error during file upload:', error);
        showToast('Failed to upload file. Please try again.', 'error');
    } finally {
        // Reset button state
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
        
        // Update dashboard if on the page
        if (window.location.pathname.includes('dashboard.html')) {
            loadFileTable();
            loadDashboardStats();
        } else if (window.location.pathname.includes('upload.html')) {
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        }
    }
}

// Toast notification function
function showToast(message, type = 'info', duration = 3000) {
    // If duration is 0, don't auto-remove
    const autoRemove = duration > 0;
    // Check if toast container exists, if not create it
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
        
        // Add styles if not already added
        if (!document.getElementById('toastStyles')) {
            const style = document.createElement('style');
            style.id = 'toastStyles';
            style.innerHTML = `
                .toast-container {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 1000;
                }
                .toast {
                    min-width: 250px;
                    margin-top: 10px;
                    padding: 15px 20px;
                    border-radius: 4px;
                    font-weight: 500;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    display: flex;
                    align-items: center;
                    animation: slideIn 0.3s, fadeOut 0.5s 2.5s;
                    animation-fill-mode: forwards;
                    opacity: 0;
                }
                .toast.success {
                    background-color: #27ae60;
                    color: white;
                }
                .toast.error {
                    background-color: #e74c3c;
                    color: white;
                }
                .toast i {
                    margin-right: 10px;
                    font-size: 1.2rem;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fas fa-check-circle';
    if (type === 'error') {
        icon = 'fas fa-exclamation-circle';
    }
    
    toast.innerHTML = `<i class="${icon}"></i> ${message}`;
    toastContainer.appendChild(toast);
    
    // Make visible
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 10);
    
    // Auto remove toast after delay if auto-remove is enabled
    if (autoRemove) {
        setTimeout(() => {
            if (toast && toast.parentNode) {
                toast.remove();
            }
        }, duration);
    }
    
    // Return the toast element in case we need to modify it later
    return toast;
}

// File Drop Area Setup
function setupFileDropArea(type) {
    const prefix = type === 'noting' ? 'noting' : 'corresponding';
    const dropArea = document.getElementById(`${prefix}DropArea`);
    const fileInput = document.getElementById(`${prefix}FileInput`);
    const fileName = document.getElementById(`${prefix}FileName`);

    if (!dropArea || !fileInput || !fileName) return;

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    // Handle dropped files
    dropArea.addEventListener('drop', handleDrop, false);

    // Handle selected files through browse button
    fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            fileName.textContent = this.files[0].name;
        }
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight() {
        dropArea.classList.add('highlight');
    }

    function unhighlight() {
        dropArea.classList.remove('highlight');
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files && files[0]) {
            // We cannot directly set fileInput.files as it's read-only
            // Instead, we can use the DataTransfer object to trigger a change event
            const dT = new DataTransfer();
            dT.items.add(files[0]);
            fileInput.files = dT.files;
            
            // Trigger change event to ensure the file input value is updated
            const event = new Event('change', { bubbles: true });
            fileInput.dispatchEvent(event);
            
            fileName.textContent = files[0].name;
        }
    }
}

// Load Recent Files for Noting or Corresponding sides
function loadRecentFiles(type) {
    const targetType = type === 'noting' ? FILE_TYPE.NOTING : FILE_TYPE.CORRESPONDING;
    const containerId = type === 'noting' ? 'recentNotingFiles' : 'recentCorrespondingFiles';
    const container = document.getElementById(containerId);
    const loader = document.getElementById(`${type}Loader`);
    
    if (!container) return;
    
    // Hide loader after a small delay to simulate loading
    setTimeout(() => {
        if (loader) loader.style.display = 'none';
        
        // Filter files by type and sort by newest first
        const filteredFiles = files
            .filter(file => file.type === targetType)
            .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
            .slice(0, 5); // Show only the 5 most recent files
        
        // Clear container
        container.innerHTML = '';
        
        if (filteredFiles.length === 0) {
            container.innerHTML = `<div class="no-files">No ${type} files uploaded yet</div>`;
            return;
        }
        
        // Add files to container
        filteredFiles.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            const icon = type === 'noting' ? 'file-signature' : 'envelope-open-text';
            const date = new Date(file.uploadDate).toLocaleDateString();
            
            fileItem.innerHTML = `
                <i class="fas fa-${icon} file-item-icon"></i>
                <div class="file-item-details">
                    <div class="file-item-name">${file.subject}</div>
                    <div class="file-item-info">
                        <span>${file.fileNumber}</span> • 
                        <span>${date}</span> • 
                        <span>Class: ${file.classification}</span>
                    </div>
                </div>
            `;
            
            container.appendChild(fileItem);
        });
    }, 500);
}

// Close modal
function closeModal() {
    const modal = document.getElementById('fileDetailsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Notes Management
function addNote() {
    const noteText = document.getElementById('noteText').value.trim();
    
    if (!noteText) {
        alert('Please enter note text');
        return;
    }

    const newNote = {
        id: Date.now(),
        text: noteText,
        date: new Date().toISOString(),
        user: currentUser.username
    };

    notes.push(newNote);
    localStorage.setItem('notes', JSON.stringify(notes));
    
    document.getElementById('noteText').value = '';
    loadNotes();
}

function loadNotes() {
    const notesContent = document.getElementById('notesContent');
    notesContent.innerHTML = '';

    if (notes.length === 0) {
        notesContent.innerHTML = '<p class="text-center">No notes yet.</p>';
        return;
    }

    notes.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note-item';
        
        // Format date for display
        const noteDate = new Date(note.date);
        const formattedDate = `${noteDate.toLocaleDateString()} ${noteDate.toLocaleTimeString()}`;
        
        noteElement.innerHTML = `
            <div class="note-date">
                <i class="fas fa-user"></i> ${note.user} | <i class="fas fa-clock"></i> ${formattedDate}
            </div>
            <div class="note-text">${note.text}</div>
        `;
        
        notesContent.appendChild(noteElement);
    });
}

// Dashboard Functions
function loadDashboardStats() {
    // Get fresh data from localStorage
    const files = JSON.parse(localStorage.getItem('files')) || [];
    console.log('Loading dashboard stats for files:', files);
    
    const SOTfiles = files.filter(file => file.department === 'SOT').length;
    const SOSfiles = files.filter(file => file.department === 'SOS').length;
    const SOMLAfiles = files.filter(file => file.department === 'SOM&LA').length;
    const AdministrationFiles = files.filter(file => file.department === 'Administration').length;
    
    console.log('Dashboard counts - SOT:', SOTfiles, 'SOS:', SOSfiles, 'SOM&LA:', SOMLAfiles, 'Admin:', AdministrationFiles);
    
    // Update dashboard counters
    if (document.getElementById('SOT')) document.getElementById('SOT').textContent = SOTfiles;
    if (document.getElementById('SOS')) document.getElementById('SOS').textContent = SOSfiles;
    if (document.getElementById('SOMLA')) document.getElementById('SOMLA').textContent = SOMLAfiles;
    if (document.getElementById('SOM&LA')) document.getElementById('SOM&LA').textContent = SOMLAfiles;
    if (document.getElementById('Administration')) document.getElementById('Administration').textContent = AdministrationFiles;
}

// Current filter state
let currentFilter = {
    type: 'all',
    search: '',
    classification: '',
    department: ''
};

function loadFileTable(searchTerm = '') {
    const fileTableBody = document.getElementById('fileTableBody');
    const itemsCount = document.getElementById('itemsCount');
    
    if (!fileTableBody) {
        console.error('fileTableBody not found');
        return;
    }

    // Get files from localStorage
    const files = JSON.parse(localStorage.getItem('files')) || [];
    console.log('Loaded files from localStorage:', files);
    
    // Filter files based on search term and current filter
    let filteredFiles = files.filter(file => {
        const matchesSearch = searchTerm === '' || 
            (file.name && file.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (file.subject && file.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (file.fileNumber && file.fileNumber.toString().toLowerCase().includes(searchTerm.toLowerCase()));
            
        const matchesFilter = currentFilter.type === 'all' || 
            (currentFilter.type === 'noting' && file.type === FILE_TYPE.NOTING) ||
            (currentFilter.type === 'corresponding' && file.type === FILE_TYPE.CORRESPONDING);
            
        const matchesDept = !currentFilter.department || 
            (file.department && file.department === currentFilter.department);
            
        const matchesClass = !currentFilter.classification || 
            (file.classification && file.classification === currentFilter.classification);
            
        return matchesSearch && matchesFilter && matchesDept && matchesClass;
    });

    // Sort files by upload date (newest first)
    filteredFiles.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

    // Clear existing rows
    fileTableBody.innerHTML = '';

    if (filteredFiles.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="10" class="no-files-message">
                <div class="empty-state">
                    <i class="fas fa-file-upload empty-icon"></i>
                    <p>No files uploaded yet</p>
                    <a href="upload.html" class="btn-upload-now">Upload Now</a>
                </div>
            </td>
        `;
        fileTableBody.appendChild(row);
        
        // Update items count if element exists
        if (itemsCount) {
            itemsCount.textContent = '0';
        }
        return;
    }
    
    // Update items count if element exists
    if (itemsCount) {
        itemsCount.textContent = filteredFiles.length.toString();
    }

    // Add rows for each file
    filteredFiles.forEach(file => {
        const row = document.createElement('tr');
        row.dataset.fileId = file.id;
        
        // Format upload date
        const uploadDate = file.uploadDate ? new Date(file.uploadDate) : new Date();
        const formattedDate = uploadDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        // Format file size
        const fileSize = file.fileSize || (file.size ? formatFileSize(file.size) : 'N/A');

        // Create file icon based on file type
        let fileIcon = 'fa-file';
        if (file.fileType) {
            if (file.fileType.includes('pdf')) fileIcon = 'fa-file-pdf';
            else if (file.fileType.includes('word') || file.fileType.includes('document')) fileIcon = 'fa-file-word';
            else if (file.fileType.includes('excel') || file.fileType.includes('spreadsheet')) fileIcon = 'fa-file-excel';
            else if (file.fileType.includes('image')) fileIcon = 'fa-file-image';
            else if (file.fileType.includes('zip') || file.fileType.includes('rar') || file.fileType.includes('7z')) fileIcon = 'fa-file-archive';
        }

        // Determine badge class based on file type
        const badgeClass = file.type === 'noting' ? 'badge-primary' : 'badge-secondary';
        const typeLabel = file.type === 'noting' ? 'Noting' : 'Corresponding';

        row.innerHTML = `
            <td>${fileTableBody.children.length + 1}</td>
            <td>${typeLabel}</td>
            <td>${file.fileNumber || 'N/A'}</td>
            <td>${file.department || 'N/A'}</td>
            <td>${file.subject || 'No subject'}</td>
            <td>${formattedDate}</td>
            <td>${file.closingDate ? new Date(file.closingDate).toLocaleDateString() : 'Not closed'}</td>
            <td>${file.classification || 'N/A'}</td>
            <td>${file.disposalYear || 'N/A'}</td>
            <td>
                <div class="file-actions">
                    <button class="btn-view" onclick="viewFile('${file.id}')" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-download" onclick="downloadFile('${file.id}')" title="Download">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn-delete" onclick="deleteFile('${file.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        fileTableBody.appendChild(row);
    });
}
// Setup dashboard filter tabs
document.addEventListener('DOMContentLoaded', function() {
    const filterAllBtn = document.getElementById('filterAllBtn');
    const filterNotingBtn = document.getElementById('filterNotingBtn');
    const filterCorrespondingBtn = document.getElementById('filterCorrespondingBtn');
    const classificationFilter = document.getElementById('classificationFilter');
    
    if (filterAllBtn && filterNotingBtn && filterCorrespondingBtn) {
        // Set up filter buttons
        filterAllBtn.addEventListener('click', function() {
            updateFilterButtons(this);
            currentFilter.type = 'all';
            loadFileTable();
        });
        
        filterNotingBtn.addEventListener('click', function() {
            updateFilterButtons(this);
            currentFilter.type = 'noting';
            loadFileTable();
        });
        
        filterCorrespondingBtn.addEventListener('click', function() {
            updateFilterButtons(this);
            currentFilter.type = 'corresponding';
            loadFileTable();
        });
    }
    
    // Set up classification filter
    if (classificationFilter) {
        classificationFilter.addEventListener('change', function() {
            currentFilter.classification = this.value;
            loadFileTable();
        });
    }

    // Set up department filter
    const departmentFilter = document.getElementById('departmentFilter');
    if (departmentFilter) {
        departmentFilter.addEventListener('change', function() {
            currentFilter.department = this.value;
            loadFileTable();
        });
    }

    // Set up clear filters button
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function() {
            clearFilters();
        });
    }
});

// Update active filter button
function updateFilterButtons(activeBtn) {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
}

// Clear all filters
function clearFilters() {
    currentFilter = {
        type: 'all',
        search: '',
        classification: '',
        department: ''
    };
    
    // Reset UI
    updateFilterButtons(document.getElementById('filterAllBtn'));
    document.getElementById('searchFiles').value = '';
    document.getElementById('classificationFilter').value = '';
    document.getElementById('departmentFilter').value = '';
    
    // Reload table
    loadFileTable();
}

// Download file from IndexedDB
async function downloadFile(id) {
    try {
        // Try to get metadata from memory/localStorage
        let fileMeta = files.find(f => f.id === id);
        if (!fileMeta) {
            const allFiles = JSON.parse(localStorage.getItem('files')) || [];
            fileMeta = allFiles.find(f => f.id === id);
        }
        if (!fileMeta) throw new Error('File metadata not found');
        
        // Get file content from IndexedDB
        const file = await getFileFromIndexedDB(id);
        if (!file) throw new Error('File content not found');
        
        // Create a download link using the file blob
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileMeta.name || 'download';
        
        // Trigger the download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up object URL after download starts
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        
        showToast('Download started', 'success');
    } catch (e) {
        console.error('Download error:', e);
        showToast('File not found or could not be downloaded', 'error');
    }
}

// View file: fetch metadata and blob from IndexedDB, preview in modal
async function viewFile(id) {
    console.log('Viewing file with ID:', id);
    
    // Get modal elements
    const modal = document.getElementById('fileViewerModal');
    const modalTitle = document.getElementById('fileViewerTitle');
    const fileContainer = document.getElementById('fileContainer');
    const fileFrame = document.getElementById('fileFrame');
    const downloadBtn = document.getElementById('downloadFileBtn');
    
    if (!modal || !modalTitle || !fileContainer || !fileFrame) {
        console.error('Required modal elements not found');
        showToast('Error loading file viewer', 'error');
        return;
    }
    
    // Show loading state
    fileContainer.innerHTML = `
        <div class="file-loading">
            <div class="spinner"></div>
            <p>Loading file preview...</p>
        </div>
    `;
    
    try {
        // Get metadata from memory/localStorage
        let fileMeta = files.find(f => f.id === id);
        if (!fileMeta) {
            const allFiles = JSON.parse(localStorage.getItem('files')) || [];
            fileMeta = allFiles.find(f => f.id === id);
        }
        if (!fileMeta) throw new Error('File metadata not found');
        
        // Get file content from IndexedDB
        const fileBlob = await getFileFromIndexedDB(id);
        if (!fileBlob) throw new Error('File content not found');
        
        currentViewingFile = {
            ...fileMeta,
            blob: fileBlob
        };
        
        modalTitle.textContent = fileMeta.name || 'File Viewer';
        
        // Generate preview URL
        const fileName = fileMeta.name || '';
        const fileExt = fileName.split('.').pop().toLowerCase();
        const fileType = fileMeta.fileType || '';
        const previewUrl = URL.createObjectURL(fileBlob);
        // Supported file types
        const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
        const documentTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
        const textTypes = ['txt', 'csv', 'json', 'js', 'html', 'css', 'xml', 'md'];
        const videoTypes = ['mp4', 'webm', 'ogg'];
        const audioTypes = ['mp3', 'wav', 'ogg', 'm4a'];
        const isImage = imageTypes.includes(fileExt) || (fileType && fileType.startsWith('image/'));
        const isPdf = fileExt === 'pdf' || (fileType === 'application/pdf');
        const isDocument = documentTypes.includes(fileExt);
        const isText = textTypes.includes(fileExt) || (fileType && fileType.startsWith('text/'));
        const isVideo = videoTypes.includes(fileExt) || (fileType && fileType.startsWith('video/'));
        const isAudio = audioTypes.includes(fileExt) || (fileType && fileType.startsWith('audio/'));
        if (downloadBtn) {
            downloadBtn.onclick = () => downloadFile(id);
            downloadBtn.style.display = 'inline-flex';
        }
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        fileContainer.innerHTML = '';
        const contentDiv = document.createElement('div');
        contentDiv.className = 'file-content';
        if (isImage) {
            const img = document.createElement('img');
            img.src = previewUrl;
            img.alt = fileName;
            img.className = 'file-preview';
            img.style.maxWidth = '100%';
            img.style.maxHeight = '70vh';
            img.style.display = 'block';
            img.style.margin = '0 auto';
            contentDiv.appendChild(img);
        } else if (isPdf) {
            fileFrame.src = previewUrl;
            fileFrame.style.display = 'block';
            fileFrame.style.width = '100%';
            fileFrame.style.height = '70vh';
            fileFrame.style.border = 'none';
            contentDiv.appendChild(fileFrame);
        } else if (isVideo) {
            const video = document.createElement('video');
            video.controls = true;
            video.style.maxWidth = '100%';
            video.style.maxHeight = '70vh';
            const source = document.createElement('source');
            source.src = previewUrl;
            source.type = fileType || `video/${fileExt}`;
            video.appendChild(source);
            video.innerHTML += 'Your browser does not support the video tag.';
            contentDiv.appendChild(video);
        } else if (isAudio) {
            const audio = document.createElement('audio');
            audio.controls = true;
            audio.style.width = '100%';
            const source = document.createElement('source');
            source.src = previewUrl;
            source.type = fileType || `audio/${fileExt}`;
            audio.appendChild(source);
            audio.innerHTML += 'Your browser does not support the audio tag.';
            contentDiv.appendChild(audio);
        } else if (isText) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const pre = document.createElement('pre');
                pre.className = 'file-content';
                pre.textContent = e.target.result;
                contentDiv.appendChild(pre);
            };
            reader.readAsText(fileBlob);
        } else {
            contentDiv.innerHTML = '<div class="unsupported">Preview not available for this file type.</div>';
        }
        
        fileContainer.appendChild(contentDiv);
        
        // Add file info section
        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';
        fileInfo.innerHTML = `
            <h4>File Information</h4>
            <table>
                <tr><th>Name:</th><td>${fileName}</td></tr>
                <tr><th>Type:</th><td>${fileType || 'N/A'}</td></tr>
                <tr><th>Size:</th><td>${formatFileSize(fileMeta.size) || 'N/A'}</td></tr>
                <tr><th>Uploaded:</th><td>${new Date(fileMeta.uploadDate || Date.now()).toLocaleString()}</td></tr>
                ${fileMeta.department ? `<tr><th>Department:</th><td>${fileMeta.department}</td></tr>` : ''}
                ${fileMeta.classification ? `<tr><th>Classification:</th><td>${fileMeta.classification}</td></tr>` : ''}
            </table>
        `;
        
        fileContainer.appendChild(fileInfo);
        
        // Clean up preview URL on modal close
        const closeBtn = document.getElementById('closeViewerBtn');
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.style.display = 'none';
                document.body.style.overflow = '';
                URL.revokeObjectURL(previewUrl);
            };
        }
        
        // Also close on clicking X
        const closeModalBtn = modal.querySelector('.close-modal');
        if (closeModalBtn) {
            closeModalBtn.onclick = () => {
                modal.style.display = 'none';
                document.body.style.overflow = '';
                URL.revokeObjectURL(previewUrl);
            };
        }
        
        // Close modal when clicking outside the content
        modal.onclick = function(event) {
            if (event.target === modal) {
                closeFileViewerModal();
            }
        };
        
        // Close with Escape key
        document.onkeydown = function(event) {
            if (event.key === 'Escape' && modal.style.display === 'block') {
                closeFileViewerModal();
            }
        };
        
    } catch (error) {
        console.error('Error loading file:', error);
        if (error.message === 'File metadata not found') {
            showToast('Error loading file: Metadata not found.', 'error');
        } else if (error.message === 'File content not found') {
            showToast('Error loading file: File content not found in storage.', 'error');
        } else {
            showToast('Error loading file. The file may be corrupted or no longer available.', 'error');
        }
        closeFileViewerModal();
    }
}

function loadFileContent(file) {
    const fileContainer = document.getElementById('fileContainer');
    const fileFrame = document.getElementById('fileFrame');
    
    if (!fileContainer || !fileFrame) {
        console.error('Required elements not found in loadFileContent');
        return;
    }
    
    const fileName = file.name || file.fileName || '';
    const fileUrl = file.url || file.fileUrl || file.path;
    const fileExt = (fileName.split('.').pop() || '').toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(fileExt);
    const isPdf = fileExt === 'pdf';
    const isText = ['txt', 'csv', 'json', 'xml', 'html', 'css', 'js', 'md'].includes(fileExt);
    
    if (!fileUrl) {
        console.error('No file URL provided');
        showUnsupportedFileView(file);
        return;
    }
    
    if (isImage) {
        // For images, create an img element
        const img = document.createElement('img');
        img.src = fileUrl;
        img.alt = fileName;
        img.className = 'file-content';
        img.onload = () => {
            fileContainer.innerHTML = '';
            fileContainer.appendChild(img);
        };
        img.onerror = () => {
            console.error('Error loading image:', fileUrl);
            showUnsupportedFileView(file);
        };
    } else if (isPdf) {
        // For PDFs, use an iframe
        fileFrame.onload = () => {
            fileFrame.style.display = 'block';
            fileContainer.innerHTML = '';
            fileContainer.appendChild(fileFrame);
        };
        fileFrame.onerror = () => {
            console.error('Error loading PDF:', fileUrl);
            showUnsupportedFileView(file);
        };
        fileFrame.src = fileUrl;
    } else if (isText) {
        // For text files, fetch and display the content
        fetch(fileUrl)
            .then(response => {
                if (!response.ok) throw new Error('Failed to load file');
                return response.text();
            })
            .then(text => {
                const pre = document.createElement('pre');
                pre.className = 'file-content';
                pre.textContent = text;
                fileContainer.innerHTML = '';
                fileContainer.appendChild(pre);
            })
            .catch(error => {
                console.error('Error loading text file:', error);
                showUnsupportedFileView(file);
            });
    } else {
        // For unsupported file types
        showUnsupportedFileView(file);
    }
}

function showUnsupportedFileView(file) {
    const fileContainer = document.getElementById('fileContainer');
    if (!fileContainer) return;
    
    const fileName = file.name || file.fileName || 'file';
    const fileType = file.type || 'unknown';
    const fileExt = fileName.split('.').pop().toUpperCase();
    const fileSize = file.size || file.fileSize || 0;
    
    // Get appropriate icon based on file type
    let fileIcon = 'file';
    if (fileType.includes('word') || fileExt === 'DOC' || fileExt === 'DOCX') {
        fileIcon = 'file-word';
    } else if (fileType.includes('excel') || fileExt === 'XLS' || fileExt === 'XLSX') {
        fileIcon = 'file-excel';
    } else if (fileType.includes('powerpoint') || fileExt === 'PPT' || fileExt === 'PPTX') {
        fileIcon = 'file-powerpoint';
    } else if (fileType.includes('zip') || fileExt === 'ZIP' || fileExt === 'RAR' || fileExt === '7Z') {
        fileIcon = 'file-archive';
    } else if (fileType.includes('audio')) {
        fileIcon = 'file-audio';
    } else if (fileType.includes('video')) {
        fileIcon = 'file-video';
    } else if (fileType.includes('pdf')) {
        fileIcon = 'file-pdf';
    } else if (fileType.includes('image')) {
        fileIcon = 'file-image';
    } else if (fileType.includes('text') || fileExt === 'TXT' || fileExt === 'CSV' || fileExt === 'JSON') {
        fileIcon = 'file-alt';
    } else if (fileType.includes('code') || fileExt === 'JS' || fileExt === 'HTML' || fileExt === 'CSS') {
        fileIcon = 'file-code';
    }
    
    fileContainer.innerHTML = `
        <div class="unsupported-file">
            <i class="fas fa-${fileIcon}"></i>
            <h3>Preview Not Available</h3>
            <p>We can't display a preview of this ${fileType} file (${fileExt}).</p>
            <p>You can download the file to view it with an appropriate application.</p>
            <div class="file-meta">
                <div class="file-name">${fileName}</div>
                ${fileSize ? `<div class="file-size">${formatFileSize(fileSize)}</div>` : ''}
            </div>
            <button onclick="downloadCurrentFile()" class="btn-download">
                <i class="fas fa-download"></i> Download File
            </button>
        </div>
    `;
}

// Download the currently viewed file
function downloadCurrentFile() {
    if (!currentViewingFile) {
        showToast('No file is currently being viewed', 'error');
        return;
    }
    
    try {
        // Create a download link using the blob
        if (currentViewingFile.blob) {
            const url = URL.createObjectURL(currentViewingFile.blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = currentViewingFile.name || 'download';
            
            // Trigger the download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up object URL after download starts
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            
            showToast('Download started', 'success');
        } else if (currentViewingFile.id) {
            // If we don't have the blob directly, try to download by ID
            downloadFile(currentViewingFile.id);
        } else {
            throw new Error('No file data available');
        }
    } catch (error) {
        console.error('Error downloading current file:', error);
        showToast('Failed to download file', 'error');
    }
}

function closeFileViewerModal() {
    const fileViewerModal = document.getElementById('fileViewerModal');
    if (fileViewerModal) {
        fileViewerModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        currentViewingFile = null;
    }
}

// Delete file from both localStorage and IndexedDB
function deleteFile(id) {
    if (confirm('Are you sure you want to delete this file?')) {
        // Remove metadata from localStorage
        files = files.filter(f => f.id !== id);
        localStorage.setItem('files', JSON.stringify(files));
        // Remove file content from IndexedDB
        const request = indexedDB.open('FileManagerDB', 1);
        request.onsuccess = function(event) {
            const db = event.target.result;
            if (db.objectStoreNames.contains('files')) {
                const tx = db.transaction(['files'], 'readwrite');
                const store = tx.objectStore('files');
                store.delete(id);
            }
        };
        loadDashboardStats();
        loadFileTable();
        showToast('File deleted successfully!', 'success');
    }
}

// Add CSS class for file drop area highlighting
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.innerHTML = `
        .file-drop-area.highlight {
            border-color: var(--secondary-color);
            background-color: rgba(52, 152, 219, 0.1);
        }
    `;
    document.head.appendChild(style);

    // Close modal when clicking outside or pressing Escape
    const fileViewerModal = document.getElementById('fileViewerModal');
    if (fileViewerModal) {
        // Click outside to close
        fileViewerModal.addEventListener('click', function(event) {
            if (event.target === fileViewerModal) {
                closeFileViewerModal();
            }
        });

        // Close button
        const closeButton = fileViewerModal.querySelector('.close-modal');
        if (closeButton) {
            closeButton.addEventListener('click', closeFileViewerModal);
        }
    }

    // Close with Escape key
    document.addEventListener('keydown', function(event) {
        const fileViewerModal = document.getElementById('fileViewerModal');
        if (event.key === 'Escape' && fileViewerModal && fileViewerModal.style.display === 'block') {
            closeFileViewerModal();
        }
    });
});
