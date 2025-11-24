// Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Global state
let currentData = [];
let currentKPIs = {};
let currentForecast = [];
let currentDepartments = [];
let charts = {};

// Screen management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function updateProgressSteps(activeStep) {
    document.querySelectorAll('.step').forEach((step, index) => {
        if (index <= activeStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

// Welcome screen
function startJourney() {
    showScreen('dataSourceScreen');
    loadSampleDatasets();
}

// Load sample datasets
async function loadSampleDatasets() {
    try {
        const response = await fetch(`${API_BASE_URL}/sample-datasets`);
        const datasets = await response.json();
        
        const container = document.getElementById('sampleDatasets');
        container.innerHTML = datasets.map(dataset => `
            <div class="dataset-item" onclick="loadSampleData('${dataset.key}')">
                <h4>
                    ${dataset.name}
                    <i class="fas fa-check-circle" style="color: var(--success);"></i>
                </h4>
                <p>${dataset.description}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading datasets:', error);
        showError('Failed to load sample datasets');
    }
}

// Load sample data
async function loadSampleData(datasetType) {
    showLoading(true);
    updateProgressSteps(2);
    showScreen('processingScreen');
    
    try {
        // Simulate processing steps
        await simulateProcessing();
        
        const response = await fetch(`${API_BASE_URL}/sample-data/${datasetType}`);
        const result = await response.json();
        
        if (result.success) {
            currentData = result.data;
            currentKPIs = result.kpis;
            currentForecast = result.forecast;
            currentDepartments = result.departments;
            
            updateDashboard();
            showScreen('dashboardScreen');
        } else {
            showError(result.error);
        }
    } catch (error) {
        console.error('Error loading sample data:', error);
        showError('Failed to load sample data');
    } finally {
        showLoading(false);
    }
}

// File upload handling
document.addEventListener('DOMContentLoaded', () => {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    
    uploadZone.addEventListener('click', () => {
        fileInput.click();
    });
    
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.style.borderColor = 'var(--primary)';
        uploadZone.style.background = 'var(--gray-50)';
    });
    
    uploadZone.addEventListener('dragleave', () => {
        uploadZone.style.borderColor = 'var(--secondary)';
        uploadZone.style.background = 'white';
    });
    
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.style.borderColor = 'var(--secondary)';
        uploadZone.style.background = 'white';
        
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.csv')) {
            handleFileUpload(file);
        } else {
            showError('Please upload a CSV file');
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileUpload(file);
        }
    });
    
    // Department filter
    const departmentFilter = document.getElementById('departmentFilter');
    departmentFilter.addEventListener('change', () => {
        refreshAnalytics();
    });
    
    // Forecast months
    const forecastMonths = document.getElementById('forecastMonths');
    forecastMonths.addEventListener('change', () => {
        refreshAnalytics();
    });
    
    // Scenario modeling
    const scenarioToggle = document.getElementById('scenarioToggle');
    const scenarioSlider = document.getElementById('scenarioSlider');
    
    scenarioToggle.addEventListener('change', () => {
        const enabled = scenarioToggle.checked;
        const chartContainer = document.getElementById('scenarioChartContainer');
        chartContainer.style.display = enabled ? 'block' : 'none';
        
        if (enabled) {
            updateScenario();
        }
    });
    
    scenarioSlider.addEventListener('input', () => {
        const value = scenarioSlider.value;
        document.getElementById('sliderValue').textContent = `${value}%`;
        
        if (scenarioToggle.checked) {
            updateScenario();
        }
    });
});

// Handle file upload
async function handleFileUpload(file) {
    showLoading(true);
    updateProgressSteps(2);
    showScreen('processingScreen');
    
    try {
        await simulateProcessing();
        
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            if (result.warnings && result.warnings.length > 0) {
                showWarnings(result.warnings);
            }
            
            currentData = result.data;
            currentKPIs = result.kpis;
            currentForecast = result.forecast;
            currentDepartments = result.departments;
            
            updateDashboard();
            showScreen('dashboardScreen');
        } else {
            showError(result.error || 'Upload failed');
            showScreen('dataSourceScreen');
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        showError('Failed to upload file');
        showScreen('dataSourceScreen');
    } finally {
        showLoading(false);
    }
}

// Simulate processing steps
async function simulateProcessing() {
    const steps = [
        { title: 'Validation', subtitle: 'Data Quality Check', duration: 1000 },
        { title: 'ETL Process', subtitle: 'Transform & Clean', duration: 1000 },
        { title: 'Analysis', subtitle: 'Generate Insights', duration: 1000 }
    ];
    
    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        document.getElementById('processingTitle').textContent = step.title;
        document.getElementById('processingSubtitle').textContent = step.subtitle;
        
        updateProgressSteps(i + 2);
        
        const progressBar = document.getElementById('progressBar');
        progressBar.style.width = `${((i + 1) / steps.length) * 100}%`;
        
        await new Promise(resolve => setTimeout(resolve, step.duration));
    }
}

// Update dashboard with data
function updateDashboard() {
    // Update subtitle
    document.getElementById('dashboardSubtitle').textContent = 
        `${currentData.length} records loaded`;
    
    // Populate department filter
    const departments = [...new Set(currentData.map(d => d.department))].filter(Boolean);
    const departmentFilter = document.getElementById('departmentFilter');
    departmentFilter.innerHTML = '<option value="all">All Departments</option>' +
        departments.map(dept => `<option value="${dept}">${dept}</option>`).join('');
    
    // Update KPIs
    updateKPIs();
    
    // Show alerts
    if (currentKPIs.alerts) {
        displayAlerts(currentKPIs.alerts);
    }
    
    // Render charts
    renderCharts();
}

// Update KPI cards
function updateKPIs() {
    // Total Revenue
    document.getElementById('kpiRevenue').textContent = formatCurrency(currentKPIs.total_revenue);
    const revenueChange = document.getElementById('kpiRevenueChange');
    const revenuePercent = currentKPIs.revenue_change;
    revenueChange.innerHTML = `
        <i class="fas fa-arrow-${revenuePercent >= 0 ? 'up' : 'down'}"></i>
        <span>${formatPercent(revenuePercent)}</span>
    `;
    revenueChange.className = `kpi-change ${revenuePercent >= 0 ? 'positive' : 'negative'}`;
    
    // Total Profit
    document.getElementById('kpiProfit').textContent = formatCurrency(currentKPIs.total_profit);
    document.getElementById('kpiMargin').textContent = `${currentKPIs.profit_margin.toFixed(1)}% margin`;
    
    // Avg Customers
    document.getElementById('kpiCustomers').textContent = 
        Math.round(currentKPIs.avg_customers).toLocaleString();
    const customerChange = document.getElementById('kpiCustomerChange');
    const customerPercent = currentKPIs.customer_change;
    customerChange.innerHTML = `
        <i class="fas fa-arrow-${customerPercent >= 0 ? 'up' : 'down'}"></i>
        <span>${formatPercent(customerPercent)}</span>
    `;
    customerChange.className = `kpi-change ${customerPercent >= 0 ? 'positive' : 'negative'}`;
    
    // Total Costs
    document.getElementById('kpiCosts').textContent = formatCurrency(currentKPIs.total_costs);
    const costRatio = (currentKPIs.total_costs / currentKPIs.total_revenue * 100).toFixed(1);
    document.getElementById('kpiCostRatio').textContent = `${costRatio}% of revenue`;
}

// Display alerts
function displayAlerts(alerts) {
    const container = document.getElementById('alertsContainer');
    container.innerHTML = alerts.map(alert => `
        <div class="alert alert-${alert.type}">
            <i class="fas fa-${alert.type === 'warning' ? 'exclamation-circle' : 'check-circle'}"></i>
            <span>${alert.message}</span>
        </div>
    `).join('');
}

// Render all charts
function renderCharts() {
    renderRevenueChart();
    renderDepartmentChart();
    renderCustomerChart();
}

// Revenue trend chart
function renderRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    
    if (charts.revenue) {
        charts.revenue.destroy();
    }
    
    const allData = [...currentData, ...currentForecast];
    const labels = allData.map(d => formatDate(d.date));
    const revenueData = currentData.map(d => d.revenue);
    const forecastData = new Array(currentData.length).fill(null).concat(
        currentForecast.map(f => f.forecast)
    );
    
    charts.revenue = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Actual Revenue',
                    data: [...revenueData, ...new Array(currentForecast.length).fill(null)],
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3
                },
                {
                    label: 'Forecasted Revenue',
                    data: forecastData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    borderDash: [5, 5]
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: { size: 12, weight: '600' }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#111827',
                    bodyColor: '#374151',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + (value / 1000).toFixed(0) + 'k';
                        }
                    },
                    grid: {
                        color: '#f3f4f6'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Department revenue chart
function renderDepartmentChart() {
    const ctx = document.getElementById('departmentChart');
    
    if (charts.department) {
        charts.department.destroy();
    }
    
    const labels = currentDepartments.map(d => d.department);
    const data = currentDepartments.map(d => d.revenue);
    
    charts.department = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Revenue',
                data: data,
                backgroundColor: [
                    '#8b5cf6',
                    '#3b82f6',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444'
                ],
                borderRadius: 8,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Revenue: ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + (value / 1000).toFixed(0) + 'k';
                        }
                    },
                    grid: {
                        color: '#f3f4f6'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Customer distribution chart
function renderCustomerChart() {
    const ctx = document.getElementById('customerChart');
    
    if (charts.customer) {
        charts.customer.destroy();
    }
    
    const labels = currentDepartments.map(d => d.department);
    const data = currentDepartments.map(d => d.customers);
    
    charts.customer = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#8b5cf6',
                    '#3b82f6',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed.toLocaleString() + ' customers';
                        }
                    }
                }
            }
        }
    });
}

// Update scenario modeling
async function updateScenario() {
    const adjustment = parseInt(document.getElementById('scenarioSlider').value);
    
    try {
        const response = await fetch(`${API_BASE_URL}/scenario`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                adjustment: adjustment
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Update impact display
            document.getElementById('scenarioRevenue').textContent = 
                formatCurrency(result.scenario_kpis.total_revenue);
            document.getElementById('scenarioProfit').textContent = 
                formatCurrency(result.scenario_kpis.total_profit);
            
            const change = result.scenario_kpis.total_revenue - currentKPIs.total_revenue;
            const changeElement = document.getElementById('scenarioChange');
            changeElement.textContent = formatCurrency(Math.abs(change));
            changeElement.className = change >= 0 ? 'change-positive' : 'change-negative';
            
            // Render scenario chart
            renderScenarioChart(result.scenario);
        }
    } catch (error) {
        console.error('Error updating scenario:', error);
    }
}

// Render scenario comparison chart
function renderScenarioChart(scenarioData) {
    const ctx = document.getElementById('scenarioChart');
    
    if (charts.scenario) {
        charts.scenario.destroy();
    }
    
    const labels = scenarioData.map(d => formatDate(d.date));
    const actualData = scenarioData.map(d => d.revenue);
    const scenarioRevenue = scenarioData.map(d => d.scenario_revenue);
    
    charts.scenario = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Current Revenue',
                    data: actualData,
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Scenario Revenue',
                    data: scenarioRevenue,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + (value / 1000).toFixed(0) + 'k';
                        }
                    }
                }
            }
        }
    });
}

// Refresh analytics with filters
async function refreshAnalytics() {
    const department = document.getElementById('departmentFilter').value;
    const forecastMonths = parseInt(document.getElementById('forecastMonths').value);
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/analytics`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: currentData,
                department: department,
                forecast_months: forecastMonths,
                alert_threshold: 10
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentKPIs = result.kpis;
            currentForecast = result.forecast;
            currentDepartments = result.departments;
            
            updateKPIs();
            displayAlerts(result.alerts);
            renderCharts();
        }
    } catch (error) {
        console.error('Error refreshing analytics:', error);
        showError('Failed to refresh analytics');
    } finally {
        showLoading(false);
    }
}

// Change data source
function changeDataSource() {
    showScreen('dataSourceScreen');
}

// Export functions
async function exportCSV() {
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/export/csv`);
        const csv = await response.text();
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dashboard_export.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting CSV:', error);
        showError('Failed to export CSV');
    } finally {
        showLoading(false);
    }
}

function exportPDF() {
    alert('PDF export functionality would integrate with a library like jsPDF or pdfmake. This is a placeholder for the full implementation.');
}

// Utility functions
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

function formatPercent(value) {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
}

function showError(message) {
    alert('Error: ' + message);
}

function showWarnings(warnings) {
    if (warnings.length > 0) {
        alert('Warnings:\n' + warnings.join('\n'));
    }
}
