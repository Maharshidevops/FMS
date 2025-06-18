// Reports page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const reportTabBtns = document.querySelectorAll('.report-tab-btn');
    const reportSections = document.querySelectorAll('.report-section');

    reportTabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all tabs
            reportTabBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all sections
            reportSections.forEach(section => section.classList.remove('active'));
            
            // Show the corresponding section
            const tabName = this.getAttribute('data-tab');
            document.getElementById(`${tabName}Section`).classList.add('active');
            
            // Initialize charts for the current tab
            initializeChartsForTab(tabName);
        });
    });
    
    // Initialize time range buttons
    const reportRangeBtns = document.querySelectorAll('.report-range-btn');
    reportRangeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Find all range buttons in the same group
            const parentActions = this.closest('.report-card-actions');
            const siblingRangeBtns = parentActions.querySelectorAll('.report-range-btn');
            
            // Remove active class from all siblings
            siblingRangeBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update the chart based on the selected range
            const range = this.getAttribute('data-range');
            const chartContainer = this.closest('.report-card').querySelector('canvas');
            if (chartContainer) {
                updateChartRange(chartContainer.id, range);
            }
        });
    });
    
    // Initialize filter buttons
    const filterBtns = document.querySelectorAll('.report-filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filterId = this.id;
            showFilterPopup(filterId);
        });
    });
    
    // Initialize export buttons
    const exportBtns = document.querySelectorAll('.report-export-btn');
    exportBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const reportCard = this.closest('.report-card');
            const reportTitle = reportCard.querySelector('h3').textContent.trim();
            exportReport(reportTitle, reportCard);
        });
    });
    
    // Initialize action buttons
    const actionBtns = document.querySelectorAll('.report-action-btn');
    actionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const actionId = this.id;
            handleAction(actionId);
        });
    });
    
    // Initialize the charts for the initial active tab
    const activeTab = document.querySelector('.report-tab-btn.active').getAttribute('data-tab');
    initializeChartsForTab(activeTab);
    
    // Load report data
    loadReportData();
});

// Function to initialize charts based on the active tab
function initializeChartsForTab(tabName) {
    switch(tabName) {
        case 'usage':
            initializeStorageUsageChart();
            initializeStorageTrendsChart();
            break;
        case 'activity':
            initializeUserActivityChart();
            initializeAccessAttemptsChart();
            break;
        case 'system':
            initializePerformanceChart();
            break;
    }
}

// Function to show filter popup
function showFilterPopup(filterId) {
    alert(`Filter popup for ${filterId} would appear here`);
    // In a real application, this would show a modal with filter options
}

// Function to export a report
function exportReport(title, container) {
    alert(`Exporting ${title} report`);
    // In a real application, this would generate a PDF or CSV export
}

// Function to handle action buttons
function handleAction(actionId) {
    switch(actionId) {
        case 'runIntegrityBtn':
            runFileIntegrityCheck();
            break;
        // Add more action handlers as needed
    }
}

// Function to run a file integrity check
function runFileIntegrityCheck() {
    // Show loading state
    const integrityStatus = document.querySelector('.integrity-status');
    integrityStatus.innerHTML = '<i class="fas fa-spinner fa-spin integrity-icon"></i><div class="integrity-details"><span class="integrity-result">Checking files...</span><span class="integrity-date">In progress</span></div>';
    
    // Simulate a check (would connect to a server in a real app)
    setTimeout(() => {
        integrityStatus.innerHTML = '<i class="fas fa-check-circle integrity-icon"></i><div class="integrity-details"><span class="integrity-result">All files verified</span><span class="integrity-date">Last check: ' + new Date().toLocaleString() + '</span></div>';
    }, 2000);
}

// Function to update chart data based on selected time range
function updateChartRange(chartId, range) {
    const chart = Chart.getChart(chartId);
    if (!chart) return;
    
    // Example data updates - in a real app, this would fetch data from the server
    if (chartId === 'storageTrendsChart') {
        const labels = generateLabels(range);
        const data = generateRandomData(labels.length);
        
        chart.data.labels = labels;
        chart.data.datasets[0].data = data;
        chart.update();
    } else if (chartId === 'accessAttemptsChart') {
        const labels = generateLabels(range, true);
        const successData = generateRandomData(labels.length, 10, 30);
        const failedData = generateRandomData(labels.length, 0, 5);
        
        chart.data.labels = labels;
        chart.data.datasets[0].data = successData;
        chart.data.datasets[1].data = failedData;
        chart.update();
    } else if (chartId === 'performanceChart') {
        const labels = generateLabels(range, true);
        const cpuData = generateRandomData(labels.length, 20, 60);
        const memoryData = generateRandomData(labels.length, 30, 70);
        const diskData = generateRandomData(labels.length, 5, 25);
        
        chart.data.labels = labels;
        chart.data.datasets[0].data = cpuData;
        chart.data.datasets[1].data = memoryData;
        chart.data.datasets[2].data = diskData;
        chart.update();
    }
}

// Function to generate labels based on time range
function generateLabels(range, includeTime = false) {
    const labels = [];
    const now = new Date();
    let format = { month: 'short', day: 'numeric' };
    let step = 1;
    let count = 7;
    
    if (includeTime) {
        format.hour = '2-digit';
        format.minute = '2-digit';
    }
    
    switch(range) {
        case 'day':
            count = 24;
            format = { hour: '2-digit' };
            break;
        case 'week':
            count = 7;
            break;
        case 'month':
            count = 30;
            break;
        case 'year':
            count = 12;
            format = { month: 'short' };
            break;
    }
    
    for (let i = count - 1; i >= 0; i--) {
        const date = new Date();
        switch(range) {
            case 'day':
                date.setHours(date.getHours() - i);
                break;
            case 'week':
                date.setDate(date.getDate() - i);
                break;
            case 'month':
                date.setDate(date.getDate() - i);
                break;
            case 'year':
                date.setMonth(date.getMonth() - i);
                break;
        }
        labels.push(date.toLocaleDateString('en-US', format));
    }
    
    return labels;
}

// Function to generate random data for charts
function generateRandomData(length, min = 0, max = 100) {
    return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

// Load report data from localStorage
function loadReportData() {
    // Get files from localStorage
    const files = JSON.parse(localStorage.getItem('files')) || [];
    
    // Load most accessed files (for demo, we'll just use the files array as is)
    loadMostAccessedFiles(files);
    
    // Load largest files (sort by fileSize)
    loadLargestFiles(files);
    
    // Load operations table (for demo, generate some random operations)
    loadOperationsTable(files);
    
    // Load version history table (for demo, generate some random versions)
    loadVersionHistory(files);
}

// Load most accessed files
function loadMostAccessedFiles(files) {
    const mostAccessedList = document.getElementById('mostAccessedList');
    if (!mostAccessedList) return;
    
    // Sort files by random access count (since we don't track this in the demo)
    // In a real app, this would sort by actual access counts
    const sortedFiles = [...files].sort(() => Math.random() - 0.5).slice(0, 5);
    
    if (sortedFiles.length === 0) {
        mostAccessedList.innerHTML = '<div class="empty-state">No files available</div>';
        return;
    }
    
    let html = '';
    sortedFiles.forEach((file, index) => {
        const accessCount = Math.floor(Math.random() * 50) + 1; // Random count for demo
        html += `
            <div class="report-list-item">
                <div class="report-list-rank">${index + 1}</div>
                <div class="report-list-content">
                    <div class="report-list-title">${file.fileSubject || 'Untitled'}</div>
                    <div class="report-list-subtitle">${file.fileNumber || ''} • ${file.Department || 'Unknown Department'}</div>
                </div>
                <div class="report-list-stat">${accessCount} views</div>
            </div>
        `;
    });
    
    mostAccessedList.innerHTML = html;
}

// Load largest files
function loadLargestFiles(files) {
    const largestFilesList = document.getElementById('largestFilesList');
    if (!largestFilesList) return;
    
    // Sort files by fileSize if available
    const sortedFiles = [...files].sort((a, b) => (b.fileSize || 0) - (a.fileSize || 0)).slice(0, 5);
    
    if (sortedFiles.length === 0) {
        largestFilesList.innerHTML = '<div class="empty-state">No files available</div>';
        return;
    }
    
    let html = '';
    sortedFiles.forEach((file, index) => {
        const fileSize = formatBytes(file.fileSize || Math.random() * 10 * 1024 * 1024); // Random size for demo
        html += `
            <div class="report-list-item">
                <div class="report-list-rank">${index + 1}</div>
                <div class="report-list-content">
                    <div class="report-list-title">${file.fileSubject || 'Untitled'}</div>
                    <div class="report-list-subtitle">${file.fileNumber || ''} • ${file.Department || 'Unknown Department'}</div>
                </div>
                <div class="report-list-stat">${fileSize}</div>
            </div>
        `;
    });
    
    largestFilesList.innerHTML = html;
}

// Helper function to format bytes
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Load operations table
function loadOperationsTable(files) {
    const operationsTable = document.getElementById('operationsTable');
    if (!operationsTable) return;
    
    const tbody = operationsTable.querySelector('tbody');
    if (!tbody) return;
    
    if (files.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No operations available</td></tr>';
        return;
    }
    
    const operations = ['Uploaded', 'Downloaded', 'Viewed', 'Edited', 'Shared'];
    const users = ['Admin', 'John', 'Maria', 'Alex', 'Sarah'];
    
    let html = '';
    for (let i = 0; i < Math.min(files.length, 8); i++) {
        const file = files[i];
        const operation = operations[Math.floor(Math.random() * operations.length)];
        const user = users[Math.floor(Math.random() * users.length)];
        const date = new Date(file.uploadDate || new Date());
        
        html += `
            <tr>
                <td>${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                <td>${operation}</td>
                <td>${file.fileSubject || 'Untitled'}</td>
                <td>${user}</td>
            </tr>
        `;
    }
    
    tbody.innerHTML = html;
}

// Load version history
function loadVersionHistory(files) {
    const versionTable = document.getElementById('versionTable');
    if (!versionTable) return;
    
    const tbody = versionTable.querySelector('tbody');
    if (!tbody) return;
    
    if (files.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No version history available</td></tr>';
        return;
    }
    
    const users = ['Admin', 'John', 'Maria', 'Alex', 'Sarah'];
    
    let html = '';
    for (let i = 0; i < Math.min(files.length, 5); i++) {
        const file = files[i];
        const user = users[Math.floor(Math.random() * users.length)];
        const date = new Date(file.uploadDate || new Date());
        const version = `1.${Math.floor(Math.random() * 5)}`;
        
        html += `
            <tr>
                <td>${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                <td>${file.fileSubject || 'Untitled'}</td>
                <td>v${version}</td>
                <td>${user}</td>
                <td>
                    <button class="table-action-btn view-btn" title="View this version">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="table-action-btn restore-btn" title="Restore this version">
                        <i class="fas fa-undo"></i>
                    </button>
                </td>
            </tr>
        `;
    }
    
    tbody.innerHTML = html;
}

// CHART INITIALIZATION FUNCTIONS

// Initialize Storage Usage Chart
function initializeStorageUsageChart() {
    const storageUsageChart = document.getElementById('storageUsageChart');
    if (!storageUsageChart) return;
    
    // Get files from localStorage
    const files = JSON.parse(localStorage.getItem('files')) || [];
    
    // Calculate total storage
    let totalSize = 0;
    files.forEach(file => {
        totalSize += (file.fileSize || 0);
    });
    
    // Update total storage display
    const totalStorageElement = document.getElementById('totalStorage');
    if (totalStorageElement) {
        totalStorageElement.textContent = formatBytes(totalSize);
    }
    
    // Group files by department
    const departments = {
        'SOT': 0,
        'SOS': 0,
        'SOM&LA': 0,
        'Administration': 0,
        'Other': 0
    };
    
    files.forEach(file => {
        const dept = file.Department || 'Other';
        if (departments[dept] !== undefined) {
            departments[dept] += (file.fileSize || 0);
        } else {
            departments['Other'] += (file.fileSize || 0);
        }
    });
    
    // If no real data, generate demo data
    if (totalSize === 0) {
        Object.keys(departments).forEach(dept => {
            departments[dept] = Math.random() * 100 * 1024 * 1024; // Random size for demo
        });
        totalSize = Object.values(departments).reduce((a, b) => a + b, 0);
    }
    
    // Create or update chart
    const existingChart = Chart.getChart(storageUsageChart);
    if (existingChart) {
        existingChart.destroy();
    }
    
    new Chart(storageUsageChart, {
        type: 'doughnut',
        data: {
            labels: Object.keys(departments),
            datasets: [{
                data: Object.values(departments),
                backgroundColor: [
                    '#FF9800', // SOT - Orange
                    '#4CAF50', // SOS - Green
                    '#F44336', // SOM&LA - Red
                    '#2196F3', // Administration - Blue
                    '#9E9E9E'  // Other - Gray
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const percentage = Math.round((value / totalSize) * 100);
                            return `${context.label}: ${formatBytes(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Initialize Storage Trends Chart
function initializeStorageTrendsChart() {
    const storageTrendsChart = document.getElementById('storageTrendsChart');
    if (!storageTrendsChart) return;
    
    const labels = generateLabels('week');
    const data = generateRandomData(labels.length, 100, 500);
    
    // Create or update chart
    const existingChart = Chart.getChart(storageTrendsChart);
    if (existingChart) {
        existingChart.destroy();
    }
    
    new Chart(storageTrendsChart, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Storage Used (MB)',
                data: data,
                borderColor: '#2196F3',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Storage (MB)'
                    }
                }
            }
        }
    });
}

// Initialize User Activity Chart
function initializeUserActivityChart() {
    const userActivityChart = document.getElementById('userActivityChart');
    if (!userActivityChart) return;
    
    const users = ['Admin', 'John', 'Maria', 'Alex', 'Sarah'];
    const data = generateRandomData(users.length, 5, 50);
    
    // Create or update chart
    const existingChart = Chart.getChart(userActivityChart);
    if (existingChart) {
        existingChart.destroy();
    }
    
    new Chart(userActivityChart, {
        type: 'bar',
        data: {
            labels: users,
            datasets: [{
                label: 'Operations',
                data: data,
                backgroundColor: '#4CAF50',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Operations'
                    }
                }
            }
        }
    });
}

// Initialize Access Attempts Chart
function initializeAccessAttemptsChart() {
    const accessAttemptsChart = document.getElementById('accessAttemptsChart');
    if (!accessAttemptsChart) return;
    
    const labels = generateLabels('day', true);
    const successData = generateRandomData(labels.length, 10, 30);
    const failedData = generateRandomData(labels.length, 0, 5);
    
    // Create or update chart
    const existingChart = Chart.getChart(accessAttemptsChart);
    if (existingChart) {
        existingChart.destroy();
    }
    
    new Chart(accessAttemptsChart, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Successful',
                    data: successData,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Failed',
                    data: failedData,
                    borderColor: '#F44336',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Attempts'
                    }
                }
            }
        }
    });
}

// Initialize Performance Chart
function initializePerformanceChart() {
    const performanceChart = document.getElementById('performanceChart');
    if (!performanceChart) return;
    
    const labels = generateLabels('day', true);
    const cpuData = generateRandomData(labels.length, 20, 60);
    const memoryData = generateRandomData(labels.length, 30, 70);
    const diskData = generateRandomData(labels.length, 5, 25);
    
    // Create or update chart
    const existingChart = Chart.getChart(performanceChart);
    if (existingChart) {
        existingChart.destroy();
    }
    
    new Chart(performanceChart, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'CPU Usage (%)',
                    data: cpuData,
                    borderColor: '#F44336',
                    backgroundColor: 'transparent',
                    tension: 0.4
                },
                {
                    label: 'Memory Usage (%)',
                    data: memoryData,
                    borderColor: '#2196F3',
                    backgroundColor: 'transparent',
                    tension: 0.4
                },
                {
                    label: 'Disk I/O (%)',
                    data: diskData,
                    borderColor: '#4CAF50',
                    backgroundColor: 'transparent',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: 100,
                    title: {
                        display: true,
                        text: 'Usage (%)'
                    }
                }
            }
        }
    });
}
